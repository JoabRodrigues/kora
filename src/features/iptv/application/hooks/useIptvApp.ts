import { useEffect, useState, type FormEvent } from "react";
import type { SavedProfile } from "../../domain/types";
import { useActivity } from "./useActivity";
import { useEpg } from "./useEpg";
import { useLibrary } from "./useLibrary";
import { usePlayback } from "./usePlayback";
import { useProfiles } from "./useProfiles";
import { useSession } from "./useSession";

export function useIptvApp() {
  const [statusMessage, setStatusMessage] = useState(
    "Entre com URL, usuario e senha do provedor IPTV."
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const profiles = useProfiles();
  const activity = useActivity();
  const session = useSession({
    credentials: profiles.credentials,
    hasProfiles: profiles.savedProfiles.length > 0,
    onConnectSuccess: async () => {
      library.setSidebarView("categories");
      await library.loadContent();
    },
    onLogout: () => {
      library.setSidebarView("categories");
      library.setSearch("");
      library.setCategorySearch("");
      setStatusMessage("Sessao encerrada.");
      setErrorMessage("");
      setShowUserMenu(false);
    },
    setErrorMessage,
    setStatusMessage,
  });
  const library = useLibrary({
    continueWatching: activity.continueWatching,
    credentials: profiles.credentials,
    favoriteKeys: activity.favoriteKeys,
    recentKeys: activity.recentKeys,
    sessionActive: session.sessionActive,
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
    const result = await session.connect();
    if (result.shouldCloseMenu) {
      setShowUserMenu(false);
    }
  }

  function handleSaveProfile(profileName: string, profileId: string | null) {
    profiles.saveProfile(profileName, profileId, setErrorMessage, setStatusMessage);
  }

  async function handleTestConnection() {
    await session.connect({ closeUserMenu: false, validateOnly: true });
  }

  async function handleSaveAndConnect(profileName: string, profileId: string | null) {
    profiles.saveProfile(profileName, profileId, setErrorMessage, setStatusMessage);
    const result = await session.connect();
    if (result.shouldCloseMenu) {
      setShowUserMenu(false);
    }
  }

  function handleLoadProfile(profile: SavedProfile) {
    profiles.loadProfile(profile, setStatusMessage, setErrorMessage);
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
    handleLogout: session.logout,
    handlePlaybackError: playback.handlePlaybackError,
    handleSaveProfile,
    handleSaveAndConnect,
    handleSelectCategory: library.handleSelectCategory,
    handleSelectChannel: library.handleSelectChannel,
    handleTestConnection,
    isLoading: library.isLoading || session.isAuthenticating,
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
    session: session.sessionActive,
    setCategorySearch: library.setCategorySearch,
    setCredentials: profiles.setCredentials,
    setIsPlaying: playback.setIsPlaying,
    setMode: library.setMode,
    setSearch: library.setSearch,
    setSelectedSeasonId: library.setSelectedSeasonId,
    setShowUserMenu,
    setSidebarView: library.setSidebarView,
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
