import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import Settings from './components/Settings';
import { useNotesContext } from './context/NotesContext';
import './index.css';

function App() {
  const { 
    notes, 
    activeNoteId, 
    updateNote,
    pendingNoteChange,
  } = useNotesContext();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Ref forwarded to Sidebar so TopBar can focus search
  const searchInputRef = useRef(null);

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
  // Don't overwrite editor when a pending change is being reviewed in diff tab
  useEffect(() => {
    if (editor) {
      if (activeNoteId && notes[activeNoteId]) {
        const currentContent = editor.getHTML();
        const noteContent = notes[activeNoteId].content;
        // Skip sync if a pending change is being reviewed — avoid stomping on proposed content display
        if (currentContent !== noteContent && !pendingNoteChange) {
          editor.commands.setContent(noteContent);
        }
      } else {
        editor.commands.setContent('');
      }
    }
  }, [activeNoteId, editor, notes, pendingNoteChange]);

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        searchInputRef={searchInputRef}
      />
      
      {isMobileSidebarOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      <main className="main-content">
        <TopBar 
          toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onFocusSearch={() => searchInputRef.current?.focus()}
          onToggleTerminal={() => setIsTerminalOpen(p => !p)}
        />
        
        <Editor editor={editor} />

        {isTerminalOpen && <Terminal />}
      </main>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
