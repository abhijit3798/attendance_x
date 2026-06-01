import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppState';

export function AddCompanyDialog({ open, onClose }) {
  const { addCompany } = useContext(AppContext);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [target, setTarget] = useState('75');
  const accentColors = ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7', '#1B5E20', '#2E7D32'];
  const [color, setColor] = useState(accentColors[0]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    addCompany(name, location, target, color);
    setName(''); setLocation(''); setTarget('75');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Add Workplace Form">
        <div className="modal-header">
          <h3>Add Workplace</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="form-group">
          <label>Company / Institution Name *</label>
          <input type="text" className="form-control" placeholder="e.g. SpaceX" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Location / Room</label>
          <input type="text" className="form-control" placeholder="e.g. Remote / Room 101" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Target Attendance (%)</label>
          <input type="number" className="form-control" placeholder="75" value={target} onChange={e => setTarget(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Theme Accent Green</label>
          <div className="color-picker-grid">
            {accentColors.map(c => (
              <div 
                key={c} 
                className={`color-dot ${color === c ? 'active' : ''}`} 
                style={{ background: c }} 
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={submit}>
          Add Workplace
        </button>
      </div>
    </div>
  );
}

export function EditCompanyDialog({ open, onClose, company }) {
  const { editCompany } = useContext(AppContext);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [target, setTarget] = useState('75');
  const [color, setColor] = useState('#10B981');
  const accentColors = ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7', '#1B5E20', '#2E7D32'];

  useEffect(() => {
    if (company) {
      setName(company.name);
      setLocation(company.location);
      setTarget(company.targetPercentage.toString());
      setColor(company.color);
    }
  }, [company]);

  if (!open || !company) return null;

  const submit = () => {
    if (!name.trim()) return;
    editCompany(company.id, name, location, target, color);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Edit Workplace Form">
        <div className="modal-header">
          <h3>Edit Workplace Details</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="form-group">
          <label>Company Name *</label>
          <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Target Attendance (%)</label>
          <input type="number" className="form-control" value={target} onChange={e => setTarget(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Theme Color</label>
          <div className="color-picker-grid">
            {accentColors.map(c => (
              <div 
                key={c} 
                className={`color-dot ${color === c ? 'active' : ''}`} 
                style={{ background: c }} 
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={submit}>
          Save Details
        </button>
      </div>
    </div>
  );
}

export function AddLeaveDialog({ open, onClose }) {
  const { logLeave, companies } = useContext(AppContext);
  const [companyId, setCompanyId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  if (!open) return null;

  const submit = () => {
    if (!companyId) return;
    logLeave(parseInt(companyId), date, reason);
    setReason('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Log Leave Form">
        <div className="modal-header">
          <h3>Log Leave Absence</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="form-group">
          <label>Workplace / Company *</label>
          <select className="form-control" value={companyId} onChange={e => setCompanyId(e.target.value)}>
            <option value="">Select Workplace</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Date of Absence *</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Reason / Notes</label>
          <input type="text" className="form-control" placeholder="e.g. Medical Checkup" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={submit}>
          Log Leave
        </button>
      </div>
    </div>
  );
}

export function AttendanceDetailsDialog({ open, onClose, dateString, currentLog, onSave }) {
  const [status, setStatus] = useState('PRESENT');
  const [shift, setShift] = useState('GENERAL');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentLog) {
      setStatus(currentLog.status || 'PRESENT');
      setShift(currentLog.shift || 'GENERAL');
      setNotes(currentLog.notes || '');
    } else {
      setStatus('PRESENT');
      setShift('GENERAL');
      setNotes('');
    }
  }, [currentLog, open]);

  if (!open) return null;

  const handleSave = () => {
    onSave(dateString, status, shift, notes);
    onClose();
  };

  const statuses = [
    { id: 'PRESENT', label: 'Present', color: 'var(--color-success)' },
    { id: 'ABSENT', label: 'Absent', color: 'var(--color-danger)' },
    { id: 'HALFDAY', label: 'Half Day', color: 'var(--color-warning)' },
    { id: 'LEAVE', label: 'Leave', color: '#3b82f6' },
    { id: 'HOLIDAY', label: 'Holiday', color: '#eab308' },
    { id: 'OVERTIME', label: 'Overtime', color: '#8b5cf6' }
  ];

  const shiftsList = ['MORNING', 'AFTERNOON', 'NIGHT', 'GENERAL'];

  return (
    <div className="modal-overlay">
      <div className="modal-content attendance-details-modal" role="dialog" aria-modal="true" aria-label={`Attendance details for ${dateString}`}>
        <div className="modal-header">
          <h3>Mark Attendance ({dateString})</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        {/* Status Selection */}
        <div className="form-group">
          <label>Attendance Status *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {statuses.map(s => {
              const isSelected = status === s.id;
              return (
                <button
                  key={s.id}
                  className="btn"
                  style={{
                    backgroundColor: isSelected ? s.color : 'var(--color-outline)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    fontSize: '13px',
                    padding: '10px'
                  }}
                  onClick={() => setStatus(s.id)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift Selection */}
        <div className="form-group">
          <label>Shift Timing *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {shiftsList.map(sh => {
              const isSelected = shift === sh;
              return (
                <button
                  key={sh}
                  className="btn"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-outline)',
                    color: isSelected ? 'var(--color-on-primary)' : 'var(--text-primary)',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                  onClick={() => setShift(sh)}
                >
                  {sh.charAt(0) + sh.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label>Check-in Notes / Comments</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Worked from home today" 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
          />
        </div>

        <div className="btn-group" style={{ marginTop: '20px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
