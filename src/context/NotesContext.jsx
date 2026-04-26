import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_NOTES } from '../utils/para';

const NotesContext = createContext();

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  // Notes state
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('vnotes-data');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState(() => Object.keys(notes)[0] || null);

  // Terminal state
  const [terminalLines, setTerminalLines] = useState([
    'VNotes Agent v1.2.0 (Context) ready.',
    'Persistence layer: LocalStorage active.',
    'Type /help for available commands.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist notes
  useEffect(() => {
    localStorage.setItem('vnotes-data', JSON.stringify(notes));
  }, [notes]);

  const updateNote = useCallback((id, content) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], content }
    }));
  }, []);

  const createNote = useCallback((category) => {
    // Determine default category: passed arg > active note category > Projects
    const defaultCategory = category || (activeNoteId && notes[activeNoteId] ? notes[activeNoteId].category : 'Projects');
    
    const id = `note-${Date.now()}`;
    const newNote = {
      id,
      title: 'Untitled Note',
      category: defaultCategory,
      tag: 'New',
      content: '<h2>Untitled Note</h2><p>Start typing...</p>'
    };
    setNotes(prev => ({ ...prev, [id]: newNote }));
    setActiveNoteId(id);
    return id;
  }, [activeNoteId, notes]);

  const deleteNote = useCallback((id) => {
    setNotes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveNoteId(prev => (prev === id ? Object.keys(notes)[0] || null : prev));
  }, [notes]);

  const moveNote = useCallback((id, category) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], category }
    }));
  }, []);

  const executeCommand = (input) => {
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
        createNote(cat);
        newLines.push(`Created new note in ${cat}`);
        break;
      case '/delete':
        if (activeNoteId) {
          deleteNote(activeNoteId);
          newLines.push('Deleted active note.');
        } else {
          newLines.push('Error: No active note to delete.');
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

  const value = {
    notes,
    activeNoteId,
    setActiveNoteId,
    terminalLines,
    terminalInput,
    setTerminalInput,
    searchQuery,
    setSearchQuery,
    updateNote,
    createNote,
    deleteNote,
    moveNote,
    executeCommand
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};
