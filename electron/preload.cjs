const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('error', (event) => {
  ipcRenderer.send('log-error', event.error ? event.error.stack : event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  ipcRenderer.send('log-error', event.reason ? event.reason.stack : event.reason);
});

const origError = console.error;
console.error = (...args) => {
  ipcRenderer.send('log-error', args.join(' '));
  origError.apply(console, args);
};

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
  launchGame: (gameId, launchUrl) => ipcRenderer.invoke('launch-game', gameId, launchUrl),
  launchLocal: (gameId, execPath) => ipcRenderer.invoke('launch-local', gameId, execPath),

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
  getTrendingMedia: () => ipcRenderer.invoke('get-trending-media'),
  getGameNews: (appid) => ipcRenderer.invoke('get-game-news', appid),
  getSteamTrailer: (appid) => ipcRenderer.invoke('get-steam-trailer', appid),

  // Manual achievements
  getManualAchievements: (gameId) => ipcRenderer.invoke('get-manual-achievements', gameId),
  saveManualAchievements: (gameId, achs) => ipcRenderer.invoke('save-manual-achievements', gameId, achs),

  // Window Controls
  quitApp: () => ipcRenderer.invoke('quit-app'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  focusWindow: () => ipcRenderer.invoke('focus-window'),

  // Overlay & Translation
  closeOverlay: () => ipcRenderer.send('close-overlay'),
  onStartTranslation: (callback) => ipcRenderer.on('start-translation', (_e, img) => callback(img)),
  resizeOverlay: (width, height) => ipcRenderer.send('resize-overlay', width, height),
  
  // Focus Mode
  onFocusModeStatus: (callback) => ipcRenderer.on('focus-mode-status', (_e, status) => callback(status)),

  // Speech (Edge-TTS and Whisper)
  generateSpeech: (text, voice) => ipcRenderer.invoke('generate-speech', text, voice),
  transcribeAudio: (buffer, mimetype) => ipcRenderer.invoke('transcribe-audio', buffer, mimetype),
  setGroqKey: (key) => ipcRenderer.invoke('set-groq-key', key),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
});
