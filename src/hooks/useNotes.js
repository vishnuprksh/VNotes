import { useState, useEffect } from 'react';
import { INITIAL_NOTES } from '../utils/para';

export const useNotes = () => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('vnotes-data');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  useEffect(() => {
    localStorage.setItem('vnotes-data', JSON.stringify(notes));
  }, [notes]);

  const updateNote = (id, content) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], content }
    }));
  };

  const createNote = (category = 'Projects') => {
    const id = `note-${Date.now()}`;
    const newNote = {
      id,
      title: 'Untitled Note',
      category,
      tag: 'New',
      content: '<h2>Untitled Note</h2><p>Start typing...</p>'
    };
    setNotes(prev => ({ ...prev, [id]: newNote }));
    return id;
  };

  const deleteNote = (id) => {
    setNotes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const moveNote = (id, category) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], category }
    }));
  };

  return { notes, updateNote, createNote, deleteNote, moveNote };
};
