import React, { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import { useNotesContext } from './context/NotesContext';
import './index.css';

function App() {
  const { 
    notes, 
    activeNoteId, 
    updateNote,
  } = useNotesContext();

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
    content: notes[activeNoteId]?.content || '',
    onUpdate: ({ editor }) => {
      if (activeNoteId) {
        updateNote(activeNoteId, editor.getHTML());
      }
    }
  });

  // Sync editor when active note changes
  useEffect(() => {
    if (editor) {
      if (activeNoteId && notes[activeNoteId]) {
        const currentContent = editor.getHTML();
        if (currentContent !== notes[activeNoteId].content) {
          editor.commands.setContent(notes[activeNoteId].content);
        }
      } else {
        // Clear editor if no note is active or found
        editor.commands.setContent('');
      }
    }
  }, [activeNoteId, editor, notes]);

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <TopBar />
        
        <Editor editor={editor} />

        <Terminal />
      </main>
    </div>
  );
}

export default App;
