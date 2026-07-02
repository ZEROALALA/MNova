const { app, BrowserWindow, ipcMain, dialog, shell, nativeImage, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const os = require('os');
const DiscordRPC = require('discord-rpc');
const si = require('systeminformation');

const clientId = '1326442805202817084'; // Custom MNova Discord Client ID (dummy fallback)
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
let rpcReady = false;
rpc.on('ready', () => { rpcReady = true; });
rpc.login({ clientId }).catch(() => console.log('Discord RPC login failed (Discord not running?)'));

function setDiscordActivity(gameTitle) {
  if (!rpcReady) return;
  rpc.setActivity({
    details: 'Playing',
    state: gameTitle,
    largeImageKey: 'mnova_logo',
    largeImageText: 'MNova Game Station',
    startTimestamp: new Date(),
    instance: false,
  }).catch(() => {});
}

function clearDiscordActivity() {
  if (!rpcReady) return;
  rpc.clearActivity().catch(() => {});
}

// ─── HARDWARE ACCELERATION & NVIDIA OPTIMIZATION ───
// Force high performance GPU and enable advanced rendering features
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('js-flags', '--expose-gc');

// ─── FOCUS MODE ───
function enableFocusMode() {
  try {
    os.setPriority(process.pid, os.constants.priority.PRIORITY_IDLE);
    if (global.gc) global.gc();
    if (mainWindow) mainWindow.webContents.send('focus-mode-status', true);
  } catch(e){}
}

function disableFocusMode() {
  try {
    os.setPriority(process.pid, os.constants.priority.PRIORITY_NORMAL);
    if (mainWindow) mainWindow.webContents.send('focus-mode-status', false);
  } catch(e){}
}

// ─── OVERLAY ───
let overlayWindow = null;
function createOverlay() {
  if (overlayWindow) return;
  overlayWindow = new BrowserWindow({
    width: 800, height: 600,
    transparent: true, frame: false, alwaysOnTop: true, fullscreen: true,
    skipTaskbar: true, show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false, 
      contextIsolation: true,
      webviewTag: true
    }
  });
  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  if (process.env.NODE_ENV === 'development') {
    overlayWindow.loadURL('http://localhost:5173/#/overlay');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'overlay' });
  }
  overlayWindow.on('closed', () => { overlayWindow = null; });
}

function toggleOverlay() {
  if (!overlayWindow) createOverlay();
  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    overlayWindow.show();
    overlayWindow.focus();
  }
}

// ─── PATHS ───
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const COVERS_DIR = path.join(app.getPath('userData'), 'assets', 'covers');
const VIDEOS_DIR = path.join(app.getPath('userData'), 'assets', 'videos');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'achievements.json');

