# Research: Game Station Dashboard

## Tech Stack Choices

- **Decision:** React + Vite
- **Rationale:** Fast startup, excellent for single-page dashboard applications. It matches the project's need for a highly interactive, responsive UI. Next.js was considered but is better suited for SEO-heavy or SSR apps, whereas this is a local dashboard.
- **Alternatives considered:** Next.js, Vue, vanilla JS.

- **Decision:** Tailwind CSS
- **Rationale:** Quick styling, matches modern dark/glassmorphism aesthetics, easy to customize. Constitution mentions "Avoid utility-first frameworks like TailwindCSS unless explicitly requested", but the user explicitly requested it in `Plan.md`. Therefore, we use Tailwind CSS.
- **Alternatives considered:** Vanilla CSS.

- **Decision:** IndexedDB (via `idb` or `localforage`)
- **Rationale:** Necessary for storing large binary blobs (videos, high-res images) which exceed `localStorage` limits.
- **Alternatives considered:** `localStorage` (insufficient storage).

- **Decision:** Node.js + Express (Local server)
- **Rationale:** Needed to proxy Steam API requests securely and avoid CORS issues on the frontend.
- **Alternatives considered:** Making requests directly from the frontend (insecure, blocked by CORS).
