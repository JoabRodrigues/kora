import { useEffect, useState } from "react";
import type { NormalizedChannel } from "../../domain/types";
import { MobileBrowser } from "./MobileBrowser";
import { MobileHeaderHero } from "./MobileHeaderHero";
import { MobilePlayerCard } from "./MobilePlayerCard";
import type {
  MobileBrowserProps,
  MobileHeaderHeroProps,
  MobilePlayerCardProps,
  MobileScreen,
} from "./mobile-types";

type MobileShellProps = Omit<MobileHeaderHeroProps, "isHomeScreen"> &
  Omit<MobilePlayerCardProps, "onBack"> &
  Omit<MobileBrowserProps, "isHomeScreen"> & {
    onModeChange: (mode: "live" | "movie" | "series") => void;
    onToggleUserMenu: () => void;
  };

export function MobileShell(props: MobileShellProps) {
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>("home");
  const [didInitHistory, setDidInitHistory] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentState = window.history.state as { mobileScreen?: MobileScreen } | null;
    if (!currentState?.mobileScreen) {
      window.history.replaceState({ mobileScreen: "home" }, "");
    }

    const handlePopState = (event: PopStateEvent) => {
      const nextScreen = (event.state as { mobileScreen?: MobileScreen } | null)?.mobileScreen;
      setMobileScreen(nextScreen ?? "home");
    };

    window.addEventListener("popstate", handlePopState);
    setDidInitHistory(true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!didInitHistory || typeof window === "undefined") {
      return;
    }

    const currentState = window.history.state as { mobileScreen?: MobileScreen } | null;
    if (currentState?.mobileScreen === mobileScreen) {
      return;
    }

    window.history.pushState({ mobileScreen }, "");
  }, [didInitHistory, mobileScreen]);

  useEffect(() => {
    if (props.sidebarView !== "categories") {
      setMobileScreen("browse");
    }
  }, [props.sidebarView]);

  useEffect(() => {
    if (!props.activeChannel && mobileScreen === "player") {
      setMobileScreen("home");
    }
  }, [mobileScreen, props.activeChannel]);

  function handleHomeNavigation() {
    props.onBackToCategories();
    setMobileScreen("home");
  }

  function handleModeNavigation(mode: "live" | "movie" | "series") {
    props.onModeChange(mode);
    setMobileScreen("browse");
  }

  function handleChannelSelection(channel: NormalizedChannel) {
    const isSeriesEntry =
      props.mode === "series" &&
      props.sidebarView !== "episodes" &&
      !channel.seasonId &&
      !channel.key.startsWith("series-episode:");

    props.onChannelSelect(channel);

    if (isSeriesEntry) {
      setMobileScreen("browse");
      return;
    }

    setMobileScreen("player");
  }

  const showHero = mobileScreen !== "player";
  const showBrowser = mobileScreen !== "player";
  const showPlayer = mobileScreen === "player";

  return (
    <main className="mobile-shell">
      {showHero ? (
        <MobileHeaderHero
          {...props}
          isHomeScreen={mobileScreen === "home"}
          onChannelSelect={handleChannelSelection}
        />
      ) : null}

      {showPlayer ? (
        <MobilePlayerCard
          {...props}
          onBack={() => {
            setMobileScreen(props.sidebarView === "categories" ? "home" : "browse");
          }}
        />
      ) : null}

      {showBrowser ? (
        <MobileBrowser
          {...props}
          isHomeScreen={mobileScreen === "home"}
          onChannelSelect={handleChannelSelection}
        />
      ) : null}

      {props.activeChannel && mobileScreen !== "player" ? (
        <button
          type="button"
          className="mobile-now-playing-bar"
          onClick={() => {
            if (props.activeChannel) {
              handleChannelSelection(props.activeChannel);
            }
          }}
        >
          <div className="mobile-now-playing-copy">
            <span className="mobile-section-label">
              {props.isPlaying ? "Tocando agora" : "Pronto para tocar"}
            </span>
            <strong>{props.activeChannel.name}</strong>
          </div>
          <div className="mobile-now-playing-meta">
            <span className={props.isPlaying ? "mobile-dot live" : "mobile-dot"} />
            <span>{props.activeChannel.mode === "live" ? "Ao vivo" : "Abrir player"}</span>
          </div>
        </button>
      ) : null}

      <nav className="mobile-bottom-nav mobile-bottom-nav-wide">
        <button
          type="button"
          className={mobileScreen === "home" ? "mobile-nav-button active" : "mobile-nav-button"}
          onClick={handleHomeNavigation}
        >
          <span className="mobile-nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" fill="currentColor" />
            </svg>
          </span>
          Home
        </button>
        <button
          type="button"
          className={
            mobileScreen === "browse" && props.mode === "live"
              ? "mobile-nav-button active"
              : "mobile-nav-button"
          }
          onClick={() => handleModeNavigation("live")}
        >
          <span className="mobile-nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 4a8 8 0 0 0-8 8v6h16v-6a8 8 0 0 0-8-8Zm0 3a5 5 0 0 1 5 5v3H7v-3a5 5 0 0 1 5-5Z" fill="currentColor" />
            </svg>
          </span>
          Ao vivo
        </button>
        <button
          type="button"
          className={
            mobileScreen === "browse" && props.mode === "movie"
              ? "mobile-nav-button active"
              : "mobile-nav-button"
          }
          onClick={() => handleModeNavigation("movie")}
        >
          <span className="mobile-nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm4 0v2h2V6Zm4 0v2h2V6Zm4 0v2h2V6ZM8 16v2h2v-2Zm4 0v2h2v-2Zm4 0v2h2v-2ZM7 11h10v2H7Z" fill="currentColor" />
            </svg>
          </span>
          Filmes
        </button>
        <button
          type="button"
          className={
            mobileScreen === "browse" && props.mode === "series"
              ? "mobile-nav-button active"
              : "mobile-nav-button"
          }
          onClick={() => handleModeNavigation("series")}
        >
          <span className="mobile-nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 4h11a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5Zm2 3v10h9a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Zm2 2h6v2H9Zm0 4h4v2H9Z" fill="currentColor" />
            </svg>
          </span>
          Series
        </button>
      </nav>
    </main>
  );
}
