import type { RefObject } from "react";
import type {
  ContentMode,
  ContinueWatchingEntry,
  EpgEntry,
  NormalizedChannel,
} from "../types";
import { modeLabel } from "../utils";

type PlayerPanelProps = {
  activeChannel: NormalizedChannel | null;
  continueWatching: Record<string, ContinueWatchingEntry>;
  currentProgram: EpgEntry | null;
  isPlaying: boolean;
  isEpgLoading: boolean;
  mode: ContentMode;
  favoriteKeys: string[];
  onFavoriteToggle: (key: string) => void;
  onPlaybackStateChange: (isPlaying: boolean) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onPlaybackError: () => void;
  upcomingPrograms: EpgEntry[];
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function PlayerPanel({
  activeChannel,
  continueWatching,
  currentProgram,
  favoriteKeys,
  isPlaying,
  isEpgLoading,
  mode,
  onFavoriteToggle,
  onPlaybackError,
  onPlaybackStateChange,
  onProgress,
  upcomingPrograms,
  videoRef,
}: PlayerPanelProps) {
  return (
    <section className="player-column">
      <article className="panel player-panel">
        <div className="player-head">
          <div>
            <span className="eyebrow">{modeLabel(activeChannel?.mode ?? mode)}</span>
            <h2>{activeChannel?.name ?? "Nenhum conteudo selecionado"}</h2>
          </div>
          <div className="player-actions">
            {activeChannel ? (
              <button
                type="button"
                className={
                  favoriteKeys.includes(activeChannel.key)
                    ? "favorite-button active"
                    : "favorite-button"
                }
                onClick={() => onFavoriteToggle(activeChannel.key)}
                aria-label={
                  favoriteKeys.includes(activeChannel.key)
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
                title={
                  favoriteKeys.includes(activeChannel.key)
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="favorite-icon">
                  <path
                    d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ) : null}
            <div className={isPlaying ? "live-badge on" : "live-badge"}>
              {activeChannel?.mode === "live" ? "LIVE" : "PLAY"}
            </div>
          </div>
        </div>

        <div className="video-wrap">
          <video
            ref={videoRef}
            className="video-frame"
            controls
            playsInline
            onPlay={() => onPlaybackStateChange(true)}
            onPause={() => onPlaybackStateChange(false)}
            onTimeUpdate={(event) =>
              onProgress(event.currentTarget.currentTime, event.currentTarget.duration)
            }
            onLoadedMetadata={(event) => {
              if (activeChannel?.mode === "movie") {
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
          {!activeChannel ? (
            <div className="empty-state">Selecione um conteudo para iniciar a reproducao.</div>
          ) : null}
        </div>

        {activeChannel?.mode === "live" ? (
          <div className="epg-panel">
            <div className="epg-header">
              <span className="eyebrow">Programacao</span>
              {isEpgLoading ? <span className="epg-state">Atualizando...</span> : null}
            </div>

            {currentProgram ? (
              <div className="epg-current">
                <div className="epg-time">
                  {currentProgram.start} - {currentProgram.end}
                </div>
                <strong>{currentProgram.title}</strong>
                {currentProgram.description ? <p>{currentProgram.description}</p> : null}
              </div>
            ) : (
              <div className="empty-list">Sem programacao disponivel para este canal.</div>
            )}

            {upcomingPrograms.length > 0 ? (
              <div className="epg-list">
                {upcomingPrograms.map((program) => (
                  <div key={program.id} className="epg-item">
                    <span className="epg-time">
                      {program.start} - {program.end}
                    </span>
                    <strong>{program.title}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </section>
  );
}
