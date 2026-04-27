# Strategic Memories
### 2026-04-27 - Note Deletion Bug Analysis
- **Context:** User reported inability to delete notes.
- **Decision:** Identified that while backend deletion works, the Editor UI fails to clear when the active note is removed, leading to a "ghost" note appearance.
- **Reasoning:** Tiptap editor content synchronization in `App.jsx` was missing a fallback for `null` active note state.

### 2026-04-27 - Mobile Responsive UI
- **Context:** User requested UI to be suitable for mobile and desktop.
- **Decision:** Use a hidden sidebar with a hamburger menu for mobile devices, leaving the editor and terminal stacked.
- **Reasoning:** Given limited horizontal space on mobile, hiding the sidebar by default prioritizes the reading and writing experience.

### 2026-04-27 - Terminal Routing Reversal & Minimization
- **Context:** User requested that `/` prefix should trigger the AI agent and plain text should trigger commands. Also requested a collapsible terminal.
- **Decision:** Reversed `agentRouter.js` logic and updated `NotesContext.jsx` to handle plain text commands. Added `isMinimized` state to `Terminal.jsx`.
- **Reasoning:** Prioritizes AI interaction by making it explicitly gated by `/`, and improves screen real estate management with the minimize feature.
