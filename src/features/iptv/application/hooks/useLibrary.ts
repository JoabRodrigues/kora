import { useEffect, useMemo, useState } from "react";
import {
  ALL_CATEGORY_ID,
  CONTINUE_WATCHING_CATEGORY_ID,
  FAVORITES_CATEGORY_ID,
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

type UseLibraryArgs = {
  continueWatching: Record<string, ContinueWatchingEntry>;
  credentials: Credentials;
  favoriteKeys: string[];
  recentKeys: string[];
  sessionActive: boolean;
  setErrorMessage: (value: string) => void;
  setStatusMessage: (value: string) => void;
};

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
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [sidebarView, setSidebarView] = useState<SidebarView>("categories");
  const [selectedSeries, setSelectedSeries] = useState<NormalizedChannel | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (!sessionActive) return;
    setSidebarView("categories");
    setSelectedCategory(ALL_CATEGORY_ID);
    setSelectedChannelId(null);
    setSelectedSeries(null);
    setSelectedSeasonId("");
    setSearch("");
    loadContent(mode).catch(() => undefined);
  }, [mode, sessionActive]);

  async function loadContent(nextMode: ContentMode) {
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage(
      `Carregando ${nextMode === "live" ? "canais" : nextMode === "movie" ? "filmes" : "series"}...`
    );

    try {
      const library = await fetchModeLibrary(credentials, nextMode);
      setCategories(library.categories);
      setChannels(library.items);
      setStatusMessage(library.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao carregar conteudo.";
      setCategories([]);
      setChannels([]);
      setSelectedChannelId(null);
      setErrorMessage(message);
      setStatusMessage("Falha ao carregar biblioteca.");
    } finally {
      setIsLoading(false);
    }
  }

  async function openSeries(channel: NormalizedChannel) {
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage(`Carregando episodios de ${channel.name}...`);

    try {
      const episodes = await fetchSeriesEpisodes(credentials, channel);
      setChannels(episodes);
      setSelectedSeries(channel);
      setSelectedSeasonId("");
      setSelectedChannelId(null);
      setSidebarView("episodes");
      setStatusMessage(`${episodes.length} episodio(s) carregado(s).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao abrir serie.";
      setErrorMessage(message);
      setStatusMessage("Falha ao carregar serie.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectCategory(categoryId: string) {
    setSelectedCategory(categoryId);
    setSidebarView("channels");
    setSelectedSeasonId("");
  }

  function handleSelectChannel(channel: NormalizedChannel) {
    if (mode === "series" && sidebarView !== "episodes") {
      openSeries(channel).catch(() => undefined);
      return;
    }

    setSelectedChannelId(channel.id);
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
    selectedSeasonId,
    selectedSeries,
    setCategorySearch,
    setMode,
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
