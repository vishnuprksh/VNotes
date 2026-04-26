# Strategic Memories
### 2026-04-26 - Search Strategy
- **Context:** User wants robust search in the sidebar and terminal.
- **Decision:** Search will filter both note titles and content. Sections will be filtered based on whether they contain matching notes.
- **Reasoning:** To prevent the sidebar from becoming cluttered during search, we only show sections that have relevant hits. Force-expanding these sections ensures the results are visible without extra clicks.

### 2026-04-26 - Terminal Commands
- **Context:** Need power-user features.
- **Decision:** Added `/search` and `/clear` commands.
- **Reasoning:** Terminal is a core part of the "VNotes" identity; basic UI actions should be scriptable/executable via terminal.
