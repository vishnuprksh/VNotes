import React, { useState, useRef, useEffect } from 'react';
import { useNotesContext } from '../context/NotesContext';

// ── Simple Toast ──────────────────────────────────────
const Toast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="topbar-toast">{message}</div>;
};

// ── Keyboard Shortcuts Modal ──────────────────────────
const ShortcutsModal = ({ onClose }) => (
  <div className="shortcuts-overlay" onClick={onClose}>
    <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
      <div className="shortcuts-header">
        <h3><i className="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
        <button className="shortcuts-close" onClick={onClose}><i className="fas fa-times"></i></button>
      </div>
      <div className="shortcuts-body">
        <div className="shortcuts-group">
          <div className="shortcuts-group-title">Navigation</div>
          <div className="shortcut-row"><kbd>Ctrl K</kbd><span>Focus search</span></div>
          <div className="shortcut-row"><kbd>Esc</kbd><span>Close modal / clear focus</span></div>
        </div>
        <div className="shortcuts-group">
          <div className="shortcuts-group-title">Terminal</div>
          <div className="shortcut-row"><kbd>↑ ↓</kbd><span>Navigate command history</span></div>
          <div className="shortcut-row"><kbd>Enter</kbd><span>Execute command</span></div>
        </div>
        <div className="shortcuts-group">
          <div className="shortcuts-group-title">Notes</div>
          <div className="shortcut-row"><kbd>/ query</kbd><span>Ask AI about your notes</span></div>
          <div className="shortcut-row"><kbd>Right-click</kbd><span>Note / section options</span></div>
        </div>
      </div>
    </div>
  </div>
);

// ── Dropdown Menu ─────────────────────────────────────
const Dropdown = ({ items, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="topbar-dropdown" ref={ref}>
      {items.map((item, i) =>
        item.separator
          ? <div key={i} className="topbar-dropdown-sep" />
          : (
            <div
              key={i}
              className="topbar-dropdown-item"
              onClick={() => { item.action(); onClose(); }}
            >
              {item.icon && <i className={item.icon}></i>}
              <span>{item.label}</span>
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </div>
          )
      )}
    </div>
  );
};

// ── TopBar ────────────────────────────────────────────
const TopBar = ({ toggleSidebar, onOpenSettings, onFocusSearch, onToggleTerminal }) => {
  const { notes, activeNoteId, createNote, deleteNote } = useNotesContext();
  const activeNote = notes[activeNoteId];

  const [openMenu, setOpenMenu] = useState(null); // 'file' | 'edit' | 'view' | 'go'
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const handleShare = () => {
    if (!activeNote) { showToast('No note selected'); return; }
    const text = `# ${activeNote.title}\n\n${activeNote.content?.replace(/<[^>]+>/g, '') || ''}`;
    navigator.clipboard.writeText(text).then(
      () => showToast('Note copied to clipboard!'),
      () => showToast('Copy failed — check permissions')
    );
  };

  const wordCount = () => {
    if (!activeNote) return '—';
    const text = activeNote.content?.replace(/<[^>]+>/g, '') || '';
    return text.trim().split(/\s+/).filter(Boolean).length + ' words';
  };

  const MENUS = {
    file: [
      { label: 'New Note', icon: 'fas fa-plus', shortcut: 'N', action: () => createNote() },
      { separator: true },
      { label: 'Delete Note', icon: 'fas fa-trash', shortcut: 'Del', action: () => { if (activeNoteId) deleteNote(activeNoteId); } },
    ],
    edit: [
      { label: 'Find / Focus Search', icon: 'fas fa-search', shortcut: 'Ctrl K', action: () => onFocusSearch?.() },
      { separator: true },
      { label: 'Settings', icon: 'fas fa-cog', action: () => onOpenSettings?.() },
    ],
    view: [
      { label: 'Toggle Sidebar', icon: 'fas fa-sidebar', action: () => toggleSidebar?.() },
      { label: 'Toggle Terminal', icon: 'fas fa-terminal', action: () => onToggleTerminal?.() },
    ],
    go: [
      { label: 'Projects', icon: 'fas fa-folder', action: () => {} },
      { label: 'Areas', icon: 'fas fa-bullseye', action: () => {} },
      { label: 'Resources', icon: 'fas fa-archive', action: () => {} },
      { label: 'Archives', icon: 'fas fa-history', action: () => {} },
    ],
  };

  const menuLabels = ['file', 'edit', 'view', 'go'];

  return (
    <header className="top-bar">
      <div className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>

      <div className="menu-items">
        {menuLabels.map(key => (
          <div
            key={key}
            className={`menu-item ${openMenu === key ? 'active' : ''}`}
            onClick={() => setOpenMenu(prev => prev === key ? null : key)}
            style={{ position: 'relative' }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {openMenu === key && (
              <Dropdown items={MENUS[key]} onClose={() => setOpenMenu(null)} />
            )}
          </div>
        ))}
      </div>

      <div className="top-bar-actions" style={{ marginLeft: 'auto' }}>
        <span className="word-count-badge" title="Word count">{wordCount()}</span>
        <i className="fas fa-keyboard" title="Keyboard Shortcuts" onClick={() => setShowShortcuts(true)}></i>
        <i className="fas fa-share-alt" title="Copy note to clipboard" onClick={handleShare}></i>
        <i className="fas fa-terminal" title="Toggle Terminal" onClick={() => onToggleTerminal?.()}></i>
      </div>

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </header>
  );
};

export default TopBar;
