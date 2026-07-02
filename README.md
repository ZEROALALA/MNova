# MNova - Game Station Dashboard

A PS5-inspired game launcher dashboard built with React + Vite and a local Node.js backend.

## ✨ Features

- **Immersive UI**: Full-screen hero backgrounds, dynamic video previews, and smooth carousel navigation
- **Gamepad Support**: Navigate with Xbox/PlayStation controllers; keyboard fallback included
- **Sound Effects**: Synthesized audio feedback for navigation, selection, and game launch
- **Add Custom Games**: Upload cover art, backgrounds, and preview videos for any game
- **Steam Integration**: Auto-discover installed Steam games and fetch achievements
- **Manual Achievements**: Track your own achievements for non-Steam games
- **Persistent Storage**: All customizations saved locally via IndexedDB

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm (included with Node.js)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 2. Configure Steam API (Optional)

Create a `server/.env` file:

```env
STEAM_API_KEY=your_steam_api_key_here
```

Get your API key from [Steam Web API](https://steamcommunity.com/dev/apikey).

### 3. Start the Application

```bash
# Terminal 1 - Backend server
cd server && node index.js

# Terminal 2 - Frontend dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Navigate Left | ← Arrow | D-pad Left / Left Stick |
| Navigate Right | → Arrow | D-pad Right / Left Stick |
| Select / Launch | Enter | A / X Button |

## 📁 Project Structure

```
├── src/
│   ├── components/          # React UI components
│   │   ├── TopBar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── GameCard.jsx
│   │   ├── GameCarousel.jsx
│   │   ├── VideoPlayerOverlay.jsx
│   │   ├── AddGameModal.jsx
│   │   ├── MediaUploader.jsx
│   │   ├── GamepadIndicator.jsx
│   │   ├── AchievementsPanel.jsx
│   │   └── ManualAchievementsEditor.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useGamepad.js
│   │   └── useSoundEffects.js
│   ├── services/            # Data and API services
│   │   ├── storage.js
│   │   └── api.js
│   ├── data/
│   │   └── defaultGames.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── index.js             # Express server entry
│   └── routes/
│       ├── games.js         # Game launch endpoints
│       ├── scanner.js       # Steam directory auto-discovery
│       └── steam.js         # Steam API proxy (achievements)
├── package.json
└── vite.config.js
```

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4
- **Backend**: Node.js, Express 5
- **Storage**: IndexedDB (via idb-keyval)
- **Icons**: Lucide React
- **APIs**: HTML5 Gamepad API, Web Audio API, Steam Web API
