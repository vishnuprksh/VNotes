# Project Overview: VNotes
**North Star:** A high-performance, PARA-organized note-taking app with a terminal-first power-user workflow, enhanced by an in-terminal AI agent.
**Core Architecture:** React (Vite), Tiptap Editor, Framer Motion, Context API for state management. AI agent layer: `src/agent/` (agentRouter, agentCore, vectorSearch, openRouterClient).
**Guiding Principles:** 
- Premium Aesthetics (Glassmorphism, Dark Mode).
- Zero-click interaction patterns (Inline renaming, automatic focus).
- PARA Structure (Projects, Areas, Resources, Archives).
- AI agent has read-only access to notes (frozen snapshot).
**Constraints:** Desktop-first, local storage persistence. OpenRouter API key stored in-memory (not persisted). Agent model: `z-ai/glm-4.5-air:free`.
