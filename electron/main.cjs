const { app, BrowserWindow, ipcMain, dialog, shell, nativeImage, Tray, Menu, globalShortcut, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');
const si = require('systeminformation');

// Path for caching trending media
const TRENDING_CACHE_FILE = path.join(app.getPath('userData'), 'trending_cache_v2.json');
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const os = require('os');
const DiscordRPC = require('discord-rpc');


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

// ─── OPTIMIZATIONS ───
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
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  const overlayWidth = width;
  const overlayHeight = Math.floor(height * 0.25);
  const x = 0;
  const y = height - overlayHeight;

  overlayWindow = new BrowserWindow({
    width: overlayWidth, height: overlayHeight, x, y,
    transparent: true, frame: false, alwaysOnTop: true,
    backgroundColor: '#00000000',
    skipTaskbar: true, show: false,
    resizable: false, movable: false, focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false, 
      contextIsolation: true,
      webviewTag: true
    }
  });
  
  // CRITICAL: Ignore mouse events so it never steals focus or intercepts clicks meant for the game
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setAlwaysOnTop(true, 'pop-up-menu');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/#/overlay');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), { hash: 'overlay' });
  }
  overlayWindow.on('closed', () => { overlayWindow = null; });
}

function toggleOverlay() {
  if (!overlayWindow) createOverlay();
  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    overlayWindow.showInactive();
    overlayWindow.moveTop();
  }
}

// ─── PATHS ───
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const COVERS_DIR = path.join(app.getPath('userData'), 'assets', 'covers');
const VIDEOS_DIR = path.join(app.getPath('userData'), 'assets', 'videos');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'achievements.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

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

// ─── SPEECH HANDLERS ───
const { generateSpeechBuffer, transcribeAudioBuffer, setGroqApiKey } = require('./speech-handler.cjs');

ipcMain.handle('generate-speech', async (event, text, voice) => {
  return await generateSpeechBuffer(text, voice);
});

ipcMain.handle('transcribe-audio', async (event, buffer, mimetype) => {
  return await transcribeAudioBuffer(buffer, mimetype);
});

ipcMain.handle('set-groq-key', (event, key) => {
  setGroqApiKey(key);
});

// Handle getting trending media from Steam
ipcMain.handle('get-trending-media', async () => {
  try {
    // Check cache first
    if (fs.existsSync(TRENDING_CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(TRENDING_CACHE_FILE, 'utf-8'));
      if (Date.now() - cacheData.timestamp < CACHE_DURATION_MS) {
        return cacheData.items; // Return cached items if within 30 days
      }
    }

    const featuredRes = await fetch('https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1/');
    const categories = await featuredRes.json();
    // Take top 20 concurrent games to find at least 5 with trailers
    const topSellers = categories.response.ranks.slice(0, 20).map(r => ({ id: r.appid }));
    
    const mediaItems = [];
    for (const game of topSellers) {
      if (mediaItems.length >= 5) break;
      try {
        const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.id}`);
        const detailsData = await detailsRes.json();
        const appDetails = detailsData[game.id]?.data;
        
        // Ensure it is strictly a PC Game and supports Windows
        if (!appDetails || appDetails.type !== 'game' || !appDetails.platforms?.windows) {
          continue;
        }
        
        if (appDetails.movies && appDetails.movies.length > 0) {
          // Find the best short trailer instead of a 10-min showcase
          let bestMovie = appDetails.movies[0];
          for (const m of appDetails.movies) {
            const name = (m.name || '').toLowerCase();
            if (name.includes('launch trailer') || name.includes('teaser') || (name.includes('trailer') && !name.includes('gameplay'))) {
              bestMovie = m;
              break;
            }
          }
          
          // Steam API now uses hls_h264
          const videoUrl = bestMovie.hls_h264 || bestMovie.dash_av1 || (bestMovie.webm && bestMovie.webm.max);
          
          if (videoUrl) {
            mediaItems.push({
              id: game.id.toString(),
              title: appDetails.name,
              image: appDetails.header_image || appDetails.capsule_image,
              videoUrl: videoUrl,
              developer: appDetails.developers ? appDetails.developers[0] : 'Unknown'
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching details for ${game.id}`, e);
      }
    }
    
    // Save to cache
    fs.writeFileSync(TRENDING_CACHE_FILE, JSON.stringify({
      timestamp: Date.now(),
      items: mediaItems
    }));

    return mediaItems;
  } catch (error) {
    console.error("Failed to fetch trending media:", error);
    throw error;
  }
});

// Handle getting REAL hardware stats
ipcMain.handle('get-system-stats', async () => {
  try {
    const cpuLoad = await si.currentLoad();
    const mem = await si.mem();
    const net = await si.networkStats('*');
    const disk = await si.fsSize();
    
    // Sum network stats across all active interfaces
    let totalRxSec = 0;
    let totalTxSec = 0;
    if (Array.isArray(net)) {
      for (const iface of net) {
        totalRxSec += (iface.rx_sec || 0);
        totalTxSec += (iface.tx_sec || 0);
      }
    }

    // We get real CPU, RAM, and Disk. 
    // GPUs and Temps require admin privileges on Windows, so we leave them null for the frontend to handle.
    return {
      cpuLoad: cpuLoad.currentLoad,
      cpuUsage: cpuLoad.currentLoad,
      ramUsage: (mem.active / mem.total) * 100,
      memUsed: mem.active,
      memTotal: mem.total,
      networkDown: totalRxSec / (1024 * 1024), // MB/s
      networkUp: totalTxSec / (1024 * 1024), // MB/s
      disks: disk.map(d => ({ fs: d.fs, size: d.size, used: d.used, mount: d.mount }))
    };
  } catch (e) {
    console.error("Failed to fetch system stats:", e);
    return null;
  }
});

