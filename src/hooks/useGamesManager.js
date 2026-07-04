import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';
import defaultGames from '../data/defaultGames.json';

export default function useGamesManager(setFocusMode) {
  const [games, setGames] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const customGames = await storage.getCustomGames();
        const deletedIds = await storage.getDeletedGames();
        let discoveredGames = [];
        try {
          discoveredGames = await api.getGames();
        } catch {}

        const existingTitles = new Set([
          ...customGames.map((g) => g.title.toLowerCase()),
          ...defaultGames.map((g) => g.title.toLowerCase()),
        ]);
        const uniqueDiscovered = discoveredGames.filter(
          (g) => !existingTitles.has(g.title.toLowerCase())
        );

        let allGames = [
          ...customGames,
          ...defaultGames,
          ...uniqueDiscovered,
        ];
        
        // Filter out games that the user deleted
        allGames = allGames.filter(g => !deletedIds.includes(String(g.id)));

        allGames.push(
          { id: '__add_game__', title: 'Add Game', isAddCard: true },
          { id: '__grid_view__', title: 'Library', isGridCard: true }
        );
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

    if (setFocusMode && api.onFocusModeStatus) {
      api.onFocusModeStatus((status) => {
        setFocusMode(status);
      });
    }

    loadGames();
  }, [setFocusMode]);

  const handleGameAdded = (newGames) => {
    setGames((prev) => {
      const withoutSpecial = prev.filter((g) => !g.isAddCard && !g.isGridCard);
      return [
        ...withoutSpecial,
        ...newGames,
        { id: '__add_game__', title: 'Add Game', isAddCard: true },
        { id: '__grid_view__', title: 'Library', isGridCard: true },
      ];
    });
    if (newGames.length > 0) {
      setSelectedId(newGames[0].id);
    }
  };

  const handleUpdateGame = async (updatedGame) => {
    try {
      await api.updateGame(updatedGame);
      setGames((prev) =>
        prev.map((g) => (g.id === updatedGame.id ? updatedGame : g))
      );
    } catch (error) {
      console.error('Failed to update game:', error);
      alert('Failed to update game.');
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      const gameToDelete = games.find((g) => g.id === gameId);
      if (!gameToDelete) return;

      if (gameToDelete.isCustom) {
        await storage.deleteCustomGame(gameId);
      } else {
        await storage.markGameAsDeleted(gameId);
      }

      setGames((prev) => {
        const next = prev.filter((g) => g.id !== gameId);
        if (selectedId === gameId) {
          const normalGames = next.filter((g) => !g.isAddCard && !g.isGridCard);
          setSelectedId(normalGames.length > 0 ? normalGames[0].id : null);
        }
        return next;
      });
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
  };

  return {
    games,
    setGames,
    selectedId,
    setSelectedId,
    handleGameAdded,
    handleUpdateGame,
    handleDeleteGame
  };
}
