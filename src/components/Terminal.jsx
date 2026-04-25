import React from 'react';

const Terminal = ({ lines, input, onInputChange, onKeyDown }) => {
  return (
    <footer className="terminal-pane">
      <div className="terminal-header">
        <div className="terminal-title">
          <i className="fas fa-terminal"></i>
          Agentic Terminal
        </div>
        <div className="top-bar-actions" style={{ fontSize: '0.6rem' }}>
          <i className="fas fa-minus"></i>
          <i className="fas fa-expand-alt"></i>
          <i className="fas fa-times"></i>
        </div>
      </div>
      <div className="terminal-body" style={{ overflowY: 'auto', height: 'calc(100% - 25px)' }}>
        {lines.map((line, i) => (
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
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="terminal-input"
            autoFocus
          />
        </div>
      </div>
    </footer>
  );
};

export default Terminal;
