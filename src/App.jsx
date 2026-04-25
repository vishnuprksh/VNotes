import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import './index.css'

const INITIAL_CONTENT = `
<h2>Product Launch Strategy</h2>
<p>The objective of this launch is to establish <strong>VNotes</strong> as the premier tool for cognitive synthesis. Our focus will be on the developer-centric market segment before expanding to broader knowledge workers.</p>

<ul data-type="taskList">
  <li data-checked="true">Finalize the 4px/8px design grid and core token architecture.</li>
  <li data-checked="true">Implement fluid pane management system.</li>
  <li data-checked="false">Deploy agentic terminal bridge for CLI integration.</li>
  <li data-checked="false">Beta rollout to selected technical partners.</li>
</ul>

<pre><code>const vnotesAgent = require('@vnotes/core');

async function initGraph() {
  const context = await vnotesAgent.hydrate({
    depth: 2
  });
}</code></pre>
`

function App() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: INITIAL_CONTENT,
  })

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
            <i className="fas fa-keyboard"></i>
            <i className="fas fa-share-alt"></i>
            <i className="fas fa-ellipsis-v"></i>
          </div>
        </header>

        <div className="editor-container">
          <article className="editor-content">
            <div className="note-meta">
              <span className="tag priority">Priority: High</span>
              <span className="tag category">Marketing</span>
            </div>
            <header className="note-header" style={{ marginBottom: '0.5rem' }}>
              <div className="note-subtitle">
                <span><i className="far fa-calendar"></i> Oct 24, 2023</span>
                <span><i className="far fa-clock"></i> 3m ago</span>
              </div>
            </header>

            <div className="editor-body tiptap-editor">
              <EditorContent editor={editor} />
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
