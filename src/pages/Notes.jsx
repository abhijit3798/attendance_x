import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';

export default function Notes() {
  const { notes, addNote, deleteNote } = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const submit = () => {
    if (!title.trim() || !content.trim()) return;
    addNote(title, content);
    setTitle(''); setContent('');
    setShowAddForm(false);
  };

  return (
    <div className="tab-content" role="region" aria-label="Personal Notes Catalog">
      {/* Search/Header and Add toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800' }}>My Notebook</h3>
        <button 
          className="btn btn-primary" 
          style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px' }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Close Form' : '+ New Note'}
        </button>
      </div>

      {/* Add note inline card */}
      {showAddForm && (
        <div className="action-card" style={{ marginBottom: '20px', animation: 'fadeIn 0.25s ease-out' }}>
          <h4>Create Note</h4>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Title *</label>
            <input type="text" className="form-control" placeholder="e.g. Calculus Homework" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Content Description *</label>
            <textarea className="form-control" rows="3" placeholder="e.g. Problems 1 to 10 due Friday" value={content} onChange={e => setContent(e.target.value)} style={{ resize: 'none' }} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit}>Save Note</button>
        </div>
      )}

      {/* Grid List of notes */}
      {notes.map(n => (
        <SwipeableRow 
          key={n.id} 
          onSwipeLeft={() => deleteNote(n.id)}
          leftLabel="Locked"
          rightLabel="Delete Note"
        >
          <div className="course-card" style={{ marginBottom: 0, padding: '16px 20px' }}>
            <div className="course-accent" style={{ background: 'var(--color-primary)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{n.title}</h3>
              <button className="delete-btn" onClick={() => deleteNote(n.id)} aria-label="Delete note">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>{n.content}</p>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px', opacity: 0.8 }}>
              {new Date(n.timestamp).toLocaleDateString()}
            </span>
          </div>
        </SwipeableRow>
      ))}

      {notes.length === 0 && (
        <div className="empty-state">
          <h3>Notebook is Empty</h3>
          <p>Tap "+ New Note" to jot down calculus reviews, task outlines or company clock reminders.</p>
        </div>
      )}
    </div>
  );
}
