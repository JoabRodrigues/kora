import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_CATEGORY_ID,
  CONTINUE_WATCHING_CATEGORY_ID,
  FAVORITES_CATEGORY_ID,
  LIBRARY_CACHE_STORAGE_KEY,
  LIBRARY_CACHE_TTL_MS,
  RECENTS_CATEGORY_ID,
} from "../../domain/constants";
import type {
  CategoryEntry,
  ContentMode,
  ContinueWatchingEntry,
  Credentials,
  NormalizedCategory,
  NormalizedChannel,
  SidebarView,
} from "../../domain/types";
import { itemLabel, selectedCategoryName } from "../../domain/utils";
import { fetchModeLibrary, fetchSeriesEpisodes } from "../../infrastructure/api";
import { readPersistentValue, writePersistentValue } from "../../infrastructure/storage";

type CachedModeLibrary = {
  categories: NormalizedCategory[];
  items: NormalizedChannel[];
  message: string;
  updatedAt: string;
};

type CachedSeriesEpisodes = {
  items: NormalizedChannel[];
  updatedAt: string;
};

type LibraryCacheStore = {
  libraries: Partial<Record<string, CachedModeLibrary>>;
  seriesEpisodes: Partial<Record<string, CachedSeriesEpisodes>>;
};

type UseLibraryArgs = {
  continueWatching: Record<string, ContinueWatchingEntry>;
  credentials: Credentials;
  favoriteKeys: string[];
  recentKeys: string[];
  sessionActive: boolean;
  setErrorMessage: (value: string) => void;
  setStatusMessage: (value: string) => void;
};

const SELECT_SEASON_PLACEHOLDER = "__select-season__";

