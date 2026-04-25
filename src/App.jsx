import React from 'react'
import './index.css'

function App() {
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
            <header className="note-header">
              <h2 className="note-title">Product Launch Strategy</h2>
              <div className="note-subtitle">
                <span><i className="far fa-calendar"></i> Oct 24, 2023</span>
                <span><i className="far fa-clock"></i> 3m ago</span>
              </div>
            </header>

            <div className="editor-body">
              <p>The objective of this launch is to establish <span className="highlight">VNotes</span> as the premier tool for cognitive synthesis. Our focus will be on the developer-centric market segment before expanding to broader knowledge workers.</p>

              <h3>Key Milestones</h3>
              <ul className="check-list">
                <li className="check-item done">
                  <span className="check-icon"><i className="fas fa-check"></i></span>
                  Finalize the 4px/8px design grid and core token architecture.
                </li>
                <li className="check-item done">
                  <span className="check-icon"><i className="fas fa-check"></i></span>
                  Implement fluid pane management system.
                </li>
                <li className="check-item">
                  <span className="check-icon"></span>
                  Deploy agentic terminal bridge for CLI integration.
                </li>
                <li className="check-item">
                  <span className="check-icon"></span>
                  Beta rollout to selected technical partners.
                </li>
              </ul>

              <h3>Implementation Hook</h3>
              <p className="code-comment">Standard event listener for terminal injection:</p>
              <div className="code-block">
                <div><span className="code-keyword">const</span> vnotesAgent = <span className="code-keyword">require</span>(<span className="code-string">'@vnotes/core'</span>);</div>
                <br />
                <div><span className="code-comment">// Initialize knowledge graph context</span></div>
                <div><span className="code-keyword">async function</span> <span className="code-tertiary">initGraph</span>() {'{'}</div>
                <div style={{ paddingLeft: '1rem' }}><span className="code-keyword">const</span> context = <span className="code-keyword">await</span> vnotesAgent.<span className="code-tertiary">hydrate</span>({'{'}</div>
                <div style={{ paddingLeft: '2rem' }}>depth: <span className="code-secondary">2</span></div>
                <div style={{ paddingLeft: '1rem' }}>{'}'});</div>
                <div>{'}'}</div>
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
          <div className="terminal-body">
            <div className="terminal-line">VNotes Agent v1.0.2 ready. Context loaded from 124 notes.</div>
            <div className="terminal-line">Type <span className="highlight">/help</span> for available commands.</div>
            <div className="terminal-line"><span className="terminal-prompt">vnotes &gt; </span>|</div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
