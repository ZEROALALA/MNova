/**
 * Unified API Service
 * Detects if running inside Electron or browser and uses the appropriate API.
 */

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Get Steam User
  async getSteamUser() {
    if (isElectron) {
      return window.electronAPI.getSteamUser();
    }
    return null;
  },

  // Get all games
  async getGames() {
    if (isElectron) {
      return window.electronAPI.getGames();
    }
    // Browser fallback: use the Node.js server
    try {
      const res = await fetch(`${API_BASE}/scanner/discover`);
      const data = await res.json();
      return data.games || [];
    } catch {
      return [];
    }
  },

  // Launch a Steam game
  async launchSteamGame(gameId, steamId) {
    if (isElectron) {
      return window.electronAPI.launchGame(gameId, `steam://rungameid/${steamId}`);
    }
    return fetch(`${API_BASE}/games/launch/steam/${steamId}`, { method: 'POST' });
  },

  // Launch local executable
  async launchLocalGame(gameId, execPath) {
    if (isElectron) {
      return window.electronAPI.launchLocal(gameId, execPath);
    }
    return fetch(`${API_BASE}/games/launch/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execPath }),
    });
  },

  // Get video URL
  async getVideoUrl(appid) {
    if (isElectron) {
      return window.electronAPI.getVideoUrl(appid);
    }
    return '';
  },

  // Download and cache video
  async downloadVideo(appid, url) {
    if (isElectron) {
      return window.electronAPI.downloadVideo(appid, url);
    }
    return url;
  },

  // Get Steam achievements
  async getAchievements(appId) {
    if (isElectron) {
      return window.electronAPI.getAchievements(appId);
    }
    try {
      const res = await fetch(`${API_BASE}/steam/achievements/${appId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    } catch {
      return { achievements: [], total: 0, achieved: 0, percentage: 0 };
    }
  },

  // Get Game News
  async getGameNews(appId) {
    if (isElectron) {
      return window.electronAPI.getGameNews(appId);
    }
    return [];
  },

  // Get Steam Trailer
  async getSteamTrailer(appId) {
    if (isElectron) {
      return window.electronAPI.getSteamTrailer(appId);
    }
    return null;
  },

  // Manual achievements
  async getManualAchievements(gameId) {
    if (isElectron) {
      return window.electronAPI.getManualAchievements(gameId);
    }
    return [];
  },

  async saveManualAchievements(gameId, achievements) {
    if (isElectron) {
      return window.electronAPI.saveManualAchievements(gameId, achievements);
    }
  },

  // Add custom game (opens native file picker in Electron)
  async addCustomGame() {
    if (isElectron) {
      return window.electronAPI.addCustomGame();
    }
    return null;
  },

  // Scan a folder for custom games
  async scanFolder() {
    if (isElectron) {
      return window.electronAPI.scanFolder();
    }
    return [];
  },

  // Sync Store Accounts
  async syncStores(steamId) {
    if (isElectron) {
      return window.electronAPI.syncStores(steamId);
    }
    return { newGamesCount: 0 };
  },

  // Pick image (native dialog in Electron)
  async pickImage(type) {
    if (isElectron) {
      return window.electronAPI.pickImage(type);
    }
    return null;
  },

  // Pick video (native dialog in Electron)
  async pickVideo() {
    if (isElectron) {
      return window.electronAPI.pickVideo();
    }
    return null;
  },

  // Pick audio (native dialog in Electron)
  async pickAudio() {
    if (isElectron) {
      return window.electronAPI.pickAudio();
    }
    return null;
  },

  // Get Screenshots
  async getScreenshots() {
    if (isElectron) {
      return window.electronAPI.getScreenshots();
    }
    return [];
  },

  // Get System Stats
  async getSystemStats() {
    if (isElectron) {
      return window.electronAPI.getSystemStats();
    }
    return null;
  },

  // Save games list
  async saveGames(games) {
    if (isElectron) {
      return window.electronAPI.saveGames(games);
    }
  },

  // Delete a game
  async deleteGame(id) {
    if (isElectron) {
      return window.electronAPI.deleteGame(id);
    }
  },

  // Update a game
  async updateGame(game) {
    if (isElectron) {
      return window.electronAPI.updateGame(game);
    }
  },

  // Copy media to persistent storage
  async copyMedia(sourcePath, extension) {
    if (isElectron) {
      return window.electronAPI.copyMedia(sourcePath, extension);
    }
    return null;
  },

  // Quit app
  async quit() {
    if (isElectron) {
      return window.electronAPI.quitApp();
    }
    window.close();
  },

  // Toggle fullscreen
  async toggleFullscreen() {
    if (isElectron) {
      return window.electronAPI.toggleFullscreen();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  },

  // Check if running in Electron
  isElectron,

  // Listeners
  onFocusModeStatus(callback) {
    if (isElectron && window.electronAPI.onFocusModeStatus) {
      window.electronAPI.onFocusModeStatus(callback);
    }
  },
};
