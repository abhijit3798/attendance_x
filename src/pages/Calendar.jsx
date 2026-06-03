import { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import CustomDropdown from '../components/CustomDropdown';

export default function Calendar() {
  const {
    records,
    leaves,
    companies,
    lastCompanyId
  } = useContext(AppContext);

  // Calendar states (locked to Month View)
  const view = 'month';
  const [currentDate, setCurrentDate] = useState(new Date());

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Generate Year picker range (5 years back to current year)
  const years = [];
  for (let y = currentYear - 5; y <= currentYear; y++) {
    years.push(y);
  }

  const prevMonth = () => {
    if (year === currentYear - 5 && month === 0) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    if (year === currentYear && month === currentMonth) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isPrevMonthDisabled = (year === currentYear - 5 && month === 0);
  const isNextMonthDisabled = (year === currentYear && month === currentMonth);

  const handleMonthChange = (m) => {
    setCurrentDate(new Date(year, m, 1));
  };

  const handleYearChange = (y) => {
    let m = month;
    if (y === currentYear && m > currentMonth) {
      m = currentMonth;
    }
    setCurrentDate(new Date(y, m, 1));
  };

  // Formats cell dates cleanly into YYYY-MM-DD keys
  const formatDateKey = (y, m, d) => {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Status mapping profiles matching WorkplaceCalendar
  const statuses = {
    PRESENT: { label: 'Present', color: 'var(--success)' },
    ABSENT: { label: 'Absent', color: 'var(--danger)' },
    HALFDAY: { label: 'Half Day', color: 'var(--warning)' },
    LEAVE: { label: 'Leave', color: 'var(--warning)' },
    HOLIDAY: { label: 'Holiday', color: '#eab308' },
    OVERTIME: { label: 'Overtime', color: '#8b5cf6' }
  };

  // Extract date string from record timestamp
  const getRecordDateString = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check state of cell date from records and leaves
  const getDayLog = (dateStr) => {
    // 1. Check leaves
    const leave = leaves.find(l => l.companyId === lastCompanyId && l.date === dateStr && l.status === 'APPROVED');
    if (leave) return { status: 'LEAVE', notes: leave.reason };

    // 2. Check records
    const record = records.find(r => r.companyId === lastCompanyId && getRecordDateString(r.timestamp) === dateStr);
    if (record) return { status: record.status, notes: record.notes };

    return null;
  };

  // ----------------------------------------------------
  // Analytics calculators synced with WorkplaceCalendar
  // ----------------------------------------------------
  const getPeriodStats = () => {
    const monthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    
    // Filter leaves for this company in active month
    const compLeaves = leaves.filter(l => l.companyId === lastCompanyId && l.date.startsWith(monthPrefix) && l.status === 'APPROVED');
    // Filter records for this company in active month
    const compRecs = records.filter(r => r.companyId === lastCompanyId && getRecordDateString(r.timestamp).startsWith(monthPrefix));

    const present = compRecs.filter(r => r.status === 'PRESENT' || r.status === 'OVERTIME').length;
    const absent = compRecs.filter(r => r.status === 'ABSENT').length;
    const halfday = compRecs.filter(r => r.status === 'HALFDAY').length;
    const leave = compLeaves.length;

    const totalDays = present + absent + halfday;
    const rate = totalDays > 0 ? ((present + halfday * 0.5) / totalDays) * 100 : 100.0;

    return { present: present + halfday * 0.5, absent, leave, percentage: rate };
  };

  const stats = getPeriodStats();

  // A. MONTH VIEW GRID (View-Only)
  const renderMonthView = () => {
    const cells = [];
    // Prev month padding offset cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateKey: null, day: null, type: 'empty' });
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(year, month, d);
      const log = getDayLog(key);
      cells.push({ dateKey: key, day: d, type: 'day', log });
    }

    return (
      <div className="action-card">
        {/* Calendar Nav controls */}
        <div className="calendar-header-row">
          <button 
            className="btn btn-secondary" 
            style={{ 
              padding: '0', 
              width: '44px',
              height: '44px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0,
              opacity: isPrevMonthDisabled ? 0.35 : 1,
              cursor: isPrevMonthDisabled ? 'not-allowed' : 'pointer'
            }} 
            onClick={prevMonth}
            disabled={isPrevMonthDisabled}
          >
            ◀
          </button>
          
          <div className="calendar-dropdowns-container">
            <CustomDropdown 
              value={month} 
              onChange={handleMonthChange}
              options={(year === currentYear ? monthNames.slice(0, currentMonth + 1) : monthNames).map((name, idx) => ({
                value: idx,
                label: name
              }))}
              ariaLabel="Select month"
            />
            <CustomDropdown 
              value={year} 
              onChange={handleYearChange}
              options={years.map(y => ({
                value: y,
                label: String(y)
              }))}
              ariaLabel="Select year"
            />
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ 
              padding: '0', 
              width: '44px',
              height: '44px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0,
              opacity: isNextMonthDisabled ? 0.35 : 1,
              cursor: isNextMonthDisabled ? 'not-allowed' : 'pointer'
            }} 
            onClick={nextMonth}
            disabled={isNextMonthDisabled}
          >
            ▶
          </button>
        </div>

        {/* Calendar Weekday headers */}
        <div className="calendar-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="calendar-header-day">{d}</div>
          ))}
        </div>

        {/* Date cells grid (Completely Read-Only, No event listeners) */}
        <div className="calendar-grid">
          {cells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return <div key={`empty-${idx}`} className="calendar-day-cell empty" />;
            }

            const log = cell.log;
            const statusColor = log ? (statuses[log.status]?.color || 'var(--card-border)') : '';

            return (
              <div
                key={cell.dateKey}
                className="calendar-day-cell"
                style={{
                  backgroundColor: statusColor && log ? `${statusColor}1c` : '',
                  borderColor: statusColor || 'var(--card-border)',
                  color: statusColor ? statusColor : 'var(--text-primary)',
                  fontWeight: '700',
                  borderWidth: '1px'
                }}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content" role="region" aria-label="Interactive Attendance Calendar Interface">
      
      {/* Active Presentation View */}
      {renderMonthView()}

      {/* Mini metrics analytics panel */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Month Summary Metrics</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--color-outline)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>{stats.present}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Present</div>
          </div>
          <div style={{ background: 'var(--color-outline)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--danger)' }}>{stats.absent}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Absent</div>
          </div>
          <div style={{ background: 'var(--color-outline)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--warning)' }}>{stats.leave}</div>
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
    </div>
  );
}
