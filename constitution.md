<!-- Sync Impact Report
Version change: 0.1.0 → 0.2.0
Modified principles: 
- "Native Web Technologies First" → "Desktop-First Technologies (Electron + React)"
- "SEO & Semantic Best Practices" → "Desktop Performance & Accessibility"
Added sections: None
Removed sections: None
Templates requiring updates: None (templates not present)
Follow-up TODOs: None
-->
# MNova Constitution

## Core Principles

### I. Visual Excellence & Rich Aesthetics
The application MUST prioritize an exceptional user experience with modern, premium designs. Use vibrant colors, glassmorphism, dynamic animations, and curated color palettes. Generic designs are unacceptable.

### II. Desktop-First Technologies (Electron + React)
The application MUST be built as a native desktop application using Electron, wrapping a React + Vite frontend. Tailwind CSS is used for styling to match the PS5 design language. Local system features MUST be accessed via Electron IPC rather than standard web APIs where appropriate.

### III. Dynamic & Interactive Design
The interface MUST feel alive. Implement micro-animations, hover effects, and smooth transitions for all interactive elements to enhance user engagement. Ensure gamepad input triggers immediate auditory and visual feedback.

### IV. Desktop Performance & Accessibility
The application MUST be optimized for desktop performance. This includes efficient rendering of video backgrounds, smooth carousel navigation, and proper memory management within the Electron wrapper. Accessibility via Gamepad and Keyboard MUST be seamlessly supported.

### V. Component-Driven Architecture
Code MUST be organized into focused, reusable components. Components MUST use predefined design system styles and tokens rather than ad-hoc utilities.

## UI/UX Standards

Designs MUST NOT rely on placeholders; use actual or generated images for realistic demonstrations. Typography MUST use modern web fonts (e.g., Inter, Roboto, Outfit) instead of browser defaults. The first impression should wow the user.

## Development Workflow

1. **Plan and Understand**: Fully outline features and requirements before coding.
2. **Build the Foundation**: Establish `index.css` and the core design system first.
3. **Assemble and Polish**: Build components, assemble pages, and ensure smooth interactions and responsive layouts.

## Governance

All code changes and design implementations MUST be reviewed against these core principles. The emphasis on visual excellence and desktop-first performance is non-negotiable. Amendments to these rules require a version bump and documented rationale.

**Version**: 0.2.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-01
