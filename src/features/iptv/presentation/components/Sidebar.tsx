import { useMemo, useState } from "react";
import type {
  CategoryEntry,
  ContentMode,
  NormalizedChannel,
  SidebarView,
} from "../../domain/types";
import { itemLabel, modeLabel } from "../../domain/utils";

type SidebarProps = {
  categorySearch: string;
  channels: NormalizedChannel[];
  isLoading: boolean;
  mode: ContentMode;
  recentKeys: string[];
  favoriteKeys: string[];
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
  onChannelSelect: (channel: NormalizedChannel) => void;
  onCategorySelect: (categoryId: string) => void;
  onSearchChange: (value: string) => void;
  onSeasonChange: (seasonId: string) => void;
};

export function Sidebar({
  categorySearch,
  channels,
  favoriteKeys,
  isLoading,
  mode,
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
  onSearchChange,
  onSeasonChange,
}: SidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const primaryEntries = useMemo(
    () =>
      visibleCategoryEntries.filter(
        (entry) => !["favorites", "recents", "continue-watching"].includes(entry.id)
      ),
    [visibleCategoryEntries]
  );

  const visiblePrimaryEntries = showAllCategories
    ? primaryEntries
    : primaryEntries.slice(0, 8);

  return (
    <aside className="sidebar-column">
      <article className="panel categories-panel">
        {sidebarView === "categories" ? (
          <>
            <div className="panel-header">
              <div>
                <span className="eyebrow">Categorias</span>
                <strong className="panel-title">{modeLabel(mode)}</strong>
              </div>
              <span className="count-pill">{visibleCategoryEntries.length}</span>
            </div>

            <div className="shortcut-row">
              {visibleCategoryEntries
                .filter((entry) =>
                  ["favorites", "recents", "continue-watching"].includes(entry.id)
                )
                .map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="shortcut-chip"
                    onClick={() => onCategorySelect(entry.id)}
                  >
                    <span className="shortcut-icon" aria-hidden="true">
                      {entry.id === "favorites" ? (
                        <svg viewBox="0 0 24 24">
                          <path
                            d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : entry.id === "recents" ? (
                        <svg viewBox="0 0 24 24">
                          <path
                            d="M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 13 5V1l5 4-5 4z"
                            fill="currentColor"
                          />
                          <path d="M12 7h2v6h-5v-2h3z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24">
                          <path
                            d="M17 3H7a2 2 0 0 0-2 2v14l7-3 7 3V5a2 2 0 0 0-2-2Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </span>
                    {entry.title}
                  </button>
                ))}
            </div>

            <div className="channels-header sidebar-search">
              <div className="search-wrap full-width">
                <input
                  value={categorySearch}
                  onChange={(event) => onCategorySearchChange(event.target.value)}
                  placeholder="Buscar categoria"
                />
              </div>
            </div>

            <div className="category-list">
              {visiblePrimaryEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="category-row"
                  onClick={() => onCategorySelect(entry.id)}
                >
                  <span>
                    <strong>{entry.title}</strong>
                  </span>
                </button>
              ))}
              {primaryEntries.length > 8 ? (
                <button
                  type="button"
                  className="show-more-button"
                  onClick={() => setShowAllCategories((current) => !current)}
                >
                  {showAllCategories ? "Mostrar menos" : "Mostrar mais"}
                </button>
              ) : null}
              {visibleCategoryEntries.length === 0 ? (
                <div className="empty-list">Nenhuma categoria encontrada.</div>
              ) : null}
            </div>
          </>
        ) : sidebarView === "episodes" ? (
          <>
            <div className="panel-header">
              <div>
                <span className="eyebrow">Episodios</span>
                <strong className="panel-title">{selectedSeriesName}</strong>
              </div>
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={onBackToSeries}
              >
                Voltar
              </button>
            </div>

            <div className="channels-header sidebar-search">
              <div className="search-wrap full-width">
                <input
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar episodio"
                />
              </div>
            </div>

            {seasonOptions.length > 1 ? (
              <div className="season-row">
                {seasonOptions.map((seasonId) => (
                  <button
                    key={seasonId}
                    type="button"
                    className={selectedSeasonId === seasonId ? "season-chip active" : "season-chip"}
                    onClick={() => onSeasonChange(seasonId)}
                  >
                    T{seasonId}
                  </button>
                ))}
              </div>
            ) : null}

            <ChannelList
              channels={visibleChannels}
              emptyMessage="Nenhum episodio encontrado para esse filtro."
              favoriteKeys={favoriteKeys}
              recentKeys={recentKeys}
              selectedChannelId={selectedChannelId}
              onChannelSelect={onChannelSelect}
            />
          </>
        ) : (
          <>
            <div className="panel-header">
              <div>
                <span className="eyebrow">{modeLabel(mode)}</span>
                <strong className="panel-title">{selectedCategoryTitle}</strong>
              </div>
              <button
                type="button"
                className="ghost-button compact-button"
                onClick={onBackToCategories}
              >
                Voltar
              </button>
            </div>

            <div className="channels-header sidebar-search">
              <div className="search-wrap full-width">
                <input
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={`Buscar ${itemLabel(mode)}`}
                />
              </div>
            </div>

            <ChannelList
              channels={visibleChannels}
              emptyMessage={
                !isLoading && sessionActive
                  ? "Nenhum item encontrado para esse filtro."
                  : ""
              }
              favoriteKeys={favoriteKeys}
              recentKeys={recentKeys}
              selectedChannelId={selectedChannelId}
              onChannelSelect={onChannelSelect}
            />
          </>
        )}
      </article>
    </aside>
  );
}

type ChannelListProps = {
  channels: NormalizedChannel[];
  emptyMessage: string;
  favoriteKeys: string[];
  recentKeys: string[];
  selectedChannelId: number | null;
  onChannelSelect: (channel: NormalizedChannel) => void;
};

function ChannelList({
  channels,
  emptyMessage,
  favoriteKeys,
  recentKeys,
  selectedChannelId,
  onChannelSelect,
}: ChannelListProps) {
  return (
    <div className="channels-list sidebar-channels-list">
      {channels.map((channel) => (
        <button
          key={channel.key}
          type="button"
          className={channel.id === selectedChannelId ? "channel-item active" : "channel-item"}
          onClick={() => onChannelSelect(channel)}
        >
          <div className="channel-main">
            {channel.icon ? (
              <img
                className="channel-logo"
                src={channel.icon}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="channel-logo fallback">{channel.name.slice(0, 1)}</div>
            )}
            <div>
              <div className="channel-title-row">
                <strong>{channel.name}</strong>
                <span className="channel-flags">
                  {favoriteKeys.includes(channel.key) ? (
                    <span className="channel-flag favorite">Fav</span>
                  ) : null}
                  {recentKeys.includes(channel.key) ? (
                    <span className="channel-flag recent">Rec</span>
                  ) : null}
                </span>
              </div>
              <small>{channel.epgId}</small>
            </div>
          </div>
        </button>
      ))}
      {emptyMessage && channels.length === 0 ? <div className="empty-list">{emptyMessage}</div> : null}
    </div>
  );
}
