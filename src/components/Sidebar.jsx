import React, { useState, useMemo, useEffect } from 'react';
import { PARA_CATEGORIES, CATEGORY_ICONS } from '../utils/para';
import { useNotesContext } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import ContextMenu from './ContextMenu';

const Sidebar = ({ isOpen, setIsOpen, onOpenSettings, searchInputRef }) => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();
  const { 
    notes, 
    activeNoteId, 
    setActiveNoteId, 
    createNote, 
    deleteNote, 
    moveNote, 
    renameSubSection, 
    deleteSubSection, 
    searchQuery,
    setSearchQuery
  } = useNotesContext();
  
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    noteId: null, 
    type: 'note', 
    target: null 
  });

  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('vnotes-expanded-sections');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [editingSection, setEditingSection] = useState(null); // path
  const [editValue, setEditValue] = useState('');
  const internalSearchRef = useRef(null);
  const resolvedSearchRef = searchInputRef || internalSearchRef;

  // Ctrl+K / Cmd+K → focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        resolvedSearchRef.current?.focus();
        resolvedSearchRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [resolvedSearchRef]);

  // Persist expanded sections
  useEffect(() => {
    localStorage.setItem('vnotes-expanded-sections', JSON.stringify(Array.from(expandedSections)));
  }, [expandedSections]);

  // Auto-expand sections on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingPaths = new Set();
      Object.values(notes).forEach(note => {
        const title = note.title || '';
        const content = note.content || '';
        const cat = note.category || 'Projects';
        
        const matches = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       content.toLowerCase().includes(searchQuery.toLowerCase());
        if (matches) {
          // If it's a sub-section note, expand its parent path
          if (cat.includes('/')) {
            matchingPaths.add(cat);
          }
        }
      });

      if (matchingPaths.size > 0) {
        setExpandedSections(prev => {
          const next = new Set(prev);
          matchingPaths.forEach(p => next.add(p));
          return next;
        });
      }
    }
  }, [searchQuery, notes]);

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
    Object.values(notes).forEach(n => {
      if (n && n.category) cats.add(n.category);
    });
    return Array.from(cats)
      .filter(c => c && typeof c === 'string')
      .sort((a, b) => {
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
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleMoveNote = (category) => {
    if (contextMenu.noteId) {
      moveNote(contextMenu.noteId, category);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    console.log('handleDelete called', contextMenu);
    if (contextMenu.type === 'note' && contextMenu.noteId) {
      console.log('Deleting note:', contextMenu.noteId);
      deleteNote(contextMenu.noteId);
    } else if (contextMenu.type === 'subsection') {
      if (window.confirm(`Delete section "${contextMenu.target}" and move all notes to parent?`)) {
        deleteSubSection(contextMenu.target);
      }
    } else if (contextMenu.type === 'section') {
      alert('Cannot delete top-level PARA categories.');
    }
    handleCloseContextMenu();
  };

  const handleRename = () => {
    if (contextMenu.type === 'subsection') {
      setEditingSection(contextMenu.target);
      setEditValue(contextMenu.target.split('/').pop());
    }
    handleCloseContextMenu();
  };

  const handleFinishRename = () => {
    if (!editingSection || !editValue.trim()) {
      setEditingSection(null);
      return;
    }

    const oldPath = editingSection;
    const parts = oldPath.split('/');
    const parentPath = parts.slice(0, -1).join('/');
    const newPath = `${parentPath}/${editValue.trim()}`;
    
    if (oldPath !== newPath) {
      renameSubSection(oldPath, newPath);
      
      if (expandedSections.has(oldPath)) {
        setExpandedSections(prev => {
          const next = new Set(prev);
          next.delete(oldPath);
          next.add(newPath);
          return next;
        });
      }
    }
    
    setEditingSection(null);
  };

  const handleCancelRename = () => {
    setEditingSection(null);
  };

  const handleAddSubSection = (e, mainCategory) => {
    e.stopPropagation();
    
    const subSectionNames = new Set(
      Object.values(notes)
        .filter(n => n.category && n.category.startsWith(`${mainCategory}/`))
        .map(n => n.category.split('/')[1])
    );

    let subName = 'Untitled Section';
    let counter = 1;
    while (subSectionNames.has(subName)) {
      subName = `Untitled Section ${++counter}`;
    }

    const fullPath = `${mainCategory}/${subName}`;
    createNote(fullPath);
    setExpandedSections(prev => new Set(prev).add(fullPath));
    setEditingSection(fullPath);
    setEditValue(subName);
  };

  const handleAddNoteToSubSection = (e, fullPath) => {
    e.stopPropagation();
    createNote(fullPath);
    if (!expandedSections.has(fullPath)) {
      setExpandedSections(prev => new Set(prev).add(fullPath));
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="brand">
        <div className="logo">VN</div>
        <div className="brand-text">
          <h2>VNotes</h2>
          <span>DEEP FOCUS</span>
        </div>
        <button className="mobile-close-btn" onClick={() => setIsOpen(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="search-bar" style={{ marginBottom: '2rem', width: '100%' }}>
        <i className="fas fa-search"></i>
        <input 
          ref={resolvedSearchRef}
          type="text" 
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <i
            className="fas fa-times"
            style={{ fontSize: '0.65rem', cursor: 'pointer', color: 'var(--outline)' }}
            onClick={() => setSearchQuery('')}
          />
        ) : (
          <span style={{ fontSize: '0.6rem', color: 'var(--outline)', whiteSpace: 'nowrap' }}>Ctrl K</span>
        )}
      </div>

      <nav className="nav-group">
        <div className="nav-header">BRAIN</div>
        {PARA_CATEGORIES.map(mainCategory => {
          // Filter notes for this main category
          const categoryNotes = Object.values(notes).filter(n => {
            const cat = n.category || 'Projects';
            const title = n.title || '';
            const content = n.content || '';
            const matchesSearch = !searchQuery || 
              title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              cat.toLowerCase().includes(searchQuery.toLowerCase());
            return cat.startsWith(mainCategory) && matchesSearch;
          });

          // Group by sub-sections
          const subSections = {};
          const rootNotes = [];

          categoryNotes.forEach(note => {
            const cat = note.category || 'Projects';
            if (cat === mainCategory) {
              rootNotes.push(note);
            } else if (cat.startsWith(`${mainCategory}/`)) {
              const subName = cat.split('/')[1];
              if (!subSections[subName]) subSections[subName] = [];
              subSections[subName].push(note);
            }
          });

          if (searchQuery.trim() && categoryNotes.length === 0) return null;

          return (
            <div key={mainCategory} className="nav-section">
              <div 
                className="category-header"
                onContextMenu={(e) => handleContextMenu(e, mainCategory, 'section')}
              >
                <div className="cat-title">
                  <i className={CATEGORY_ICONS[mainCategory]}></i>
                  <span>{mainCategory}</span>
                </div>
                <button className="add-sub-btn" onClick={(e) => handleAddSubSection(e, mainCategory)}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <div className="nav-hierarchy">
                <ul className="nav-sub-list">
                  {rootNotes.map(note => (
                    <li 
                      key={`note-${note.id}`} 
                      className={`nav-sub-item ${activeNoteId === note.id ? 'active' : ''}`}
                      onClick={() => setActiveNoteId(note.id)}
                      onContextMenu={(e) => handleContextMenu(e, note.id, 'note')}
                    >
                      {note.title}
                    </li>
                  ))}
                </ul>

                {Object.entries(subSections).map(([subName, notes]) => {
                  const fullPath = `${mainCategory}/${subName}`;
                  const isExpanded = expandedSections.has(fullPath);
                  
                  return (
                    <div key={subName} className={`nav-subsection ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="subsection-header"
                        onClick={(e) => toggleSection(e, fullPath)}
                        onContextMenu={(e) => handleContextMenu(e, fullPath, 'subsection')}
                      >
                        <i className={`fas fa-chevron-right ${isExpanded ? 'rotated' : ''}`}></i>
                        {editingSection === fullPath ? (
                          <input 
                            autoFocus
                            className="inline-rename-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleFinishRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFinishRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="sub-title">{subName}</span>
                        )}
                        <button 
                          className="add-note-inline-btn" 
                          onClick={(e) => handleAddNoteToSubSection(e, fullPath)}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      {isExpanded && (
                        <ul className="nav-sub-list nested">
                          {notes.map(note => (
                            <li 
                              key={`note-${note.id}`} 
                              className={`nav-sub-item ${activeNoteId === note.id ? 'active' : ''}`}
                              onClick={() => setActiveNoteId(note.id)}
                              onContextMenu={(e) => handleContextMenu(e, note.id, 'note')}
                            >
                              {note.title}
                            </li>
                          ))}
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
        <div className="sidebar-item" onClick={onOpenSettings}><i className="fas fa-cog"></i> Settings</div>
        {currentUser ? (
          <div className="sidebar-item user-profile" onClick={signOut}>
            <img src={currentUser.photoURL || 'https://via.placeholder.com/24'} alt="User" className="user-avatar" style={{width: 20, height: 20, borderRadius: '50%', marginRight: 8}} />
            <span>Sign Out</span>
          </div>
        ) : (
          <div className="sidebar-item" onClick={signInWithGoogle}>
            <i className="fab fa-google"></i> Sign In
          </div>
        )}
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
