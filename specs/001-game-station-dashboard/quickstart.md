# Quickstart & Validation Guide

## Prerequisites
- Node.js (v18+)
- NPM or Yarn

## Setup
1. Clone the repository and navigate to the project directory.
2. Install frontend dependencies: `npm install`
3. Navigate to the `server/` directory and install backend dependencies: `cd server && npm install`
4. Create a `.env` file in the `server/` directory and add your Steam API Key and Steam ID:
   ```
   STEAM_API_KEY=your_api_key
   STEAM_USER_ID=your_steam_id
   ```

## Running the Application
1. Start the proxy server: `cd server && npm start` (Runs on port 3001)
2. Start the Vite development server: `npm run dev` (Runs on port 3000)

## Validation Scenarios
1. **Gamepad Navigation**: Connect an Xbox or PS controller. Ensure the browser detects it. Use the D-pad to navigate left and right through the game carousel.
2. **Video Preview**: Focus on a game and wait 1 second. The background image should fade out and the video should start looping silently.
3. **Steam Achievements**: Focus on a Steam game. A panel should display the correct achievement progress fetched from the local proxy server.
