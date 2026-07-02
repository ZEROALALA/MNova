# Feature Specification: Game Station Dashboard

**Feature Branch**: `001-game-station-dashboard`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "1. General Philosophy from Plan.md"

## Clarifications

### Session 2026-07-01
- Q: How are games initially populated in the dashboard? → A: A mix: Auto-discover Steam games, manually add others
- Q: When a game is launched, what should the dashboard do? → A: Minimize to system tray/background to save resources but remain active
- Q: How does the dashboard know which Steam user's achievements to fetch? → A: Auto-detect Steam ID from the local Steam client installation
- Q: What happens if a selected game does not have an intro video? → A: Show a default ambient animation

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Immersive Game Navigation (Priority: P1)

Users browse their game library with an immersive, dynamic experience similar to a modern console.

**Why this priority**: Navigation and presentation are the core value proposition of the dashboard.

**Independent Test**: Can be fully tested by navigating through the library using keyboard/mouse to verify visual updates and video playback.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** the user selects a game card, **Then** the hero background instantly updates to the game's art.
2. **Given** a game is selected, **When** 1 second passes without further navigation, **Then** the game's intro video begins playing seamlessly.
3. **Given** a video is playing, **When** the user navigates to a different game, **Then** the video stops and the new game's background is displayed immediately.

---

### User Story 2 - Console-like Hardware Interaction (Priority: P1)

Users interact with the dashboard using a gamepad and receive immediate auditory feedback, reinforcing the console experience.

**Why this priority**: A console-like dashboard must feel native when used with a controller from a couch.

**Independent Test**: Can be fully tested by connecting a standard gamepad and verifying navigation and sound cues.

**Acceptance Scenarios**:

1. **Given** a connected gamepad, **When** the user presses the D-pad or analog stick, **Then** the UI focus moves accordingly and a navigation sound plays.
2. **Given** a selected game, **When** the user presses the 'Confirm' button (e.g., X or A), **Then** the game launches, a distinct launch sound plays, and the dashboard minimizes to the system tray/background.

---

### User Story 3 - Visual Customization (Priority: P2)

Users customize the appearance of their game library by uploading personalized cover art and hero backgrounds.

**Why this priority**: Provides personalization, especially useful for non-standard games or missing metadata.

**Independent Test**: Can be tested by uploading new images and verifying they persist after a refresh.

**Acceptance Scenarios**:

1. **Given** the user is in edit mode for a game, **When** they upload a new cover image, **Then** the game card immediately reflects the new image.
2. **Given** the user has uploaded custom images, **When** they restart the dashboard, **Then** their custom images are still displayed.

---

### User Story 4 - Achievements Display (Priority: P2)

Users view their earned and locked achievements directly within the dashboard to track their progress.

**Why this priority**: Enhances player engagement by surfacing game progress without opening a separate store client.

**Independent Test**: Can be tested by selecting a game with known achievements and verifying the list and completion status.

**Acceptance Scenarios**:

1. **Given** a Steam-linked game, **When** the user views the game details, **Then** the dashboard displays a progress bar and a list of achievements synced from their account.
2. **Given** a non-Steam game, **When** the user views the game details, **Then** they can manually log and track custom achievements.

### Edge Cases

- What happens if the Steam integration is unreachable or the user profile is private? (Fallback to showing a friendly message explaining the privacy settings or network issue).
- What happens if the gamepad is disconnected mid-navigation? (Seamless fallback to keyboard/mouse, displaying a disconnected indicator).
- What happens if the uploaded custom image/video is extremely large? (System rejects the file and shows an error message).
- What happens if a selected game does not have an intro video? (System shows a default ambient animation instead of leaving a static image).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a horizontal carousel of game covers for navigation.
- **FR-002**: System MUST update the background image immediately upon game selection.
- **FR-003**: System MUST auto-play the associated game video after a 1-second delay of resting on a selected game.
- **FR-004**: System MUST support standard gamepad inputs for navigation (Up, Down, Left, Right, Confirm, Back).
- **FR-005**: System MUST play distinct audio feedback for navigation, selection, back actions, and application launch.
- **FR-006**: System MUST allow users to upload and persist custom cover and background images.
- **FR-007**: System MUST integrate with the Steam platform to retrieve and display user achievements by auto-detecting the Steam ID from the local Steam client installation.
- **FR-008**: System MUST provide a manual entry method for tracking achievements of non-Steam games.
- **FR-009**: System MUST auto-discover installed Steam games by scanning local directories.
- **FR-010**: System MUST provide an interface for users to manually add non-Steam games with their executable paths.

### Key Entities

- **Game**: Represents an installed title. Key attributes: Title, Source Platform, Cover Image, Background Image, Video Preview.
- **Achievement**: Represents an in-game milestone. Key attributes: Title, Description, Icon, Unlock Status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Gamepad navigation latency is under 50ms (feels native and responsive).
- **SC-002**: Transition from background image to video playback occurs without visual stutter.
- **SC-003**: Custom image uploads process and reflect in the UI in under 1 second.
- **SC-004**: Achievement data fetches and renders within 2 seconds of game selection.

## Assumptions

- Users have a stable local environment to run the dashboard.
- Steam profiles and game details are set to public if achievements are to be fetched automatically.
- Users have standard gamepads (Xbox, PlayStation) compatible with their operating system.
