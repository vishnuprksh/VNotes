import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import { useNotes } from './hooks/useNotes';
import './index.css';

function App() {
  const { notes, updateNote, createNote, deleteNote, moveNote } = useNotes();
  const [activeNoteId, setActiveNoteId] = useState(() => Object.keys(notes)[0] || null);
  const [terminalLines, setTerminalLines] = useState([
    'VNotes Agent v1.1.0 ready. PARA context active.',
    'Persistence layer: LocalStorage initialized.',
    'Type /help for available commands.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (editor && activeNoteId && notes[activeNoteId]) {
      const currentContent = editor.getHTML();
      if (currentContent !== notes[activeNoteId].content) {
        editor.commands.setContent(notes[activeNoteId].content);
      }
    }
  }, [activeNoteId, editor, notes]);

  const handleNewNote = useCallback(() => {
    const id = createNote();
    setActiveNoteId(id);
  }, [createNote]);

  const handleTerminalCommand = (input) => {
    const args = input.trim().split(' ');
    const command = args[0].toLowerCase();
    const newLines = [...terminalLines, `vnotes > ${input}`];

    switch (command) {
      case '/help':
        newLines.push('Available commands:');
        newLines.push('  /create [category] - Create a new note');
        newLines.push('  /delete - Delete active note');
        newLines.push('  /move [category] - Move active note to category');
        newLines.push('  /list - List all notes by PARA');
        newLines.push('  /clear - Clear terminal');
        break;
      case '/create':
        const cat = args[1] || 'Projects';
        const newId = createNote(cat);
        setActiveNoteId(newId);
        newLines.push(`Created new note in ${cat}`);
        break;
      case '/delete':
        if (activeNoteId) {
          deleteNote(activeNoteId);
          setActiveNoteId(Object.keys(notes)[0] || null);
          newLines.push('Deleted active note.');
        }
        break;
      case '/move':
        const newCat = args[1];
        if (activeNoteId && newCat) {
          moveNote(activeNoteId, newCat);
          newLines.push(`Moved note to ${newCat}`);
        } else {
          newLines.push('Usage: /move [Projects|Areas|Resources|Archives]');
        }
        break;
      case '/list':
        newLines.push('PARA Hierarchy:');
        Object.values(notes).forEach(n => {
          newLines.push(`- [${n.category}] ${n.title}`);
        });
        break;
      case '/clear':
        setTerminalLines([]);
        return;
      default:
        newLines.push(`Agent: Unknown command "${command}". Type /help.`);
    }

    setTerminalLines(newLines);
  };

  const filteredNotes = Object.values(notes).filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar 
        notes={notes} 
        activeNoteId={activeNoteId} 
        onNoteSelect={setActiveNoteId}
        onNewNote={handleNewNote}
        searchQuery={searchQuery}
      />
      
      <main className="main-content">
        <TopBar onSearch={setSearchQuery} />
        
        <Editor 
          editor={editor} 
          activeNote={notes[activeNoteId]} 
        />

        <Terminal 
          lines={terminalLines}
          input={terminalInput}
          onInputChange={setTerminalInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTerminalCommand(terminalInput);
              setTerminalInput('');
            }
          }}
        />
      </main>
    </div>
  );
}

export default App;
