import type { Dispatch, RefObject, SetStateAction } from "react";
import type {
  CategoryEntry,
  ContentMode,
  ContinueWatchingEntry,
  EpgEntry,
  NormalizedChannel,
  SidebarView,
} from "../../domain/types";

export type MobileHeaderHeroProps = {
  activeChannel: NormalizedChannel | null;
  categoryCount: number;
  favoriteCount: number;
  isHomeScreen: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  mode: ContentMode;
  recentCount: number;
  selectedCategoryTitle: string;
  sidebarView: SidebarView;
  statusMessage: string;
  currentProgram: EpgEntry | null;
  onChannelSelect: (channel: NormalizedChannel) => void;
  onToggleUserMenu: () => void;
};

export type MobilePlayerCardProps = {
  activeChannel: NormalizedChannel | null;
  continueWatching: Record<string, ContinueWatchingEntry>;
  currentProgram: EpgEntry | null;
  favoriteKeys: string[];
  isEpgLoading: boolean;
  isPlaying: boolean;
  onBack: () => void;
  onFavoriteToggle: (key: string) => void;
  onPlaybackError: () => void;
  onPlaybackStateChange: (isPlaying: boolean) => void;
  onProgress: (currentTime: number, duration: number) => void;
  upcomingPrograms: EpgEntry[];
  videoRef: RefObject<HTMLVideoElement | null>;
};

export type MobileBrowserProps = {
  categorySearch: string;
  continueWatching: Record<string, ContinueWatchingEntry>;
  favoriteKeys: string[];
  isHomeScreen: boolean;
  isLoading: boolean;
  mode: ContentMode;
  recentItems: NormalizedChannel[];
  recentKeys: string[];
  search: string;
  seasonOptions: string[];
  selectedCategoryTitle: string;
  selectedChannelId: number | null;
  selectedSeasonId: string;
  selectedSeriesName: string;
  sessionActive: boolean;
  sidebarView: SidebarView;
  visibleCategoryEntries: CategoryEntry[];
  visibleChannels: NormalizedChannel[];
  onBackToCategories: () => void;
  onBackToSeries: () => void;
  onCategorySearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onChannelSelect: (channel: NormalizedChannel) => void;
  onModeChange: (mode: ContentMode) => void;
  onSearchChange: (value: string) => void;
  onSeasonChange: (seasonId: string) => void;
  onToggleUserMenu: () => void;
};

export type MobileScreen = "home" | "browse" | "player";

export type MobileShellState = {
  mobileScreen: MobileScreen;
  setMobileScreen: Dispatch<SetStateAction<MobileScreen>>;
};
