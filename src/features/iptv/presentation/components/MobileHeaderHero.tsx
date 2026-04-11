import { modeLabel } from "../../domain/utils";
import type { MobileHeaderHeroProps } from "./mobile-types";

export function MobileHeaderHero({
  activeChannel,
  categoryCount,
  currentProgram,
  favoriteCount,
  isHomeScreen,
  isLoading,
  isPlaying,
  mode,
  recentCount,
  selectedCategoryTitle,
  sidebarView,
  onChannelSelect,
  onToggleUserMenu,
}: MobileHeaderHeroProps) {
  const heroTitle =
    activeChannel?.name ??
    (sidebarView === "categories" ? "Escolha o que assistir" : selectedCategoryTitle);

  const heroMeta =
    isLoading
      ? "Carregando dados..."
      : activeChannel?.mode === "live"
      ? currentProgram?.title ?? "Selecione um canal e acompanhe a programacao ao vivo."
      : activeChannel
        ? activeChannel.epgId || modeLabel(activeChannel.mode)
        : "";

  return (
    <>
      <header className="mobile-topbar">
        <div>
          <p className="mobile-kicker">IPTV player</p>
          <strong className="mobile-brand">Kora</strong>
        </div>
        <button
          type="button"
          className="mobile-icon-button"
          onClick={onToggleUserMenu}
          aria-label="Abrir perfis"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </header>

      {!isHomeScreen ? (
        <section className="mobile-hero panel">
          <div className="mobile-hero-backdrop" />
          <div className="mobile-hero-copy">
            <span className="mobile-live-pill">
              {activeChannel?.mode === "live" ? "Live now" : modeLabel(mode)}
            </span>
            <h1>{heroTitle}</h1>
            {heroMeta ? <p>{heroMeta}</p> : null}
            <div className="mobile-hero-actions">
              {activeChannel ? (
                <button
                  type="button"
                  className="mobile-cta-button"
                  onClick={() => onChannelSelect(activeChannel)}
                >
                  {isPlaying ? "Continuar" : "Assistir agora"}
                </button>
              ) : null}
              <button type="button" className="mobile-glass-button" onClick={onToggleUserMenu}>
                Perfis
              </button>
            </div>
            <div className="mobile-hero-stats">
              <div className="mobile-stat-chip">
                <span>{categoryCount}</span>
                <small>categorias</small>
              </div>
              <div className="mobile-stat-chip">
                <span>{favoriteCount}</span>
                <small>favoritos</small>
              </div>
              <div className="mobile-stat-chip">
                <span>{recentCount}</span>
                <small>recentes</small>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
