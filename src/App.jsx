import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Power } from 'lucide-react';
import LoginModal from './components/LoginModal';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import StartupScreen from './components/StartupScreen';
import MaryamOverlay from './components/MaryamOverlay';
import TopBar from './components/TopBar';
import AddGameModal from './components/AddGameModal';
import EditGameModal from './components/EditGameModal';
import AchievementsModal from './components/AchievementsModal';
import defaultGames from './data/defaultGames.json';
import { storage } from './services/storage';
import { api } from './services/api';
import useGamepad from './hooks/useGamepad';
import useSoundEffects from './hooks/useSoundEffects';
import useBackgroundAudio from './hooks/useBackgroundAudio';
import useSettingsInit from './hooks/useSettingsInit';
import useGamesManager from './hooks/useGamesManager';
import PS5Layout from './layouts/PS5Layout';
import XboxLayout from './layouts/XboxLayout';
import NexusLayout from './layouts/NexusLayout';
import CoverflowLayout from './layouts/CoverflowLayout';
import Particles from './components/Particles';

import MediaGallery from './components/MediaGallery';
import NewsFeed from './components/NewsFeed';
import SocialHub from './components/SocialHub';
import StoreTab from './components/StoreTab';
import PerformanceTab from './components/PerformanceTab';
import SettingsTab from './components/SettingsTab'; // Forces Vite reload
import StatsTab from './components/StatsTab';
import LibraryGridModal from './components/LibraryGridModal';

