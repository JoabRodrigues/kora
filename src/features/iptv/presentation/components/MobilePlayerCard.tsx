import { useEffect, useState } from "react";
import type { MobilePlayerCardProps } from "./mobile-types";
import { modeLabel } from "../../domain/utils";

export function MobilePlayerCard({
  activeChannel,
  continueWatching,
  currentProgram,
  favoriteKeys,
  isEpgLoading,
  isPlaying,
  onBack,
  onFavoriteToggle,
  onPlaybackError,
  onPlaybackStateChange,
  onProgress,
  upcomingPrograms,
  videoRef,
}: MobilePlayerCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof document === "undefined") {
      return;
    }

    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };

      const fullscreenElement =
        document.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement;

      setIsFullscreen(fullscreenElement === video || fullscreenElement === video.parentElement);
    };

    const handleWebkitBeginFullscreen = () => setIsFullscreen(true);
    const handleWebkitEndFullscreen = () => setIsFullscreen(false);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    video.addEventListener("webkitbeginfullscreen", handleWebkitBeginFullscreen);
    video.addEventListener("webkitendfullscreen", handleWebkitEndFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      video.removeEventListener("webkitbeginfullscreen", handleWebkitBeginFullscreen);
      video.removeEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
    };
  }, [videoRef]);

  if (!activeChannel) {
    return null;
  }

  const continueEntry = continueWatching[activeChannel.key];
  const progressPercent =
    continueEntry && continueEntry.duration > 0
      ? Math.max(0, Math.min(100, (continueEntry.currentTime / continueEntry.duration) * 100))
      : activeChannel.mode === "live"
        ? 72
        : 0;
  const isFavorite = favoriteKeys.includes(activeChannel.key);

  return (
    <section className="mobile-player-card panel">
      <div className="mobile-player-hero">
        <div className="mobile-player-head">
          <div className="mobile-player-title-group">
            {!isFullscreen ? (
              <button type="button" className="mobile-player-back" onClick={onBack}>
                <span aria-hidden="true">←</span>
                Voltar
              </button>
            ) : null}
            <span className="mobile-section-label">{modeLabel(activeChannel.mode)}</span>
            <h2>{activeChannel.name}</h2>
          </div>
          <button
            type="button"
            className={isFavorite ? "mobile-favorite-button active" : "mobile-favorite-button"}
            onClick={() => onFavoriteToggle(activeChannel.key)}
            aria-label="Alternar favorito"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="mobile-player-meta-row">
          <span className={isPlaying ? "mobile-live-pill on-air" : "mobile-live-pill"}>
            {activeChannel.mode === "live" ? "Ao vivo" : "Em reproducao"}
          </span>
          <span className="mobile-player-chip">{activeChannel.epgId || modeLabel(activeChannel.mode)}</span>
          {isFavorite ? <span className="mobile-player-chip accent">Favorito</span> : null}
        </div>
      </div>

      <div className="mobile-video-wrap">
        <video
          ref={videoRef}
          className="mobile-video-frame"
          controls
          playsInline
          onPlay={() => onPlaybackStateChange(true)}
          onPause={() => onPlaybackStateChange(false)}
          onTimeUpdate={(event) =>
            onProgress(event.currentTarget.currentTime, event.currentTarget.duration)
          }
          onLoadedMetadata={(event) => {
            if (activeChannel.mode === "movie") {
              const entry = continueWatching[activeChannel.key];
              if (
                entry &&
                entry.currentTime > 30 &&
                entry.currentTime < event.currentTarget.duration - 15
              ) {
                event.currentTarget.currentTime = entry.currentTime;
              }
            }
            onProgress(event.currentTarget.currentTime, event.currentTarget.duration);
          }}
          onError={onPlaybackError}
        />
        <div className="mobile-video-overlay" />
        <div className="mobile-video-caption">
          <span className={isPlaying ? "mobile-live-pill on-air" : "mobile-live-pill"}>
            {activeChannel.mode === "live" ? "Live" : "Play"}
          </span>
          <strong>{currentProgram?.title ?? activeChannel.name}</strong>
        </div>
      </div>

      <div className="mobile-player-actions-row">
        <button
          type="button"
          className="mobile-player-action"
          onClick={() => onFavoriteToggle(activeChannel.key)}
        >
          {isFavorite ? "Remover favorito" : "Adicionar favorito"}
        </button>
        <button
          type="button"
          className="mobile-player-action secondary"
          onClick={() => {
            const video = videoRef.current;
            if (video) {
              if (video.paused) {
                void video.play();
              } else {
                video.pause();
              }
            }
          }}
        >
          {isPlaying ? "Pausar" : "Retomar"}
        </button>
      </div>

      <div className="mobile-progress-meta">
        <span>
          {activeChannel.mode === "live"
            ? currentProgram
              ? `${currentProgram.start} - ${currentProgram.end}`
              : "Sem grade ativa"
            : continueEntry
              ? "Continuar assistindo"
              : "Pronto para reproduzir"}
        </span>
        <span>{Math.round(progressPercent)}%</span>
      </div>
      <div className="mobile-progress-track">
        <div className="mobile-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {activeChannel.mode === "live" && !isFullscreen ? (
        <div className="mobile-epg-block">
          <div className="mobile-card-header">
            <span className="mobile-section-label">Programacao</span>
            {isEpgLoading ? <span className="mobile-muted-text">Atualizando...</span> : null}
          </div>

          {currentProgram ? (
            <article className="mobile-epg-now">
              <span className="mobile-muted-text">
                {currentProgram.start} - {currentProgram.end}
              </span>
              <strong>{currentProgram.title}</strong>
              {currentProgram.description ? <p>{currentProgram.description}</p> : null}
              <div className="mobile-progress-track rail">
                <div className="mobile-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </article>
          ) : (
            <div className="mobile-empty-card">Sem programacao disponivel.</div>
          )}

          {upcomingPrograms.length > 0 ? (
            <div className="mobile-epg-list">
              {upcomingPrograms.slice(0, 3).map((program) => (
                <article key={program.id} className="mobile-epg-item">
                  <span className="mobile-muted-text">
                    {program.start} - {program.end}
                  </span>
                  <strong>{program.title}</strong>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
