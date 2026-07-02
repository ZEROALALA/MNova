const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Game management
  getGames: () => ipcRenderer.invoke('get-games'),
  saveGames: (games) => ipcRenderer.invoke('save-games', games),
  addCustomGame: () => ipcRenderer.invoke('add-custom-game'),
  deleteGame: (id) => ipcRenderer.invoke('delete-game', id),
  updateGame: (game) => ipcRenderer.invoke('update-game', game),
  copyMedia: (sourcePath, extension) => ipcRenderer.invoke('copy-media', sourcePath, extension),
  scanFolder: () => ipcRenderer.invoke('scan-folder'),
  syncStores: (steamId) => ipcRenderer.invoke('sync-stores', steamId),

  // Launching
  launchGame: (launchUrl) => ipcRenderer.invoke('launch-game', launchUrl),
  launchLocal: (execPath) => ipcRenderer.invoke('launch-local', execPath),

  // Media & System
  getVideoUrl: (appid) => ipcRenderer.invoke('get-video-url', appid),
  downloadVideo: (appid, url) => ipcRenderer.invoke('download-video', appid, url),
  downloadCover: (appid, url) => ipcRenderer.invoke('download-cover', appid, url),
  pickImage: (type) => ipcRenderer.invoke('pick-image', type),
  pickVideo: () => ipcRenderer.invoke('pick-video'),
  pickAudio: () => ipcRenderer.invoke('pick-audio'),
  getScreenshots: () => ipcRenderer.invoke('get-screenshots'),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),

  // Steam & News & Trailers
  getSteamUser: () => ipcRenderer.invoke('get-steam-user'),
  getAchievements: (appid) => ipcRenderer.invoke('get-achievements', appid),
  getGameNews: (appid) => ipcRenderer.invoke('get-game-news', appid),
  getSteamTrailer: (appid) => ipcRenderer.invoke('get-steam-trailer', appid),

  // Manual achievements
  getManualAchievements: (gameId) => ipcRenderer.invoke('get-manual-achievements', gameId),
  saveManualAchievements: (gameId, achs) => ipcRenderer.invoke('save-manual-achievements', gameId, achs),

  // App control
  quit: () => ipcRenderer.invoke('quit-app'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  focusWindow: () => ipcRenderer.invoke('focus-window'),
  onFocusModeStatus: (callback) => ipcRenderer.on('focus-mode-status', (event, status) => callback(status)),
});