// Ensure directories exist
[DATA_DIR, COVERS_DIR, VIDEOS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const isDev = process.argv.includes('--dev');
let mainWindow;
let tray = null;
let memoryGamesCache = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'MNova',
    width: 1280,
    height: 720,
    fullscreen: true,
    frame: false,
    show: !process.argv.includes('--hidden'),
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      backgroundThrottling: false, // Allow background gamepad detection
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    // In dev mode, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Removed auto openDevTools to maintain the PS5 immersion
  } else {
    // In production, load from the built dist/ folder
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Create Tray
  const { nativeImage } = require('electron');
  let iconPath = path.join(__dirname, 'assets', 'icon.png');
  let trayIcon;
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    // 16x16 red square as fallback
    const fallbackBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHElEQVR42mP8z8AAR0PxqAEMo2EQD0MDBQAAAP//j1wV7wAAAABJRU5ErkJggg==', 'base64');
    trayIcon = nativeImage.createFromBuffer(fallbackBuf);
  }

  if (!tray) {
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Dashboard', click: () => { mainWindow.show(); mainWindow.focus(); } },
      { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
    ]);
    tray.setToolTip('MNova Game Station');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
  }

  // Auto Start
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe'),
    args: ['--hidden']
  });

  // WMI Gamepad Auto-Launch
  const { spawn } = require('child_process');
  const psScript = `
$query = "SELECT * FROM __InstanceCreationEvent WITHIN 2 WHERE TargetInstance ISA 'Win32_PnPEntity' AND (TargetInstance.Caption LIKE '%Controller%' OR TargetInstance.Caption LIKE '%Gamepad%' OR TargetInstance.Caption LIKE '%Xbox%')"
Register-WmiEvent -Query $query -SourceIdentifier "GamepadConnected" -Action {
    [Console]::WriteLine("CONNECTED")
}
while ($true) { Start-Sleep -Seconds 1 }
`;
  const ps = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-Command', psScript]);
  ps.stdout.on('data', (data) => {
    if (data.toString().includes('CONNECTED')) {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('will-quit', () => {
    try { ps.kill(); } catch (e) {}
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    const { session } = require('electron');
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') {
        callback(true);
      } else {
        callback(true);
      }
    });
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      if (permission === 'media') return true;
      return true;
    });

    createWindow();
    createOverlay();
    globalShortcut.register('CommandOrControl+Shift+G', toggleOverlay);
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Track playtime when returning to app
app.on('browser-window-focus', () => {
  clearDiscordActivity();
  disableFocusMode();
  if (memoryGamesCache) {
    let updated = false;
    for (const game of memoryGamesCache) {
      if (game._lastLaunchTime) {
        const durationSecs = Math.floor((Date.now() - game._lastLaunchTime) / 1000);
        game.playtime = (game.playtime || 0) + durationSecs;
        delete game._lastLaunchTime;
        updated = true;
      }
    }
    if (updated) {
       try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
    }
  }
});

// ═══════════════════════════════════════════
//  STEAM GAME DISCOVERY
// ═══════════════════════════════════════════

function findSteamGames() {
  const steamPaths = [
    'C:\\Program Files (x86)\\Steam\\steamapps',
    'C:\\Program Files\\Steam\\steamapps',
    'D:\\SteamLibrary\\steamapps',
    'D:\\Steam\\steamapps',
    'E:\\SteamLibrary\\steamapps',
    'F:\\SteamLibrary\\steamapps',
  ];

  // Discover additional library folders from VDF
  const mainSteamApps = 'C:\\Program Files (x86)\\Steam\\steamapps';
  const libFoldersFile = path.join(mainSteamApps, 'libraryfolders.vdf');
  if (fs.existsSync(libFoldersFile)) {
    try {
      const content = fs.readFileSync(libFoldersFile, 'utf-8');
      const pathMatches = content.match(/"path"\s+"([^"]+)"/g);
      if (pathMatches) {
        pathMatches.forEach(m => {
          const p = m.replace(/"path"\s+"/, '').replace(/"/, '').replace(/\\\\/g, '\\');
          const sa = path.join(p, 'steamapps');
          if (!steamPaths.includes(sa)) steamPaths.push(sa);
        });
      }
    } catch {}
  }

  const games = [];
  const skip = ['Steamworks Common Redistributables', 'Steam Linux Runtime', 'Proton'];

  steamPaths.forEach(steamapps => {
    if (!fs.existsSync(steamapps)) return;
    try {
      const acfFiles = fs.readdirSync(steamapps).filter(f => f.endsWith('.acf'));
      acfFiles.forEach(acf => {
        try {
          const content = fs.readFileSync(path.join(steamapps, acf), 'utf-8');
          const nameMatch = content.match(/"name"\s+"([^"]+)"/);
          const appidMatch = content.match(/"appid"\s+"([^"]+)"/);
          const installDirMatch = content.match(/"installdir"\s+"([^"]+)"/);

          if (nameMatch && appidMatch) {
            const name = nameMatch[1];
            const appid = appidMatch[1];
            if (skip.some(s => name.includes(s))) return;

            const installDir = installDirMatch ? installDirMatch[1] : '';
            const gamePath = path.join(steamapps, 'common', installDir);

            games.push({
              id: `steam_${appid}`,
              title: name,
              appid: appid,
              platform: 'steam',
              isSteam: true,
              installDir: gamePath,
              launchUrl: `steam://rungameid/${appid}`,
              coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
              backgroundUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_hero.jpg`,
              logoUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/logo.png`,
              videoUrl: '',
              steamId: appid,
              developer: 'Steam',
            });
          }
        } catch {}
      });
    } catch {}
  });

  return games;
}

