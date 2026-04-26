import React from 'react';
import { PARA_CATEGORIES, CATEGORY_ICONS } from '../utils/para';
import { useNotesContext } from '../context/NotesContext';

const Sidebar = () => {
  const { notes, activeNoteId, setActiveNoteId, createNote, searchQuery } = useNotesContext();

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
        {PARA_CATEGORIES.map(category => (
          <div key={category} className="nav-section">
            <div className="nav-item category-header">
              <i className={CATEGORY_ICONS[category]}></i>
              {category}
            </div>
            <ul className="nav-sub-list">
              {Object.values(notes)
                .filter(n => n.category === category)
                .filter(n => 
                  n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  n.content.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(note => (
                  <li 
                    key={note.id} 
                    className={`nav-sub-item ${activeNoteId === note.id ? 'active' : ''}`}
                    onClick={() => setActiveNoteId(note.id)}
                  >
                    {note.title}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-item"><i className="fas fa-search"></i> Search</div>
        <div className="sidebar-item"><i className="fas fa-cog"></i> Settings</div>
      </div>
    </aside>
  );
};

export default Sidebar;
