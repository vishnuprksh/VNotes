import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useNotesContext } from '../context/NotesContext';

// ── Helpers ────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
// ───────────────────────────────────────────────────────

const Editor = ({ editor }) => {
  const { notes, activeNoteId } = useNotesContext();
  const activeNote = notes[activeNoteId];

  if (!activeNote || !editor) {
    return (
      <div className="editor-container editor-empty-state">
        <div className="empty-state-content">
          <i className="fas fa-feather-alt"></i>
          <h3>No note selected</h3>
          <p>Pick a note from the sidebar or create a new one.</p>
        </div>
      </div>
    );
  }

  const category = activeNote.category || 'Projects';
  const tagClass = category.split('/')[0].toLowerCase();

  return (
    <div className="editor-container">
      <article className="editor-content">
        <div className="note-meta">
          <span className={`tag ${tagClass}`}>{category}</span>
          <span className="tag generic">{activeNote.tag || 'Note'}</span>
        </div>
        <header className="note-header" style={{ marginBottom: '0.5rem' }}>
          <div className="note-subtitle">
            <span>
              <i className="far fa-calendar"></i>{' '}
              {formatDate(activeNote.createdAt)}
            </span>
            <span>
              <i className="far fa-clock"></i>{' '}
              {timeAgo(activeNote.createdAt)}
            </span>
          </div>
        </header>

        <div className="editor-body tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </article>
    </div>
  );
};

export default Editor;
