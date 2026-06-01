import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';

export default function Shifts() {
  const { companies, logAttendance, triggerBanner } = useContext(AppContext);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [hours, setHours] = useState('8');
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (!selectedCompId) {
      triggerBanner('Please select a workplace!');
      return;
    }
    const h = parseFloat(hours) || 8;
    logAttendance(parseInt(selectedCompId), 'PRESENT', notes || 'Clocked work hours', { hours: h });
    setNotes('');
    triggerBanner(`Logged ${h} hours!`);
  };

  return (
    <div className="tab-content" role="region" aria-label="Shift Hours Manager">
      <div className="action-card">
        <h3>Log Work Hours / Shift</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>
          Record worked hours for freelance projects, shifts or daily tasks.
        </p>

        <div className="form-group">
          <label>Select Workplace / Client *</label>
          <select 
            className="form-control" 
            value={selectedCompId} 
            onChange={e => setSelectedCompId(e.target.value)}
          >
            <option value="">Choose Company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Hours Worked *</label>
          <input 
            type="number" 
            className="form-control" 
            placeholder="8" 
            value={hours} 
            onChange={e => setHours(e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label>Shift Task Notes / Logs</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Cleared queue / Worked on backlog" 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit}>
          Log Shift Hours
        </button>
      </div>
    </div>
  );
}
