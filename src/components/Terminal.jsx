import React, { useEffect, useRef } from 'react';
import { useNotesContext } from '../context/NotesContext';

// Cursor blink component for streaming lines
const BlinkCursor = () => (
  <span className="terminal-cursor">▋</span>
);

const TerminalLine = ({ line }) => {
  switch (line.type) {
    case 'user':
      return (
        <div className="terminal-line">
          <span className="terminal-prompt">vnotes &gt; </span>
          <span>{line.text}</span>
        </div>
      );
    case 'agent':
      return (
        <div className="terminal-line terminal-agent-line">
          <span className="terminal-agent-prefix">✦ </span>
          <span className="terminal-agent-text">{line.text}</span>
          {line.streaming && <BlinkCursor />}
        </div>
      );
    case 'error':
      return (
        <div className="terminal-line terminal-error-line">
          <span className="terminal-error-prefix">✗ </span>
          <span>{line.text}</span>
        </div>
      );
    case 'system-dim':
      return (
        <div className="terminal-line terminal-dim-line">
          <span>{line.text}</span>
        </div>
      );
    case 'system':
    default:
      return (
        <div className="terminal-line">
          <span className={line.text?.includes('/') ? 'highlight' : ''}>{line.text}</span>
        </div>
      );
  }
};

const Terminal = () => {
  const {
    terminalLines,
    terminalInput,
    setTerminalInput,
    executeCommand,
    isAgentThinking,
  } = useNotesContext();

  const [isMinimized, setIsMinimized] = React.useState(false);
  const [terminalHeight, setTerminalHeight] = React.useState(250);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const isResizing = useRef(false);

  // Command history — stored in a ref to avoid re-renders
  const historyRef = useRef([]);     // oldest → newest
  const historyIdxRef = useRef(-1);  // -1 = no navigation active
  const draftRef = useRef('');       // preserves in-progress text when navigating

  // Auto-scroll to bottom whenever lines update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const handleKeyDown = (e) => {
    const history = historyRef.current;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      // Save draft on first upward move
      if (historyIdxRef.current === -1) {
        draftRef.current = terminalInput;
      }
      const nextIdx = Math.min(historyIdxRef.current + 1, history.length - 1);
      historyIdxRef.current = nextIdx;
      setTerminalInput(history[history.length - 1 - nextIdx]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdxRef.current === -1) return;
      const nextIdx = historyIdxRef.current - 1;
      historyIdxRef.current = nextIdx;
      if (nextIdx === -1) {
        setTerminalInput(draftRef.current);
      } else {
        setTerminalInput(history[history.length - 1 - nextIdx]);
      }
      return;
    }

    if (e.key === 'Enter' && !isAgentThinking) {
      const val = terminalInput.trim();
      if (!val) return;
      // Push to history (avoid consecutive duplicates)
      if (history[history.length - 1] !== val) {
        historyRef.current = [...history, val];
      }
      historyIdxRef.current = -1;
      draftRef.current = '';
      executeCommand(val);
      setTerminalInput('');
    }
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleMouseDown = (e) => {
    isResizing.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      
      if (terminalRef.current) {
        const rect = terminalRef.current.getBoundingClientRect();
        const newHeight = window.innerHeight - rect.top - e.clientY;
        const minHeight = 100;
        const maxHeight = window.innerHeight - 200;
        const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
        setTerminalHeight(constrainedHeight);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    if (isResizing.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, []);

  return (
    <footer 
      ref={terminalRef}
      className={`terminal-pane ${isMinimized ? 'minimized' : ''}`}
      style={{ height: isMinimized ? '36px' : `${terminalHeight}px` }}
    >
      <div className="terminal-header" onClick={isMinimized ? toggleMinimize : undefined}>
        <div className="terminal-title">
          <i className="fas fa-terminal"></i>
          Agentic Terminal
          {isAgentThinking && (
            <span className="terminal-thinking-badge">
              <span className="terminal-thinking-dot"></span>
              thinking
            </span>
          )}
        </div>
        <div className="top-bar-actions">
          <i 
            className={`fas ${isMinimized ? 'fa-chevron-up' : 'fa-minus'}`} 
            onClick={toggleMinimize} 
            title={isMinimized ? "Expand Terminal" : "Minimize Terminal"}
          ></i>
          {!isMinimized && (
            <i className="fas fa-times" onClick={() => setTerminalInput('')} title="Clear Input"></i>
          )}
        </div>
      </div>

      <div
        className="terminal-body"
        onClick={() => inputRef.current?.focus()}
      >
        {terminalLines.map((line, i) => (
          <TerminalLine key={line.id || i} line={line} />
        ))}

        {/* Input row */}
        <div className="terminal-line" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span className="terminal-prompt">vnotes &gt; </span>
          <input
            ref={inputRef}
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            placeholder={isAgentThinking ? 'Agent is thinking...' : 'Type help or /ask something...'}
            disabled={isAgentThinking}
            autoFocus
          />
        </div>

        <div ref={bottomRef} />
      </div>
      {!isMinimized && <div className="terminal-resize-handle" onMouseDown={handleMouseDown} />}
    </footer>
  );
};

export default Terminal;
