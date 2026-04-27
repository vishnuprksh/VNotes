import React from 'react';

const TopBar = ({ toggleSidebar }) => {
  return (
    <header className="top-bar">
      <div className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>
      <div className="menu-items">
        <div className="menu-item">File</div>
        <div className="menu-item">Edit</div>
        <div className="menu-item">View</div>
        <div className="menu-item">Go</div>
      </div>
      <div className="top-bar-actions" style={{ marginLeft: 'auto' }}>
        <i className="fas fa-keyboard" title="Keyboard Shortcuts"></i>
        <i className="fas fa-share-alt" title="Share Note"></i>
        <i className="fas fa-ellipsis-v" title="More Options"></i>
      </div>
    </header>
  );
};

export default TopBar;
