import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { INITIAL_NOTES } from '../utils/para';
import { routeInput, ROUTE_AGENT } from '../agent/agentRouter';
import { runAgent } from '../agent/agentCore';

const DEFAULT_SETTINGS = {
  openRouterKey: '',
  defaultModel: 'z-ai/glm-4.5-air:free',
  systemPrompt: 'You are a helpful assistant integrated into a terminal of a note-taking app.',
  streamResponses: true,
};

const NotesContext = createContext();

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Notes state
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState(() => Object.keys(INITIAL_NOTES)[0] || null);

  // Terminal state
  const [terminalLines, setTerminalLines] = useState([
    { type: 'system', text: 'VNotes Agent v2.0.0 ready.' },
    { type: 'system', text: 'Type help for commands, or use / to ask me anything.' },
    { type: 'system', text: 'Example: /what did I do on last sep 25th?' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // ─── User settings (AI config) ───────────────────────────────────────────
  const [userSettings, setUserSettings] = useState(DEFAULT_SETTINGS);
  const settingsLoadedRef = useRef(false);

  // Load settings from Firestore when user changes
  useEffect(() => {
    if (!currentUser) {
      setUserSettings(DEFAULT_SETTINGS);
      settingsLoadedRef.current = false;
      return;
    }
    const settingsDocRef = doc(db, `users/${currentUser.uid}/settings`, 'ai');
    getDoc(settingsDocRef).then((snap) => {
      if (snap.exists()) {
        setUserSettings(prev => ({ ...DEFAULT_SETTINGS, ...snap.data() }));
      }
      settingsLoadedRef.current = true;
    }).catch(console.error);
  }, [currentUser]);

  const updateSettings = useCallback((newSettings) => {
    setUserSettings(prev => {
      const merged = { ...prev, ...newSettings };
      if (currentUser) {
        const settingsDocRef = doc(db, `users/${currentUser.uid}/settings`, 'ai');
        // Don't store the raw API key in plaintext in Firestore — store it
        // only if the user explicitly saves (acceptable trade-off for personal apps)
        setDoc(settingsDocRef, merged, { merge: true }).catch(console.error);
      }
      return merged;
    });
  }, [currentUser]);

  // Fetch notes from Firestore
  useEffect(() => {
    if (!currentUser) {
      setNotes(INITIAL_NOTES);
      setActiveNoteId(Object.keys(INITIAL_NOTES)[0] || null);
      return;
    }

    const notesRef = collection(db, `users/${currentUser.uid}/notes`);
    const unsubscribe = onSnapshot(notesRef, (snapshot) => {
      const fetchedNotes = {};
      snapshot.forEach(doc => {
        fetchedNotes[doc.id] = { ...doc.data(), id: doc.id };
      });
      
      // Only update state if there are actual notes or if it's explicitly empty.
      setNotes(prev => {
        // Simple merge check could be added, but for now we trust Firestore as source of truth
        return fetchedNotes;
      });

      setActiveNoteId(prev => {
        if (!prev || !fetchedNotes[prev]) {
          return Object.keys(fetchedNotes)[0] || null;
        }
        return prev;
      });
    }, (error) => {
      console.error("Error fetching notes:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateNote = useCallback((id, content) => {
    // Extract title from content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    let title = 'Untitled Note';
    
    for (const child of tempDiv.children) {
      const text = child.textContent.trim();
      if (text) {
        title = text.substring(0, 100);
        break;
      }
    }
    if (title === 'Untitled Note' && tempDiv.textContent.trim()) {
      title = tempDiv.textContent.trim().substring(0, 100);
    }

    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], content, title }
    }));
    
    if (currentUser) {
      const docRef = doc(db, `users/${currentUser.uid}/notes`, id);
      setDoc(docRef, { content, title }, { merge: true }).catch(console.error);
    }
  }, [currentUser]);

  const createNote = useCallback((category) => {
    const defaultCategory = category || (activeNoteId && notes[activeNoteId] ? notes[activeNoteId].category : 'Projects');
    const id = `note-${Date.now()}`;
    const newNote = {
      id,
      title: 'Untitled Note',
      category: defaultCategory,
      tag: 'New',
      createdAt: new Date().toISOString(),
      content: '<h2>Untitled Note</h2><p>Start typing...</p>'
    };
    
    setNotes(prev => ({ ...prev, [id]: newNote }));
    setActiveNoteId(id);
    
    if (currentUser) {
      const docRef = doc(db, `users/${currentUser.uid}/notes`, id);
      setDoc(docRef, newNote).catch(console.error);
    }
    
    return id;
  }, [activeNoteId, notes, currentUser]);

  const deleteNote = useCallback((id) => {
    // Clear active note if it's the one being deleted
    setActiveNoteId(prev => (prev === id ? null : prev));

    setNotes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    
    if (currentUser) {
      const docRef = doc(db, `users/${currentUser.uid}/notes`, id);
      deleteDoc(docRef).catch(err => {
        console.error("Error deleting note from Firestore:", err);
        // Optional: Re-fetch notes on error to restore local state
      });
    }
  }, [currentUser]);

  const moveNote = useCallback((id, category) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], category }
    }));
    
    if (currentUser) {
      const docRef = doc(db, `users/${currentUser.uid}/notes`, id);
      setDoc(docRef, { category }, { merge: true }).catch(console.error);
    }
  }, [currentUser]);

  const renameSubSection = useCallback((oldPath, newPath) => {
    const notesToUpdate = [];
    setNotes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id].category === oldPath) {
          const updatedNote = { ...next[id], category: newPath };
          next[id] = updatedNote;
          notesToUpdate.push({ id, category: newPath });
        } else if (next[id].category && next[id].category.startsWith(`${oldPath}/`)) {
          const updatedCategory = next[id].category.replace(oldPath, newPath);
          const updatedNote = { ...next[id], category: updatedCategory };
          next[id] = updatedNote;
          notesToUpdate.push({ id, category: updatedCategory });
        }
      });
      return next;
    });
    
    if (currentUser && notesToUpdate.length > 0) {
      const batch = writeBatch(db);
      notesToUpdate.forEach(update => {
        const docRef = doc(db, `users/${currentUser.uid}/notes`, update.id);
        batch.set(docRef, { category: update.category }, { merge: true });
      });
      batch.commit().catch(console.error);
    }
  }, [currentUser]);

  const deleteSubSection = useCallback((path) => {
    const parentPath = path.split('/').slice(0, -1).join('/') || 'Projects';
    const notesToUpdate = [];
    setNotes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id].category === path || (next[id].category && next[id].category.startsWith(`${path}/`))) {
          const updatedCategory = next[id].category.replace(path, parentPath);
          const updatedNote = { ...next[id], category: updatedCategory };
          next[id] = updatedNote;
          notesToUpdate.push({ id, category: updatedCategory });
        }
      });
      return next;
    });
    
    if (currentUser && notesToUpdate.length > 0) {
      const batch = writeBatch(db);
      notesToUpdate.forEach(update => {
        const docRef = doc(db, `users/${currentUser.uid}/notes`, update.id);
        batch.set(docRef, { category: update.category }, { merge: true });
      });
      batch.commit().catch(console.error);
    }
  }, [currentUser]);

  // ─── Agent pipeline ────────────────────────────────────────────────────────
  const runAgentQuery = useCallback((query, currentNotes) => {
    // Append user query line
    // If the query starts with '/', strip it for the agent
    const cleanQuery = query.startsWith('/') ? query.substring(1).trim() : query;

    setTerminalLines(prev => [
      ...prev,
      { type: 'user', text: query },
    ]);

    setIsAgentThinking(true);

    // We'll build the agent response in a mutable ref and then append
    let agentResponse = '';
    const agentLineId = `agent-${Date.now()}`;

    // Insert a placeholder agent line
    setTerminalLines(prev => [
      ...prev,
      { type: 'agent', text: '', id: agentLineId, streaming: true },
    ]);

    runAgent({
      query: cleanQuery,
      notes: currentNotes,
      apiKey: userSettings.openRouterKey || import.meta.env.VITE_OPENROUTER_API_KEY || '',
      model: userSettings.defaultModel,
      systemPromptOverride: userSettings.systemPrompt || undefined,
      onSearchResults: (results) => {
        if (results.length > 0) {
          const titles = results.map(r => `"${r.note.title}"`).join(', ');
          setTerminalLines(prev => [
            ...prev.slice(0, -1), // remove the streaming placeholder temporarily
            { type: 'system-dim', text: `↳ Searching notes… found: ${titles}` },
            { type: 'agent', text: '', id: agentLineId, streaming: true },
          ]);
        }
      },
      onToken: (token) => {
        agentResponse += token;
        // Update the last agent line in-place
        setTerminalLines(prev => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (next[lastIdx]?.id === agentLineId) {
            next[lastIdx] = { ...next[lastIdx], text: agentResponse };
          }
          return next;
        });
      },
      onDone: () => {
        // Mark streaming complete
        setTerminalLines(prev => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (next[lastIdx]?.id === agentLineId) {
            next[lastIdx] = { ...next[lastIdx], streaming: false };
          }
          return next;
        });
        setIsAgentThinking(false);
      },
      onError: (errMsg) => {
        setTerminalLines(prev => [
          ...prev.filter(l => l.id !== agentLineId),
          { type: 'error', text: `Agent error: ${errMsg}` },
        ]);
        setIsAgentThinking(false);
      },
    });
  }, [userSettings]);

  // ─── Command executor ───────────────────────────────────────────────────────
  const executeCommand = useCallback((input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Route to agent or command handler
    if (routeInput(trimmed) === ROUTE_AGENT) {
      runAgentQuery(trimmed, notes);
      return;
    }

    // /command handling
    const args = trimmed.split(' ');
    const command = args[0].toLowerCase();
    const newLines = [
      ...terminalLines,
      { type: 'user', text: trimmed },
    ];

    switch (command) {
      case 'help':
        newLines.push({ type: 'system', text: '── Commands ──────────────────────' });
        newLines.push({ type: 'system', text: '  create [category]  — Create a new note' });
        newLines.push({ type: 'system', text: '  delete             — Delete active note' });
        newLines.push({ type: 'system', text: '  move [category]    — Move active note' });
        newLines.push({ type: 'system', text: '  search [query]     — Filter sidebar' });
        newLines.push({ type: 'system', text: '  clear-search       — Reset search' });
        newLines.push({ type: 'system', text: '  list               — List all notes' });
        newLines.push({ type: 'system', text: '  setkey <key>       — Set OpenRouter API key' });
        newLines.push({ type: 'system', text: '  clear              — Clear terminal' });
        newLines.push({ type: 'system', text: '── AI Agent ──────────────────────' });
        newLines.push({ type: 'system', text: '  Start with / to ask the AI about your notes.' });
        newLines.push({ type: 'system', text: '  Example: "/what did I work on last week?"' });
        break;

      case 'setkey': {
        const key = args.slice(1).join(' ').trim();
        if (key) {
          updateSettings({ openRouterKey: key });
          newLines.push({ type: 'system', text: '✓ API key saved to your account.' });
        } else {
          newLines.push({ type: 'error', text: 'Usage: setkey <your-openrouter-key>' });
        }
        break;
      }

      case 'create': {
        const cat = args[1] || 'Projects';
        createNote(cat);
        newLines.push({ type: 'system', text: `✓ Created new note in ${cat}` });
        break;
      }

      case 'delete':
        if (activeNoteId) {
          deleteNote(activeNoteId);
          newLines.push({ type: 'system', text: '✓ Deleted active note.' });
        } else {
          newLines.push({ type: 'error', text: 'Error: No active note to delete.' });
        }
        break;

      case 'move': {
        const newCat = args[1];
        if (activeNoteId && newCat) {
          moveNote(activeNoteId, newCat);
          newLines.push({ type: 'system', text: `✓ Moved note to ${newCat}` });
        } else {
          newLines.push({ type: 'error', text: 'Usage: move [Projects|Areas|Resources|Archives]' });
        }
        break;
      }

      case 'list':
        newLines.push({ type: 'system', text: 'PARA Hierarchy:' });
        Object.values(notes).forEach(n => {
          newLines.push({ type: 'system', text: `  [${n.category}] ${n.title}` });
        });
        break;

      case 'search': {
        const query = args.slice(1).join(' ');
        if (query) {
          setSearchQuery(query);
          newLines.push({ type: 'system', text: `Searching sidebar for: "${query}"` });
        } else {
          newLines.push({ type: 'error', text: 'Usage: search [query]' });
        }
        break;
      }

      case 'clear-search':
        setSearchQuery('');
        newLines.push({ type: 'system', text: '✓ Search filter cleared.' });
        break;

      case 'clear':
        setTerminalLines([]);
        return;

      default:
        newLines.push({ type: 'error', text: `Unknown command "${command}". Type help for help.` });
    }

    setTerminalLines(newLines);
  }, [terminalLines, notes, activeNoteId, createNote, deleteNote, moveNote, runAgentQuery]);

  const value = {
    notes,
    activeNoteId,
    setActiveNoteId,
    terminalLines,
    terminalInput,
    setTerminalInput,
    searchQuery,
    setSearchQuery,
    isAgentThinking,
    userSettings,
    updateSettings,
    updateNote,
    createNote,
    deleteNote,
    moveNote,
    renameSubSection,
    deleteSubSection,
    executeCommand,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};
