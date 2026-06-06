import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppState';
import CustomDropdown from '../components/CustomDropdown';
import { AddCompanyDialog } from '../components/Dialogs';

export default function Calendar() {
  const {
    records,
    leaves,
    companies,
    lastCompanyId
  } = useContext(AppContext);

  const activeCompanies = (companies || []).filter(c => c && !c.isArchived);

  // Workplace Selector states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
    const saved = localStorage.getItem('lastSelectedCompanyId');
    if (saved) {
      const parsed = parseInt(saved);
      if (activeCompanies.some(c => c.id === parsed)) {
        return parsed;
      }
    }
    if (lastCompanyId && activeCompanies.some(c => c.id === lastCompanyId)) {
      return lastCompanyId;
    }
    return activeCompanies.length > 0 ? activeCompanies[0].id : '';
  });

  useEffect(() => {
    if (activeCompanies.length > 0) {
      if (!selectedCompanyId || !activeCompanies.some(c => c.id === selectedCompanyId)) {
        const firstId = activeCompanies[0].id;
        setSelectedCompanyId(firstId);
        localStorage.setItem('lastSelectedCompanyId', String(firstId));
      }
    } else {
      setSelectedCompanyId('');
    }
  }, [activeCompanies, selectedCompanyId]);

  const handleCompanyChange = (id) => {
    const parsedId = parseInt(id);
    setSelectedCompanyId(parsedId);
    localStorage.setItem('lastSelectedCompanyId', String(parsedId));
  };

  const company = activeCompanies.find(c => c.id === selectedCompanyId) || {};
  const targetPercentage = company.targetPercentage || 75.0;

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
  const getRecordDateString = (r) => {
    if (!r) return '';
    if (typeof r === 'object') {
      if (r.date) return r.date;
      return getRecordDateString(r.timestamp);
    }
    const d = new Date(r);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check state of cell date from records and leaves
  const getDayLog = (dateStr) => {
    // 1. Check leaves
    const leave = leaves.find(l => l.companyId === selectedCompanyId && l.date === dateStr && l.status === 'APPROVED');
    if (leave) return { status: 'LEAVE', notes: leave.reason };

    // 2. Check records
    const record = records.find(r => r.companyId === selectedCompanyId && getRecordDateString(r) === dateStr);
    if (record) return { status: record.status, notes: record.notes };

    return null;
  };

  // Check state of cell date from records and leaves to determine visual status class
  const getDayStatus = (dateStr) => {
    // 1. Check leaves
    const leave = leaves.find(l => l.companyId === selectedCompanyId && l.date === dateStr && l.status === 'APPROVED');
    if (leave) return 'leave';

    // 2. Check records
    const record = records.find(r => r.companyId === selectedCompanyId && getRecordDateString(r) === dateStr);
    if (record) {
      if (record.status === 'PRESENT' || record.status === 'OVERTIME') return 'present';
      if (record.status === 'ABSENT') return 'absent';
      if (record.status === 'HALFDAY') return 'present'; // half day counts as present/active
      if (record.status === 'HOLIDAY') return 'holiday';
      if (record.status === 'WEEKOFF') return 'weekoff';
    }
    return '';
  };

  // ----------------------------------------------------
  // Analytics calculators synced with WorkplaceCalendar
  // ----------------------------------------------------
  const getPeriodStats = () => {
    const monthPrefix = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    
    // Filter leaves for this company in active month
    const compLeaves = leaves.filter(l => l.companyId === selectedCompanyId && l.date.startsWith(monthPrefix) && l.status === 'APPROVED');
    // Filter records for this company in active month
    const compRecs = records.filter(r => r.companyId === selectedCompanyId && getRecordDateString(r).startsWith(monthPrefix));

    let present = 0;
    let absent = 0;
    let leave = compLeaves.length;
    let holiday = 0;
    let weekoff = 0;

    compRecs.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'OVERTIME') {
        present += 1;
      } else if (r.status === 'ABSENT') {
        absent += 1;
      } else if (r.status === 'HALFDAY') {
        present += 0.5;
        absent += 0.5;
      } else if (r.status === 'HOLIDAY') {
        holiday += 1;
      } else if (r.status === 'WEEKOFF') {
        weekoff += 1;
      }
    });

    const totalDays = present + absent + leave + holiday + weekoff;
    const workingDays = present + absent + leave;
    const percentage = workingDays > 0 ? (present / workingDays) * 100 : 100.0;

    return {
      present,
      absent,
      leave,
      holiday,
      weekoff,
      percentage,
      totalDays
    };
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

        {/* Calendar grid */}
        <div className="wp-calendar-grid">
          {/* Weekday headers */}
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="wp-weekday-header">{day}</div>
          ))}
          {cells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return <div key={`empty-${idx}`} className="wp-day-cell empty" />;
            }

            const status = getDayStatus(cell.dateKey);
            const isToday = cell.dateKey === getRecordDateString(Date.now());

            return (
              <div
                key={cell.dateKey}
                className={`wp-day-cell ${status} ${isToday ? 'today' : ''}`}
                style={{ pointerEvents: 'none' }}
              >
                <span>{cell.day}</span>
                {status && <div className="wp-day-indicator-dot" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (activeCompanies.length === 0) {
    return (
      <div className="tab-content" role="region" aria-label="Calendar Empty State" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>No workplace available</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '300px', margin: '0 auto 12px auto' }}>
          Add a workplace on the dashboard or click below to start tracking.
        </p>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Workplace
        </button>
        <AddCompanyDialog open={showAddModal} onClose={() => setShowAddModal(false)} />
      </div>
    );
  }

  const companyOptions = activeCompanies.map(c => ({
    value: c.id,
    label: c.name
  }));

  return (
    <div className="tab-content" role="region" aria-label="Interactive Attendance Calendar Interface">
      
      {/* Workplace Selection Card */}
      <div className="action-card" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Workplace</h4>
        <div style={{ display: 'flex', width: '100%' }}>
          <CustomDropdown 
            value={selectedCompanyId} 
            onChange={handleCompanyChange}
            options={companyOptions}
            ariaLabel="Select workplace"
          />
        </div>
      </div>

      {/* Active Presentation View */}
      {renderMonthView()}

      {/* Mini metrics analytics panel */}
      <div className="wp-stats-panel" style={{ marginTop: '20px' }}>
        <h3 className="wp-stats-title">Month Summary Metrics</h3>
        
        {stats.totalDays === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>
            No attendance data available
          </div>
        ) : (
          <>
            <div className="wp-stats-row">
              <div className="wp-stat-box">
                <div className="wp-stat-number present">{stats.present}</div>
                <div className="wp-stat-label">Present</div>
              </div>
              <div className="wp-stat-box">
                <div className="wp-stat-number absent">{stats.absent}</div>
                <div className="wp-stat-label">Absent</div>
              </div>
              <div className="wp-stat-box">
                <div className="wp-stat-number leave">{stats.leave}</div>
                <div className="wp-stat-label">Leave</div>
              </div>
              <div className="wp-stat-box">
                <div className="wp-stat-number holiday" style={{ color: 'var(--info)' }}>{stats.holiday}</div>
                <div className="wp-stat-label">Holiday</div>
              </div>
              <div className="wp-stat-box">
                <div className="wp-stat-number weekoff" style={{ color: 'var(--purple)' }}>{stats.weekoff}</div>
                <div className="wp-stat-label">Week Off</div>
              </div>
            </div>

            <div className="progress-bar-container" style={{ margin: '8px 0', height: '8px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${stats.percentage}%`,
                  background: stats.percentage >= targetPercentage ? 'var(--color-primary)' : 'var(--color-danger)'
                }}
              />
            </div>

            <div className="wp-rate-container">
              <span className="wp-rate-label">Monthly Percentage</span>
              <span className="wp-rate-value" style={{ color: stats.percentage >= targetPercentage ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {stats.percentage.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
              <span>Target Workplace Percentage</span>
              <span>{targetPercentage}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