function App() {
  const { currentUser, gamerProfile } = useAuth();
  const [showStartup, setShowStartup] = useState(true);
  const {
    appHue, setAppHue,
    activeTheme, handleThemeChange,
    aiVoice, setAiVoice
  } = useSettingsInit();

  const {
    games, setGames,
    selectedId, setSelectedId,
    handleGameAdded, handleUpdateGame, handleDeleteGame
  } = useGamesManager(setFocusMode);

  const audioRef = useBackgroundAudio(games, selectedId);

  const { playNav, playConfirm, playLaunch } = useSoundEffects();

  const handleGamepadAction = useCallback(
    (action) => {
      // Intercept if any modal is open
      if (showAddModal || editingGame || achievementsData || showStartup || showLibraryGrid) {
        if (action === 'BACK' && !showLibraryGrid) {
          playNav();
          setShowAddModal(false);
          setEditingGame(null);
          setAchievementsData(null);
        }
        return;
      }

      if (games.length === 0) return;

      const currentIndex = games.findIndex((g) => g.id === selectedId);
      const game = games[currentIndex];

      if (focusedRegion === 'TOP_BAR') {
        if (action === 'DOWN') {
          playNav();
          setFocusedRegion('CAROUSEL');
        } else if (action === 'LEFT' && focusedActionIndex > 0) {
          playNav();
          setFocusedActionIndex(focusedActionIndex - 1);
        } else if (action === 'RIGHT' && focusedActionIndex < 5) {
          playNav();
          setFocusedActionIndex(focusedActionIndex + 1);
        } else if (action === 'CONFIRM') {
          playConfirm();
          if (focusedActionIndex === 0) setActiveTab('games');
          else if (focusedActionIndex === 1) setActiveTab('media');
          else if (focusedActionIndex === 3)
            handleThemeChange(
              activeTheme === 'ps5' ? 'xbox' : activeTheme === 'xbox' ? 'nexus' : 'ps5'
            );
          else if (focusedActionIndex === 5) api.quit();
        }
        return;
      }

      if (layoutRef.current && layoutRef.current.handleGamepadAction) {
        const handled = layoutRef.current.handleGamepadAction(action);
        if (handled) return;
      }

      // Global Shortcuts
      if (action === 'SQUARE' && game && !game.isAddCard && !game.isGridCard) {
        playConfirm();
        setEditingGame(game);
      } else if (
        action === 'TRIANGLE' &&
        game &&
        game.isSteam &&
        !game.isAddCard &&
        !game.isGridCard
      ) {
        playConfirm();
        api
          .getAchievements(game.steamId)
          .then(setAchievementsData)
          .catch(() => setAchievementsData(null));
      }
    },
    [
      games,
      selectedId,
      playNav,
      playConfirm,
      showAddModal,
      editingGame,
      achievementsData,
      showStartup,
      focusedRegion,
      focusedActionIndex,
      activeTheme,
      showLibraryGrid,
    ]
  );

  const { connected: gamepadConnected, vibrate } = useGamepad((action) => {
    // Add subtle vibration for navigation
    if (['LEFT', 'RIGHT', 'UP', 'DOWN'].includes(action)) vibrate(30, 0.2, 0);
    else if (action === 'CONFIRM') vibrate(50, 0.5, 0.2);
    else if (action === 'BACK') vibrate(40, 0.3, 0);
    handleGamepadAction(action);
  });



  const handleLaunchGame = (game) => {
    if (game.isSteam && game.steamId)
      api.launchSteamGame(game.id, game.steamId).catch(console.error);
    else if (game.execPath) api.launchLocalGame(game.id, game.execPath).catch(console.error);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keybindings if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (showAddModal || editingGame || achievementsData || showStartup || showLibraryGrid || showExitConfirm) {
        if (e.key === 'Escape' && !showLibraryGrid && !showExitConfirm) {
          handleGamepadAction('BACK');
        }
        if (e.key === 'Escape' && showExitConfirm) {
          setShowExitConfirm(false);
        }
        return;
      }

      if (e.key === 'ArrowLeft') handleGamepadAction('LEFT');
      if (e.key === 'ArrowRight') handleGamepadAction('RIGHT');
      if (e.key === 'ArrowUp') handleGamepadAction('UP');
      if (e.key === 'ArrowDown') handleGamepadAction('DOWN');
      if (e.key === 'Enter') handleGamepadAction('CONFIRM');
      if (e.key === 'q') handleGamepadAction('SQUARE');
      if (e.key === 'a' || e.key === 'A') handleGamepadAction('TRIANGLE');
      if (e.key.toLowerCase() === 'x') handleGamepadAction('SQUARE'); // Edit Shortcut
      if (e.key.toLowerCase() === 'y') handleGamepadAction('TRIANGLE'); // Achievements Shortcut
      if (e.key === 'Escape') setShowExitConfirm(true);
      if (e.key === '+' || e.key === '=') setShowAddModal(true);
      if (e.key === 'Delete') {
        const selectedGame = games.find((g) => g.id === selectedId);
        if (selectedGame && !selectedGame.isAddCard && !selectedGame.isGridCard) {
          if (
            window.confirm(
              `Are you sure you want to remove ${selectedGame.title} from your library?`
            )
          ) {
            handleDeleteGame(selectedId);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleGamepadAction,
    showAddModal,
    showStartup,
    games,
    selectedId,
    showLibraryGrid,
    editingGame,
    achievementsData,
    handleDeleteGame,
  ]);

  if (showStartup) {
    return <StartupScreen theme={activeTheme} onFinish={() => setShowStartup(false)} />;
  }

  const handleSyncStores = async () => {
    try {
      window.alert(
        'Scanning your PC for installed games from Steam, Epic Games, and EA Desktop...'
      );

      const result = await api.syncStores();

      if (result.newGamesCount > 0) {
        window.alert(
          `Successfully found and synced ${result.newGamesCount} new installed games!\\n\\nNote: Uninstalled Steam games cannot be synced due to Steam privacy updates, and Achievements are only supported for Steam/Steam-matched games.`
        );
      } else {
        window.alert('Scan complete. No new games were found.');
      }

      // Reload games
      const customGames = await storage.getCustomGames();
      let discoveredGames = await api.getGames();
      const existingTitles = new Set([
        ...customGames.map((g) => g.title.toLowerCase()),
        ...defaultGames.map((g) => g.title.toLowerCase()),
      ]);
      const uniqueDiscovered = discoveredGames.filter(
        (g) => !existingTitles.has(g.title.toLowerCase())
      );

      const allGames = [
        ...customGames,
        ...defaultGames,
        ...uniqueDiscovered,
        { id: '__add_game__', title: 'Add Game', isAddCard: true },
        { id: '__grid_view__', title: 'Library', isGridCard: true },
      ];
      setGames(allGames);
    } catch (err) {
      console.error(err);
      window.alert(
        `An error occurred during sync:\\n${err.message}\\n\\nDid you fully restart the app? (Use the Power button in TopBar, then start again)`
      );
    }
  };

  // Filtering logic for collections
  const availableCollections = [
    ...new Set(games.filter((g) => g.collection).map((g) => g.collection)),
  ];
  const hasFavorites = games.some((g) => g.isFavorite);
  if (hasFavorites && !availableCollections.includes('Favorites')) {
    availableCollections.unshift('Favorites');
  }

  const filteredGames = games.filter((g) => {
    if (g.isAddCard || g.isGridCard) return true;
    if (activeCollection === 'Favorites') return g.isFavorite;
    if (activeCollection) return g.collection === activeCollection;
    return true;
  });

  const selectedGame = games.find((g) => g.id === selectedId);

  if (window.location.hash === '#/overlay') {
    return <Overlay />;
  }

  return (
    <div
      className={`w-full h-screen overflow-hidden relative selection:bg-blue-500/30 ${!activeTheme ? 'bg-[#0f172a]' : ''}`}
      style={{
        '--app-hue': `${appHue}deg`,
        filter: 'hue-rotate(var(--app-hue))',
        transition: 'filter 0.5s ease',
      }}
    >
      {/* Background audio player */}
      <audio ref={audioRef} loop muted={focusMode} />

      {/* Dynamic Background Particles */}
      {!focusMode && <Particles count={40} />}

      <audio ref={audioRef} src={selectedGame?.audioUrl} loop />

      {/* Top Bar */}
      <div className={`transition-opacity duration-1000 ${uiHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <TopBar
          gamepadConnected={gamepadConnected}
          onAddGame={() => setShowAddModal(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          focusedActionIndex={focusedRegion === 'TOP_BAR' ? focusedActionIndex : -1}
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
          onSyncStores={handleSyncStores}
          onRequestLogin={() => setShowLoginModal(true)}
          collections={availableCollections}
          activeCollection={activeCollection}
          onCollectionChange={setActiveCollection}
          playNav={playNav}
          playConfirm={playConfirm}
          isAudioPlaying={!!selectedGame?.audioUrl && activeTab === 'games'}
          currentUser={currentUser}
          gamerProfile={gamerProfile}
          onToggleMaryam={() => setShowMaryam(true)}
          aiVoice={aiVoice}
          setAiVoice={setAiVoice}
        />
      </div>

      {/* Main Content Areas */}
      {activeTab === 'store' ? (
        <StoreTab playNav={playNav} playConfirm={playConfirm} />
      ) : activeTab === 'media' ? (
        <MediaGallery games={games} playConfirm={playConfirm} playLaunch={playLaunch} />
      ) : activeTab === 'news' ? (
        <NewsFeed />
      ) : activeTab === 'community' ? (
        <div className="pt-20 p-8 h-full w-full max-w-7xl mx-auto">
          <SocialHub />
        </div>
      ) : activeTab === 'performance' ? (
        <PerformanceTab playNav={playNav} playConfirm={playConfirm} />
      ) : activeTab === 'stats' ? (
        <StatsTab playNav={playNav} playConfirm={playConfirm} />
      ) : activeTab === 'settings' ? (
        <SettingsTab
          playNav={playNav}
          playConfirm={playConfirm}
          currentHue={appHue}
          setHue={setAppHue}
          userProfile={gamerProfile}
          onToggleMaryam={() => setShowMaryam(true)}
          aiVoice={aiVoice}
          setAiVoice={setAiVoice}
        />
      ) : activeTheme === 'xbox' ? (
        <XboxLayout
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={(id) => {
            if (id === '__grid_view__') {
              playConfirm();
              setShowLibraryGrid(true);
            } else setSelectedId(id);
          }}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
          onUiHiddenChange={setUiHidden}
        />
      ) : activeTheme === 'nexus' ? (
        <NexusLayout
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={(id) => {
            if (id === '__grid_view__') {
              playConfirm();
              setShowLibraryGrid(true);
            } else setSelectedId(id);
          }}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
          onUiHiddenChange={setUiHidden}
        />
      ) : activeTheme === 'coverflow' ? (
        <CoverflowLayout
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={(id) => {
            if (id === '__grid_view__') {
              playConfirm();
              setShowLibraryGrid(true);
            } else setSelectedId(id);
          }}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
          onUiHiddenChange={setUiHidden}
        />
      ) : (
        <PS5Layout
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={(id) => {
            if (id === '__grid_view__') {
              playConfirm();
              setShowLibraryGrid(true);
            } else setSelectedId(id);
          }}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
          onUiHiddenChange={setUiHidden}
        />
      )}

      <LibraryGridModal
        isOpen={showLibraryGrid}
        onClose={() => {
          playNav();
          setShowLibraryGrid(false);
        }}
        games={games}
        onSelectGame={(id) => {
          playConfirm();
          setSelectedId(id);
        }}
      />

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onGameAdded={handleGameAdded}
      />

      {/* Edit Game Modal */}
      <EditGameModal
        isOpen={!!editingGame}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onGameUpdated={handleUpdateGame}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={!!achievementsData}
        onClose={() => setAchievementsData(null)}
        game={selectedGame}
        data={achievementsData}
      />
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-[#1e1e1e] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center transform scale-100 transition-transform">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Power size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Are you sure you want to exit?
            </h2>
            <p className="text-white/50 mb-8">
              The application will keep running in the background for controller connection and AI features.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  playConfirm?.();
                  api.quit();
                }}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      <MaryamOverlay
        isOpen={showMaryam}
        onClose={() => setShowMaryam(false)}
        aiVoice={aiVoice}
      />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
