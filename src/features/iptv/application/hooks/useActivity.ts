import {
  CONTINUE_WATCHING_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  RECENTS_STORAGE_KEY,
} from "../../domain/constants";
import type { ContinueWatchingEntry, NormalizedChannel } from "../../domain/types";
import { usePersistentState } from "../../infrastructure/storage";

export function useActivity() {
  const [favoriteKeys, setFavoriteKeys] = usePersistentState<string[]>(
    FAVORITES_STORAGE_KEY,
    []
  );
  const [recentKeys, setRecentKeys] = usePersistentState<string[]>(
    RECENTS_STORAGE_KEY,
    []
  );
  const [continueWatching, setContinueWatching] = usePersistentState<
    Record<string, ContinueWatchingEntry>
  >(CONTINUE_WATCHING_STORAGE_KEY, {});

  function toggleFavorite(channelKey: string) {
    setFavoriteKeys((current) =>
      current.includes(channelKey)
        ? current.filter((key) => key !== channelKey)
        : [channelKey, ...current]
    );
  }

  function updateContinueWatching(
    activeChannel: NormalizedChannel | null,
    currentTime: number,
    duration: number
  ) {
    if (!activeChannel || activeChannel.mode !== "movie") return;
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return;

    setContinueWatching((current) => {
      if (currentTime < 30 || duration - currentTime < 15) {
        const next = { ...current };
        delete next[activeChannel.key];
        return next;
      }

      return {
        ...current,
        [activeChannel.key]: {
          currentTime,
          duration,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }

  function registerRecent(activeChannel: NormalizedChannel | null) {
    if (!activeChannel) return;
    setRecentKeys((current) => {
      const next = [activeChannel.key, ...current.filter((key) => key !== activeChannel.key)];
      return next.slice(0, 24);
    });
  }

  return {
    continueWatching,
    favoriteKeys,
    recentKeys,
    registerRecent,
    toggleFavorite,
    updateContinueWatching,
  };
}