// ═══════════════════════════════════════════
//  EPIC GAMES LOCAL SCANNER
// ═══════════════════════════════════════════

function findEpicGames() {
  const manifestsDir = 'C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests';
  const games = [];
  
  if (fs.existsSync(manifestsDir)) {
    try {
      const files = fs.readdirSync(manifestsDir).filter(f => f.endsWith('.item'));
      files.forEach(file => {
        try {
          const content = fs.readFileSync(path.join(manifestsDir, file), 'utf-8');
          const data = JSON.parse(content);
          
          if (data.DisplayName && data.AppName && data.InstallLocation) {
            // Ignore system tools or redistributables
            if (data.DisplayName.includes('Unreal Engine') || data.DisplayName.includes('Prerequisites')) return;
            
            const launchUrl = `com.epicgames.launcher://apps/${data.AppName}?action=launch&silent=true`;
            
            games.push({
              id: `epic_${data.AppName}`,
              title: data.DisplayName,
              appid: data.AppName,
              platform: 'epic',
              isSteam: false,
              installDir: data.InstallLocation,
              launchUrl: launchUrl,
              execPath: data.LaunchExecutable ? path.join(data.InstallLocation, data.LaunchExecutable) : '',
              coverUrl: '', // Will be fetched via metadata fetcher
              backgroundUrl: '',
              logoUrl: '',
              videoUrl: '',
              steamId: '',
              developer: 'Epic Games',
            });
          }
        } catch {}
      });
    } catch {}
  }
  return games;
}

// ═══════════════════════════════════════════
//  SMART METADATA FETCHER (VIA STEAM STORE)
// ═══════════════════════════════════════════

function fetchMetadataFromSteam(title) {
  return new Promise(resolve => {
    // Search Steam store for the game title
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.total > 0 && json.items && json.items.length > 0) {
            const appid = json.items[0].id;
            resolve({
              coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
              backgroundUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_hero.jpg`,
              logoUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/logo.png`,
              steamId: appid
            });
          } else {
            resolve(null);
          }
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}
// ═══════════════════════════════════════════
//  EA GAMES LOCAL SCANNER
// ═══════════════════════════════════════════

function findEAGames() {
  const eaPaths = [
    'C:\\\\Program Files\\\\EA Games',
    'C:\\\\Program Files (x86)\\\\EA Games',
    'D:\\\\EA Games',
    'E:\\\\EA Games'
  ];
  const games = [];
  
  eaPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const folders = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory());
        folders.forEach(folder => {
          const gameName = folder.name;
          const gameDir = path.join(dir, gameName);
          try {
            const files = fs.readdirSync(gameDir);
            const exe = files.find(f => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('cleanup') && !f.toLowerCase().includes('touchup') && !f.toLowerCase().includes('crash') && !f.toLowerCase().includes('unins'));
            
            if (exe) {
              games.push({
                id: `ea_${gameName.replace(/\\s+/g, '')}`,
                title: gameName,
                appid: '',
                platform: 'ea',
                isSteam: false,
                installDir: gameDir,
                launchUrl: '',
                execPath: path.join(gameDir, exe),
                coverUrl: '',
                backgroundUrl: '',
                logoUrl: '',
                videoUrl: '',
                steamId: '',
                developer: 'EA Games',
              });
            }
          } catch {}
        });
      } catch {}
    }
  });
  return games;
}

// ═══════════════════════════════════════════
//  STEAM VIDEO FETCH
// ═══════════════════════════════════════════

function fetchSteamVideoUrl(appid) {
  return new Promise(resolve => {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const appData = json[appid];
          if (appData?.success && appData.data?.movies?.length > 0) {
            const movie = appData.data.movies[0];
            resolve(movie.mp4 ? (movie.mp4.max || movie.mp4['480']) : '');
          } else {
            resolve('');
          }
        } catch { resolve(''); }
      });
    }).on('error', () => resolve(''));
  });
}

