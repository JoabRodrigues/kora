import { useEffect, useState } from "react";
import { useIptvApp } from "./features/iptv/application/hooks/useIptvApp";
import logo from "./features/iptv/presentation/assets/kora-logo.svg";
import { MobileShell } from "./features/iptv/presentation/components/MobileShell";
import { PlayerPanel } from "./features/iptv/presentation/components/PlayerPanel";
import { Sidebar } from "./features/iptv/presentation/components/Sidebar";
import { TopBar } from "./features/iptv/presentation/components/TopBar";
import { UserMenu } from "./features/iptv/presentation/components/UserMenu";

export default function App() {
  const app = useIptvApp();
  const isMobile = useIsMobileViewport();
  const hasProfiles = app.savedProfiles.length > 0;

  if (!hasProfiles) {
    return (
      <main className="app-shell onboarding-shell">
        <div className="onboarding-brand">
          <img className="brand-logo" src={logo} alt="Kora" />
        </div>
        <UserMenu
          forceCreate
          credentials={app.credentials}
          errorMessage={app.errorMessage}
          isLoading={app.isLoading}
          savedProfiles={app.savedProfiles}
          sessionActive={Boolean(app.session)}
          statusMessage={app.statusMessage}
          onClose={() => undefined}
          onDeleteProfile={app.handleDeleteProfile}
          onLoadProfile={app.handleLoadProfile}
          onLogin={app.handleLogin}
          onLogout={app.handleLogout}
          onSaveProfile={app.handleSaveProfile}
          onSaveAndConnect={app.handleSaveAndConnect}
          onSetCredentials={app.setCredentials}
          onTestConnection={app.handleTestConnection}
        />
      </main>
    );
  }

  if (isMobile) {
    return (
      <>
        <MobileShell
          activeChannel={app.activeChannel}
          categoryCount={app.visibleCategoryEntries.filter(
            (entry) => !["favorites", "recents", "continue-watching"].includes(entry.id)
          ).length}
          categorySearch={app.categorySearch}
          continueWatching={app.continueWatching}
          currentProgram={app.currentProgram}
          favoriteCount={app.favoriteKeys.length}
          favoriteKeys={app.favoriteKeys}
          isEpgLoading={app.isEpgLoading}
          isLoading={app.isLoading}
          isPlaying={app.isPlaying}
          mode={app.mode}
          recentItems={app.recentItems}
          recentCount={app.recentKeys.length}
          recentKeys={app.recentKeys}
          search={app.search}
          seasonOptions={app.seasonOptions}
          selectedCategoryTitle={app.selectedCategoryTitle}
          selectedChannelId={app.selectedChannelId}
          selectedSeasonId={app.selectedSeasonId}
          selectedSeriesName={app.selectedSeries?.name ?? "Serie"}
          sessionActive={Boolean(app.session)}
          sidebarView={app.sidebarView}
          statusMessage={app.statusMessage}
          upcomingPrograms={app.upcomingPrograms}
          videoRef={app.videoRef}
          visibleCategoryEntries={app.visibleCategoryEntries}
          visibleChannels={app.visibleChannels}
          onBackToCategories={() => {
            app.setSidebarView("categories");
            if (app.sidebarView === "episodes") {
              app.reloadCurrentMode().catch(() => undefined);
            }
          }}
          onBackToSeries={() => {
            app.setSidebarView("channels");
            app.reloadCurrentMode().catch(() => undefined);
          }}
          onCategorySearchChange={app.setCategorySearch}
          onCategorySelect={app.handleSelectCategory}
          onChannelSelect={app.handleSelectChannel}
          onFavoriteToggle={app.toggleFavorite}
          onModeChange={app.setMode}
          onPlaybackError={app.handlePlaybackError}
          onPlaybackStateChange={app.setIsPlaying}
          onProgress={app.updateContinueWatching}
          onSearchChange={app.setSearch}
          onSeasonChange={app.setSelectedSeasonId}
          onToggleUserMenu={() => app.setShowUserMenu((current) => !current)}
        />

        {app.showUserMenu ? (
          <UserMenu
            credentials={app.credentials}
            errorMessage={app.errorMessage}
            isLoading={app.isLoading}
            savedProfiles={app.savedProfiles}
            sessionActive={Boolean(app.session)}
            statusMessage={app.statusMessage}
            onClose={() => app.setShowUserMenu(false)}
            onDeleteProfile={app.handleDeleteProfile}
            onLoadProfile={app.handleLoadProfile}
            onLogin={app.handleLogin}
            onLogout={app.handleLogout}
            onSaveProfile={app.handleSaveProfile}
            onSetCredentials={app.setCredentials}
          />
        ) : null}
      </>
    );
  }

  return (
    <main className="app-shell">
      <TopBar
        mode={app.mode}
        statusMessage={app.statusMessage}
        onModeChange={app.setMode}
        onToggleUserMenu={() => app.setShowUserMenu((current) => !current)}
      />

      {app.showUserMenu ? (
        <UserMenu
          credentials={app.credentials}
          errorMessage={app.errorMessage}
          isLoading={app.isLoading}
          savedProfiles={app.savedProfiles}
          sessionActive={Boolean(app.session)}
          statusMessage={app.statusMessage}
          onClose={() => app.setShowUserMenu(false)}
          onDeleteProfile={app.handleDeleteProfile}
          onLoadProfile={app.handleLoadProfile}
          onLogin={app.handleLogin}
          onLogout={app.handleLogout}
          onSaveProfile={app.handleSaveProfile}
          onSetCredentials={app.setCredentials}
        />
      ) : null}

      <section className="workspace-grid">
        <Sidebar
          categorySearch={app.categorySearch}
          channels={app.channels}
          favoriteKeys={app.favoriteKeys}
          isLoading={app.isLoading}
          mode={app.mode}
          recentKeys={app.recentKeys}
          search={app.search}
          seasonOptions={app.seasonOptions}
          selectedCategoryTitle={app.selectedCategoryTitle}
          selectedChannelId={app.selectedChannelId}
          selectedSeasonId={app.selectedSeasonId}
          selectedSeriesName={app.selectedSeries?.name ?? "Serie"}
          sessionActive={Boolean(app.session)}
          sidebarView={app.sidebarView}
          visibleCategoryEntries={app.visibleCategoryEntries}
          visibleChannels={app.visibleChannels}
          onBackToCategories={() => {
            app.setSidebarView("categories");
            if (app.sidebarView === "episodes") {
              app.reloadCurrentMode().catch(() => undefined);
            }
          }}
          onBackToSeries={() => {
            app.setSidebarView("channels");
            app.reloadCurrentMode().catch(() => undefined);
          }}
          onCategorySearchChange={app.setCategorySearch}
          onChannelSelect={app.handleSelectChannel}
          onCategorySelect={app.handleSelectCategory}
          onSearchChange={app.setSearch}
          onSeasonChange={app.setSelectedSeasonId}
        />

        <PlayerPanel
          activeChannel={app.activeChannel}
          continueWatching={app.continueWatching}
          currentProgram={app.currentProgram}
          favoriteKeys={app.favoriteKeys}
          isPlaying={app.isPlaying}
          isEpgLoading={app.isEpgLoading}
          mode={app.mode}
          onFavoriteToggle={app.toggleFavorite}
          onPlaybackError={app.handlePlaybackError}
          onPlaybackStateChange={app.setIsPlaying}
          onProgress={app.updateContinueWatching}
          upcomingPrograms={app.upcomingPrograms}
          videoRef={app.videoRef}
        />
      </section>
    </main>
  );
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(max-width: 920px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 920px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
