import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './index.css'

function App() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState('Product Launch Strategy');
  const [noteContent, setNoteContent] = React.useState(`The objective of this launch is to establish **VNotes** as the premier tool for cognitive synthesis. Our focus will be on the developer-centric market segment before expanding to broader knowledge workers.

### Key Milestones
- [x] Finalize the 4px/8px design grid and core token architecture.
- [x] Implement fluid pane management system.
- [ ] Deploy agentic terminal bridge for CLI integration.
- [ ] Beta rollout to selected technical partners.

### Implementation Hook
Standard event listener for terminal injection:

\`\`\`javascript
const vnotesAgent = require('@vnotes/core');

// Initialize knowledge graph context
async function initGraph() {
  const context = await vnotesAgent.hydrate({
    depth: 2
  });
}
\`\`\`
`);
  const [terminalLines, setTerminalLines] = React.useState([
    'VNotes Agent v1.0.2 ready. Context loaded from 124 notes.',
    'Type /help for available commands.'
  ]);
  const [terminalInput, setTerminalInput] = React.useState('');

  const handleTerminalKeyDown = (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.trim().toLowerCase();
      const newLines = [...terminalLines, `vnotes >${terminalInput}`];
      
      switch (command) {
        case '/help':
          newLines.push('Available commands: /help, /list, /clear, /info');
          break;
        case '/list':
          newLines.push('Notes found: [Product Launch Strategy], [Meeting Notes], [Daily Log]');
          break;
        case '/clear':
          setTerminalLines([]);
          setTerminalInput('');
          return;
        case '/info':
          newLines.push('VNotes v1.0.2 - Agentic Minimalist Editor');
          newLines.push('Build: 2026-04-25');
          break;
        default:
          newLines.push(`Unknown command: ${command}`);
      }
      
      setTerminalLines(newLines);
      setTerminalInput('');
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <i className="fas fa-brain"></i>
          </div>
          <div className="brand-name">
            <h1>VNotes</h1>
            <p>Deep Focus</p>
          </div>
        </div>

        <button className="btn-new-note">
          <i className="fas fa-plus"></i>
          New Note
        </button>

        <nav className="nav-section">
          <h2 className="nav-section-title">Brain</h2>
          <div className="nav-item active">
            <i className="fas fa-folder"></i>
            Projects
          </div>
          <div className="nav-item">
            <i className="fas fa-book-open"></i>
            Areas
          </div>
          <div className="nav-item">
            <i className="fas fa-database"></i>
            Resources
          </div>
          <div className="nav-item">
            <i className="fas fa-archive"></i>
            Archives
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item">
            <i className="fas fa-search"></i>
            Search
          </div>
          <div className="nav-item">
            <i className="fas fa-cog"></i>
            Settings
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="menu-items">
            <div className="menu-item">File</div>
            <div className="menu-item">Edit</div>
            <div className="menu-item">View</div>
            <div className="menu-item">Go</div>
          </div>
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Jump to file..." />
            <span style={{ fontSize: '0.6rem', color: 'var(--outline)' }}>⌘K</span>
          </div>
          <div className="top-bar-actions">
            <button 
              className={`edit-toggle ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
              style={{
                fontSize: '0.7rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: isEditing ? 'var(--primary)' : 'transparent',
                color: isEditing ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: `1px solid ${isEditing ? 'var(--primary)' : 'var(--outline-variant)'}`,
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
            <i className="fas fa-keyboard"></i>
            <i className="fas fa-share-alt"></i>
            <i className="fas fa-ellipsis-v"></i>
          </div>
        </header>

        <div className="editor-container">
          <article className={`editor-content ${isEditing ? 'split-view' : ''}`}>
            {isEditing && (
              <div className="edit-pane">
                <input 
                  className="title-input"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title"
                />
                <textarea 
                  className="content-textarea"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Start writing markdown..."
                />
              </div>
            )}
            <div className="preview-pane">
              <div className="note-meta">
                <span className="tag priority">Priority: High</span>
                <span className="tag category">Marketing</span>
              </div>
              <header className="note-header">
                <h2 className="note-title">{noteTitle}</h2>
                <div className="note-subtitle">
                  <span><i className="far fa-calendar"></i> Oct 24, 2023</span>
                  <span><i className="far fa-clock"></i> 3m ago</span>
                </div>
              </header>

              <div className="editor-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {noteContent}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        </div>

        <footer className="terminal-pane">
          <div className="terminal-header">
            <div className="terminal-title">
              <i className="fas fa-terminal"></i>
              Agentic Terminal
            </div>
            <div className="top-bar-actions" style={{ fontSize: '0.6rem' }}>
              <i className="fas fa-minus"></i>
              <i className="fas fa-expand-alt"></i>
              <i className="fas fa-times"></i>
            </div>
          </div>
          <div className="terminal-body" style={{ overflowY: 'auto', height: 'calc(100% - 25px)' }}>
            {terminalLines.map((line, i) => (
              <div key={i} className="terminal-line">
                {line.startsWith('vnotes >') ? (
                  <>
                    <span className="terminal-prompt">vnotes &gt; </span>
                    <span>{line.replace('vnotes >', '')}</span>
                  </>
                ) : (
                  <span className={line.includes('/') ? 'highlight' : ''}>{line}</span>
                )}
              </div>
            ))}
            <div className="terminal-line" style={{ display: 'flex', gap: '4px' }}>
              <span className="terminal-prompt">vnotes &gt; </span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--on-surface)',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  flex: 1
                }}
                autoFocus
              />
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
