import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import StatsCard from '../components/StatsCard';
import CustomDropdown from '../components/CustomDropdown';

export default function Analytics() {
  const context = useContext(AppContext) || {};
  const { 
    calendarLogs = {}, 
    triggerBanner = () => {}, 
    companies = [], 
    records = [], 
    leaves = [] 
  } = context;

  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(today.getFullYear());

  // Chart Tab state ('pie' | 'bar' | 'line')
  const [activeChart, setActiveChart] = useState('pie');

  // Filter out archived companies
  const activeCompanies = (companies || []).filter(c => c && !c.isArchived);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper date conversions
  const getRecordDateString = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Generate Year picker range (5 years back to current year)
  const years = [];
  const currentYear = today.getFullYear();
  for (let y = currentYear - 5; y <= currentYear; y++) {
    years.push(y);
  }

  const handleYearChange = (year) => {
    setFilterYear(year);
    if (year === currentYear && filterMonth > currentMonth) {
      setFilterMonth(currentMonth);
    }
  };

  // Calculate statistics for a given month prefix (YYYY-MM)
  const getStatsForMonth = (monthStr) => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    
    Object.keys(calendarLogs || {}).forEach(date => {
      if (date && date.startsWith(monthStr)) {
        const log = calendarLogs[date];
        if (log) {
          if (log.status === 'PRESENT' || log.status === 'OVERTIME') present++;
          else if (log.status === 'ABSENT') absent++;
          else if (log.status === 'HALFDAY') {
            present += 0.5;
            absent += 0.5;
          } else if (log.status === 'LEAVE') leave++;
        }
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 100.0;
    return { present, absent, leave, percentage, total };
  };

  const monthPrefix = `${filterYear}-${(filterMonth + 1).toString().padStart(2, '0')}`;
  const selectedMonthStats = getStatsForMonth(monthPrefix);

  // Calculate 3 months: selected month as LAST, and previous 2 months
  const getThreeMonths = () => {
    const list = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(filterYear, filterMonth - i, 1);
      const label = monthNames[d.getMonth()].slice(0, 3);
      const prefix = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      list.push({ label, prefix, isSelected: i === 0 });
    }
    return list;
  };

  // Workplace stats calculated specifically inside the selected month/year
  const getCompanyStatsForSelectedMonth = (companyId) => {
    const compRecs = (records || []).filter(r => r && r.companyId === companyId && r.timestamp && getRecordDateString(r.timestamp).startsWith(monthPrefix));
    const compLeaves = (leaves || []).filter(l => l && l.companyId === companyId && l.date && l.date.startsWith(monthPrefix) && l.status === 'APPROVED');

    let present = 0;
    let absent = 0;

    compRecs.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'OVERTIME') {
        present += 1;
      } else if (r.status === 'ABSENT') {
        absent += 1;
      } else if (r.status === 'HALFDAY') {
        present += 0.5;
        absent += 0.5;
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

  // Weekly stats for the active month (weeks 1-7, 8-14, 15-21, 22-28, 29+)
  const getWeeklyStats = () => {
    const weeks = [
      { label: 'W1', start: 1, end: 7 },
      { label: 'W2', start: 8, end: 14 },
      { label: 'W3', start: 15, end: 21 },
      { label: 'W4', start: 22, end: 28 }
    ];
    
    const daysInMonth = new Date(filterYear, filterMonth + 1, 0).getDate();
    if (daysInMonth > 28) {
      weeks.push({ label: 'W5', start: 29, end: daysInMonth });
    }

    return weeks.map(w => {
      let present = 0;
      let absent = 0;
      
      for (let d = w.start; d <= w.end; d++) {
        const dateStr = `${filterYear}-${(filterMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const log = calendarLogs[dateStr];
        if (log) {
          if (log.status === 'PRESENT' || log.status === 'OVERTIME') present++;
          else if (log.status === 'ABSENT') absent++;
          else if (log.status === 'HALFDAY') {
            present += 0.5;
            absent += 0.5;
          }
        }
      }
      
      const total = present + absent;
      const rate = total > 0 ? (present / total) * 100 : 100.0;
      return { ...w, rate };
    });
  };

  // Cumulative progression stats for selected month (Day 5, 10, 15, 20, 25, End)
  const getProgressionStats = () => {
    const daysInMonth = new Date(filterYear, filterMonth + 1, 0).getDate();
    const intervals = [5, 10, 15, 20, 25, daysInMonth];
    
    return intervals.map(day => {
      let present = 0;
      let absent = 0;
      
      for (let d = 1; d <= day; d++) {
        const dateStr = `${filterYear}-${(filterMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const log = calendarLogs[dateStr];
        if (log) {
          if (log.status === 'PRESENT' || log.status === 'OVERTIME') present++;
          else if (log.status === 'ABSENT') absent++;
          else if (log.status === 'HALFDAY') {
            present += 0.5;
            absent += 0.5;
          }
        }
      }
      
      const total = present + absent;
      const rate = total > 0 ? (present / total) * 100 : 100.0;
      return { day, rate };
    });
  };



  // Donut/Pie renderer
  const renderPieChart = () => {
    const present = selectedMonthStats.present;
    const absent = selectedMonthStats.absent;
    const leave = selectedMonthStats.leave;
    const total = present + absent + leave;
    const presentPct = total > 0 ? (present / total) * 100 : 100.0;

    return (
      <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="75" cy="75" r="55" fill="none" stroke="var(--color-outline)" strokeWidth="14" opacity="0.3" />
          <circle
            cx="75"
            cy="75"
            r="55"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="14"
            strokeDasharray={2 * Math.PI * 55}
            strokeDashoffset={2 * Math.PI * 55 * (1 - presentPct / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)' }}>{presentPct.toFixed(0)}%</div>
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Present Rate</div>
        </div>
      </div>
    );
  };

  // Weekly bar chart renderer
  const renderBarChart = () => {
    const weeklyData = getWeeklyStats();
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '140px', background: 'var(--color-outline)', borderRadius: '12px', padding: '10px 0', boxSizing: 'border-box' }}>
        {weeklyData.map(w => (
          <div key={w.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '32px' }}>
            <div 
              style={{ 
                width: '14px', 
                height: `${Math.max(w.rate, 6)}%`, 
                background: 'linear-gradient(to top, var(--color-primary), var(--color-secondary))', 
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease'
              }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', marginTop: '4px' }}>{w.label}</span>
          </div>
        ))}
      </div>
    );
  };

  // Progression Line chart renderer
  const renderLineChart = () => {
    const points = getProgressionStats();
    const width = 280;
    const height = 100;
    const paddingX = 15;
    const paddingY = 10;
    
    const svgPoints = points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * (width - 2 * paddingX);
      const y = paddingY + (1 - p.rate / 100) * (height - 2 * paddingY);
      return { x, y, ...p };
    });
    
    let pathD = '';
    svgPoints.forEach((p, idx) => {
      if (idx === 0) {
        pathD += `M ${p.x} ${p.y}`;
      } else {
        pathD += ` L ${p.x} ${p.y}`;
      }
    });

    let fillD = pathD ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} 110 L ${svgPoints[0].x} 110 Z` : '';

    return (
      <div style={{ width: '100%', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <svg width="100%" height="120" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="lineGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="100%" y2="20" stroke="var(--color-outline)" strokeWidth="1" opacity="0.3" />
          <line x1="0" y1="60" x2="100%" y2="60" stroke="var(--color-outline)" strokeWidth="1" opacity="0.3" />
          <line x1="0" y1="100" x2="100%" y2="100" stroke="var(--color-outline)" strokeWidth="1" opacity="0.3" />

          {fillD && <path d={fillD} fill="url(#lineGlowGrad)" />}

          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {svgPoints.map(p => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--color-surface)"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)', padding: '0 8px', marginTop: '4px', fontWeight: '700' }}>
          <span>Day 1</span>
          <span>Day 15</span>
          <span>End ({points[points.length - 1].rate.toFixed(0)}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content" role="region" aria-label="Analytics Module" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
      
      {/* SECTION 1: MONTH SELECTION */}
      <section className="action-card" style={{ marginBottom: 0, padding: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Month</h4>
        <div className="dropdown-flex-row">
          <CustomDropdown 
            value={filterMonth} 
            onChange={setFilterMonth}
            options={(filterYear === currentYear ? monthNames.slice(0, currentMonth + 1) : monthNames).map((name, idx) => ({
              value: idx,
              label: name
            }))}
            ariaLabel="Select month"
          />
          <CustomDropdown 
            value={filterYear} 
            onChange={handleYearChange}
            options={years.map(y => ({
              value: y,
              label: String(y)
            }))}
            ariaLabel="Select year"
          />
        </div>
      </section>

      {/* SECTION 2: ATTENDANCE TREND */}
      <section className="action-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 0, borderRadius: '16px', height: 'auto', overflow: 'hidden' }}>
        <div className="trend-tabs-container">
          <button className={`trend-tab-btn ${activeChart === 'pie' ? 'active' : ''}`} onClick={() => setActiveChart('pie')}>Pie</button>
          <button className={`trend-tab-btn ${activeChart === 'bar' ? 'active' : ''}`} onClick={() => setActiveChart('bar')}>Bar</button>
          <button className={`trend-tab-btn ${activeChart === 'line' ? 'active' : ''}`} onClick={() => setActiveChart('line')}>Line</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '180px' }}>
          {activeChart === 'pie' && renderPieChart()}
          {activeChart === 'bar' && renderBarChart()}
          {activeChart === 'line' && renderLineChart()}
        </div>
      </section>

      {/* SECTION 3: MONTHLY LOG ACTIVITY */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', borderLeft: '3px solid var(--color-primary)', paddingLeft: '8px' }}>
          Monthly Log Activity
        </h3>

        <div className="action-card" style={{ padding: '16px', marginBottom: 0 }}>
          {/* Vertical Bar Chart */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              justifyContent: 'space-around', 
              height: '120px', 
              padding: '10px 0', 
              background: 'var(--color-outline)', 
              borderRadius: '12px',
              boxSizing: 'border-box'
            }}
          >
            {getThreeMonths().map(m => {
              const stats = getStatsForMonth(m.prefix);
              const barHeight = `${Math.max(stats.percentage, 6)}%`;
              return (
                <div 
                  key={m.prefix} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    width: '44px',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  <div 
                    style={{ 
                      width: '20px', 
                      height: barHeight, 
                      background: m.isSelected ? '#047857' : '#34D399', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', marginTop: '16px', background: 'var(--color-outline)', borderRadius: '12px', padding: '12px 6px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>{selectedMonthStats.present}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>Present</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--danger)' }}>{selectedMonthStats.absent}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>Absent</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#3b82f6' }}>{selectedMonthStats.leave}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>Leaves</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WORKPLACE PERFORMANCE */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', borderLeft: '3px solid var(--color-primary)', paddingLeft: '8px' }}>
          Workplace Performance
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeCompanies.map(comp => {
            const stats = getCompanyStatsForSelectedMonth(comp.id);
            return (
              <div 
                key={comp.id} 
                className="action-card" 
                style={{ padding: '14px', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>{comp.name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Present: {stats.present} • Leaves: {stats.leaves}
                  </span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)' }}>
                  {stats.percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
          
          {activeCompanies.length === 0 && (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p style={{ fontSize: '12px' }}>No active workplaces logged.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
