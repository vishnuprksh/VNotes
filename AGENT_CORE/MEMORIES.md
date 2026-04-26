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
31: 
32: ### 2026-04-26 - Render MCP Setup
33: - **Context:** User requested setting up MCP for Render management.
34: - **Decision:** Configured `@render-oss/mcp-server-render` in `mcp_config.json` with the provided API key.
35: - **Reasoning:** Enables agentic control over Render services, builds, and logs directly from the assistant.
36: 
37: ### 2026-04-26 - Render MCP Configuration Fix
38: - **Context:** Encountered 404 error when trying to fetch `@render-oss/mcp-server-render`.
39: - **Decision:** Switched to the official hosted URL `https://mcp.render.com/mcp` using `mcp-remote`.
40: - **Reasoning:** The official hosted URL is the recommended way to integrate with Render's MCP and avoids package registry issues.

### 2026-04-26 - Deployment Troubleshooting
- **Context:** Render build failed due to React 19 peer dependency conflicts with react-markdown-editor-lite.
- **Decision:** Created .npmrc with legacy-peer-deps=true and updated render.yaml.
- **Reasoning:** .npmrc ensures npm install succeeds even with peer dependency conflicts, which is necessary when using libraries that haven't updated for React 19 yet.

### 2026-04-26 - UI Contrast Improvement
- **Context:** User noted sidebar and main window are indistinguishable due to same color.
- **Decision:** Using Stitch to redesign for better contrast and glassmorphism.
- **Reasoning:** Improving visual hierarchy and user experience through clear separation of functional areas.
### 2026-04-26 - PARA Sub-sections & 'New Note' Fix
- **Context:** User requested sub-sections in PARA and noted 'New Note' always defaults to Projects.
- **Decision:** Implementing hierarchical category rendering in Sidebar and making 'New Note' dynamic based on active note.
- **Reasoning:** Enhances organization capabilities and streamlines workflow by respecting the current context.

### 2026-04-26 - Sidebar UX & Context Menus
- **Context:** User requested sidebar scrolling, sub-section creation UI, and right-click context menus for notes.
- **Decision:** Implementing custom context menu for sidebar notes and adding '+' icons for sub-section creation.
- **Reasoning:** Moving beyond terminal-only controls to a more intuitive GUI-driven workflow while maintaining minimalist aesthetics.
### 2026-04-26 - Advanced Sub-section Management Planning
- **Context:** User requested better sidebar organization; current PARA system is derived but hard to manage.
- **Decision:** Planning to add "Move to Sub-section" and sub-section lifecycle management (Rename/Delete).
- **Reasoning:** Necessary for the PARA system to be fully functional and user-friendly beyond simple note creation.

### 2026-04-26 - Advanced Sub-section Management Implementation
- **Context:** User approved the plan to enhance PARA organization.
- **Decision:** Implemented context-aware menus and cascading logic for renames/deletions.
- **Reasoning:** Ensures data integrity while providing a powerful GUI-driven organizational tool. The system now feels like a mature PARA-based knowledge manager.
