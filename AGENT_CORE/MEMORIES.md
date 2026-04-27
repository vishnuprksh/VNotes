# Strategic Memories
### 2026-04-27 - Note Deletion Bug Analysis
- **Context:** User reported inability to delete notes.
- **Decision:** Identified that while backend deletion works, the Editor UI fails to clear when the active note is removed, leading to a "ghost" note appearance.
- **Reasoning:** Tiptap editor content synchronization in `App.jsx` was missing a fallback for `null` active note state.
