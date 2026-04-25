import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import './index.css'

const INITIAL_NOTES = {
  'note-1': {
    id: 'note-1',
    title: 'Product Launch Strategy',
    category: 'Projects',
    tag: 'Marketing',
    content: `<h2>Product Launch Strategy</h2><p>The objective of this launch is to establish <strong>VNotes</strong> as the premier tool for cognitive synthesis. Our focus will be on the developer-centric market segment before expanding to broader knowledge workers.</p><ul data-type="taskList"><li data-checked="true">Finalize the 4px/8px design grid and core token architecture.</li><li data-checked="true">Implement fluid pane management system.</li><li data-checked="false">Deploy agentic terminal bridge for CLI integration.</li><li data-checked="false">Beta rollout to selected technical partners.</li></ul><pre><code>const vnotesAgent = require('@vnotes/core');\n\nasync function initGraph() {\n  const context = await vnotesAgent.hydrate({\n    depth: 2\n  });\n}</code></pre>`
  },
  'note-2': {
    id: 'note-2',
    title: 'Health & Fitness',
    category: 'Areas',
    tag: 'Long-term',
    content: `<h2>Health & Fitness</h2><p>Maintaining high cognitive performance requires a baseline of physical health.</p><ul><li>Morning routine: 20m mobility, 10m meditation.</li><li>Hydration: 3L daily minimum.</li><li>Deep work blocks: Max 90m before movement break.</li></ul>`
  },
  'note-3': {
    id: 'note-3',
    title: 'React Patterns',
    category: 'Resources',
    tag: 'Technical',
    content: `<h2>React Patterns</h2><p>Curated collection of advanced React patterns for agentic UI development.</p><h3>Compound Components</h3><p>Excellent for complex UI blocks like our Sidebar/Editor bridge.</p><pre><code>const Sidebar = ({ children }) => {\n  return &lt;aside&gt;{children}&lt;/aside&gt;\n}</code></pre>`
  },
  'note-4': {
    id: 'note-4',
    title: 'Q1 Vision 2024',
    category: 'Archives',
    tag: 'Historical',
    content: `<h2>Q1 Vision 2024</h2><p>Archive of initial brainstorms for the VNotes ecosystem.</p><blockquote>"Knowledge is gravity, and we are building the antigravity shoes."</blockquote>`
  }
};

function App() {
  const [activeNoteId, setActiveNoteId] = React.useState('note-1');
  const [notes, setNotes] = React.useState(INITIAL_NOTES);

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
    content: INITIAL_NOTES['note-1'].content,
  })

  // Synchronize editor content when active note changes
  React.useEffect(() => {
    if (editor && notes[activeNoteId]) {
      editor.commands.setContent(notes[activeNoteId].content);
    }
  }, [activeNoteId, editor, notes]);

  const [terminalLines, setTerminalLines] = React.useState([
    'VNotes Agent v1.0.2 ready. PARA context active.',
    'Type /help for available commands.'
  ]);
  const [terminalInput, setTerminalInput] = React.useState('');

  const handleTerminalKeyDown = (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.trim().toLowerCase();
      const newLines = [...terminalLines, `vnotes >${terminalInput}`];
      
      switch (command) {
        case '/help':
          newLines.push('Available commands: /help, /list, /clear, /para');
          break;
        case '/list':
          newLines.push('Active PARA Hierarchy:');
          Object.values(INITIAL_NOTES).forEach(n => {
            newLines.push(`- [${n.category}] ${n.title}`);
          });
          break;
        case '/para':
          newLines.push('PARA Status: Projects (1), Areas (1), Resources (1), Archives (1)');
          break;
        case '/clear':
          setTerminalLines([]);
          setTerminalInput('');
          return;
        default:
          newLines.push(`Unknown command: ${command}`);
      }
      
      setTerminalLines(newLines);
      setTerminalInput('');
    }
  };

  const activeNote = notes[activeNoteId];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">VN</div>
          <div className="brand-text">
            <h2>VNotes</h2>
            <span>DEEP FOCUS</span>
          </div>
        </div>
        
        <button className="new-note-btn">
          <i className="fas fa-plus"></i>
          New Note
        </button>

        <nav className="nav-group">
          <div className="nav-header">BRAIN</div>
          {['Projects', 'Areas', 'Resources', 'Archives'].map(category => (
            <div key={category} className="nav-section">
              <div className="nav-item category-header">
                <i className={`fas fa-${category === 'Projects' ? 'folder' : category === 'Areas' ? 'bullseye' : category === 'Resources' ? 'archive' : 'history'}`}></i>
                {category}
              </div>
              <ul className="nav-sub-list">
                {Object.values(notes)
                  .filter(n => n.category === category)
                  .map(note => (
                    <li 
                      key={note.id} 
                      className={`nav-sub-item ${activeNoteId === note.id ? 'active' : ''}`}
                      onClick={() => setActiveNoteId(note.id)}
                    >
                      {note.title}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-item"><i className="fas fa-search"></i> Search</div>
          <div className="sidebar-item"><i className="fas fa-cog"></i> Settings</div>
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
              <span className={`tag ${activeNote.category.toLowerCase()}`}>{activeNote.category}</span>
              <span className="tag generic">{activeNote.tag}</span>
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
