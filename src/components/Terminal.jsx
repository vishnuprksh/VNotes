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

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever lines update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isAgentThinking) {
      const val = terminalInput.trim();
      if (!val) return;
      executeCommand(val);
      setTerminalInput('');
    }
  };

  return (
    <footer className="terminal-pane">
      <div className="terminal-header">
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
        <div className="top-bar-actions" style={{ fontSize: '0.6rem' }}>
          <i className="fas fa-minus" title="Minimize Terminal"></i>
          <i className="fas fa-expand-alt" title="Expand Terminal"></i>
          <i className="fas fa-times" title="Close Terminal"></i>
        </div>
      </div>

      <div
        className="terminal-body"
        style={{ overflowY: 'auto', height: 'calc(100% - 25px)' }}
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
            placeholder={isAgentThinking ? 'Agent is thinking...' : 'Ask anything or type /help'}
            disabled={isAgentThinking}
            autoFocus
          />
        </div>

        <div ref={bottomRef} />
      </div>
    </footer>
  );
};

export default Terminal;
