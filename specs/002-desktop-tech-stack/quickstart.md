# Quickstart: Desktop Tech Stack Validation

1. **Prerequisites**: Ensure you have Node.js installed.
2. **Setup**: Run `npm install` to ensure `electron` and `electron-builder` are installed.
3. **Run Dev**: Execute `npm run electron:dev`.
   - *Expected Outcome*: A native window should appear containing the React dashboard. No browser tabs should open.
4. **Validation - Launch**: Navigate to a game and press `Enter` to launch.
   - *Expected Outcome*: The game should launch externally.
5. **Validation - Quit**: Press `Escape`.
   - *Expected Outcome*: The Electron window closes and the process terminates.
