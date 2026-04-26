import React from 'react';
import { useNotesContext } from '../context/NotesContext';

const Terminal = () => {
  const { terminalLines, terminalInput, setTerminalInput, executeCommand } = useNotesContext();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(terminalInput);
      setTerminalInput('');
    }
  };

  return (
    <footer className="terminal-pane">
      <div className="terminal-header">
        <div className="terminal-title">
          <i className="fas fa-terminal"></i>
          Agentic Terminal
        </div>
        <div className="top-bar-actions" style={{ fontSize: '0.6rem' }}>
          <i className="fas fa-minus" title="Minimize Terminal"></i>
          <i className="fas fa-expand-alt" title="Expand Terminal"></i>
          <i className="fas fa-times" title="Close Terminal"></i>
        </div>
      </div>
      <div className="terminal-body" style={{ overflowY: 'auto', height: 'calc(100% - 25px)' }}>
        {terminalLines.map((line, i) => (
          <div key={i} className="terminal-line">
            {line.startsWith('vnotes >') ? (
              <>
                <span className="terminal-prompt">vnotes &gt; </span>
                <span>{line.replace('vnotes >', '')}</span>
              </>
            ) : (
              <span className={line.includes('/') ? 'highlight' : ''}>{line}</span>
            )}
          </div>
        ))}
        <div className="terminal-line" style={{ display: 'flex', gap: '4px' }}>
          <span className="terminal-prompt">vnotes &gt; </span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoFocus
          />
        </div>
      </div>
    </footer>
  );
};

export default Terminal;
