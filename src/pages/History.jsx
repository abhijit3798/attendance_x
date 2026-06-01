import React, { useContext } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';

export default function History() {
  const { records, deleteRecord, subjects, shifts, projects, role } = useContext(AppContext);

  // Exclude helper "SESSION" entries to show clean tracking feeds
  const displayRecs = records.filter(r => r.status !== 'SESSION');

  // Filter logs to match the active profile context, preventing confusing cross-role feeds
  const getFilteredLogs = () => {
    return displayRecs.filter(r => {
      if (role === 'student') return r.subjectId !== undefined;
      if (role === 'employee' || role === 'shiftworker') return r.shiftId !== undefined;
      return r.projectId !== undefined;
    });
  };

  const logs = getFilteredLogs();

  return (
    <div className="tab-content" role="region" aria-label="Chronological History Log">
      {logs.map(rec => {
        const date = new Date(rec.timestamp);
        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let name = 'Unknown Item';
        let color = '#10B981';
        let detailStr = formatted;

        if (rec.subjectId) {
          const sub = subjects.find(s => s.id === rec.subjectId);
          name = sub?.name || 'Course';
          color = sub?.color || '#10B981';
          detailStr = `${formatted} ${rec.notes && rec.notes !== 'Logged' ? `• ${rec.notes}` : ''}`;
        } else if (rec.shiftId) {
          const shift = shifts.find(s => s.id === rec.shiftId);
          name = shift?.name || 'Shift';
          color = shift?.color || '#34D399';
          detailStr = `${formatted} (${rec.hours?.toFixed(1) || 0} hrs logged) ${rec.notes && rec.notes !== 'Logged' ? `• ${rec.notes}` : ''}`;
        } else if (rec.projectId) {
          const proj = projects.find(p => p.id === rec.projectId);
          name = proj?.name || 'Project';
          color = proj?.color || '#059669';
          detailStr = `${formatted} (${rec.hours?.toFixed(1) || 0} hrs billed • $${rec.earnings?.toFixed(2) || 0}) ${rec.notes && rec.notes !== 'Logged' ? `• ${rec.notes}` : ''}`;
        }

        return (
          <SwipeableRow 
            key={rec.id} 
            onSwipeLeft={() => deleteRecord(rec.id)}
            leftLabel="Locked"
            rightLabel="Delete Log"
          >
            <div className="history-card" style={{ borderLeftColor: color, marginBottom: 0 }}>
              <div className="history-left">
                <div className="history-indicator" style={{ background: color }}></div>
                <div className="history-details">
                  <h4 style={{ color: 'var(--text-primary)' }}>{name}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{detailStr}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`history-badge ${rec.status.toLowerCase()}`}>
                  {rec.status}
                </span>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteRecord(rec.id)}
                  aria-label="Delete this log"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </SwipeableRow>
        );
      })}

      {logs.length === 0 && (
        <div className="empty-state">
          <h3>No Records Registered</h3>
          <p>Chronological summaries of your attendance clockings will show up here. Mark logs inside courses, shifts or billable projects to start.</p>
        </div>
      )}
    </div>
  );
}
