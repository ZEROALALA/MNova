import React, { useState, useEffect, useCallback, useRef } from 'react';
import StartupScreen from './components/StartupScreen';
import TopBar from './components/TopBar';
import AddGameModal from './components/AddGameModal';
import EditGameModal from './components/EditGameModal';
import AchievementsModal from './components/AchievementsModal';
import defaultGames from './data/defaultGames.json';
import { storage } from './services/storage';
import { api } from './services/api';
import useGamepad from './hooks/useGamepad';
import useSoundEffects from './hooks/useSoundEffects';
import PS5Layout from './layouts/PS5Layout';
import XboxLayout from './layouts/XboxLayout';
import NexusLayout from './layouts/NexusLayout';
import CoverflowLayout from './layouts/CoverflowLayout';
import Particles from './components/Particles';
import ScreenshotsGallery from './components/ScreenshotsGallery';
import Overlay from './components/Overlay';
import NewsFeed from './components/NewsFeed';
import NexusAI from './components/NexusAI';

function App() {
  const [showStartup, setShowStartup] = useState(true);
  const [games, setGames] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [achievementsData, setAchievementsData] = useState(null);
  const [activeTab, setActiveTab] = useState('games');
  const [focusMode, setFocusMode] = useState(false);
  const [activeCollection, setActiveCollection] = useState(null);
  
  const [focusedRegion, setFocusedRegion] = useState('CAROUSEL');
  const [focusedActionIndex, setFocusedActionIndex] = useState(0);
  const layoutRef = useRef(null);
  const audioRef = useRef(null);
  
  const [activeTheme, setActiveTheme] = useState(() => storage.getTheme());

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    storage.saveTheme(theme);
    setFocusedRegion('CAROUSEL');
    setShowStartup(true);
  };
  
  const { playNav, playConfirm, playLaunch } = useSoundEffects();

  const handleGamepadAction = useCallback((action) => {
    // Intercept if any modal is open
    if (showAddModal || editingGame || achievementsData || showStartup) {
      if (action === 'BACK') {
        playNav();
        setShowAddModal(false);
        setEditingGame(null);
        setAchievementsData(null);
      }
      return;
    }

    if (games.length === 0) return;
    
    const currentIndex = games.findIndex(g => g.id === selectedId);
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
        else if (focusedActionIndex === 3) handleThemeChange(activeTheme === 'ps5' ? 'xbox' : (activeTheme === 'xbox' ? 'nexus' : 'ps5'));
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
    } else if (action === 'TRIANGLE' && game && game.isSteam && !game.isAddCard && !game.isGridCard) {
      playConfirm();
      api.getAchievements(game.steamId).then(setAchievementsData).catch(() => setAchievementsData(null));
    }
  }, [games, selectedId, playNav, playConfirm, playLaunch, showAddModal, editingGame, achievementsData, showStartup, focusedRegion, focusedActionIndex, activeTheme]);

  const { connected: gamepadConnected } = useGamepad(handleGamepadAction);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showAddModal || editingGame || achievementsData || showStartup) {
        if (e.key === 'Escape') {
          handleGamepadAction('BACK');
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
      if (e.key === 'Escape') api.quit();
      if (e.key === '+' || e.key === '=') setShowAddModal(true);
      if (e.key === 'Delete') {
        const selectedGame = games.find(g => g.id === selectedId);
        if (selectedGame && !selectedGame.isAddCard && !selectedGame.isGridCard) {
          if (window.confirm(`Are you sure you want to remove ${selectedGame.title} from your library?`)) {
            handleDeleteGame(selectedId);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGamepadAction, showAddModal, showStartup, games, selectedId]);

  // Load all games on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        const customGames = await storage.getCustomGames();
        let discoveredGames = [];
        try {
          discoveredGames = await api.getGames();
        } catch {}

        const existingTitles = new Set([
          ...customGames.map(g => g.title.toLowerCase()),
          ...defaultGames.map(g => g.title.toLowerCase()),
        ]);
        const uniqueDiscovered = discoveredGames.filter(g => !existingTitles.has(g.title.toLowerCase()));

        const allGames = [
          ...customGames,
          ...defaultGames,
          ...uniqueDiscovered,
          { id: '__add_game__', title: 'Add Game', isAddCard: true },
          { id: '__grid_view__', title: 'Library', isGridCard: true },
        ];
        setGames(allGames);
        if (allGames.length > 0) {
          setSelectedId(allGames[0].id);
        }
      } catch (err) {
        console.error('Failed to load games', err);
        const fallback = [
          ...defaultGames,
          { id: '__add_game__', title: 'Add Game', isAddCard: true },
          { id: '__grid_view__', title: 'Library', isGridCard: true },
        ];
        setGames(fallback);
        if (defaultGames.length > 0) setSelectedId(defaultGames[0].id);
      }
    };

    api.onFocusModeStatus?.((status) => {
      setFocusMode(status);
    });

    const checkGamepad = () => { };
    loadGames();
  }, []);

  const handleGameAdded = (newGames) => {
    // newGames is always an array now
    setGames(prev => {
      const withoutSpecial = prev.filter(g => !g.isAddCard && !g.isGridCard);
      return [
        ...withoutSpecial,
        ...newGames,
        { id: '__add_game__', title: 'Add Game', isAddCard: true },
        { id: '__grid_view__', title: 'Library', isGridCard: true },
      ];
    });
    // Select the first newly added game if available
    if (newGames.length > 0) {
      setSelectedId(newGames[0].id);
    }
  };

  const handleUpdateGame = async (updatedGame) => {
    try {
      await api.updateGame(updatedGame);
      
      // Also update custom games in IndexedDB if it was a custom game
      const customGames = await storage.getCustomGames();
      if (customGames.find(g => g.id === updatedGame.id)) {
        const newCustom = customGames.map(g => g.id === updatedGame.id ? updatedGame : g);
        await storage.saveCustomGames(newCustom);
      }

      setGames(prev => prev.map(g => g.id === updatedGame.id ? updatedGame : g));
    } catch (err) {
      console.error('Failed to update game', err);
    }
  };

  const handleDeleteGame = async (id) => {
    try {
      await api.deleteGame(id);
      const customGames = await storage.getCustomGames();
      await storage.saveCustomGames(customGames.filter(g => g.id !== id));
      
      setGames(prev => {
        const newGames = prev.filter(g => g.id !== id);
        if (selectedId === id) {
          const idx = prev.findIndex(g => g.id === id);
          if (idx > 0) setSelectedId(prev[idx - 1].id);
          else if (newGames.length > 0) setSelectedId(newGames[0].id);
        }
        return newGames;
      });
    } catch (err) {
      console.error('Failed to delete game', err);
    }
  };

  const handleLaunchGame = (game) => {
    if (game.isSteam && game.steamId) api.launchSteamGame(game.id, game.steamId).catch(console.error);
    else if (game.execPath) api.launchLocalGame(game.id, game.execPath).catch(console.error);
  };

  const handleSyncStores = async () => {
    try {
      window.alert("Scanning your PC for installed games from Steam, Epic Games, and EA Desktop...");
      
      const result = await api.syncStores();
      
      if (result.newGamesCount > 0) {
        window.alert(`Successfully found and synced ${result.newGamesCount} new installed games!\\n\\nNote: Uninstalled Steam games cannot be synced due to Steam privacy updates, and Achievements are only supported for Steam/Steam-matched games.`);
      } else {
        window.alert("Scan complete. No new games were found.");
      }
      
      // Reload games
      const customGames = await storage.getCustomGames();
      let discoveredGames = await api.getGames();
      const existingTitles = new Set([
        ...customGames.map(g => g.title.toLowerCase()),
        ...defaultGames.map(g => g.title.toLowerCase()),
      ]);
      const uniqueDiscovered = discoveredGames.filter(g => !existingTitles.has(g.title.toLowerCase()));

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
      window.alert(`An error occurred during sync:\\n${err.message}\\n\\nDid you fully restart the app? (Use the Power button in TopBar, then start again)`);
    }
  };

  // Filtering logic for collections
  const availableCollections = [...new Set(games.filter(g => g.collection).map(g => g.collection))];
  const filteredGames = games.filter(g => {
    if (g.isAddCard || g.isGridCard) return true;
    if (activeCollection) return g.collection === activeCollection;
    return true;
  });

  const selectedGame = games.find(g => g.id === selectedId);
  const isSpecialCard = selectedGame?.isAddCard || selectedGame?.isGridCard;

  useEffect(() => {
    if (audioRef.current) {
      if (selectedGame && selectedGame.audioUrl && activeTab === 'games') {
        audioRef.current.src = selectedGame.audioUrl;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [selectedGame?.id, selectedGame?.audioUrl, activeTab]);

  if (window.location.hash === '#/overlay') {
    return <Overlay />;
  }

  // Startup Screen
  if (showStartup) {
    return <StartupScreen theme={activeTheme} onFinish={() => setShowStartup(false)} />;
  }

  return (
    <div className="relative w-full h-full bg-ps-dark text-white overflow-hidden">
      {/* Background audio player */}
      <audio ref={audioRef} loop muted={focusMode} />

      {/* Dynamic Background Particles */}
      {!focusMode && <Particles count={40} />}

      {/* Top Bar */}
      <TopBar 
        gamepadConnected={gamepadConnected} 
        onAddGame={() => setShowAddModal(true)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        focusedActionIndex={focusedRegion === 'TOP_BAR' ? focusedActionIndex : -1}
        activeTheme={activeTheme}
        onThemeChange={handleThemeChange}
        onSyncStores={handleSyncStores}
        collections={availableCollections}
        activeCollection={activeCollection}
        onCollectionChange={setActiveCollection}
      />

      {activeTab === 'screenshots' ? (
        <ScreenshotsGallery />
      ) : activeTab === 'news' ? (
        <NewsFeed games={games} />
      ) : activeTheme === 'xbox' ? (
        <XboxLayout 
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
        />
      ) : activeTheme === 'nexus' ? (
        <NexusLayout 
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
        />
      ) : activeTheme === 'coverflow' ? (
        <CoverflowLayout 
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
        />
      ) : (
        <PS5Layout 
          ref={layoutRef}
          games={filteredGames}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPlay={handleLaunchGame}
          onDelete={handleDeleteGame}
          onEdit={(game) => setEditingGame(game)}
          onViewAchievements={(data) => setAchievementsData(data)}
          onAddGame={() => setShowAddModal(true)}
          playNav={playNav}
          playLaunch={playLaunch}
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
        />
      )}

      {/* Voice Assistant */}
      <NexusAI 
        games={games}
        onLaunchGame={handleLaunchGame}
        onTabChange={setActiveTab}
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
    </div>
  );
}

export default App;