// ═══════════════════════════════════════════
//  FILE DOWNLOAD UTILITY
// ═══════════════════════════════════════════

function downloadFile(url, destPath) {
  return new Promise(resolve => {
    if (!url) return resolve(false);
    if (fs.existsSync(destPath)) return resolve(true);

    const getter = url.startsWith('https') ? https : http;
    const request = (currentUrl, redirects = 0) => {
      if (redirects > 5) return resolve(false);
      getter.get(currentUrl, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return resolve(false);
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
        file.on('error', () => resolve(false));
      }).on('error', () => resolve(false));
    };
    request(url);
  });
}

// ═══════════════════════════════════════════
//  STEAM ID DETECTION
// ═══════════════════════════════════════════

function detectSteamId() {
  const configPaths = [
    'C:\\Program Files (x86)\\Steam\\config\\loginusers.vdf',
    'C:\\Program Files\\Steam\\config\\loginusers.vdf',
  ];
  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        const match = content.match(/"(\d{17})"/);
        if (match) return match[1];
      }
    } catch {}
  }
  return null;
}

// ═══════════════════════════════════════════
//  IPC HANDLERS
// ═══════════════════════════════════════════

// Get all games (saved + auto-discovered Steam)
ipcMain.handle('get-games', async () => {
  if (!memoryGamesCache) {
    if (fs.existsSync(GAMES_FILE)) {
      try { memoryGamesCache = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf-8')); } catch { memoryGamesCache = []; }
    } else {
      memoryGamesCache = [];
    }
  }

  const steamGames = findSteamGames();
  const savedIds = new Set(memoryGamesCache.map(g => g.id));
  steamGames.forEach(sg => {
    if (!savedIds.has(sg.id)) memoryGamesCache.push(sg);
  });

  try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
  return memoryGamesCache;
});

// Sync Store Accounts
ipcMain.handle('sync-stores', async (event) => {
  const newGames = [];
  const savedIds = new Set(memoryGamesCache ? memoryGamesCache.map(g => g.id) : []);

  const allDiscovered = [
    ...findSteamGames(),
    ...findEpicGames(),
    ...findEAGames()
  ];

  for (const game of allDiscovered) {
    if (!savedIds.has(game.id)) {
      // Attempt to fetch missing metadata via Steam Search for non-steam games
      if (!game.isSteam) {
        const meta = await fetchMetadataFromSteam(game.title);
        if (meta) {
          game.coverUrl = meta.coverUrl;
          game.backgroundUrl = meta.backgroundUrl;
          game.logoUrl = meta.logoUrl;
          game.steamId = meta.steamId; // We can use this to fetch videos and achievements later!
        }
      }
      newGames.push(game);
      savedIds.add(game.id);
    }
  }

  if (newGames.length > 0) {
    memoryGamesCache = [...(memoryGamesCache || []), ...newGames];
    try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
  }

  return { newGamesCount: newGames.length };
});

// Get video URL for a Steam game
ipcMain.handle('get-video-url', async (event, appid) => {
  const videoPath = path.join(VIDEOS_DIR, `${appid}.mp4`);
  if (fs.existsSync(videoPath)) {
    return `file://${videoPath.replace(/\\/g, '/')}`;
  }
  return await fetchSteamVideoUrl(appid);
});

// Get Game News (Steam Web API)
ipcMain.handle('get-game-news', async (event, appid) => {
  return new Promise(resolve => {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appid}&count=5&maxlength=300&format=json`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.appnews?.newsitems || []);
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
});

// Get Screenshots (Mock or local directory)
ipcMain.handle('get-screenshots', async () => {
  return [
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_8e3d368d37fc1bc7520b7baeb7399f36f6d634fb.jpg', title: 'Cyberpunk 2077' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_49dae360e7e174b5aebfcd105572b9a71a067ff2.jpg', title: 'Cyberpunk 2077' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_2b724fce3f73950efcf84b42fb4495e86541f92e.jpg', title: 'Elden Ring' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_5a54cc8d2d38e21f7bc9e32d8fb6cd29a73e6a0d.jpg', title: 'Elden Ring' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_40d41e7ebde9687e3848b8969dc3e9702ea42805.jpg', title: 'RDR 2' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_e15a77322bf20b57e4e840a1eb1d81a9ff6f4e41.jpg', title: 'RDR 2' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_37762635bc971360da8ca6c8df34fc617a229a43.jpg', title: 'RDR 2' },
    { url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_e2e42d7a2f5f14dcce68e16e6f1f4e1f729226ed.jpg', title: 'Hollow Knight' }
  ];
});

// Download a video
ipcMain.handle('download-video', async (event, appid, url) => {
  const videoPath = path.join(VIDEOS_DIR, `${appid}.mp4`);
  const success = await downloadFile(url, videoPath);
  if (success) return `file://${videoPath.replace(/\\/g, '/')}`;
  return '';
});

// Download a cover image
ipcMain.handle('download-cover', async (event, appid, url) => {
  const coverPath = path.join(COVERS_DIR, `${appid}.jpg`);
  const success = await downloadFile(url, coverPath);
  if (success) return `file://${coverPath.replace(/\\/g, '/')}`;
  return url;
});

// Launch a game
ipcMain.handle('launch-game', async (event, gameId, launchUrl) => {
  shell.openExternal(launchUrl);
  if (mainWindow) mainWindow.minimize();
  
  enableFocusMode();
  const game = memoryGamesCache?.find(g => g.id === gameId);
  if (game) {
    setDiscordActivity(game.title);
    game._lastLaunchTime = Date.now();
  }
  return true;
});

// Launch local executable
ipcMain.handle('launch-local', async (event, gameId, execPath) => {
  const startTime = Date.now();
  const child = exec(`"${execPath}"`, err => {
    if (err) console.error('Launch error:', err.message);
  });
  
  if (mainWindow) mainWindow.minimize();
  
  enableFocusMode();
  const game = memoryGamesCache?.find(g => g.id === gameId);
  if (game) setDiscordActivity(game.title);
  
  child.on('exit', () => {
    const durationSecs = Math.floor((Date.now() - startTime) / 1000);
    if (game) {
      game.playtime = (game.playtime || 0) + durationSecs;
      try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
    }
    clearDiscordActivity();
  });
  
  return true;
});

// Add custom game via file picker
ipcMain.handle('add-custom-game', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe', 'lnk'] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const exePath = result.filePaths[0];
    const gameName = path.basename(exePath, path.extname(exePath));
    
    // Extract native icon
    let iconUrl = '';
    try {
      const icon = await app.getFileIcon(exePath, { size: 'large' });
      if (icon) {
        const iconData = icon.toPNG();
        const iconId = `icon_${Date.now()}`;
        const iconPath = path.join(COVERS_DIR, `${iconId}.png`);
        fs.writeFileSync(iconPath, iconData);
        iconUrl = `file://${iconPath.replace(/\\/g, '/')}`;
      }
    } catch(e) {}

    const game = {
      id: `custom_${Date.now()}`,
      title: gameName,
      appid: '',
      platform: 'custom',
      isSteam: false,
      installDir: path.dirname(exePath),
      launchUrl: exePath,
      execPath: exePath,
      coverUrl: iconUrl,
      backgroundUrl: '',
      logoUrl: '',
      videoUrl: '',
      steamId: '',
      developer: 'Custom',
    };

    if (!memoryGamesCache) memoryGamesCache = [];
    memoryGamesCache.push(game);
    try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
    return game;
  }
  return null;
});

