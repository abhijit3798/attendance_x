import { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import StatsCard from '../components/StatsCard';

export default function Analytics() {
  const { calendarLogs, triggerBanner } = useContext(AppContext);

  // Period Tab state ('daily' | 'weekly' | 'monthly' | 'yearly' | 'custom')
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Chart Tab state ('pie' | 'bar' | 'line')
  const [activeChart, setActiveChart] = useState('pie');

  // Filter logs corresponding to selected period
  const getFilteredLogs = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let start = new Date();
    start.setHours(0, 0, 0, 0);

    if (period === 'daily') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      start.setDate(today.getDate() - 7);
    } else if (period === 'monthly') {
      start.setDate(today.getDate() - 30);
    } else if (period === 'yearly') {
      start.setDate(today.getDate() - 365);
    } else if (period === 'custom') {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return Object.keys(calendarLogs).filter(date => {
        const d = new Date(date);
        return d >= start && d <= end;
      });
    }

    return Object.keys(calendarLogs).filter(date => {
      const d = new Date(date);
      return d >= start && d <= today;
    });
  };

  const activeDates = getFilteredLogs();
  const logsCount = activeDates.length;

  // Calculate Metrics reactively
  const calculateMetrics = () => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let overtimeHours = 0;

    activeDates.forEach(date => {
      const log = calendarLogs[date];
      if (log) {
        if (log.status === 'PRESENT') present++;
        else if (log.status === 'ABSENT') absent++;
        else if (log.status === 'HALFDAY') {
          present += 0.5;
          absent += 0.5;
        } else if (log.status === 'LEAVE') leave++;
        else if (log.status === 'HOLIDAY' || log.status === 'WEEKLYOFF') {
          // Holidays don't count against attendance
        } else if (log.status === 'OVERTIME') {
          present++;
          overtimeHours += 4; // Assume 4 hours overtime per log!
        }
      }
    });

    const totalDays = present + absent;
    const rate = totalDays > 0 ? (present / totalDays) * 100 : 100.0;
    const leaveRate = logsCount > 0 ? (leave / logsCount) * 100 : 0.0;

    return {
      present,
      absent,
      leave,
      overtimeHours,
      rate,
      leaveRate,
      totalDays
    };
  };

  const metrics = calculateMetrics();

  // ----------------------------------------------------
  // Exporters (CSV, Excel, PDF)
  // ----------------------------------------------------
  const exportCSV = () => {
    if (activeDates.length === 0) {
      triggerBanner('No records logged in this period!');
      return;
    }
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Date,Status,Shift,Notes\r\n';
    activeDates.forEach(date => {
      const log = calendarLogs[date];
      csv += `${date},${log.status},${log.shift},"${log.notes}"\r\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `attendancex_${period}_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBanner('Exported CSV!');
  };

  const exportExcel = () => {
    if (activeDates.length === 0) {
      triggerBanner('No records logged in this period!');
      return;
    }
    // Excel-style tabular text format download
    let xls = 'data:application/vnd.ms-excel;charset=utf-8,';
    xls += 'AttendanceX Workplace Report\r\n';
    xls += `Period: ${period.toUpperCase()}\r\n\r\n`;
    xls += 'Date\tStatus\tShift\tNotes\r\n';
    activeDates.forEach(date => {
      const log = calendarLogs[date];
      xls += `${date}\t${log.status}\t${log.shift}\t${log.notes}\r\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(xls);
    link.download = `attendancex_${period}_report.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBanner('Downloaded Excel File!');
  };

  const exportPDF = () => {
    // Triggers standard print screen with localized layout styling
    window.print();
    triggerBanner('Print dialog launched.');
  };

  return (
    <div className="tab-content" role="region" aria-label="Analytics Module">
      {/* 1. Period switcher buttons */}
      <div className="profile-switcher-bar" style={{ marginBottom: '16px' }}>
        {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map(p => (
          <button 
            key={p} 
            className={`profile-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* 2. Custom Date Range Pickers (If custom is active) */}
      {period === 'custom' && (
        <div 
          className="action-card" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px', 
            marginBottom: '20px',
            animation: 'fadeIn 0.25s ease-out' 
          }}
        >
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Start Date</label>
            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>End Date</label>
            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      )}

      {/* 3. Metric cards grid */}
      <div className="metrics-grid">
        <StatsCard 
          title="Attendance Rate" 
          value={`${metrics.rate.toFixed(0)}%`} 
          icon={<span>📊</span>} 
          colorHex="var(--color-primary)" 
          label={metrics.rate >= 75 ? 'Safe Target' : 'Below 75% Limit'}
        />
        <StatsCard 
          title="Overtime Logged" 
          value={`${metrics.overtimeHours} hr`} 
          icon={<span>⏱️</span>} 
          colorHex="var(--color-success)" 
          label="Billed hours"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--color-outline)', opacity: 0.9, borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-warning)' }}>
            {metrics.leaveRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>Leave Percentage</div>
        </div>

        <div style={{ background: 'var(--color-outline)', opacity: 0.9, borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {metrics.leave}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>Total Leaves Taken</div>
        </div>
      </div>

      {/* 4. Chart type switch buttons */}
      <div className="profile-switcher-bar" style={{ marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px auto' }}>
        <button className={`profile-btn ${activeChart === 'pie' ? 'active' : ''}`} onClick={() => setActiveChart('pie')}>Pie</button>
        <button className={`profile-btn ${activeChart === 'bar' ? 'active' : ''}`} onClick={() => setActiveChart('bar')}>Bar</button>
        <button className={`profile-btn ${activeChart === 'line' ? 'active' : ''}`} onClick={() => setActiveChart('line')}>Line</button>
      </div>

      {/* 5. Custom Interactive Responsive SVG Charts */}
      <div className="action-card" style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px', marginBottom: '20px' }}>
        
        {/* PIE / DONUT CHART */}
        {activeChart === 'pie' && (
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
              {/* Backing Ring */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--color-outline)" strokeWidth="16" opacity="0.3" />
              {/* Present Ring segment */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="16"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - metrics.rate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900' }}>{metrics.rate.toFixed(0)}%</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>Attendance</div>
            </div>
          </div>
        )}

        {/* RESPONSIVE BAR CHART */}
        {activeChart === 'bar' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
            {/* Row 1: Present */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                <span>Present Days</span>
                <span>{metrics.present} Days</span>
              </div>
              <div className="progress-bar-container" style={{ height: '14px', borderRadius: '6px', background: 'var(--color-outline)', marginBottom: 0 }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${logsCount > 0 ? (metrics.present / logsCount) * 100 : 0}%`, 
                    background: 'var(--color-success)', 
                    borderRadius: '6px' 
                  }}
                />
              </div>
            </div>
            {/* Row 2: Absent */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                <span>Absent Days</span>
                <span>{metrics.absent} Days</span>
              </div>
              <div className="progress-bar-container" style={{ height: '14px', borderRadius: '6px', background: 'var(--color-outline)', marginBottom: 0 }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${logsCount > 0 ? (metrics.absent / logsCount) * 100 : 0}%`, 
                    background: 'var(--color-danger)', 
                    borderRadius: '6px' 
                  }}
                />
              </div>
            </div>
            {/* Row 3: Leave */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                <span>Leave Days</span>
                <span>{metrics.leave} Days</span>
              </div>
              <div className="progress-bar-container" style={{ height: '14px', borderRadius: '6px', background: 'var(--color-outline)', marginBottom: 0 }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${logsCount > 0 ? (metrics.leave / logsCount) * 100 : 0}%`, 
                    background: '#3b82f6', 
                    borderRadius: '6px' 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* GLOWING LINE CHART */}
        {activeChart === 'line' && (
          <div style={{ width: '100%', height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative' }}>
            {/* Backing Grid lines */}
            <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', background: 'var(--color-outline)', opacity: 0.3 }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--color-outline)', opacity: 0.3 }} />
            <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', background: 'var(--color-outline)', opacity: 0.3 }} />

            {/* Glowing lines representation */}
            <svg width="100%" height="150" style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                <linearGradient id="lineGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Shaded Area */}
              <path
                d={`M 10 130 Q 80 ${130 - (metrics.rate / 100) * 80} 150 ${130 - (metrics.rate / 100) * 100} Q 220 ${130 - (metrics.rate / 100) * 90} 290 ${130 - (metrics.rate / 100) * 110} L 290 140 L 10 140 Z`}
                fill="url(#lineGlowGrad)"
              />
              {/* Main Line */}
              <path
                d={`M 10 130 Q 80 ${130 - (metrics.rate / 100) * 80} 150 ${130 - (metrics.rate / 100) * 100} Q 220 ${130 - (metrics.rate / 100) * 90} 290 ${130 - (metrics.rate / 100) * 110}`}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '10px', color: 'var(--text-secondary)' }}>Start</div>
            <div style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '10px', color: 'var(--text-primary)', fontWeight: '700' }}>Active: {metrics.rate.toFixed(0)}%</div>
          </div>
        )}
      </div>

      {/* 6. Export Panel Actions */}
      <div className="action-card">
        <h3>Export Period Data Reports</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>
          Download aggregated statistics tabular logs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={exportCSV}>CSV</button>
          <button className="btn btn-secondary" onClick={exportExcel}>Excel</button>
          <button className="btn btn-primary" onClick={exportPDF}>PDF Print</button>
        </div>
      </div>
    </div>
  );
}
