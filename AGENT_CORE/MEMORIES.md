# Strategic Memories
### 2026-04-26 - Search Strategy
- **Context:** User wants robust search in the sidebar and terminal.
- **Decision:** Search will filter both note titles and content. Sections will be filtered based on whether they contain matching notes.
- **Reasoning:** To prevent the sidebar from becoming cluttered during search, we only show sections that have relevant hits. Force-expanding these sections ensures the results are visible without extra clicks.

### 2026-04-26 - Terminal Commands
- **Context:** Need power-user features.
- **Decision:** Added `/search` and `/clear` commands.
- **Reasoning:** Terminal is a core part of the "VNotes" identity; basic UI actions should be scriptable/executable via terminal.

### 2026-04-26 - AI Agent Architecture
- **Context:** User wants natural language queries answered from their notes in the terminal.
- **Decision:** Client-side TF-IDF vector search + OpenRouter streaming (`z-ai/glm-4.5-air:free`). No new npm packages. Agent has read-only access (frozen notes snapshot). API key stored in `apiKeyRef` in-memory, set via `/setkey` terminal command.
- **Reasoning:** Keeps the app pure-frontend. TF-IDF is fast, free, and sufficient for personal notes. Streaming gives a live terminal feel. Read-only by design — agent cannot write.
- **Terminal line format changed:** Lines are now typed objects `{ type, text, id?, streaming? }` not plain strings. This allows per-type rendering (agent vs user vs error vs system).
### 2026-04-26 - Firestore Migration
- **Context:** User requested to use Firebase Firestore instead of LocalStorage for notes database.
- **Decision:** Replaced `localStorage` persistence in `NotesContext.jsx` with Firestore `onSnapshot` for real-time syncing and `setDoc`/`deleteDoc`/`writeBatch` for mutations. Secured access using `firestore.rules`.
- **Reasoning:** LocalStorage lacks cross-device sync and durability. Firestore offers a seamless real-time document database that integrates natively with the recently added Google Authentication, allowing robust multi-device synchronization per user.
