import { modeLabel } from "../../domain/utils";
import type { MobileBrowserProps } from "./mobile-types";

export function MobileBrowser({
  categorySearch,
  continueWatching,
  favoriteKeys,
  isHomeScreen,
  isLoading,
  mode,
  recentItems,
  recentKeys,
  search,
  seasonOptions,
  selectedCategoryTitle,
  selectedChannelId,
  selectedSeasonId,
  selectedSeriesName,
  sessionActive,
  sidebarView,
  visibleCategoryEntries,
  visibleChannels,
  onBackToCategories,
  onBackToSeries,
  onCategorySearchChange,
  onCategorySelect,
  onChannelSelect,
  onModeChange,
  onSearchChange,
  onSeasonChange,
}: MobileBrowserProps) {
  const isSeasonSelectionPending =
    sidebarView === "episodes" && seasonOptions.length > 1 && selectedSeasonId === "__select-season__";
  const shortcutEntries = visibleCategoryEntries.filter((entry) =>
    ["favorites", "recents", "continue-watching"].includes(entry.id)
  );
  const primaryEntries = visibleCategoryEntries.filter(
    (entry) => !["favorites", "recents", "continue-watching"].includes(entry.id)
  );
  const recentLiveChannels = recentItems.filter((item) => item.mode === "live").slice(0, 3);
  const lastMovie =
    Object.entries(continueWatching)
      .sort(([, left], [, right]) => right.updatedAt.localeCompare(left.updatedAt))
      .map(([key]) => recentItems.find((item) => item.key === key) ?? null)
      .find(Boolean) ??
    recentItems.find((item) => item.mode === "movie") ??
    null;
  const lastSeriesEpisode =
    recentItems.find(
      (item) => item.mode === "series" && (item.key.startsWith("series-episode:") || item.seasonId)
    ) ?? recentItems.find((item) => item.mode === "series") ?? null;
  const showHomeOnly = sidebarView === "categories" && isHomeScreen;
  const showHomeSkeleton = isLoading && showHomeOnly;
  const showCategorySkeleton = isLoading && !showHomeOnly && sidebarView === "categories";
  const showChannelSkeleton =
    isLoading && !showHomeOnly && sidebarView !== "categories" && visibleChannels.length === 0;

  return (
    <section className="mobile-list-section">
      {!showHomeOnly ? (
        <>
          <div className="mobile-card-header">
            <div>
              <span className="mobile-section-label">
                {sidebarView === "categories" ? "Categorias" : "Navegacao"}
              </span>
              <h3>
                {sidebarView === "episodes"
                  ? selectedSeriesName
                  : sidebarView === "channels"
                    ? selectedCategoryTitle
                    : modeLabel(mode)}
              </h3>
            </div>
            {sidebarView !== "categories" ? (
              <button type="button" className="mobile-text-button" onClick={onBackToCategories}>
                Voltar
              </button>
            ) : null}
          </div>

          {shortcutEntries.length > 0 ? (
            <div className="mobile-shortcut-row">
              {shortcutEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="mobile-shortcut-pill"
                  onClick={() => onCategorySelect(entry.id)}
                >
                  {entry.title}
                </button>
              ))}
            </div>
          ) : null}

          <label className="mobile-search-field">
            <span className="mobile-search-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m15.5 14 5 5-1.5 1.5-5-5V14h1.5Zm-5 1a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              value={sidebarView === "categories" ? categorySearch : search}
              onChange={(event) =>
                sidebarView === "categories"
                  ? onCategorySearchChange(event.target.value)
                  : onSearchChange(event.target.value)
              }
              placeholder={sidebarView === "categories" ? "Buscar categoria" : "Buscar conteudo"}
            />
          </label>
        </>
      ) : null}

      {!showHomeOnly && sidebarView === "episodes" && seasonOptions.length > 1 ? (
        <div className="mobile-season-row">
          {seasonOptions.map((seasonId) => (
            <button
              key={seasonId}
              type="button"
              className={
                selectedSeasonId === seasonId ? "mobile-season-pill active" : "mobile-season-pill"
              }
              onClick={() => onSeasonChange(seasonId)}
            >
              T{seasonId}
            </button>
          ))}
        </div>
      ) : null}

      {showHomeOnly ? (
        <div className="mobile-home-stack">
          <section className="mobile-home-section">
            <div className="mobile-card-header">
              <div>
                <span className="mobile-section-label">Ao vivo</span>
                <h3>Canais recentes</h3>
              </div>
              <span className="mobile-count-badge">{recentLiveChannels.length}</span>
            </div>
            <div className="mobile-channel-list">
              {showHomeSkeleton
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`live-skeleton-${index}`}
                      className="mobile-channel-card skeleton"
                    />
                  ))
                : null}
              {recentLiveChannels.map((channel) => (
                <button
                  key={channel.key}
                  type="button"
                  className="mobile-channel-card"
                  onClick={() => {
                    onModeChange("live");
                    onChannelSelect(channel);
                  }}
                >
                  <div className="mobile-channel-art">
                    {channel.icon ? (
                      <img src={channel.icon} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{channel.name.slice(0, 1)}</span>
                    )}
                  </div>
                  <div className="mobile-channel-copy">
                    <div className="mobile-channel-head">
                      <strong>{channel.name}</strong>
                    </div>
                    <p>{channel.epgId || "Canal recente"}</p>
                  </div>
                </button>
              ))}
              {!showHomeSkeleton && recentLiveChannels.length === 0 ? (
                <button
                  type="button"
                  className="mobile-category-card featured"
                  onClick={() => {
                    onModeChange("live");
                    onCategorySelect("all");
                  }}
                >
                  <span className="mobile-section-label">Ao vivo</span>
                  <strong>Explorar canais</strong>
                </button>
              ) : null}
            </div>
          </section>

          <section className="mobile-home-section">
            <div className="mobile-card-header">
              <div>
                <span className="mobile-section-label">Filmes</span>
                <h3>Ultimo filme</h3>
              </div>
              <span className="mobile-count-badge">{lastMovie ? 1 : 0}</span>
            </div>
            <div className="mobile-featured-grid">
              {showHomeSkeleton
                ? Array.from({ length: 1 }).map((_, index) => (
                    <div
                      key={`movie-skeleton-${index}`}
                      className="mobile-feature-card featured skeleton"
                    />
                  ))
                : null}
              {lastMovie ? (
                <button
                  key={lastMovie.key}
                  type="button"
                  className="mobile-feature-card featured"
                  onClick={() => onChannelSelect(lastMovie)}
                >
                  <div className="mobile-media-bleed">
                    {lastMovie.icon ? (
                      <img src={lastMovie.icon} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    ) : null}
                  </div>
                  <div className="mobile-card-gradient" />
                  <span className="mobile-section-label">Filme</span>
                  <strong>{lastMovie.name}</strong>
                  <p>{continueWatching[lastMovie.key] ? "Continuar assistindo" : lastMovie.epgId || "Ultimo filme"}</p>
                </button>
              ) : null}
              {!showHomeSkeleton && !lastMovie ? (
                <button
                  type="button"
                  className="mobile-category-card featured"
                  onClick={() => {
                    onModeChange("movie");
                    onCategorySelect("all");
                  }}
                >
                  <span className="mobile-section-label">Filmes</span>
                  <strong>Explorar filmes</strong>
                </button>
              ) : null}
            </div>
          </section>

          <section className="mobile-home-section">
            <div className="mobile-card-header">
              <div>
                <span className="mobile-section-label">Series</span>
                <h3>Ultimo episodio</h3>
              </div>
              <span className="mobile-count-badge">{lastSeriesEpisode ? 1 : 0}</span>
            </div>
            <div className="mobile-featured-grid">
              {showHomeSkeleton
                ? Array.from({ length: 1 }).map((_, index) => (
                    <div
                      key={`series-skeleton-${index}`}
                      className="mobile-feature-card featured skeleton"
                    />
                  ))
                : null}
              {lastSeriesEpisode ? (
                <button
                  key={lastSeriesEpisode.key}
                  type="button"
                  className="mobile-feature-card featured"
                  onClick={() => onChannelSelect(lastSeriesEpisode)}
                >
                  <div className="mobile-media-bleed">
                    {lastSeriesEpisode.icon ? (
                      <img
                        src={lastSeriesEpisode.icon}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                  </div>
                  <div className="mobile-card-gradient" />
                  <span className="mobile-section-label">
                    {lastSeriesEpisode.seasonId ? `T${lastSeriesEpisode.seasonId}` : "Serie"}
                  </span>
                  <strong>{lastSeriesEpisode.name}</strong>
                  <p>{lastSeriesEpisode.epgId || "Ultimo episodio assistido"}</p>
                </button>
              ) : null}
              {!showHomeSkeleton && !lastSeriesEpisode ? (
                <button
                  type="button"
                  className="mobile-category-card featured"
                  onClick={() => {
                    onModeChange("series");
                    onCategorySelect("all");
                  }}
                >
                  <span className="mobile-section-label">Series</span>
                  <strong>Explorar series</strong>
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : sidebarView === "categories" ? (
        <div className="mobile-category-grid">
          {showCategorySkeleton
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`browse-category-skeleton-${index}`}
                  className={index === 0 ? "mobile-category-card featured skeleton" : "mobile-category-card skeleton"}
                />
              ))
            : null}
          {primaryEntries.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              className={index === 0 ? "mobile-category-card featured" : "mobile-category-card"}
              onClick={() => onCategorySelect(entry.id)}
            >
              <span className="mobile-section-label">{entry.subtitle || "Colecao"}</span>
              <strong>{entry.title}</strong>
            </button>
          ))}
          {!showCategorySkeleton && primaryEntries.length === 0 ? (
            <div className="mobile-empty-card">Nenhuma categoria encontrada.</div>
          ) : null}
        </div>
      ) : (
        <div className="mobile-channel-list">
          {sidebarView === "episodes" ? (
            <button type="button" className="mobile-text-button align-left" onClick={onBackToSeries}>
              Voltar para series
            </button>
          ) : null}

          {showChannelSkeleton
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={`channel-skeleton-${index}`} className="mobile-channel-card skeleton" />
              ))
            : null}
          {visibleChannels.map((channel) => {
            const isFavorite = favoriteKeys.includes(channel.key);
            const isRecent = recentKeys.includes(channel.key);
            const isActive = channel.id === selectedChannelId;

            return (
              <button
                key={channel.key}
                type="button"
                className={isActive ? "mobile-channel-card active" : "mobile-channel-card"}
                onClick={() => onChannelSelect(channel)}
              >
                <div className="mobile-channel-art">
                  {channel.icon ? (
                    <img src={channel.icon} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{channel.name.slice(0, 1)}</span>
                  )}
                </div>
                <div className="mobile-channel-copy">
                  <div className="mobile-channel-head">
                    <strong>{channel.name}</strong>
                    <span className="mobile-channel-flags">
                      {isFavorite ? <em>Fav</em> : null}
                      {isRecent ? <em>Rec</em> : null}
                    </span>
                  </div>
                  <p>{channel.epgId || modeLabel(channel.mode)}</p>
                </div>
              </button>
            );
          })}

          {!showChannelSkeleton && !isLoading && sessionActive && visibleChannels.length === 0 ? (
            <div className="mobile-empty-card">
              {isSeasonSelectionPending
                ? "Selecione uma temporada para ver os episodios."
                : "Nenhum item encontrado para esse filtro."}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
