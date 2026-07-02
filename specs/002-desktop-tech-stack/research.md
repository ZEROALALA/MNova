# Research: Desktop Tech Stack

**Decision**: Use `electron` with `contextIsolation: true` and `nodeIntegration: false`.
**Rationale**: This provides a secure sandbox for the React renderer process while allowing controlled OS access via `preload.js` IPC methods, which is the recommended modern Electron architecture.
**Alternatives considered**: Tauri (rejected due to Rust learning curve and existing JavaScript ecosystem familiarity).

**Decision**: Use `electron-builder` for packaging.
**Rationale**: It provides simple out-of-the-box support for generating Windows `.exe` installers.
**Alternatives considered**: Electron Forge (viable, but `electron-builder` is simpler for a single platform target).
