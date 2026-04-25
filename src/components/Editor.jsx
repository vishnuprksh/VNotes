import React from 'react';
import { EditorContent } from '@tiptap/react';

const Editor = ({ editor, activeNote }) => {
  if (!activeNote || !editor) return <div className="editor-container">Select a note</div>;

  return (
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
  );
};

export default Editor;
