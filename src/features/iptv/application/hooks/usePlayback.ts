import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Credentials, NormalizedChannel } from "../../domain/types";
import {
  buildLiveStreamCandidates,
  buildPlaybackUrl,
  modeLabel,
} from "../../domain/utils";

export function usePlayback(
  credentials: Credentials,
  channels: NormalizedChannel[],
  recentItems: NormalizedChannel[],
  selectedChannelId: number | null,
  selectedChannelKey: string | null,
  selectedChannelVersion: number,
  setStatusMessage: (value: string) => void,
  setErrorMessage: (value: string) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const activeChannel = useMemo(
    () =>
      (selectedChannelKey
        ? channels.find((channel) => channel.key === selectedChannelKey) ??
          recentItems.find((channel) => channel.key === selectedChannelKey) ??
          null
        : channels.find((channel) => channel.id === selectedChannelId) ??
          recentItems.find((channel) => channel.id === selectedChannelId) ??
          null),
    [channels, recentItems, selectedChannelId, selectedChannelKey]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel) return;

    const [hlsCandidate, fallbackCandidate] = buildLiveStreamCandidates(credentials, activeChannel.id);
    const playbackUrl = activeChannel.directSource || buildPlaybackUrl(
      credentials,
      activeChannel.mode,
      activeChannel.id,
      activeChannel.extension
    );
    const shouldUseHls =
      playbackUrl.toLowerCase().includes(".m3u8") &&
      activeChannel.mode !== "live" &&
      Hls.isSupported();

    setErrorMessage("");
    setStatusMessage(`Sintonizando ${activeChannel.name}...`);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    if ((activeChannel.mode === "live" && Hls.isSupported()) || shouldUseHls) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(activeChannel.mode === "live" ? hlsCandidate : playbackUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setStatusMessage(`Ao vivo: ${activeChannel.name}`);
          })
          .catch(() => {
            setIsPlaying(false);
            setStatusMessage(`Canal pronto: ${activeChannel.name}`);
          });
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (activeChannel.mode !== "live") {
          setIsPlaying(false);
          setErrorMessage(
            "Nao foi possivel iniciar a reproducao da serie. Verifique formato, URL do stream ou permissao do provedor."
          );
          return;
        }

        video.src = fallbackCandidate;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setStatusMessage(`Ao vivo: ${activeChannel.name}`);
          })
          .catch(() => {
            setErrorMessage(
              "O stream falhou no navegador. Verifique CORS, credenciais ou formato do canal."
            );
          });
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    video.src = playbackUrl;
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        setStatusMessage(`${modeLabel(activeChannel.mode)}: ${activeChannel.name}`);
      })
      .catch(() => {
        setIsPlaying(false);
        if (activeChannel.mode !== "live") {
          setErrorMessage(
            "Nao foi possivel iniciar a reproducao. Verifique se o provedor permite playback via navegador."
          );
          return;
        }

        video.src = fallbackCandidate;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setStatusMessage(`Ao vivo: ${activeChannel.name}`);
          })
          .catch(() => {
            setErrorMessage(
              "Nao foi possivel iniciar o canal. Verifique se o provedor permite playback via navegador."
            );
          });
      });

    return () => {
      video.pause();
    };
  }, [activeChannel, credentials, selectedChannelVersion, setErrorMessage, setStatusMessage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleFullscreenChange = () => {
      const isFullscreen = isPlayerFullscreen(video);
      if (isFullscreen) {
        lockScreenOrientation("landscape");
        return;
      }

      lockScreenOrientation("portrait");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitbeginfullscreen", handleFullscreenChange as EventListener);
    video.addEventListener("webkitendfullscreen", handleFullscreenChange as EventListener);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video.removeEventListener("webkitbeginfullscreen", handleFullscreenChange as EventListener);
      video.removeEventListener("webkitendfullscreen", handleFullscreenChange as EventListener);
      unlockScreenOrientation();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  function handlePlaybackError() {
    setErrorMessage(
      "O navegador nao conseguiu reproduzir o conteudo atual. Pode ser bloqueio do provedor ou formato nao suportado."
    );
  }

  return {
    activeChannel,
    isPlaying,
    setIsPlaying,
    handlePlaybackError,
    videoRef,
  };
}

type OrientationLockType = "portrait" | "landscape";

type OrientationScreen = Screen & {
  orientation?: ScreenOrientation & {
    lock?: (orientation: OrientationLockType | "any") => Promise<void>;
    unlock?: () => void;
  };
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

function isPlayerFullscreen(video: HTMLVideoElement) {
  const doc = document as FullscreenDocument;
  const fullscreenElement =
    document.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement;

  return fullscreenElement === video || fullscreenElement === video.parentElement;
}

function lockScreenOrientation(orientation: OrientationLockType) {
  const screenWithOrientation = window.screen as OrientationScreen;
  void screenWithOrientation.orientation?.lock?.(orientation).catch(() => undefined);
}

function unlockScreenOrientation() {
  const screenWithOrientation = window.screen as OrientationScreen;
  if (screenWithOrientation.orientation?.unlock) {
    screenWithOrientation.orientation.unlock();
    return;
  }

  void screenWithOrientation.orientation?.lock?.("any").catch(() => undefined);
}
