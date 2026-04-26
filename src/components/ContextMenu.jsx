import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, visible, onClose, onMove, onDelete, onRename, categories, type, target }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const isNote = type === 'note';

  const menuStyle = {
    top: y,
    left: x,
  };

  // Viewport safeguards
  if (menuRef.current) {
    const { offsetWidth, offsetHeight } = menuRef.current;
    if (x + offsetWidth > window.innerWidth) {
      menuStyle.left = x - offsetWidth;
    }
    if (y + offsetHeight > window.innerHeight) {
      menuStyle.top = y - offsetHeight;
    }
  }

  return (
    <div 
      ref={menuRef}
      className="context-menu" 
      style={menuStyle}
    >
      {isNote ? (
        <>
          <div className="menu-item delete" onClick={onDelete}>
            <i className="fas fa-trash"></i> Delete Note
          </div>
          <div className="menu-separator"></div>
          <div className="menu-header">MOVE TO</div>
          <div className="menu-scroll-area">
            {categories.map(cat => (
              <div key={cat} className="menu-item" onClick={() => onMove(cat)}>
                <i className={cat.includes('/') ? "fas fa-folder-open" : "fas fa-folder"}></i> 
                {cat.includes('/') ? cat.split('/').pop() : cat}
                {cat.includes('/') && <span className="cat-parent">{cat.split('/')[0]}</span>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="menu-header">{target}</div>
          <div className="menu-item" onClick={onRename}>
            <i className="fas fa-edit"></i> Rename Section
          </div>
          <div className="menu-item delete" onClick={onDelete}>
            <i className="fas fa-trash"></i> Delete Section
          </div>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
