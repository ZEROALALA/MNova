# Tasks: Game Station Dashboard

**Input**: Design documents from `specs/001-game-station-dashboard/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React project with Vite in the repository root
- [x] T002 Initialize Node.js Express server in `server/` directory
- [x] T003 [P] Install and configure Tailwind CSS in `tailwind.config.js` and `src/index.css`
- [x] T004 [P] Configure basic linting and Prettier

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Setup IndexedDB storage wrapper in `src/services/storage.js`
- [x] T006 [P] Create default games data in `src/data/defaultGames.json`
- [x] T007 Setup base `App.jsx` layout with TopBar placeholder
- [x] T008 [P] Implement `TopBar.jsx` component in `src/components/TopBar.jsx`

## Phase 3: User Story 1 - Immersive Game Navigation (Priority: P1)

**Goal**: Users browse their game library with an immersive, dynamic experience similar to a modern console.
**Independent Test**: Can be fully tested by navigating through the library using keyboard/mouse to verify visual updates and video playback.

- [x] T009 [P] [US1] Create `HeroSection.jsx` component in `src/components/HeroSection.jsx`
- [x] T010 [P] [US1] Create `GameCard.jsx` component in `src/components/GameCard.jsx`
- [x] T011 [US1] Implement `GameCarousel.jsx` component in `src/components/GameCarousel.jsx`
- [x] T012 [P] [US1] Create `VideoPlayerOverlay.jsx` component in `src/components/VideoPlayerOverlay.jsx`
- [x] T013 [US1] Integrate Carousel, Hero, and Video logic into `src/App.jsx`

## Phase 4: User Story 2 - Console-like Hardware Interaction (Priority: P1)

**Goal**: Users interact with the dashboard using a gamepad and receive immediate auditory feedback.
**Independent Test**: Can be fully tested by connecting a standard gamepad and verifying navigation and sound cues.

- [x] T014 [P] [US2] Implement `useGamepad.js` hook in `src/hooks/useGamepad.js`
- [x] T015 [P] [US2] Implement `useSoundEffects.js` hook in `src/hooks/useSoundEffects.js`
- [x] T016 [US2] Create `GamepadIndicator.jsx` in `src/components/GamepadIndicator.jsx` and add to TopBar
- [x] T017a [US2] Implement game launcher API endpoint using `child_process` in `server/routes/games.js`
- [x] T017b [US2] Integrate gamepad navigation, sound effects, and game launching into `src/App.jsx` and `src/components/GameCarousel.jsx`

## Phase 5: User Story 3 - Visual Customization (Priority: P2)

**Goal**: Users customize the appearance of their game library by uploading personalized cover art and hero backgrounds.
**Independent Test**: Can be tested by uploading new images and verifying they persist after a refresh.

- [x] T018 [P] [US3] Create `MediaUploader.jsx` component in `src/components/MediaUploader.jsx`
- [x] T019 [US3] Implement `AddGameModal.jsx` in `src/components/AddGameModal.jsx`
- [x] T020 [US3] Connect IndexedDB `storage.js` to the uploader to persist user images
- [x] T021a [P] [US3] Implement auto-discovery endpoint in `server/routes/scanner.js` to scan local Steam directories
- [x] T021b [US3] Update `src/App.jsx` to load and merge custom images and auto-discovered games

## Phase 6: User Story 4 - Achievements Display (Priority: P2)

**Goal**: Users view their earned and locked achievements directly within the dashboard to track their progress.
**Independent Test**: Can be tested by selecting a game with known achievements and verifying the list and completion status.

- [x] T022 [P] [US4] Implement Steam API proxy routes in `server/routes/steam.js` and `server/index.js`
- [x] T023 [P] [US4] Create frontend API service in `src/services/api.js`
- [x] T024 [P] [US4] Create `AchievementsPanel.jsx` component in `src/components/AchievementsPanel.jsx`
- [x] T025a [US4] Create `ManualAchievementsEditor.jsx` component for non-Steam games
- [x] T025b [US4] Integrate `AchievementsPanel.jsx` and `ManualAchievementsEditor.jsx` into details view

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T026 Update `README.md` with final instructions
- [x] T027 Polish Tailwind animations and transitions across all components
- [x] T028 [P] Run `quickstart.md` validation scenarios manually to ensure quality

## Dependencies & Execution Order

- **Phase 1 & 2** block all subsequent phases.
- **US1** and **US2** can be implemented in parallel after Phase 2.
- **US3** depends on US1's basic layout.
- **US4** depends on US1's game selection state and requires the proxy server to be running.
