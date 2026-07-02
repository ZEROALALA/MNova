# IPC Bridge Contract

The Electron `preload.js` exposes the following APIs to the React renderer via `window.api`:

## Methods

- `getGames()`: Requests the main process to auto-discover local Steam games.
- `launchGame(executablePath)`: Asks the OS to execute a child process.
- `quit()`: Terminates the Electron application.
- `openFileDialog()`: Triggers a native OS file picker.
