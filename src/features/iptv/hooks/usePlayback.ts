import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Credentials, NormalizedChannel } from "../types";
import { buildLiveStreamCandidates, buildPlaybackUrl, modeLabel } from "../utils";

export function usePlayback(
  credentials: Credentials,
  channels: NormalizedChannel[],
  selectedChannelId: number | null,
  setStatusMessage: (value: string) => void,
  setErrorMessage: (value: string) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const activeChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel) return;

    const [hlsCandidate, fallbackCandidate] = buildLiveStreamCandidates(credentials, activeChannel.id);
    setErrorMessage("");
    setStatusMessage(`Sintonizando ${activeChannel.name}...`);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (activeChannel.mode === "live" && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(hlsCandidate);
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

    video.src = buildPlaybackUrl(
      credentials,
      activeChannel.mode,
      activeChannel.id,
      activeChannel.extension
    );
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        setStatusMessage(`${modeLabel(activeChannel.mode)}: ${activeChannel.name}`);
      })
      .catch(() => {
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
  }, [activeChannel, credentials, setErrorMessage, setStatusMessage]);

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