// App lifecycle
app.whenReady().then(async () => {
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
  if (memoryGamesCache && Array.isArray(memoryGamesCache)) {
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

ipcMain.on('log-error', (event, msg) => {
  console.log('\n\n[RENDERER CRASH ERROR]:', msg, '\n\n');
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
  const drives = ['C', 'D', 'E', 'F', 'G'];
  const folders = ['Program Files\\EA Games', 'Program Files (x86)\\EA Games', 'EA Games', 'Origin Games', 'Program Files (x86)\\Origin Games'];
  const eaPaths = [];
  drives.forEach(drive => {
    folders.forEach(folder => eaPaths.push(`${drive}:\\${folder}`));
  });
  
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
//  GOG GAMES LOCAL SCANNER
// ═══════════════════════════════════════════

function findGOGGames() {
  const drives = ['C', 'D', 'E', 'F', 'G'];
  const folders = ['Program Files (x86)\\GOG Galaxy\\Games', 'GOG Games'];
  const paths = [];
  drives.forEach(d => folders.forEach(f => paths.push(`${d}:\\${f}`)));
  
  const games = [];
  paths.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const gameFolders = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory());
        gameFolders.forEach(folder => {
          const gameDir = path.join(dir, folder.name);
          const exe = fs.readdirSync(gameDir).find(f => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('unins'));
          if (exe) {
            games.push({
              id: `gog_${folder.name.replace(/\\s+/g, '')}`,
              title: folder.name,
              appid: '',
              platform: 'gog',
              isSteam: false,
              installDir: gameDir,
              launchUrl: '',
              execPath: path.join(gameDir, exe),
              coverUrl: '', backgroundUrl: '', logoUrl: '', videoUrl: '', steamId: '',
              developer: 'GOG',
            });
          }
        });
      } catch {}
    }
  });
  return games;
}

// ═══════════════════════════════════════════
//  UBISOFT GAMES LOCAL SCANNER
// ═══════════════════════════════════════════

function findUbisoftGames() {
  const drives = ['C', 'D', 'E', 'F', 'G'];
  const folders = ['Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\games', 'Ubisoft\\games'];
  const paths = [];
  drives.forEach(d => folders.forEach(f => paths.push(`${d}:\\${f}`)));
  
  const games = [];
  paths.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const gameFolders = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory());
        gameFolders.forEach(folder => {
          const gameDir = path.join(dir, folder.name);
          const exe = fs.readdirSync(gameDir).find(f => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('unins') && !f.toLowerCase().includes('crash'));
          if (exe) {
            games.push({
              id: `ubi_${folder.name.replace(/\\s+/g, '')}`,
              title: folder.name,
              appid: '',
              platform: 'ubisoft',
              isSteam: false,
              installDir: gameDir,
              launchUrl: '',
              execPath: path.join(gameDir, exe),
              coverUrl: '', backgroundUrl: '', logoUrl: '', videoUrl: '', steamId: '',
              developer: 'Ubisoft',
            });
          }
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

  return memoryGamesCache;
});

// Sync Store Accounts
ipcMain.handle('sync-stores', async (event) => {
  const newGames = [];
  const savedIds = new Set(memoryGamesCache ? memoryGamesCache.map(g => g.id) : []);

  const allDiscovered = [
    ...findSteamGames(),
    ...findEpicGames(),
    ...findEAGames(),
    ...findGOGGames(),
    ...findUbisoftGames()
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

ipcMain.handle('get-settings', async () => {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch { return {}; }
  }
  return {};
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const existing = fs.existsSync(SETTINGS_FILE) ? JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) : {};
    const newSettings = { ...existing, ...settings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    return true;
  } catch(e) { return false; }
});

// Delete a game
ipcMain.handle('delete-game', async (event, gameId) => {
  if (memoryGamesCache) {
    const game = memoryGamesCache.find(g => g.id === gameId);
    if (game) {
      // If there's a downloaded video, delete it to save space
      const appid = game.appid || game.steamId;
      if (appid) {
        const videoPath = path.join(VIDEOS_DIR, `${appid}.mp4`);
        if (fs.existsSync(videoPath)) {
          try { fs.unlinkSync(videoPath); } catch (e) { console.error('Failed to delete video', e); }
        }
      }
    }
    
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

// --- TRANSLATOR OVERLAY SUPPORT ---
ipcMain.on('close-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
    const { screen } = require('electron');
    const bounds = screen.getPrimaryDisplay().bounds;
    overlayWindow.setBounds({ width: bounds.width, height: Math.floor(bounds.height * 0.25), x: 0, y: bounds.height - Math.floor(bounds.height * 0.25) });
  }
});

ipcMain.on('resize-overlay', (event, width, height) => {
  if (overlayWindow) {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const finalWidth = primaryDisplay.bounds.width;
    const finalHeight = Math.ceil(height) + 40;
    const x = 0;
    const y = primaryDisplay.bounds.height - finalHeight;
    overlayWindow.setBounds({ x, y, width: finalWidth, height: finalHeight });
  }
});

app.whenReady().then(() => {
  createOverlay(); // Pre-load overlay window

  globalShortcut.register('CommandOrControl+T', async () => {
    try {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
        return;
      }
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
      if (sources.length > 0) {
        const imageBase64 = sources[0].thumbnail.toDataURL();
        if (!overlayWindow) createOverlay();
        overlayWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
        overlayWindow.showInactive();
        
        // Give React a tiny bit of time if it was just recreated
        setTimeout(() => {
          if (overlayWindow) overlayWindow.webContents.send('start-translation', imageBase64);
        }, 100);
      }
    } catch (error) {
      console.error("Screen capture failed:", error);
    }
  });
});

