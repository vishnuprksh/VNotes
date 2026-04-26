import React, { useState, useMemo } from 'react';
import { PARA_CATEGORIES, CATEGORY_ICONS } from '../utils/para';
import { useNotesContext } from '../context/NotesContext';
import ContextMenu from './ContextMenu';

const Sidebar = () => {
  const { 
    notes, 
    activeNoteId, 
    setActiveNoteId, 
    createNote, 
    deleteNote, 
    moveNote, 
    renameSubSection, 
    deleteSubSection, 
    searchQuery 
  } = useNotesContext();
  
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    noteId: null, 
    type: 'note', 
    target: null 
  });

  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (e, path) => {
    e.stopPropagation();
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Calculate all unique categories for the 'Move To' menu
  const allCategories = useMemo(() => {
    const cats = new Set(PARA_CATEGORIES);
    Object.values(notes).forEach(n => cats.add(n.category));
    return Array.from(cats).sort((a, b) => {
      // Sort main categories first, then sub-sections
      const aIsMain = PARA_CATEGORIES.includes(a);
      const bIsMain = PARA_CATEGORIES.includes(b);
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;
      return a.localeCompare(b);
    });
  }, [notes]);

  const handleContextMenu = (e, id, type) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      noteId: type === 'note' ? id : null,
      type,
      target: id // id or category path
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMoveNote = (category) => {
    if (contextMenu.noteId) {
      moveNote(contextMenu.noteId, category);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu.type === 'note' && contextMenu.noteId) {
      if (window.confirm('Delete this note?')) {
        deleteNote(contextMenu.noteId);
      }
    } else if (contextMenu.type === 'subsection') {
      if (window.confirm(`Delete section "${contextMenu.target}" and move all notes to parent?`)) {
        deleteSubSection(contextMenu.target);
      }
    }
    handleCloseContextMenu();
  };

  const handleRename = () => {
    if (contextMenu.type === 'subsection') {
      const newName = prompt('Enter new name for this sub-section:', contextMenu.target.split('/').pop());
      if (newName) {
        const parentPath = contextMenu.target.split('/').slice(0, -1).join('/');
        const newPath = `${parentPath}/${newName}`;
        renameSubSection(contextMenu.target, newPath);
      }
    }
    handleCloseContextMenu();
  };

  const renderNoteItem = (note) => (
    <li 
      key={note.id} 
      className={`nav-sub-item ${activeNoteId === note.id ? 'active' : ''}`}
      onClick={() => setActiveNoteId(note.id)}
      onContextMenu={(e) => handleContextMenu(e, note.id, 'note')}
    >
      {note.title}
    </li>
  );

  const handleAddSubSection = (e, mainCategory) => {
    e.stopPropagation();
    const subName = prompt(`Enter sub-section name for ${mainCategory}:`);
    if (subName) {
      const fullPath = `${mainCategory}/${subName}`;
      // Creating a sub-section is represented by creating a placeholder note
      createNote(fullPath);
      // Automatically expand the new section
      setExpandedSections(prev => new Set(prev).add(fullPath));
    }
  };

  const handleAddNoteToSubSection = (e, fullPath) => {
    e.stopPropagation();
    createNote(fullPath);
    // Ensure it's expanded so user sees the new note
    if (!expandedSections.has(fullPath)) {
      setExpandedSections(prev => new Set(prev).add(fullPath));
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">VN</div>
        <div className="brand-text">
          <h2>VNotes</h2>
          <span>DEEP FOCUS</span>
        </div>
      </div>
      
      <button className="new-note-btn" onClick={() => createNote()}>
        <i className="fas fa-plus"></i>
        New Note
      </button>

      <nav className="nav-group">
        <div className="nav-header">BRAIN</div>
        {PARA_CATEGORIES.map(mainCategory => {
          // Filter notes that belong to this main category
          const categoryNotes = Object.values(notes).filter(n => {
            const matchesSearch = !searchQuery || 
              n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              n.content.toLowerCase().includes(searchQuery.toLowerCase());
            return n.category.startsWith(mainCategory) && matchesSearch;
          });

          // Group by sub-sections
          const subSections = {};
          const rootNotes = [];

          categoryNotes.forEach(note => {
            if (note.category === mainCategory) {
              rootNotes.push(note);
            } else {
              const subSectionName = note.category.replace(`${mainCategory}/`, '');
              if (!subSections[subSectionName]) subSections[subSectionName] = [];
              subSections[subSectionName].push(note);
            }
          });

          return (
            <div key={mainCategory} className="nav-section">
              <div className="nav-item category-header">
                <div className="cat-title">
                  <i className={CATEGORY_ICONS[mainCategory]}></i>
                  {mainCategory}
                </div>
                <button className="add-sub-btn" onClick={(e) => handleAddSubSection(e, mainCategory)} title="Add sub-section">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <div className="nav-hierarchy">
                {/* Root notes in this category */}
                <ul className="nav-sub-list">
                  {rootNotes.map(renderNoteItem)}
                </ul>

                {/* Sub-sections */}
                {Object.entries(subSections).map(([subName, subNotes]) => {
                  const fullSubPath = `${mainCategory}/${subName}`;
                  const isExpanded = expandedSections.has(fullSubPath);
                  
                  return (
                    <div key={subName} className={`nav-subsection ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="subsection-header"
                        onClick={(e) => toggleSection(e, fullSubPath)}
                        onContextMenu={(e) => handleContextMenu(e, fullSubPath, 'subsection')}
                      >
                        <i className={`fas fa-chevron-right ${isExpanded ? 'rotated' : ''}`}></i>
                        <span className="sub-title">{subName}</span>
                        <button 
                          className="add-note-inline-btn" 
                          onClick={(e) => handleAddNoteToSubSection(e, fullSubPath)}
                          title="Add note to section"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      {isExpanded && (
                        <ul className="nav-sub-list nested">
                          {subNotes.map(renderNoteItem)}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-item"><i className="fas fa-search"></i> Search</div>
        <div className="sidebar-item"><i className="fas fa-cog"></i> Settings</div>
      </div>

      <ContextMenu 
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        type={contextMenu.type}
        target={contextMenu.target}
        onClose={handleCloseContextMenu}
        onMove={handleMoveNote}
        onDelete={handleDelete}
        onRename={handleRename}
        categories={allCategories}
      />
    </aside>
  );
};

export default Sidebar;
