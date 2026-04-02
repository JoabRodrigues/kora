import type {
  ContentMode,
  Credentials,
  EpgEntry,
  NormalizedCategory,
  NormalizedChannel,
  PlayerApiResponse,
  XtreamCategory,
  XtreamChannel,
  XtreamShortEpgItem,
  XtreamShortEpgResponse,
  XtreamSeries,
  XtreamSeriesInfo,
} from "./types";
import { buildApiUrl, itemLabel, normalizeCategories, normalizeChannels, normalizeSeries } from "./utils";

export async function authenticate(credentials: Credentials) {
  const authResponse = await fetch(buildApiUrl(credentials));
  if (!authResponse.ok) {
    throw new Error(`Falha ao autenticar: HTTP ${authResponse.status}`);
  }

  const authData = (await authResponse.json()) as PlayerApiResponse;
  if (authData.user_info?.auth !== 1) {
    throw new Error("Login invalido no provedor IPTV.");
  }

  return authData;
}

export async function fetchModeLibrary(
  credentials: Credentials,
  mode: ContentMode
): Promise<{ categories: NormalizedCategory[]; items: NormalizedChannel[]; message: string }> {
  const actionMap =
    mode === "live"
      ? { categories: "get_live_categories", items: "get_live_streams" }
      : mode === "movie"
        ? { categories: "get_vod_categories", items: "get_vod_streams" }
        : { categories: "get_series_categories", items: "get_series" };

  const [categoriesResponse, itemsResponse] = await Promise.all([
    fetch(buildApiUrl(credentials, actionMap.categories)),
    fetch(buildApiUrl(credentials, actionMap.items)),
  ]);

  if (!categoriesResponse.ok || !itemsResponse.ok) {
    throw new Error("Nao foi possivel carregar esse tipo de conteudo.");
  }

  const rawCategories = (await categoriesResponse.json()) as XtreamCategory[];
  const rawItems = await itemsResponse.json();
  const items =
    mode === "series"
      ? normalizeSeries(Array.isArray(rawItems) ? (rawItems as XtreamSeries[]) : [])
      : normalizeChannels(Array.isArray(rawItems) ? (rawItems as XtreamChannel[]) : [], mode);

  return {
    categories: normalizeCategories(Array.isArray(rawCategories) ? rawCategories : [], items),
    items,
    message: `${items.length} ${itemLabel(mode)}(s) carregado(s).`,
  };
}

export async function fetchSeriesEpisodes(
  credentials: Credentials,
  series: NormalizedChannel
): Promise<NormalizedChannel[]> {
  const response = await fetch(
    buildApiUrl(credentials, "get_series_info", { series_id: String(series.id) })
  );
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar episodios da serie.");
  }

  const data = (await response.json()) as XtreamSeriesInfo;
  const episodes: NormalizedChannel[] = [];
  for (const [seasonId, seasonEpisodes] of Object.entries(data.episodes ?? {})) {
    for (const episode of seasonEpisodes) {
      const episodeId = Number(episode.id);
      episodes.push({
        key: `series-episode:${episodeId}`,
        mode: "series",
        id: episodeId,
        name:
          String(episode.title ?? `Episodio ${episode.episode_num ?? ""}`).trim() ||
          `Episodio ${episode.episode_num ?? ""}`.trim(),
        categoryId: series.categoryId,
        icon: String(episode.info?.movie_image ?? data.info?.cover ?? series.icon).trim(),
        epgId: `Temporada ${seasonId}`,
        extension: String(episode.container_extension ?? "mp4").trim() || "mp4",
        seasonId,
        seriesId: series.id,
      });
    }
  }

  return episodes;
}

function normalizeEpgItem(item: XtreamShortEpgItem, index: number): EpgEntry {
  const title = item.title ? safeDecode(item.title) : "Sem titulo";
  const description = item.description ? safeDecode(item.description) : "";
  const startRaw = String(item.start ?? item.start_timestamp ?? "");
  const endRaw = String(item.end ?? item.stop_timestamp ?? "");
  const startDate = parseEpgDate(startRaw, item.start_timestamp);
  const endDate = parseEpgDate(endRaw, item.stop_timestamp);
  const now = Date.now();
  const isCurrent =
    item.now_playing === 1 ||
    (startDate !== null &&
      endDate !== null &&
      startDate.getTime() <= now &&
      endDate.getTime() > now);

  return {
    id: String(item.id ?? index),
    title,
    description,
    start: formatEpgTime(startDate, startRaw),
    end: formatEpgTime(endDate, endRaw),
    startDate,
    endDate,
    isCurrent,
  };
}

function parseEpgDate(raw: string, timestamp?: string | number) {
  if (timestamp !== undefined) {
    const numeric = Number(timestamp);
    if (Number.isFinite(numeric) && numeric > 0) {
      return new Date(numeric * 1000);
    }
  }

  if (!raw) return null;
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;

  const compact = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!compact) return null;
  const [, year, month, day, hour, minute, second = "00"] = compact;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}

function formatEpgTime(date: Date | null, raw: string) {
  if (date) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return raw || "--:--";
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    try {
      return atob(value);
    } catch {
      return value;
    }
  }
}

export async function fetchShortEpg(
  credentials: Credentials,
  streamId: number
): Promise<EpgEntry[]> {
  const response = await fetch(
    buildApiUrl(credentials, "get_short_epg", {
      stream_id: String(streamId),
      limit: "12",
    })
  );

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a programacao do canal.");
  }

  const data = (await response.json()) as XtreamShortEpgResponse;
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data.epg_listings)
      ? data.epg_listings
      : Array.isArray(data.listings)
        ? data.listings
        : [];

  return rawItems.map((item, index) => normalizeEpgItem(item, index));
}
