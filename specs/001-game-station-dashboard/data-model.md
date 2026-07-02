# Data Model: Game Station Dashboard

## Entities

### Game
Represents a game entry in the dashboard.
- `id` (String): Unique identifier (e.g., 'injustice-2')
- `title` (String): Display name
- `source` (String): Platform source (e.g., 'Steam', 'Epic', 'Manual')
- `steamAppId` (String): Used for fetching achievements if source is Steam
- `coverImage` (String|BlobUrl): Path or Blob URL for the cover art
- `backgroundImage` (String|BlobUrl): Path or Blob URL for the hero background
- `videoPreview` (String|BlobUrl): Path or Blob URL for the background intro video
- `isManual` (Boolean): Flag indicating if it was manually added

### Achievement
Represents an unlocked or locked achievement for a game.
- `id` (String): Unique identifier
- `title` (String): Display name
- `description` (String): Details
- `icon` (String): URL or path to the achievement icon
- `achieved` (Boolean): Status
- `unlockTime` (Date): When it was achieved (if applicable)

## State Management
- `activeGameId`: The currently focused game in the carousel.
- `isPlayingVideo`: Boolean indicating if the video preview delay (1s) has passed.
- `gamepadConnected`: Boolean indicating if a gamepad is active.
