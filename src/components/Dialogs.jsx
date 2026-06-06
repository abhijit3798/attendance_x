import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppState';

export function AddCompanyDialog({ open, onClose }) {
  const { addCompany } = useContext(AppContext);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [target, setTarget] = useState('75');
  const [targetError, setTargetError] = useState('');
  const accentColors = ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7', '#1B5E20', '#2E7D32'];
  const [color, setColor] = useState(accentColors[0]);

  useEffect(() => {
    if (open) {
      setName('');
      setLocation('');
      setTarget('75');
      setTargetError('');
      setColor(accentColors[0]);
    }
  }, [open]);

  if (!open) return null;

  const handleTargetChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setTarget('');
      setTargetError('Target attendance is required');
      return;
    }

    // Input: Numeric only (allow only digits)
    if (!/^\d*$/.test(val)) {
      return;
    }

    // Max: 3 digits
    if (val.length > 3) {
      return;
    }

    let formattedVal = val;
    if (formattedVal.length > 1 && formattedVal.startsWith('0')) {
      formattedVal = parseInt(formattedVal, 10).toString();
    }

    setTarget(formattedVal);

    const num = parseInt(formattedVal, 10);
    if (num > 100) {
      setTargetError('Target attendance must be between 0 and 100');
    } else {
      setTargetError('');
    }
  };

  const isAddDisabled = !name.trim() || target === '' || targetError !== '';

  const submit = () => {
    if (isAddDisabled) return;
    const finalTarget = parseInt(target, 10) || 0;
    addCompany(name, location, finalTarget, color);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Add Workplace Form"
        style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px 24px 12px 24px' }}>
          <div className="modal-header">
            <h3>Add Workplace</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
          </div>
          <div className="form-group">
            <label>Company Name *</label>
            <input type="text" className="form-control" placeholder="e.g. SpaceX" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" className="form-control" placeholder="e.g. Remote" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Target Attendance (%)</label>
            <input 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-control" 
              placeholder="75" 
              value={target} 
              onChange={handleTargetChange} 
            />
            {targetError && (
              <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>
                {targetError}
              </div>
            )}
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
        </div>

        {/* Sticky Footer */}
        <div 
          style={{ 
            padding: '12px 24px calc(24px + env(safe-area-inset-bottom, 0px)) 24px', 
            background: 'var(--color-surface)', 
            borderTop: '1px solid var(--card-border)', 
            display: 'flex', 
            flexDirection: 'column', 
            boxSizing: 'border-box' 
          }}
        >
          <button 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: '52px', 
              borderRadius: '14px', 
              fontSize: '15px', 
              fontWeight: '700',
              opacity: isAddDisabled ? 0.5 : 1,
              cursor: isAddDisabled ? 'not-allowed' : 'pointer'
            }} 
            disabled={isAddDisabled}
            onClick={submit}
          >
            Add Workplace
          </button>
        </div>
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
  const [targetError, setTargetError] = useState('');
  const accentColors = ['#10B981', '#34D399', '#059669', '#047857', '#6EE7B7', '#1B5E20', '#2E7D32'];

  useEffect(() => {
    if (company) {
      setName(company.name);
      setLocation(company.location);
      setTarget(company.targetPercentage.toFixed(0));
      setColor(company.color);
      setTargetError('');
    }
  }, [company]);

  if (!open || !company) return null;

  const handleTargetChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setTarget('');
      setTargetError('Target attendance is required');
      return;
    }

    // Input: Numeric only (allow only digits)
    if (!/^\d*$/.test(val)) {
      return;
    }

    // Max: 3 digits
    if (val.length > 3) {
      return;
    }

    let formattedVal = val;
    if (formattedVal.length > 1 && formattedVal.startsWith('0')) {
      formattedVal = parseInt(formattedVal, 10).toString();
    }

    setTarget(formattedVal);

    const num = parseInt(formattedVal, 10);
    if (num > 100) {
      setTargetError('Target attendance must be between 0 and 100');
    } else {
      setTargetError('');
    }
  };

  const isSaveDisabled = !name.trim() || target === '' || targetError !== '';

  const submit = () => {
    if (isSaveDisabled) return;
    const finalTarget = parseInt(target, 10) || 0;
    editCompany(company.id, name, location, finalTarget, color);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Edit Workplace Form"
        style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px 24px 12px 24px' }}>
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
            <input 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-control" 
              value={target} 
              onChange={handleTargetChange} 
            />
            {targetError && (
              <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>
                {targetError}
              </div>
            )}
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
        </div>

        {/* Sticky Footer always visible */}
        <div 
          style={{ 
            padding: '12px 24px calc(24px + env(safe-area-inset-bottom, 0px)) 24px', 
            background: 'var(--color-surface)', 
            borderTop: '1px solid var(--card-border)', 
            display: 'flex', 
            flexDirection: 'column', 
            boxSizing: 'border-box' 
          }}
        >
          <button 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: '52px', 
              borderRadius: '14px', 
              fontSize: '15px', 
              fontWeight: '700',
              opacity: isSaveDisabled ? 0.5 : 1,
              cursor: isSaveDisabled ? 'not-allowed' : 'pointer'
            }} 
            disabled={isSaveDisabled}
            onClick={submit}
          >
            Save Details
          </button>
        </div>
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
