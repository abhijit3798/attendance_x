import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';

export default function QuickAttendance() {
  const { companies, logAttendance, triggerBanner } = useContext(AppContext);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [status, setStatus] = useState('PRESENT');
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (!selectedCompId) {
      triggerBanner('Please select a workplace!');
      return;
    }
    logAttendance(parseInt(selectedCompId), status, notes || 'Quick attendance logged');
    setNotes('');
  };

  return (
    <div className="tab-content" role="region" aria-label="Quick Attendance logging">
      <div className="action-card">
        <h3>Fast Check-in Pad</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 20px 0' }}>
          Instantly mark present or absent checks.
        </p>

        <div className="form-group">
          <label>Choose Workplace / Company *</label>
          <select 
            className="form-control" 
            value={selectedCompId} 
            onChange={e => setSelectedCompId(e.target.value)}
          >
            <option value="">Select Company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Attendance Status *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {['PRESENT', 'ABSENT', 'LATE'].map(s => {
              const isSelected = status === s;
              return (
                <button
                  key={s}
                  className="btn"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-outline)',
                    color: isSelected ? 'var(--color-on-primary)' : 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label>Check-in Notes / Task Logs</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Worked on Frontend design" 
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '10px' }}
          onClick={submit}
        >
          Submit Attendance Check
        </button>
      </div>
    </div>
  );
}
