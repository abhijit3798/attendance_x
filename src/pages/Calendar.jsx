import { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppState';
import { AttendanceDetailsDialog } from '../components/Dialogs';

export default function Calendar() {
  const {
    calendarLogs,
    logAttendanceForDate,
    bulkUpdateDates,
    undoBannerActive,
    undoLastChange
  } = useContext(AppContext);

  // Calendar states
  const [view, setView] = useState('month'); // 'month' | 'week' | 'year'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dialog triggers
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  // Bulk selection states
  const [dragSelecting, setDragSelecting] = useState(false);
  const [dragSelectionKeys, setDragSelectionKeys] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('PRESENT');
  const [bulkShift, setBulkShift] = useState('GENERAL');

  // Long press timer references
  const longPressTimer = useRef(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // ----------------------------------------------------
  // Long Press & Touch / Mouse gesture selectors
  // ----------------------------------------------------
  const handleCellDown = (dateStr) => {
    // Start long-press detection timer (500ms)
    longPressTimer.current = setTimeout(() => {
      setSelectedDateStr(dateStr);
      setShowLogModal(true);
      triggerVibrate();
    }, 500);

    // Initial Drag Select check
    setDragSelecting(true);
    setDragSelectionKeys([dateStr]);
  };

  const handleCellEnter = (dateStr) => {
    if (dragSelecting) {
      if (!dragSelectionKeys.includes(dateStr)) {
        setDragSelectionKeys([...dragSelectionKeys, dateStr]);
      }
    }
  };

  const handleCellUp = (dateStr) => {
    clearTimeout(longPressTimer.current);
    setDragSelecting(false);

    // If dragged across multiple dates, trigger Bulk Dialog
    if (dragSelectionKeys.length > 1) {
      setShowBulkModal(true);
    } else {
      // Tap action: open modern bottom sheet popup details dialog
      setSelectedDateStr(dateStr);
      setShowLogModal(true);
    }
  };

  const clearGestureTimers = () => {
    clearTimeout(longPressTimer.current);
    setDragSelecting(false);
  };

  // Helper haptic vibration wrapper
  const triggerVibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  // Formats cell dates cleanly into YYYY-MM-DD keys
  const formatDateKey = (y, m, d) => {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Status mapping profiles
  const statuses = {
    PRESENT: { label: 'Present', color: 'var(--color-success)' },
    ABSENT: { label: 'Absent', color: 'var(--color-danger)' },
    HALFDAY: { label: 'Half Day', color: 'var(--color-warning)' },
    LEAVE: { label: 'Leave', color: '#3b82f6' },
    HOLIDAY: { label: 'Holiday', color: '#eab308' },
    OVERTIME: { label: 'Overtime', color: '#8b5cf6' }
  };

  // ----------------------------------------------------
  // Analytics calculators
  // ----------------------------------------------------
  const getPeriodStats = () => {
    // Collect all dates corresponding to current month view
    const monthKeys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      monthKeys.push(formatDateKey(year, month, d));
    }

    let pCount = 0;
    let aCount = 0;
    let lCount = 0;

    monthKeys.forEach(key => {
      const log = calendarLogs[key];
      if (log) {
        if (log.status === 'PRESENT' || log.status === 'OVERTIME') pCount++;
        else if (log.status === 'ABSENT') aCount++;
        else if (log.status === 'LEAVE') lCount++;
        else if (log.status === 'HALFDAY') {
          pCount += 0.5; // Half day counts as 0.5 attendance!
        }
      }
    });

    const totalDaysLogged = pCount + aCount;
    const rate = totalDaysLogged > 0 ? (pCount / totalDaysLogged) * 100 : 100.0;

    return { present: pCount, absent: aCount, leave: lCount, percentage: rate };
  };

  const stats = getPeriodStats();

  // ----------------------------------------------------
  // RENDER VIEWS
  // ----------------------------------------------------

  // A. MONTH VIEW GRID
  const renderMonthView = () => {
    const cells = [];
    // Prev month padding offset cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateKey: null, day: null, type: 'empty' });
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(year, month, d);
      const log = calendarLogs[key];
      cells.push({ dateKey: key, day: d, type: 'day', log });
    }

    return (
      <div className="action-card">
        {/* Calendar Nav controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={prevMonth}>◀</button>
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{monthNames[month]} {year}</h3>
          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={nextMonth}>▶</button>
        </div>

        {/* Calendar Weekday headers */}
        <div className="calendar-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="calendar-header-day">{d}</div>
          ))}
        </div>

        {/* Date cells grid */}
        <div 
          className="calendar-grid"
          onMouseLeave={clearGestureTimers}
        >
          {cells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return <div key={`empty-${idx}`} className="calendar-day-cell empty" />;
            }

            const log = cell.log;
            const statusColor = log ? (statuses[log.status]?.color || 'var(--color-outline)') : '';
            const isSelected = dragSelectionKeys.includes(cell.dateKey);

            return (
              <div
                key={cell.dateKey}
                className="calendar-day-cell"
                style={{
                  backgroundColor: statusColor ? `${statusColor}1c` : '',
                  borderColor: isSelected ? 'var(--color-primary)' : (statusColor || 'var(--card-border)'),
                  color: statusColor ? statusColor : 'var(--text-primary)',
                  fontWeight: '700',
                  boxShadow: isSelected ? '0 0 10px rgba(16,185,129,0.2)' : 'none',
                  borderWidth: isSelected ? '2px' : '1px'
                }}
                onMouseDown={() => handleCellDown(cell.dateKey)}
                onMouseEnter={() => handleCellEnter(cell.dateKey)}
                onMouseUp={() => handleCellUp(cell.dateKey)}
                onTouchStart={() => handleCellDown(cell.dateKey)}
                onTouchEnd={() => handleCellUp(cell.dateKey)}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // B. WEEK VIEW DETAIL BARS
  const renderWeekView = () => {
    // Collect the current week's 7 days based on currentDate
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {weekDays.map(date => {
          const key = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
          const log = calendarLogs[key];
          const status = log ? statuses[log.status] : null;
          const statusColor = status ? status.color : 'var(--color-outline)';
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

          return (
            <div 
              key={key}
              className="action-card"
              style={{ 
                borderLeft: `4px solid ${statusColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedDateStr(key);
                setShowLogModal(true);
              }}
            >
              <div>
                <strong style={{ fontSize: '15px' }}>{dayLabel}</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {log ? `Shift: ${log.shift} ${log.notes ? `• ${log.notes}` : ''}` : 'No attendance logged.'}
                </p>
              </div>

              {log && (
                <span 
                  className="history-badge"
                  style={{
                    background: `${statusColor}1c`,
                    color: statusColor,
                    fontWeight: '800'
                  }}
                >
                  {status ? status.label : log.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // C. YEAR HEATMAP GRAPH VIEW
  const renderYearView = () => {
    const monthsGrid = [];
    for (let m = 0; m < 12; m++) {
      monthsGrid.push(m);
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {monthsGrid.map(m => {
          const totalDays = new Date(year, m + 1, 0).getDate();
          const firstDay = new Date(year, m, 1).getDay();

          const cells = [];
          for (let padding = 0; padding < firstDay; padding++) {
            cells.push({ day: null, type: 'empty' });
          }
          for (let d = 1; d <= totalDays; d++) {
            const key = formatDateKey(year, m, d);
            const log = calendarLogs[key];
            cells.push({ dateKey: key, day: d, type: 'day', log });
          }

          return (
            <div className="action-card" key={m} style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>{monthNames[m]}</h4>
              <div className="calendar-grid" style={{ gap: '4px' }}>
                {cells.map((cell, idx) => {
                  if (cell.type === 'empty') {
                    return <div key={`empty-${m}-${idx}`} style={{ aspectRatio: '1', opacity: 0 }} />;
                  }

                  const log = cell.log;
                  const statusColor = log ? (statuses[log.status]?.color || 'var(--color-outline)') : '';

                  return (
                    <div
                      key={cell.dateKey}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '6px',
                        background: statusColor ? statusColor : 'var(--color-outline)',
                        opacity: statusColor ? 0.9 : 0.15,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedDateStr(cell.dateKey);
                        setShowLogModal(true);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="tab-content" role="region" aria-label="Interactive Attendance Calendar Interface">
      
      {/* Dynamic Floating Undo Change Alert Banner */}
      {undoBannerActive && (
        <div 
          className="notification-banner active" 
          style={{ 
            background: 'var(--color-surface)',
            borderLeft: '4px solid var(--color-warning)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            bottom: '90px',
            top: 'auto'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-on-surface)' }}>
            Attendance logged.
          </span>
          <button 
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}
            onClick={undoLastChange}
          >
            Undo
          </button>
        </div>
      )}

      {/* View Switcher segment buttons */}
      <div className="profile-switcher-bar" style={{ marginBottom: '20px' }}>
        <button className={`profile-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
        <button className={`profile-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
        <button className={`profile-btn ${view === 'year' ? 'active' : ''}`} onClick={() => setView('year')}>Year</button>
      </div>

      {/* Active Presentation View */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'year' && renderYearView()}

      {/* Mini metrics analytics panel */}
      {view === 'month' && (
        <div className="action-card" style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Month Summary Metrics</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--color-outline)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-success)' }}>{stats.present}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Present</div>
            </div>
            <div style={{ background: 'var(--color-outline)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-danger)' }}>{stats.absent}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Absent</div>
            </div>
            <div style={{ background: 'var(--color-outline)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#3b82f6' }}>{stats.leave}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Leave</div>
            </div>
          </div>

          {/* SVG Ratio Gauge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ fontWeight: '700' }}>Attendance Rate</span>
            <strong style={{ color: 'var(--color-primary)' }}>{stats.percentage.toFixed(1)}%</strong>
          </div>
          <div className="progress-bar-container" style={{ marginTop: '8px', marginBottom: 0 }}>
            <div className="progress-bar-fill" style={{ width: `${stats.percentage}%`, background: 'var(--color-primary)' }}></div>
          </div>
        </div>
      )}

      {/* Day Actions Modal */}
      <AttendanceDetailsDialog
        open={showLogModal}
        onClose={() => { setShowLogModal(false); setSelectedDateStr(''); }}
        dateString={selectedDateStr}
        currentLog={calendarLogs[selectedDateStr]}
        onSave={(date, status, shift, notes) => logAttendanceForDate(date, status, shift, notes)}
      />

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true" aria-label="Bulk update modal">
            <div className="modal-header">
              <h3>Bulk Mark ({dragSelectionKeys.length} days selected)</h3>
              <button className="modal-close" onClick={() => { setShowBulkModal(false); setDragSelectionKeys([]); }}>×</button>
            </div>

            <div className="form-group">
              <label>Attendance Status *</label>
              <select className="form-control" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALFDAY">Half Day</option>
                <option value="LEAVE">Leave</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="OVERTIME">Overtime</option>
              </select>
            </div>

            <div className="form-group">
              <label>Shift Timing *</label>
              <select className="form-control" value={bulkShift} onChange={e => setBulkShift(e.target.value)}>
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="NIGHT">Night</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div className="btn-group" style={{ marginTop: '20px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => {
                  setShowBulkModal(false);
                  setDragSelectionKeys([]);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  bulkUpdateDates(dragSelectionKeys, bulkStatus, bulkShift, 'Bulk gesture logged');
                  setShowBulkModal(false);
                  setDragSelectionKeys([]);
                }}
              >
                Bulk Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