// Scan folder for games
ipcMain.handle('scan-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) return [];
  const dir = result.filePaths[0];

  const foundGames = [];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.toLowerCase().endsWith('.exe')) {
        const lower = file.toLowerCase();
        if (lower.includes('crash') || lower.includes('unins') || lower.includes('setup') || lower.includes('redist')) continue;

        const exePath = path.join(dir, file);
        const gameName = path.basename(file, '.exe');
        
        let iconUrl = '';
        try {
          const icon = await app.getFileIcon(exePath, { size: 'large' });
          if (icon) {
            const iconData = icon.toPNG();
            const iconId = `icon_${Date.now()}_${Math.floor(Math.random()*1000)}`;
            const iconPath = path.join(COVERS_DIR, `${iconId}.png`);
            fs.writeFileSync(iconPath, iconData);
            iconUrl = `file://${iconPath.replace(/\\/g, '/')}`;
          }
        } catch (e) {}

        foundGames.push({
          id: `custom_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          title: gameName,
          appid: '',
          platform: 'custom',
          isSteam: false,
          installDir: dir,
          launchUrl: exePath,
          execPath: exePath,
          coverUrl: iconUrl,
          backgroundUrl: '',
          logoUrl: '',
          videoUrl: '',
          steamId: '',
          developer: 'Custom'
        });
      }
    }
  } catch (err) {}

  return foundGames;
});

// Save custom cover/background image
ipcMain.handle('pick-image', async (event, type) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const sourcePath = result.filePaths[0];
    const ext = sourcePath.split('.').pop();
    const mediaDir = path.join(app.getPath('userData'), 'media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
    const fileName = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const destPath = path.join(mediaDir, fileName);
    fs.copyFileSync(sourcePath, destPath);
    return `file:///${destPath.replace(/\\/g, '/')}`;
  }
  return null;
});

