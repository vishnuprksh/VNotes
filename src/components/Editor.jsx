import React, { useMemo } from 'react';
import { EditorContent } from '@tiptap/react';
import { useNotesContext } from '../context/NotesContext';

// ─── Minimal word-level diff (no external dep) ────────────────────────────────

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Longest-common-subsequence on word arrays.
 * Returns an array of diff ops: { type: 'equal'|'remove'|'add', value: string }
 */
function wordDiff(oldText, newText) {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const m = oldWords.length;
  const n = newWords.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Trace back
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      ops.unshift({ type: 'equal', value: oldWords[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: 'add', value: newWords[j - 1] });
      j--;
    } else {
      ops.unshift({ type: 'remove', value: oldWords[i - 1] });
      i--;
    }
  }
  return ops;
}

// ─── DiffView ─────────────────────────────────────────────────────────────────

const DiffView = ({ originalHtml, proposedHtml, onAccept, onReject }) => {
  const ops = useMemo(() => {
    const oldText = stripHtml(originalHtml);
    const newText = stripHtml(proposedHtml);
    return wordDiff(oldText, newText);
  }, [originalHtml, proposedHtml]);

  return (
    <div className="diff-view">
      <div className="diff-actions">
        <button className="diff-btn diff-accept" onClick={onAccept}>
          <i className="fas fa-check"></i> Accept changes
        </button>
        <button className="diff-btn diff-reject" onClick={onReject}>
          <i className="fas fa-times"></i> Discard
        </button>
      </div>
      <div className="diff-legend">
        <span className="diff-legend-add">+ Added</span>
        <span className="diff-legend-remove">− Removed</span>
      </div>
      <div className="diff-body">
        {ops.map((op, i) => {
          if (op.type === 'equal') return <span key={i}>{op.value}</span>;
          if (op.type === 'add') return <mark key={i} className="diff-add">{op.value}</mark>;
          return <del key={i} className="diff-remove">{op.value}</del>;
        })}
      </div>
    </div>
  );
};

// ─── RawView ──────────────────────────────────────────────────────────────────

const RawView = ({ content }) => (
  <div className="raw-view">
    <pre className="raw-content">{content}</pre>
  </div>
);

// ─── Main Editor ──────────────────────────────────────────────────────────────

const Editor = ({ editor }) => {
  const {
    notes,
    activeNoteId,
    pendingNoteChange,
    applyNoteChange,
    rejectNoteChange,
    activeTab,
    setActiveTab,
  } = useNotesContext();
  const activeNote = notes[activeNoteId];

  if (!activeNote || !editor) {
    return <div className="editor-container editor-empty">Select a note to start writing</div>;
  }

  const hasPending = !!(pendingNoteChange && pendingNoteChange.noteId === activeNoteId);

  return (
    <div className="editor-container">
      {/* Tab bar — sticky above scrollable content */}
      <div className="editor-tabs">
        <button
          className={`editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <i className="far fa-eye"></i> Preview
        </button>
        <button
          className={`editor-tab ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <i className="fas fa-code"></i> Raw
        </button>
        <button
          className={`editor-tab ${activeTab === 'diff' ? 'active' : ''} ${hasPending ? 'tab-has-badge' : ''}`}
          onClick={() => setActiveTab('diff')}
        >
          <i className="fas fa-code-branch"></i> Diff
          {hasPending && <span className="tab-badge">1</span>}
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="editor-scroll-body">
        <article className="editor-content">
          <div className="note-meta">
            <span className={`tag ${(activeNote.category || 'Projects').toLowerCase()}`}>{activeNote.category || 'Projects'}</span>
            <span className="tag generic">{activeNote.tag || 'Note'}</span>
          </div>

          {activeTab === 'preview' && (
            <div className="editor-body tiptap-editor">
              <EditorContent editor={editor} />
            </div>
          )}

          {activeTab === 'raw' && (
            <RawView content={activeNote.content} />
          )}

          {activeTab === 'diff' && (
            hasPending ? (
              <DiffView
                originalHtml={pendingNoteChange.originalContent}
                proposedHtml={pendingNoteChange.proposedContent}
                onAccept={applyNoteChange}
                onReject={rejectNoteChange}
              />
            ) : (
              <div className="diff-empty">
                <i className="fas fa-code-branch"></i>
                <p>No pending changes. Ask the agent to proofread or edit your note.</p>
              </div>
            )
          )}
        </article>
      </div>
    </div>
  );
};

export default Editor;
