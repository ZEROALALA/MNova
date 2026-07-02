# Tasks: Desktop Tech Stack

**Input**: Design documents from `/specs/002-desktop-tech-stack/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ipc-api.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Electron project dependencies (`electron`, `electron-builder`, `concurrently`) in `package.json`
- [ ] T002 Update Vite configuration for Electron compatibility if necessary in `vite.config.js`
- [ ] T003 Create `electron/` directory structure per implementation plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement IPC bridge contract definitions in `electron/preload.js`
- [ ] T005 Implement Main Process skeleton in `electron/main.js` with basic window creation
- [ ] T006 Update `src/services/api.js` to support Electron IPC fallback

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Native Application Launch (Priority: P1) 🎯 MVP

**Goal**: Users can install and launch the game dashboard as a standalone desktop application rather than running a web server and opening a browser.

**Independent Test**: Can be fully tested by building the Electron app and launching the resulting `.exe` on Windows.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Add `electron:dev` and `electron:build` scripts to `package.json` and configure `electron-builder` NSIS installer options
- [ ] T008 [US1] Implement native window controls (close, fullscreen) in `electron/main.js`
- [ ] T009 [US1] Wire up TopBar React components to call window controls via IPC in `src/components/TopBar.jsx`
- [ ] T010 [US1] Implement logging mechanism (rolling log file with 5MB max size rotation policy) in `electron/main.js`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Local System Integration (Priority: P1)

**Goal**: The application accesses local system resources directly through secure IPC calls.

**Independent Test**: Can be tested by having the app auto-discover Steam games from native installation folders.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Implement Steam game auto-discovery using local file system APIs in `electron/main.js`
- [ ] T012 [P] [US2] Implement external game launching using `child_process.exec` in `electron/main.js`
- [ ] T013 [US2] Add native file picker dialog support in `electron/main.js` for custom covers
- [ ] T014 [US2] Implement error handling toast/notification for game launch failures in `src/App.jsx`
- [ ] T015 [US2] Update `src/services/api.js` to map game launch and discovery requests to IPC calls

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T016 [P] Documentation updates in `README.md` for Electron build instructions
- [ ] T017 [P] Measure and validate that game launch latency is under 1 second (SC-002)
- [ ] T018 [P] Validate React UI maintains 60 FPS under Electron during animations (SC-003)
- [ ] T019 Run quickstart.md validation manually to ensure smooth dev and build flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Can start after Foundational (Phase 2), can be parallelized with US1

### Parallel Opportunities

- IPC contract (`preload.js`) and Main Process skeleton can be written simultaneously by different team members.
- Game Discovery (`main.js`) and React IPC wiring (`api.js`) can be developed in parallel against the defined contract.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 & Phase 2 to get a barebones window rendering React.
2. Complete Phase 3 (US1) to ensure the app lifecycle works.
3. Test MVP by running `npm run electron:dev`.
4. Proceed to US2 to add actual OS integrations.

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests/scenarios before committing
