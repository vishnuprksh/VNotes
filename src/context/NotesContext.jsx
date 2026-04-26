import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_NOTES } from '../utils/para';
import { routeInput, ROUTE_AGENT } from '../agent/agentRouter';
import { runAgent } from '../agent/agentCore';

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
    { type: 'system', text: 'VNotes Agent v2.0.0 ready.' },
    { type: 'system', text: 'Persistence layer: LocalStorage active.' },
    { type: 'system', text: 'Type /help for commands, or ask me anything naturally.' },
    { type: 'system', text: 'Use /setkey <key> to set your OpenRouter API key.' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // API key stored in memory (not persisted for security)
  const apiKeyRef = useRef(
    import.meta.env.VITE_OPENROUTER_API_KEY || ''
  );

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

  const renameSubSection = useCallback((oldPath, newPath) => {
    setNotes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id].category === oldPath) {
          next[id].category = newPath;
        } else if (next[id].category.startsWith(`${oldPath}/`)) {
          next[id].category = next[id].category.replace(oldPath, newPath);
        }
      });
      return next;
    });
  }, []);

  const deleteSubSection = useCallback((path) => {
    const parentPath = path.split('/').slice(0, -1).join('/') || 'Projects';
    setNotes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        if (next[id].category === path || next[id].category.startsWith(`${path}/`)) {
          next[id].category = next[id].category.replace(path, parentPath);
        }
      });
      return next;
    });
  }, []);

  // ─── Agent pipeline ────────────────────────────────────────────────────────
  const runAgentQuery = useCallback((query, currentNotes) => {
    // Append user query line
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
      query,
      notes: currentNotes,
      apiKey: apiKeyRef.current,
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
  }, []);

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
      case '/help':
        newLines.push({ type: 'system', text: '── Commands ──────────────────────' });
        newLines.push({ type: 'system', text: '  /create [category]  — Create a new note' });
        newLines.push({ type: 'system', text: '  /delete             — Delete active note' });
        newLines.push({ type: 'system', text: '  /move [category]    — Move active note' });
        newLines.push({ type: 'system', text: '  /search [query]     — Filter sidebar' });
        newLines.push({ type: 'system', text: '  /clear-search       — Reset search' });
        newLines.push({ type: 'system', text: '  /list               — List all notes' });
        newLines.push({ type: 'system', text: '  /setkey <key>       — Set OpenRouter API key' });
        newLines.push({ type: 'system', text: '  /clear              — Clear terminal' });
        newLines.push({ type: 'system', text: '── AI Agent ──────────────────────' });
        newLines.push({ type: 'system', text: '  Type anything without / to ask the AI about your notes.' });
        newLines.push({ type: 'system', text: '  Example: "what did I work on last week?"' });
        break;

      case '/setkey': {
        const key = args.slice(1).join(' ').trim();
        if (key) {
          apiKeyRef.current = key;
          newLines.push({ type: 'system', text: '✓ OpenRouter API key set for this session.' });
        } else {
          newLines.push({ type: 'error', text: 'Usage: /setkey <your-openrouter-key>' });
        }
        break;
      }

      case '/create': {
        const cat = args[1] || 'Projects';
        createNote(cat);
        newLines.push({ type: 'system', text: `✓ Created new note in ${cat}` });
        break;
      }

      case '/delete':
        if (activeNoteId) {
          deleteNote(activeNoteId);
          newLines.push({ type: 'system', text: '✓ Deleted active note.' });
        } else {
          newLines.push({ type: 'error', text: 'Error: No active note to delete.' });
        }
        break;

      case '/move': {
        const newCat = args[1];
        if (activeNoteId && newCat) {
          moveNote(activeNoteId, newCat);
          newLines.push({ type: 'system', text: `✓ Moved note to ${newCat}` });
        } else {
          newLines.push({ type: 'error', text: 'Usage: /move [Projects|Areas|Resources|Archives]' });
        }
        break;
      }

      case '/list':
        newLines.push({ type: 'system', text: 'PARA Hierarchy:' });
        Object.values(notes).forEach(n => {
          newLines.push({ type: 'system', text: `  [${n.category}] ${n.title}` });
        });
        break;

      case '/search': {
        const query = args.slice(1).join(' ');
        if (query) {
          setSearchQuery(query);
          newLines.push({ type: 'system', text: `Searching sidebar for: "${query}"` });
        } else {
          newLines.push({ type: 'error', text: 'Usage: /search [query]' });
        }
        break;
      }

      case '/clear-search':
        setSearchQuery('');
        newLines.push({ type: 'system', text: '✓ Search filter cleared.' });
        break;

      case '/clear':
        setTerminalLines([]);
        return;

      default:
        newLines.push({ type: 'error', text: `Unknown command "${command}". Type /help.` });
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
