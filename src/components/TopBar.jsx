import React from 'react';

const TopBar = () => {
  return (
    <header className="top-bar">
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
