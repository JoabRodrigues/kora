import {
  ALL_CATEGORY_ID,
  CONTINUE_WATCHING_CATEGORY_ID,
  FAVORITES_CATEGORY_ID,
  RECENTS_CATEGORY_ID,
  UNCATEGORIZED_CATEGORY_ID,
} from "./constants";
import type {
  ContentMode,
  Credentials,
  NormalizedCategory,
  NormalizedChannel,
  XtreamCategory,
  XtreamChannel,
  XtreamSeries,
} from "./types";

export function emptyCredentials(): Credentials {
  return { serverUrl: "", username: "", password: "" };
}

export function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function normalizeCategoryId(value: string | number | null | undefined) {
  const raw = String(value ?? "").trim();
  return raw.length > 0 ? raw : UNCATEGORIZED_CATEGORY_ID;
}

export function buildApiUrl(
  credentials: Credentials,
  action?: string,
  extra?: Record<string, string>
) {
  const base = normalizeBaseUrl(credentials.serverUrl);
  const url = new URL(`${base}/player_api.php`);
  url.searchParams.set("username", credentials.username.trim());
  url.searchParams.set("password", credentials.password.trim());
  if (action) {
    url.searchParams.set("action", action);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export function buildLiveStreamCandidates(credentials: Credentials, streamId: number) {
  const base = normalizeBaseUrl(credentials.serverUrl);
  const username = credentials.username.trim();
  const password = credentials.password.trim();
  return [
    `${base}/live/${username}/${password}/${streamId}.m3u8`,
    `${base}/live/${username}/${password}/${streamId}.ts`,
  ];
}

export function buildPlaybackUrl(
  credentials: Credentials,
  mode: ContentMode,
  streamId: number,
  extension?: string
) {
  const base = normalizeBaseUrl(credentials.serverUrl);
  const username = credentials.username.trim();
  const password = credentials.password.trim();

  if (mode === "live") {
    return `${base}/live/${username}/${password}/${streamId}.m3u8`;
  }

  if (mode === "movie") {
    return `${base}/movie/${username}/${password}/${streamId}.${extension || "mp4"}`;
  }

  return `${base}/series/${username}/${password}/${streamId}.${extension || "mp4"}`;
}

export function inferProfileName(credentials: Credentials) {
  const url = normalizeBaseUrl(credentials.serverUrl);
  const host = url.replace(/^https?:\/\//, "");
  return `${credentials.username.trim() || "perfil"}@${host || "iptv"}`;
}

export function itemLabel(mode: ContentMode) {
  if (mode === "live") return "canal";
  if (mode === "movie") return "filme";
  return "serie";
}

export function modeLabel(mode: ContentMode) {
  if (mode === "live") return "Ao vivo";
  if (mode === "movie") return "Filmes";
  return "Series";
}

export function normalizeChannels(
  nextChannels: XtreamChannel[],
  mode: ContentMode
): NormalizedChannel[] {
  return nextChannels.map((channel) => ({
    key: `${mode}:${Number(channel.stream_id)}`,
    mode,
    id: Number(channel.stream_id),
    name: String(channel.name ?? "Canal sem nome").trim() || "Canal sem nome",
    categoryId: normalizeCategoryId(channel.category_id),
    icon: String(channel.stream_icon ?? "").trim(),
    epgId:
      mode === "movie"
        ? String(channel.container_extension ?? "mp4").trim().toUpperCase() || "VOD"
        : String(channel.epg_channel_id ?? "").trim(),
    extension: String(channel.container_extension ?? "mp4").trim() || "mp4",
  }));
}

export function normalizeSeries(seriesList: XtreamSeries[]): NormalizedChannel[] {
  return seriesList.map((series) => ({
    key: `series:${Number(series.series_id)}`,
    mode: "series",
    id: Number(series.series_id),
    name: String(series.name ?? "Serie sem nome").trim() || "Serie sem nome",
    categoryId: normalizeCategoryId(series.category_id),
    icon: String(series.cover ?? "").trim(),
    epgId: "Serie",
  }));
}

export function normalizeCategories(
  nextCategories: XtreamCategory[],
  nextChannels: NormalizedChannel[]
): NormalizedCategory[] {
  const map = new Map<string, string>();

  for (const category of nextCategories) {
    const id = normalizeCategoryId(category.category_id);
    const name = String(category.category_name ?? "").trim() || `Categoria ${id}`;
    map.set(id, name);
  }

  for (const channel of nextChannels) {
    if (!map.has(channel.categoryId)) {
      map.set(
        channel.categoryId,
        channel.categoryId === UNCATEGORIZED_CATEGORY_ID
          ? "Sem categoria"
          : `Categoria ${channel.categoryId}`
      );
    }
  }

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
}

export function selectedCategoryName(
  selectedCategory: string,
  mode: ContentMode,
  categories: NormalizedCategory[]
) {
  if (selectedCategory === ALL_CATEGORY_ID) return `Todos os ${itemLabel(mode)}s`;
  if (selectedCategory === FAVORITES_CATEGORY_ID) return "Favoritos";
  if (selectedCategory === RECENTS_CATEGORY_ID) return "Recentes";
  if (selectedCategory === CONTINUE_WATCHING_CATEGORY_ID) return "Continuar assistindo";
  return categories.find((category) => category.id === selectedCategory)?.name ?? "Categoria";
}
