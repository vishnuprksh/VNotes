import React from 'react';
import { useNotesContext } from '../context/NotesContext';

const TopBar = () => {
  const { searchQuery, setSearchQuery } = useNotesContext();

  return (
    <header className="top-bar">
      <div className="menu-items">
        <div className="menu-item">File</div>
        <div className="menu-item">Edit</div>
        <div className="menu-item">View</div>
        <div className="menu-item">Go</div>
      </div>
      <div className="search-bar">
        <i className="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Jump to file..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span style={{ fontSize: '0.6rem', color: 'var(--outline)' }}>⌘K</span>
      </div>
      <div className="top-bar-actions">
        <i className="fas fa-keyboard" title="Keyboard Shortcuts"></i>
        <i className="fas fa-share-alt" title="Share Note"></i>
        <i className="fas fa-ellipsis-v" title="More Options"></i>
      </div>
    </header>
  );
};

export default TopBar;
