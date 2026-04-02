import type { ContentMode } from "../types";
import { modeLabel } from "../utils";
import logo from "../assets/kora-logo.svg";

type TopBarProps = {
  mode: ContentMode;
  statusMessage: string;
  onModeChange: (mode: ContentMode) => void;
  onToggleUserMenu: () => void;
};

export function TopBar({
  mode,
  statusMessage,
  onModeChange,
  onToggleUserMenu,
}: TopBarProps) {
  return (
    <section className="topbar">
      <div className="hero-copy">
        <img className="brand-logo" src={logo} alt="Kora" />
      </div>
      <div className="topbar-actions">
        <div className="mode-switch">
          {(["live", "movie", "series"] as ContentMode[]).map((entry) => (
            <button
              key={entry}
              type="button"
              className={mode === entry ? "mode-chip active" : "mode-chip"}
              onClick={() => onModeChange(entry)}
            >
              {modeLabel(entry)}
            </button>
          ))}
        </div>
        <div className="status-pill">{statusMessage}</div>
        <button
          type="button"
          className="user-button"
          onClick={onToggleUserMenu}
          aria-label="Abrir menu de usuario"
        >
          <span className="user-avatar">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="user-icon">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
