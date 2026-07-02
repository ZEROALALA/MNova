# Steam API Proxy Contract

## `GET /api/achievements?appid={steamAppId}`
Fetches the achievements for the configured Steam user and the specified game.

**Response (Success)**
```json
{
  "success": true,
  "game": "Injustice 2",
  "achievements": [
    {
      "id": "ach_1",
      "title": "Master of Combat",
      "description": "Win 100 matches",
      "icon": "https://steamcdn.../icon.jpg",
      "achieved": true,
      "unlockTime": "2026-06-15T12:00:00Z"
    }
  ],
  "progress": {
    "unlocked": 10,
    "total": 50
  }
}
```

**Response (Error)**
```json
{
  "success": false,
  "error": "Profile is private or Steam API is unreachable"
}
```