export function useLibrary({
  continueWatching,
  credentials,
  favoriteKeys,
  recentKeys,
  sessionActive,
  setErrorMessage,
  setStatusMessage,
}: UseLibraryArgs) {
  const [mode, setMode] = useState<ContentMode>("live");
  const [categories, setCategories] = useState<NormalizedCategory[]>([]);
  const [channels, setChannels] = useState<NormalizedChannel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_ID);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedChannelKey, setSelectedChannelKey] = useState<string | null>(null);
  const [selectedChannelVersion, setSelectedChannelVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [sidebarView, setSidebarView] = useState<SidebarView>("categories");
  const [selectedSeries, setSelectedSeries] = useState<NormalizedChannel | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const modeLibraryMemoryRef = useRef<Partial<Record<ContentMode, CachedModeLibrary>>>({});

  function cancelPendingRequest() {
    requestIdRef.current += 1;
    setIsLoading(false);
  }

  function buildProfileCacheKey() {
    return `${credentials.serverUrl.trim()}|${credentials.username.trim()}`;
  }

  function buildLibraryCacheKey(nextMode: ContentMode) {
    return `${buildProfileCacheKey()}|${nextMode}`;
  }

  function buildSeriesCacheKey(series: NormalizedChannel) {
    return `${buildProfileCacheKey()}|series:${series.id}`;
  }

  function isFresh(updatedAt: string) {
    return Date.now() - new Date(updatedAt).getTime() < LIBRARY_CACHE_TTL_MS;
  }

  async function readCache() {
    return readPersistentValue<LibraryCacheStore>(LIBRARY_CACHE_STORAGE_KEY, {
      libraries: {},
      seriesEpisodes: {},
    });
  }

  async function writeLibraryCache(nextMode: ContentMode, library: CachedModeLibrary) {
    const cache = await readCache();
    cache.libraries[buildLibraryCacheKey(nextMode)] = library;
    await writePersistentValue(LIBRARY_CACHE_STORAGE_KEY, cache);
  }

  async function writeSeriesCache(series: NormalizedChannel, items: NormalizedChannel[]) {
    const cache = await readCache();
    cache.seriesEpisodes[buildSeriesCacheKey(series)] = {
      items,
      updatedAt: new Date().toISOString(),
    };
    await writePersistentValue(LIBRARY_CACHE_STORAGE_KEY, cache);
  }

  function applyLibrarySnapshot(library: CachedModeLibrary) {
    setCategories(library.categories);
    setChannels(library.items);
    setStatusMessage(library.message);
  }

  const visibleChannels = useMemo(() => {
    const term = search.toLowerCase().trim();
    return channels.filter((channel) => {
      const matchCategory =
        selectedCategory === ALL_CATEGORY_ID ||
        (selectedCategory === FAVORITES_CATEGORY_ID && favoriteKeys.includes(channel.key)) ||
        (selectedCategory === RECENTS_CATEGORY_ID && recentKeys.includes(channel.key)) ||
        (selectedCategory === CONTINUE_WATCHING_CATEGORY_ID &&
          mode === "movie" &&
          Boolean(continueWatching[channel.key]) &&
          continueWatching[channel.key].currentTime > 30 &&
          continueWatching[channel.key].duration - continueWatching[channel.key].currentTime > 30) ||
        channel.categoryId === selectedCategory;
      const matchSeason =
        !channel.seasonId ||
        selectedSeasonId.length === 0 ||
        channel.seasonId === selectedSeasonId;
      const matchSearch = term.length === 0 || channel.name.toLowerCase().includes(term);
      return matchCategory && matchSeason && matchSearch;
    });
  }, [
    channels,
    continueWatching,
    favoriteKeys,
    mode,
    recentKeys,
    search,
    selectedCategory,
    selectedSeasonId,
  ]);

  const visibleCategoryEntries = useMemo<CategoryEntry[]>(() => {
    const term = categorySearch.toLowerCase().trim();
    const entries: CategoryEntry[] = [
      {
        id: FAVORITES_CATEGORY_ID,
        title: "Favoritos",
        subtitle: `${channels.filter((channel) => favoriteKeys.includes(channel.key)).length} ${itemLabel(mode)}(s) favorito(s)`,
      },
      {
        id: RECENTS_CATEGORY_ID,
        title: "Recentes",
        subtitle: `${channels.filter((channel) => recentKeys.includes(channel.key)).length} ${itemLabel(mode)}(s) recente(s)`,
      },
      ...(mode === "movie"
        ? [
            {
              id: CONTINUE_WATCHING_CATEGORY_ID,
              title: "Continuar assistindo",
              subtitle: `${channels.filter((channel) => {
                const entry = continueWatching[channel.key];
                return Boolean(
                  entry && entry.currentTime > 30 && entry.duration - entry.currentTime > 30
                );
              }).length} filme(s) em progresso`,
            },
          ]
        : []),
      {
        id: ALL_CATEGORY_ID,
        title: "Todas",
        subtitle: `Exibir todos os ${itemLabel(mode)}s`,
      },
      ...categories.map((category) => ({
        id: category.id,
        title: category.name,
        subtitle: "Entrar na categoria",
      })),
    ];

    if (!term) return entries;
    return entries.filter((entry) => entry.title.toLowerCase().includes(term));
  }, [categories, categorySearch, channels, continueWatching, favoriteKeys, mode, recentKeys]);

  const selectedCategoryTitle = useMemo(
    () => selectedCategoryName(selectedCategory, mode, categories),
    [categories, mode, selectedCategory]
  );

  const seasonOptions = useMemo(
    () =>
      Array.from(new Set(channels.map((channel) => channel.seasonId).filter(Boolean))).map(
        (value) => value ?? ""
      ),
    [channels]
  );

  function resetNavigationState() {
    cancelPendingRequest();
    setSidebarView("categories");
    setSelectedCategory(ALL_CATEGORY_ID);
    setSelectedChannelId(null);
    setSelectedChannelKey(null);
    setSelectedChannelVersion(0);
    setSelectedSeries(null);
    setSelectedSeasonId("");
    setSearch("");
    setCategorySearch("");
  }

  useEffect(() => {
    if (!sessionActive) return;
    resetNavigationState();
    loadContent(mode).catch(() => undefined);
  }, [mode, sessionActive]);

  async function loadContent(nextMode: ContentMode) {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const cache = await readCache();
      if (requestId !== requestIdRef.current) {
        return;
      }
      const cachedLibrary = cache.libraries[buildLibraryCacheKey(nextMode)];

      if (cachedLibrary && isFresh(cachedLibrary.updatedAt)) {
        modeLibraryMemoryRef.current[nextMode] = cachedLibrary;
        applyLibrarySnapshot(cachedLibrary);
        return;
      }

      setStatusMessage(
        `Carregando ${nextMode === "live" ? "canais" : nextMode === "movie" ? "filmes" : "series"}...`
      );

      const library = await fetchModeLibrary(credentials, nextMode);
      if (requestId !== requestIdRef.current) {
        return;
      }
      const loadedLibrarySnapshot: CachedModeLibrary = {
        ...library,
        updatedAt: new Date().toISOString(),
      };
      modeLibraryMemoryRef.current[nextMode] = loadedLibrarySnapshot;
      applyLibrarySnapshot(loadedLibrarySnapshot);
      await writeLibraryCache(nextMode, loadedLibrarySnapshot);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : "Falha ao carregar conteudo.";
      setCategories([]);
      setChannels([]);
      setSelectedChannelId(null);
      setSelectedChannelKey(null);
      setErrorMessage(message);
      setStatusMessage("Falha ao carregar biblioteca.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  async function openSeries(channel: NormalizedChannel) {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage("");
    setSelectedSeries(channel);
    setSelectedSeasonId("");
    setSelectedChannelId(null);
    setSelectedChannelKey(null);
    setSidebarView("episodes");
    setChannels([]);

    try {
      const cache = await readCache();
      if (requestId !== requestIdRef.current) {
        return;
      }
      const cachedEpisodes = cache.seriesEpisodes[buildSeriesCacheKey(channel)];

      if (cachedEpisodes && isFresh(cachedEpisodes.updatedAt)) {
        setChannels(cachedEpisodes.items);
        setSelectedSeasonId(getInitialSeasonSelection(cachedEpisodes.items));
        setStatusMessage(`${cachedEpisodes.items.length} episodio(s) carregado(s).`);
        return;
      }

      setStatusMessage(`Carregando episodios de ${channel.name}...`);

      const episodes = await fetchSeriesEpisodes(credentials, channel);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setChannels(episodes);
      setSelectedSeasonId(getInitialSeasonSelection(episodes));
      setStatusMessage(`${episodes.length} episodio(s) carregado(s).`);
      await writeSeriesCache(channel, episodes);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : "Falha ao abrir serie.";
      setErrorMessage(message);
      setStatusMessage("Falha ao carregar serie.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  function handleModeChange(nextMode: ContentMode) {
    const memoryLibrary = modeLibraryMemoryRef.current[nextMode];

    if (nextMode === mode) {
      resetNavigationState();
      if (memoryLibrary) {
        applyLibrarySnapshot(memoryLibrary);
      }
      loadContent(nextMode).catch(() => undefined);
      return;
    }

    resetNavigationState();
    if (memoryLibrary) {
      applyLibrarySnapshot(memoryLibrary);
    } else {
      setCategories([]);
      setChannels([]);
    }
    setMode(nextMode);
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategory(categoryId);
    setSidebarView("channels");
    setSelectedSeasonId("");
  }

  function handleSelectChannel(channel: NormalizedChannel) {
    if (
      mode === "series" &&
      sidebarView !== "episodes" &&
      !channel.seasonId &&
      !channel.key.startsWith("series-episode:")
    ) {
      openSeries(channel).catch(() => undefined);
      return;
    }

    setSelectedChannelId(channel.id);
    setSelectedChannelKey(channel.key);
    setSelectedChannelVersion((current) => current + 1);
  }

  return {
    categorySearch,
    channels,
    isLoading,
    mode,
    search,
    seasonOptions,
    selectedCategoryTitle,
    selectedChannelId,
    selectedChannelKey,
    selectedChannelVersion,
    selectedSeasonId,
    selectedSeries,
    setCategorySearch,
    setMode: handleModeChange,
    setSearch,
    setSelectedSeasonId,
    setSidebarView,
    sidebarView,
    visibleCategoryEntries,
    visibleChannels,
    handleSelectCategory,
    handleSelectChannel,
    loadContent: () => loadContent(mode),
  };
}

function getInitialSeasonSelection(items: NormalizedChannel[]) {
  const seasonIds = Array.from(new Set(items.map((item) => item.seasonId).filter(Boolean)));
  return seasonIds.length > 1 ? SELECT_SEASON_PLACEHOLDER : "";
}
