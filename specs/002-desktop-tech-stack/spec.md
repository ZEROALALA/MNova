# Feature Specification: Desktop Tech Stack

**Feature Branch**: `002-desktop-tech-stack`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "2. Proposed Tech Stack"

## Clarifications

### Session 2026-07-01
- Q: What should the application do if an external game executable fails to launch (e.g., file not found or permission denied)? → A: Show a non-intrusive on-screen error toast/notification.
- Q: Should the application maintain a local log file for troubleshooting crashes or failed game launches? → A: Yes, keep a rolling log file in the user's AppData directory for troubleshooting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Native Application Launch (Priority: P1)

Users can install and launch the game dashboard as a standalone desktop application rather than running a web server and opening a browser.

**Why this priority**: Shifting to Electron enables OS-level integration which is required to scan files and launch processes cleanly.

**Independent Test**: Can be fully tested by building the Electron app and launching the resulting `.exe` on Windows.

**Acceptance Scenarios**:

1. **Given** the application is installed, **When** the user opens the shortcut, **Then** the application launches in a standalone window without browser chrome.
2. **Given** the application is running, **When** the user clicks "Quit" or presses Escape, **Then** the application process terminates completely.

---

### User Story 2 - Local System Integration (Priority: P1)

The application accesses local system resources (Steam installation paths, game executables, image files) directly through secure IPC calls.

**Why this priority**: Required for the auto-discovery of games and uploading of custom media without hitting browser sandbox limitations.

**Independent Test**: Can be tested by having the app auto-discover Steam games from native installation folders.

**Acceptance Scenarios**:

1. **Given** the app is launched, **When** it queries for games, **Then** it natively reads local directories to find Steam games.
2. **Given** a user wants to launch a game, **When** they press play, **Then** the app natively triggers the system executable.

### Edge Cases

- **Game Launch Failure**: If an external game executable fails to launch (e.g., file not found, permission denied), the system displays a non-intrusive on-screen error toast/notification instead of a native system dialog.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST be packaged as an Electron desktop application.
- **FR-002**: System MUST use Electron's IPC mechanism to bridge the React frontend with the Node.js backend logic.
- **FR-003**: System MUST provide native window controls (close window, fullscreen toggle).
- **FR-004**: System MUST launch external game executables using native OS APIs (`child_process`).
- **FR-005**: System MUST present a native file picker dialog when users want to upload custom cover art or videos.
- **FR-006**: System MUST maintain a rolling log file in the user's OS-level AppData directory for troubleshooting issues like failed game launches or IPC errors.

### Key Entities

- **IPC Bridge**: The secure communication channel (`preload.js`) between the React frontend (renderer process) and the Node.js system APIs (main process).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application can be bundled into a standalone executable installer.
- **SC-002**: Launching a game takes less than 1 second to trigger the external process.
- **SC-003**: UI rendering maintains a consistent 60 FPS frame rate inside the Electron window.

## Assumptions

- Target operating system is Windows.
- Users have basic permissions to run executables on their machine.
