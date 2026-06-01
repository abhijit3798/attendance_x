import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';
import { AddLeaveDialog } from '../components/Dialogs';

export default function LeaveManager() {
  const { leaves, deleteLeave, companies } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="tab-content" role="region" aria-label="Leave Balance Manager">
      {/* Leave balance summaries */}
      <div className="stats-ring-card" style={{ gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-warning)' }}>
            {leaves.length}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Leaves Logged This Semester</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
          aria-label="Log leave absence"
        >
          + Log Absence
        </button>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Leave Registry</h3>

      {leaves.map(l => {
        const comp = companies.find(c => c.id === l.companyId);
        const formattedDate = new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        return (
          <SwipeableRow 
            key={l.id} 
            onSwipeLeft={() => deleteLeave(l.id)}
            leftLabel="Locked"
            rightLabel="Delete Log"
          >
            <div className="history-card" style={{ borderLeftColor: comp?.color || 'var(--color-primary)', marginBottom: 0 }}>
              <div className="history-left">
                <div className="history-indicator" style={{ background: comp?.color || 'var(--color-primary)' }}></div>
                <div className="history-details">
                  <h4 style={{ color: 'var(--text-primary)' }}>{comp?.name || 'Company'}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{formattedDate} {l.reason && `• ${l.reason}`}</p>
                </div>
              </div>
              <span className="history-badge present" style={{ background: 'var(--warning-glow)', color: 'var(--warning)' }}>
                {l.status}
              </span>
            </div>
          </SwipeableRow>
        );
      })}

      {leaves.length === 0 && (
        <div className="empty-state">
          <h3>No Leave Registry Logs</h3>
          <p>Logged leave checks and absences will compile here. Tap "Log Absence" to start.</p>
        </div>
      )}

      <AddLeaveDialog open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
