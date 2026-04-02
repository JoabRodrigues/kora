import { useEffect, useState, type FormEvent } from "react";
import { authenticate } from "../api";
import type { SavedProfile } from "../types";
import { useActivity } from "./useActivity";
import { useEpg } from "./useEpg";
import { useLibrary } from "./useLibrary";
import { usePlayback } from "./usePlayback";
import { useProfiles } from "./useProfiles";

export function useIptvApp() {
  const [sessionActive, setSessionActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Entre com URL, usuario e senha do provedor IPTV."
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showProfiles, setShowProfiles] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const profiles = useProfiles();
  const activity = useActivity();
  const library = useLibrary({
    continueWatching: activity.continueWatching,
    credentials: profiles.credentials,
    favoriteKeys: activity.favoriteKeys,
    recentKeys: activity.recentKeys,
    sessionActive,
    setErrorMessage,
    setStatusMessage,
  });
  const playback = usePlayback(
    profiles.credentials,
    library.channels,
    library.selectedChannelId,
    setStatusMessage,
    setErrorMessage
  );
  const epg = useEpg(profiles.credentials, playback.activeChannel, setErrorMessage);

  useEffect(() => {
    activity.registerRecent(playback.activeChannel);
  }, [activity, playback.activeChannel]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    library.setSidebarView("categories");
    setErrorMessage("");
    setStatusMessage("Validando credenciais...");
    try {
      await authenticate(profiles.credentials);
      setSessionActive(true);
      setShowUserMenu(false);
      await library.loadContent();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha desconhecida ao conectar no IPTV.";
      setSessionActive(false);
      setErrorMessage(message);
      setStatusMessage("Conexao falhou.");
    }
  }

  function handleLogout() {
    setSessionActive(false);
    library.setSidebarView("categories");
    library.setSearch("");
    library.setCategorySearch("");
    setStatusMessage("Sessao encerrada.");
    setErrorMessage("");
    setShowUserMenu(false);
  }

  function handleSaveProfile() {
    profiles.saveProfile(setErrorMessage, setStatusMessage, setShowProfiles);
  }

  function handleLoadProfile(profile: SavedProfile) {
    profiles.loadProfile(
      profile,
      setStatusMessage,
      setErrorMessage,
      setShowProfiles,
      setShowUserMenu
    );
  }

  return {
    activeChannel: playback.activeChannel,
    categorySearch: library.categorySearch,
    channels: library.channels,
    continueWatching: activity.continueWatching,
    credentials: profiles.credentials,
    errorMessage,
    favoriteKeys: activity.favoriteKeys,
    handleDeleteProfile: profiles.deleteProfile,
    handleLoadProfile,
    handleLogin,
    handleLogout,
    handlePlaybackError: playback.handlePlaybackError,
    handleSaveProfile,
    handleSelectCategory: library.handleSelectCategory,
    handleSelectChannel: library.handleSelectChannel,
    isLoading: library.isLoading,
    isPlaying: playback.isPlaying,
    mode: library.mode,
    recentKeys: activity.recentKeys,
    reloadCurrentMode: library.loadContent,
    savedProfiles: profiles.savedProfiles,
    search: library.search,
    seasonOptions: library.seasonOptions,
    currentProgram: epg.currentProgram,
    isEpgLoading: epg.isEpgLoading,
    upcomingPrograms: epg.upcomingPrograms,
    selectedCategoryTitle: library.selectedCategoryTitle,
    selectedChannelId: library.selectedChannelId,
    selectedSeasonId: library.selectedSeasonId,
    selectedSeries: library.selectedSeries,
    session: sessionActive,
    setCategorySearch: library.setCategorySearch,
    setCredentials: profiles.setCredentials,
    setIsPlaying: playback.setIsPlaying,
    setMode: library.setMode,
    setSearch: library.setSearch,
    setSelectedSeasonId: library.setSelectedSeasonId,
    setShowProfiles,
    setShowUserMenu,
    setSidebarView: library.setSidebarView,
    showProfiles,
    showUserMenu,
    sidebarView: library.sidebarView,
    statusMessage,
    toggleFavorite: activity.toggleFavorite,
    updateContinueWatching: (currentTime: number, duration: number) =>
      activity.updateContinueWatching(playback.activeChannel, currentTime, duration),
    videoRef: playback.videoRef,
    visibleCategoryEntries: library.visibleCategoryEntries,
    visibleChannels: library.visibleChannels,
  };
}