// Pick video file
ipcMain.handle('pick-video', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'mkv'] }],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const sourcePath = result.filePaths[0];
    const ext = sourcePath.split('.').pop();
    const mediaDir = path.join(app.getPath('userData'), 'media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
    const fileName = `video_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const destPath = path.join(mediaDir, fileName);
    fs.copyFileSync(sourcePath, destPath);
    return `file:///${destPath.replace(/\\/g, '/')}`;
  }
  return null;
});

// Pick audio file
ipcMain.handle('pick-audio', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const sourcePath = result.filePaths[0];
    const ext = sourcePath.split('.').pop();
    const mediaDir = path.join(app.getPath('userData'), 'media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
    const fileName = `audio_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const destPath = path.join(mediaDir, fileName);
    fs.copyFileSync(sourcePath, destPath);
    return `file:///${destPath.replace(/\\/g, '/')}`;
  }
  return null;
});

// Save game data (after editing covers, etc.)
ipcMain.handle('save-games', async (event, games) => {
  memoryGamesCache = games;
  try { fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2)); } catch(e){}
  return true;
});

// Delete a game
ipcMain.handle('delete-game', async (event, gameId) => {
  if (memoryGamesCache) {
    memoryGamesCache = memoryGamesCache.filter(g => g.id !== gameId);
    try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
  }
  return true;
});

// Update a game
ipcMain.handle('update-game', async (event, updatedGame) => {
  if (!memoryGamesCache) return false;
  const idx = memoryGamesCache.findIndex(g => g.id === updatedGame.id);
  if (idx !== -1) {
    memoryGamesCache[idx] = updatedGame;
  } else {
    memoryGamesCache.push(updatedGame);
  }
  try { fs.writeFileSync(GAMES_FILE, JSON.stringify(memoryGamesCache, null, 2)); } catch(e){}
  return true;
});

