import { useIptvApp } from "./features/iptv/application/hooks/useIptvApp";
import logo from "./features/iptv/presentation/assets/kora-logo.svg";
import { PlayerPanel } from "./features/iptv/presentation/components/PlayerPanel";
import { Sidebar } from "./features/iptv/presentation/components/Sidebar";
import { TopBar } from "./features/iptv/presentation/components/TopBar";
import { UserMenu } from "./features/iptv/presentation/components/UserMenu";

export default function App() {
  const app = useIptvApp();
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
          onBackToCategories={() => app.setSidebarView("categories")}
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
