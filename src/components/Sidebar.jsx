import React from 'react';
import { PARA_CATEGORIES, CATEGORY_ICONS } from '../utils/para';
import { useNotesContext } from '../context/NotesContext';

const Sidebar = () => {
  const { notes, activeNoteId, setActiveNoteId, createNote, searchQuery } = useNotesContext();

  const renderNoteItem = (note) => (
    <li 
      key={note.id} 
      className={`nav-sub-item ${activeNoteId === note.id ? 'active' : ''}`}
      onClick={() => setActiveNoteId(note.id)}
    >
      {note.title}
    </li>
  );

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
                <i className={CATEGORY_ICONS[mainCategory]}></i>
                {mainCategory}
              </div>
              
              <div className="nav-hierarchy">
                {/* Root notes in this category */}
                <ul className="nav-sub-list">
                  {rootNotes.map(renderNoteItem)}
                </ul>

                {/* Sub-sections */}
                {Object.entries(subSections).map(([subName, subNotes]) => (
                  <div key={subName} className="nav-subsection">
                    <div className="subsection-header">
                      <i className="fas fa-chevron-right"></i>
                      {subName}
                    </div>
                    <ul className="nav-sub-list nested">
                      {subNotes.map(renderNoteItem)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-item"><i className="fas fa-search"></i> Search</div>
        <div className="sidebar-item"><i className="fas fa-cog"></i> Settings</div>
      </div>
    </aside>
  );
};

export default Sidebar;
