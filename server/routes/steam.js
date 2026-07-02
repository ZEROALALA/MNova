const express = require('express');
const axios = require('axios');

const router = express.Router();

const STEAM_API_BASE = 'https://api.steampowered.com';

/**
 * Try to auto-detect Steam ID from local Steam config files.
 */
function detectSteamId() {
  const fs = require('fs');
  const path = require('path');
  
  const configPaths = [
    'C:\\Program Files (x86)\\Steam\\config\\loginusers.vdf',
    'C:\\Program Files\\Steam\\config\\loginusers.vdf',
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        // Extract the first Steam ID (17-digit number)
        const match = content.match(/"(\d{17})"/);
        if (match) return match[1];
      }
    } catch {
      // Skip unreadable
    }
  }
  return null;
}

/**
 * GET /api/steam/user
 * Returns detected Steam user info.
 */
router.get('/user', (req, res) => {
  const steamId = detectSteamId();
  if (!steamId) {
    return res.status(404).json({ error: 'Could not auto-detect Steam ID. Make sure Steam is installed.' });
  }
  res.json({ steamId });
});

/**
 * GET /api/steam/achievements/:appId
 * Fetches achievements for the given appId using the detected Steam user.
 */
router.get('/achievements/:appId', async (req, res) => {
  const steamApiKey = process.env.STEAM_API_KEY;
  if (!steamApiKey) {
    return res.status(500).json({ error: 'STEAM_API_KEY not configured. Add it to server/.env' });
  }

  const { appId } = req.params;
  const steamId = req.query.steamId || detectSteamId();

  if (!steamId) {
    return res.status(404).json({ error: 'No Steam ID found.' });
  }

  try {
    // 1. Get the game's achievement schema
    const schemaRes = await axios.get(`${STEAM_API_BASE}/ISteamUserStats/GetSchemaForGame/v2/`, {
      params: { key: steamApiKey, appid: appId, l: 'english' },
    });
    const schema = schemaRes.data?.game?.availableGameStats?.achievements || [];

    // 2. Get player's achievement progress
    const playerRes = await axios.get(`${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/`, {
      params: { key: steamApiKey, appid: appId, steamid: steamId, l: 'english' },
    });
    const playerAchievements = playerRes.data?.playerstats?.achievements || [];

    // 3. Merge schema with player progress
    const merged = schema.map(s => {
      const playerMatch = playerAchievements.find(p => p.apiname === s.name);
      return {
        id: s.name,
        name: s.displayName || s.name,
        description: s.description || '',
        icon: s.icon || '',
        iconGray: s.icongray || '',
        achieved: playerMatch ? playerMatch.achieved === 1 : false,
        unlockTime: playerMatch?.unlocktime || null,
      };
    });

    const achieved = merged.filter(a => a.achieved).length;

    res.json({
      success: true,
      appId,
      steamId,
      total: merged.length,
      achieved,
      percentage: merged.length > 0 ? Math.round((achieved / merged.length) * 100) : 0,
      achievements: merged,
    });
  } catch (err) {
    console.error('Steam API error:', err.message);
    if (err.response?.status === 403) {
      return res.status(403).json({ error: 'Profile or game stats may be private. Check Steam privacy settings.' });
    }
    res.status(500).json({ error: 'Failed to fetch achievements from Steam.' });
  }
});

module.exports = router;
