# Strategic Memories

### 2026-04-28 — UI Audit Sprint

- **Context:** Full-stack UI audit of VNotes; 7 issues identified from browser inspection.
- **Decision:** Rewrote TopBar entirely rather than patching dead menu items.
- **Reasoning:** The original TopBar had no dropdown logic at all — patching would have been messier than a clean rewrite given the scope.

### 2026-04-28 — Sidebar `useRef` Bug

- **Context:** Added `useRef` usage to Sidebar.jsx but forgot to include it in the React import.
- **Decision:** Always check existing imports before adding new hook usage.
- **Reasoning:** Silent runtime crash, not a build error — caught by browser verification step.

### 2026-04-28 — `createdAt` Missing on Seeded Notes

- **Context:** `INITIAL_NOTES` in `para.js` has no `createdAt` or `updatedAt` field; demo notes showed blank date headers.
- **Decision:** Added fallback chain: `createdAt || updatedAt || new Date().toISOString()` in Editor.jsx instead of adding timestamps to para.js.
- **Reasoning:** The right fix is at the display layer — seeded notes are a dev artifact; real Firestore notes always have `createdAt`.

### 2026-04-28 — GitHub Push Auth

- **Context:** Remote is HTTPS, no credential helper or `gh` CLI available in the shell session.
- **Decision:** Commits staged locally; user must push manually with a PAT or switch remote to SSH.
- **Pattern to remember:** Always verify remote auth method before promising force-push in an automated session.