// Copy a media file to a persistent app folder
ipcMain.handle('copy-media', async (event, sourcePath, extension) => {
  try {
    const mediaDir = path.join(app.getPath('userData'), 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    const fileName = `media_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const destPath = path.join(mediaDir, fileName);
    fs.copyFileSync(sourcePath, destPath);
    return `file://${destPath.replace(/\\/g, '/')}`;
  } catch (err) {
    console.error('Failed to copy media:', err);
    return null;
  }
});

// Get Steam user ID
ipcMain.handle('get-steam-user', () => {
  return detectSteamId();
});

// Fetch achievements (using Steam Public XML Profile)
ipcMain.handle('get-achievements', async (event, appid) => {
  const steamId = detectSteamId();
  if (!steamId) return { achievements: [], total: 0, achieved: 0, percentage: 0 };

  return new Promise(resolve => {
    const url = `https://steamcommunity.com/profiles/${steamId}/stats/${appid}/?xml=1`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const isPrivate = data.includes('<privacyState>private</privacyState>');
          if (isPrivate) {
             return resolve({ achievements: [], total: 0, achieved: 0, percentage: 0, error: 'private' });
          }
          
          const achievements = [];
          const regex = /<achievement[^>]*>([\s\S]*?)<\/achievement>/g;
          let match;
          while ((match = regex.exec(data)) !== null) {
            const block = match[1];
            const name = block.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/)?.[1] || block.match(/<name>(.*?)<\/name>/)?.[1] || 'Unknown';
            const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || block.match(/<description>(.*?)<\/description>/)?.[1] || '';
            const iconClosed = block.match(/<iconClosed><!\[CDATA\[(.*?)\]\]><\/iconClosed>/)?.[1] || '';
            const iconOpen = block.match(/<iconOpen><!\[CDATA\[(.*?)\]\]><\/iconOpen>/)?.[1] || '';
            const closed = block.match(/<closed>(\d+)<\/closed>/)?.[1];
            
            const achieved = closed === '0';
            achievements.push({
              title: name,
              description: description,
              icon: achieved ? iconOpen : iconClosed,
              achieved: achieved
            });
          }
          
          const achievedCount = achievements.filter(a => a.achieved).length;
          resolve({
            achievements,
            total: achievements.length,
            achieved: achievedCount,
            percentage: achievements.length > 0 ? Math.round((achievedCount / achievements.length) * 100) : 0,
          });
        } catch(e) {
          resolve({ achievements: [], total: 0, achieved: 0, percentage: 0 });
        }
      });
    }).on('error', () => resolve({ achievements: [], total: 0, achieved: 0, percentage: 0 }));
  });
});

// Manual achievements
ipcMain.handle('get-manual-achievements', (event, gameId) => {
  if (!fs.existsSync(ACHIEVEMENTS_FILE)) return [];
  try {
    const all = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
    return all[gameId] || [];
  } catch { return []; }
});

ipcMain.handle('save-manual-achievements', (event, gameId, achievements) => {
  let all = {};
  if (fs.existsSync(ACHIEVEMENTS_FILE)) {
    try { all = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8')); } catch { all = {}; }
  }
  all[gameId] = achievements;
  fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(all, null, 2));
  return true;
});

// Quit
ipcMain.handle('quit-app', () => app.quit());

// Toggle fullscreen
ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  return mainWindow?.isFullScreen();
});

// Focus window
ipcMain.handle('focus-window', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// System Monitor
ipcMain.handle('get-system-stats', async () => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    return {
      cpuLoad: cpu.currentLoad,
      memUsed: mem.active,
      memTotal: mem.total
    };
  } catch (err) {
    return null;
  }
});

// Screenshots
const SCREENSHOTS_DIR = path.join(app.getPath('userData'), 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

ipcMain.handle('get-screenshots', () => {
  try {
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    return files
      .filter(f => f.match(/\.(png|jpe?g|webp)$/i))
      .map(f => `file://${path.join(SCREENSHOTS_DIR, f).replace(/\\/g, '/')}`);
  } catch { return []; }
});

// Get Game News
ipcMain.handle('get-game-news', async (event, appid) => {
  return new Promise((resolve) => {
    https.get(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appid}&count=5&maxlength=300&format=json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data).appnews.newsitems); } 
        catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
});

// Get Steam Trailer
ipcMain.handle('get-steam-trailer', async (event, appid) => {
  return new Promise((resolve) => {
    https.get(`https://store.steampowered.com/api/appdetails?appids=${appid}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed[appid] && parsed[appid].success && parsed[appid].data.movies) {
            // Get the highest quality webm trailer available
            const movies = parsed[appid].data.movies;
            if (movies.length > 0) {
              resolve(movies[0].webm.max || movies[0].webm[480]);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
});
