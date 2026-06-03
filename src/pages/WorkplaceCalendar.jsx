import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppState';
import { EditCompanyDialog } from '../components/Dialogs';

// Inline SVGs for lightweight design
const Icons = {
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
  ),
  Delete: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  )
};

export default function WorkplaceCalendar({ companyId, onBack }) {
  const {
    companies, editCompany, deleteCompany,
    records, setRecords,
    leaves, setLeaves,
    triggerBanner
  } = useContext(AppContext);

  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  // Find company
  const company = companies.find(c => c.id === companyId);

  // Swipe month detection references
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  if (!company) {
    return (
      <div className="tab-content">
        <h3>Workplace not found</h3>
        <button className="btn btn-primary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Navigation helpers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Touch Swipe Handlers for Month switching
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Detect horizontal swipes (horizontal distance > 60px, vertical < 40px)
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 40) {
      if (diffX > 0) {
        prevMonth(); // Swipe right -> prev month
      } else {
        nextMonth(); // Swipe left -> next month
      }
    }
  };

  // Helper date conversions
  const getLocalDateString = (y, m, d) => {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const getRecordDateString = (timestamp) => {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check state of cell date
  const getDayStatus = (dateStr) => {
    // 1. Check leaves
    const leave = leaves.find(l => l.companyId === companyId && l.date === dateStr && l.status === 'APPROVED');
    if (leave) return 'leave';

    // 2. Check records
    const record = records.find(r => r.companyId === companyId && getRecordDateString(r.timestamp) === dateStr);
    if (record) {
      if (record.status === 'PRESENT' || record.status === 'OVERTIME') return 'present';
      if (record.status === 'ABSENT') return 'absent';
      if (record.status === 'HALFDAY') return 'present'; // half day counts as present/active
    }
    return '';
  };

  // Save details from tap day dialog
  const handleSaveStatus = (status) => {
    const targetDateStr = selectedDateStr;
    const targetTimestamp = new Date(targetDateStr + 'T12:00:00').getTime();

    // 1. Remove existing records/leaves for this company on this date
    const filteredRecords = records.filter(r => !(r.companyId === companyId && getRecordDateString(r.timestamp) === targetDateStr));
    const filteredLeaves = leaves.filter(l => !(l.companyId === companyId && l.date === targetDateStr));

    if (status === 'PRESENT' || status === 'ABSENT' || status === 'HALFDAY') {
      const newRec = {
        id: Date.now(),
        companyId,
        status,
        notes: 'Logged from Workplace Calendar',
        timestamp: targetTimestamp
      };
      setRecords([newRec, ...filteredRecords]);
      setLeaves(filteredLeaves);
      triggerBanner(`Marked ${status.toLowerCase()} for ${targetDateStr}`);
    } else if (status === 'LEAVE') {
      const newLeave = {
        id: Date.now(),
        companyId,
        date: targetDateStr,
        reason: 'Leave absence',
        status: 'APPROVED'
      };
      setLeaves([newLeave, ...filteredLeaves]);
      setRecords(filteredRecords);
      triggerBanner(`Marked leave for ${targetDateStr}`);
    } else if (status === 'CLEAR') {
      setRecords(filteredRecords);
      setLeaves(filteredLeaves);
      triggerBanner(`Cleared log for ${targetDateStr}`);
    }

    setShowMarkModal(false);
  };

  // Calculate statistics for active month
  const getMonthlyStats = () => {
    const monthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    
    // Filter records for this company in active month
    const compRecs = records.filter(r => r.companyId === companyId && getRecordDateString(r.timestamp).startsWith(monthPrefix));
    // Filter leaves for this company in active month
    const compLeaves = leaves.filter(l => l.companyId === companyId && l.date.startsWith(monthPrefix) && l.status === 'APPROVED');

    let present = 0;
    let absent = 0;

    compRecs.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'OVERTIME') {
        present += 1;
      } else if (r.status === 'ABSENT') {
        absent += 1;
      } else if (r.status === 'HALFDAY') {
        present += 0.5;
        absent += 0.5; // Counts half-present and half-absent
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 100.0;

    return {
      present,
      absent,
      leaves: compLeaves.length,
      percentage
    };
  };

  const monthlyStats = getMonthlyStats();

  // Render cells list
  const renderCells = () => {
    const cells = [];
    const todayStr = getRecordDateString(Date.now());

    // Padding empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateStr: null, day: null, isEmpty: true });
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = getLocalDateString(year, month, d);
      const status = getDayStatus(dateStr);
      const isToday = dateStr === todayStr;
      cells.push({ dateStr, day: d, isEmpty: false, status, isToday });
    }

    return cells.map((cell, idx) => {
      if (cell.isEmpty) {
        return <div key={`empty-${idx}`} className="wp-day-cell empty" />;
      }

      return (
        <div
          key={cell.dateStr}
          className={`wp-day-cell ${cell.status} ${cell.isToday ? 'today' : ''}`}
          onClick={() => {
            setSelectedDateStr(cell.dateStr);
            setShowMarkModal(true);
          }}
        >
          <span>{cell.day}</span>
          {cell.status && <div className="wp-day-indicator-dot" />}
        </div>
      );
    });
  };

  return (
    <div className="tab-content" role="region" aria-label="Workplace Attendance Calendar">
      <div className="workplace-calendar-container">
        


        {/* Month Navigation */}
        <div className="wp-month-nav">
          <button className="wp-month-nav-btn" onClick={prevMonth} aria-label="Previous month">◀</button>
          <span className="wp-month-label">{monthNames[month]} {year}</span>
          <button className="wp-month-nav-btn" onClick={nextMonth} aria-label="Next month">▶</button>
        </div>

        {/* Calendar grid */}
        <div
          className="wp-calendar-grid"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Weekday headers */}
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="wp-weekday-header">{day}</div>
          ))}
          {renderCells()}
        </div>

        {/* Below Calendar Stats */}
        <div className="wp-stats-panel">
          <h3 className="wp-stats-title">Attendance Summary</h3>
          <div className="wp-stats-row">
            <div className="wp-stat-box">
              <div className="wp-stat-number present">{monthlyStats.present}</div>
              <div className="wp-stat-label">Present</div>
            </div>
            <div className="wp-stat-box">
              <div className="wp-stat-number absent">{monthlyStats.absent}</div>
              <div className="wp-stat-label">Absent</div>
            </div>
            <div className="wp-stat-box">
              <div className="wp-stat-number leave">{monthlyStats.leaves}</div>
              <div className="wp-stat-label">Leaves</div>
            </div>
          </div>

          <div className="progress-bar-container" style={{ margin: '8px 0', height: '8px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${monthlyStats.percentage}%`,
                background: monthlyStats.percentage >= company.targetPercentage ? 'var(--color-primary)' : 'var(--color-danger)'
              }}
            />
          </div>

          <div className="wp-rate-container">
            <span className="wp-rate-label">Monthly Percentage</span>
            <span className="wp-rate-value" style={{ color: monthlyStats.percentage >= company.targetPercentage ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {monthlyStats.percentage.toFixed(1)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
            <span>Target Workplace Percentage</span>
            <span>{company.targetPercentage}%</span>
          </div>
        </div>
      </div>



      {/* Tap day modal action sheet */}
      {showMarkModal && (
        <div className="modal-overlay" onClick={() => setShowMarkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Log attendance for ${selectedDateStr}`}>
            <div className="modal-header">
              <h3>Log Attendance</h3>
              <button className="modal-close" onClick={() => setShowMarkModal(false)}>×</button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', marginTop: '-12px', fontWeight: '500' }}>
              Select status for <strong>{selectedDateStr}</strong>:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn" style={{ background: 'var(--success-glow)', color: 'var(--success)', border: '1px solid var(--success)' }} onClick={() => handleSaveStatus('PRESENT')}>
                Present
              </button>
              <button className="btn" style={{ background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => handleSaveStatus('ABSENT')}>
                Absent
              </button>
              <button className="btn" style={{ background: 'var(--warning-glow)', color: 'var(--warning)', border: '1px solid var(--warning)' }} onClick={() => handleSaveStatus('LEAVE')}>
                Leave
              </button>
              <button className="btn btn-secondary" onClick={() => handleSaveStatus('CLEAR')}>
                Clear Log
              </button>
            </div>

            <div style={{ marginTop: '16px', display: 'flex' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowMarkModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
