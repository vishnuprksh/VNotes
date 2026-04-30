# Task Tracking

## Completed Sprint: UI Audit Fixes

- [x] **Editor.jsx** — Dynamic date formatting (`createdAt` / `updatedAt` fallback + relative time)
- [x] **TopBar.jsx** — Full rewrite: File/Edit/View/Go dropdowns with real actions
- [x] **TopBar.jsx** — Word count badge, Share icon (clipboard), Terminal toggle icon
- [x] **TopBar.jsx** — Keyboard shortcuts modal (⌨ icon)
- [x] **TopBar.jsx** — Toast notification system
- [x] **Sidebar.jsx** — `useRef` import fix (runtime crash)
- [x] **Sidebar.jsx** — Ctrl+K / Cmd+K global shortcut → focus search
- [x] **Sidebar.jsx** — Search clear (×) button when query is active
- [x] **Settings.jsx** — General tab: Auto-save delay, Default category, Title extraction
- [x] **Settings.jsx** — Appearance tab: Font size, Editor width, Line height sliders
- [x] **index.css** — TopBar dropdown, toast, shortcuts modal, word count badge, slider, checkbox, empty-state CSS
- [x] **Build verified** — `npm run build` exits 0 (no errors)
- [x] **Committed** — 2 commits on `main`

## Pending

- [ ] **Push to remote** — requires GitHub credentials (HTTPS token or SSH key registration)
  - Run: `git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/vishnuprksh/VNotes.git && git push --force origin main`

**Blockers:** GitHub auth not available in headless environment.
