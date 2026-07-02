const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/**
 * Common Steam library paths on Windows.
 * Steam stores games in "steamapps/common" subdirectories.
 */
const STEAM_COMMON_PATHS = [
  'C:\\Program Files (x86)\\Steam\\steamapps\\common',
  'C:\\Program Files\\Steam\\steamapps\\common',
  'D:\\SteamLibrary\\steamapps\\common',
  'E:\\SteamLibrary\\steamapps\\common',
  'F:\\SteamLibrary\\steamapps\\common',
];

/**
 * Try to find additional Steam library folders from libraryfolders.vdf
 */
function discoverLibraryFolders() {
  const vdfPaths = [
    'C:\\Program Files (x86)\\Steam\\steamapps\\libraryfolders.vdf',
    'C:\\Program Files\\Steam\\steamapps\\libraryfolders.vdf',
  ];

  const additionalPaths = [];

  for (const vdfPath of vdfPaths) {
    try {
      if (fs.existsSync(vdfPath)) {
        const content = fs.readFileSync(vdfPath, 'utf-8');
        // Simple regex to extract "path" values from the VDF format
        const pathMatches = content.match(/"path"\s+"([^"]+)"/g);
        if (pathMatches) {
          for (const match of pathMatches) {
            const extracted = match.match(/"path"\s+"([^"]+)"/);
            if (extracted && extracted[1]) {
              const commonPath = path.join(extracted[1].replace(/\\\\/g, '\\'), 'steamapps', 'common');
              additionalPaths.push(commonPath);
            }
          }
        }
      }
    } catch (err) {
      // Silently skip unreadable VDF files
    }
  }

  return additionalPaths;
}

/**
 * GET /api/scanner/discover
 * Scan local Steam directories and return discovered games.
 */
router.get('/discover', (req, res) => {
  const allPaths = [...new Set([...STEAM_COMMON_PATHS, ...discoverLibraryFolders()])];
  const discoveredGames = [];

  for (const steamPath of allPaths) {
    try {
      if (!fs.existsSync(steamPath)) continue;

      const entries = fs.readdirSync(steamPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          discoveredGames.push({
            id: `steam-${entry.name.toLowerCase().replace(/\s+/g, '-')}`,
            title: entry.name,
            developer: 'Steam',
            coverUrl: '',
            backgroundUrl: '',
            videoUrl: '',
            logoUrl: '',
            steamId: '',
            isSteam: true,
            source: steamPath,
          });
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  res.json({
    success: true,
    count: discoveredGames.length,
    games: discoveredGames,
  });
});

module.exports = router;
