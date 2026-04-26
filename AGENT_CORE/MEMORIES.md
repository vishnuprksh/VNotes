# Strategic Memories

### 2026-04-25 - Project Initialization
- **Context:** Project started to build VNotes.
- **Decision:** Initializing AGENT_CORE framework for state management and long-term memory.

### 2026-04-25 - Framework Transition (React PWA)
- **Context:** User requested a suitable stack and PWA capability.
- **Decision:** Shifted to Vite + React and integrated PWA plugin.
- **Reasoning:** Robust architecture and cross-platform installation.

### 2026-04-25 - Terminal & Documentation
- **Context:** User requested functional terminal and documentation.
- **Decision:** Implemented React-based terminal state machine and created `vnotes_documentation.md`.
- **Reasoning:** Moves the app from a visual prototype to a functional "agentic" platform.

### 2026-04-25 - Strategic Refactor
- **Context:** User found the app lacked workflow and architecture.
- **Decision:** Moving from monolithic `App.jsx` to component-based architecture and implementing LocalStorage persistence.
- **Reasoning:** Necessary for scalability, real-world utility, and better maintenance.

### 2026-04-26 - Render Deployment & Context Refactor
- **Context:** User requested deployment to Render and architecture changes.
- **Decision:** Moving state management to React Context API and adding Render Blueprint configuration.
- **Reasoning:** Context API simplifies global state access (notes/terminal) and prepares the app for future features. Render Blueprints ensure consistent deployments.

### 2026-04-26 - Render Blueprint Fix
- **Context:** Render failed to parse the blueprint due to incorrect field names.
- **Decision:** Updated 'publishPath' to 'staticPublishPath' and added explicit SPA routing in render.yaml.
- **Reasoning:** 'staticPublishPath' is the correct field for static sites in the Render Blueprint spec.
