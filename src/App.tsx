import { PlayerPanel } from "./features/iptv/components/PlayerPanel";
import { Sidebar } from "./features/iptv/components/Sidebar";
import { TopBar } from "./features/iptv/components/TopBar";
import { UserMenu } from "./features/iptv/components/UserMenu";
import { useIptvApp } from "./features/iptv/hooks/useIptvApp";

export default function App() {
  const app = useIptvApp();

  return (
    <main className="app-shell">
      <TopBar
        mode={app.mode}
        statusMessage={app.statusMessage}
        onModeChange={app.setMode}
        onToggleUserMenu={() => {
          app.setShowUserMenu((current) => !current);
          if (app.savedProfiles.length === 0) {
            app.setShowProfiles(true);
          }
        }}
      />

      {app.showUserMenu ? (
        <UserMenu
          credentials={app.credentials}
          errorMessage={app.errorMessage}
          isLoading={app.isLoading}
          savedProfiles={app.savedProfiles}
          sessionActive={Boolean(app.session)}
          showProfiles={app.showProfiles}
          onClose={() => app.setShowUserMenu(false)}
          onDeleteProfile={app.handleDeleteProfile}
          onLoadProfile={app.handleLoadProfile}
          onLogin={app.handleLogin}
          onLogout={app.handleLogout}
          onSaveProfile={app.handleSaveProfile}
          onSetCredentials={app.setCredentials}
          onToggleProfiles={() => app.setShowProfiles((current) => !current)}
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
