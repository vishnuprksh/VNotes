import React from 'react';

const TopBar = ({ onSearch }) => {
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
          onChange={(e) => onSearch(e.target.value)}
        />
        <span style={{ fontSize: '0.6rem', color: 'var(--outline)' }}>⌘K</span>
      </div>
      <div className="top-bar-actions">
        <i className="fas fa-keyboard"></i>
        <i className="fas fa-share-alt"></i>
        <i className="fas fa-ellipsis-v"></i>
      </div>
    </header>
  );
};

export default TopBar;
