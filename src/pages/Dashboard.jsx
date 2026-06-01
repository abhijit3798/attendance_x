import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';
import { AddCompanyDialog, EditCompanyDialog } from '../components/Dialogs';

export default function Dashboard() {
  const {
    userName,
    companies, deleteCompany, toggleArchiveCompany,
    records, logAttendance,
    leaves,
    streak,
    holidays,
    triggerBanner
  } = useContext(AppContext);

  // States
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeCompanyForEdit, setActiveCompanyForEdit] = useState(null);
  const [openCompanyDetailsId, setOpenCompanyDetailsId] = useState(null);

  // Filter out archived companies
  const activeCompanies = companies.filter(c => !c.isArchived);

  // Calculate stats reactively
  const getCompanyStats = (companyId) => {
    const compRecs = records.filter(r => r.companyId === companyId);
    const present = compRecs.filter(r => r.status === 'PRESENT').length;
    const absent = compRecs.filter(r => r.status === 'ABSENT').length;
    const compLeaves = leaves.filter(l => l.companyId === companyId && l.status === 'APPROVED').length;
    const total = present + absent;
    const percentage = total > 0 ? (present / total) * 100 : 100.0;
    return { present, absent, leaves: compLeaves, total, percentage };
  };

  // Overall Attendance Percentage calculated across active companies
  const calculateOverallPercentage = () => {
    if (activeCompanies.length === 0) return 100.0;
    let sum = 0;
    activeCompanies.forEach(c => {
      sum += getCompanyStats(c.id).percentage;
    });
    return sum / activeCompanies.length;
  };
  const overallPercentage = calculateOverallPercentage();

  // Search filter matching
  const filteredCompanies = activeCompanies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tab-content" role="region" aria-label="Attendance Dashboard">
      {/* 1. Header Profile Panel */}
      <div className="profile-header-card">
        <div className="profile-left">
          <div className="profile-avatar" aria-label="User Avatar icon">
            {userName[0]}
          </div>
          <div className="profile-name-group">
            <h3 style={{ color: 'var(--text-primary)' }}>{userName}</h3>
            <p>Ready to clock in today</p>
          </div>
        </div>
        <div className="profile-right">
          <div className="profile-percentage">
            {overallPercentage.toFixed(1)}%
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>Overall Attendance</p>
        </div>
      </div>

      {/* 2. Responsive Widgets Grid (1 col mobile, 2 col tablet) */}
      <div className="widgets-grid">
        {/* Widget A: Monthly Attendance Bar Chart */}
        <div className="widget-card">
          <h4>Monthly Log Activity</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '90px', padding: '10px 0' }}>
            {/* SVG Bars representing relative activity per month */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '16px', height: '40px', background: 'var(--color-primary-container)', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Mar</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '16px', height: '55px', background: 'var(--color-primary-container)', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Apr</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '16px', height: '70px', background: 'linear-gradient(to top, var(--color-primary), var(--color-secondary))', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: '700', display: 'block', marginTop: '4px' }}>May</span>
            </div>
          </div>
        </div>

        {/* Widget B: Today's Status Tracker */}
        {activeCompanies.length > 0 && (
          <div className="widget-card">
            <h4>Today's Check-in Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Quick Check for: <strong>{activeCompanies[0].name}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-success-outline" 
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => logAttendance(activeCompanies[0].id, 'PRESENT', 'Quick Dashboard Present')}
                >
                  Present
                </button>
                <button 
                  className="btn btn-danger-outline" 
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => logAttendance(activeCompanies[0].id, 'ABSENT', 'Quick Dashboard Absent')}
                >
                  Absent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Widget C: Flame Streak Counter */}
        <div className="widget-card">
          <h4>Consecutive Streak</h4>
          <div className="streak-box">
            <div className="streak-number">🔥 {streak}</div>
            <div style={{ fontSize: '12px', fontWeight: '700' }}>
              {streak > 0 ? 'Day check-in streak active! Keep going!' : 'Log present today to start your streak!'}
            </div>
          </div>
        </div>

        {/* Widget D: Upcoming Holidays */}
        <div className="widget-card">
          <h4>Upcoming Holidays</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {holidays.slice(0, 2).map(h => (
              <div 
                key={h.id} 
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: 'var(--color-outline)', padding: '6px 12px', borderRadius: '8px', opacity: 0.9 }}
              >
                <span>🎉 {h.name}</span>
                <strong>{new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</strong>
              </div>
            ))}
            {holidays.length === 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No upcoming holidays logged.</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search Box */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search registered workplaces..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search workplaces"
        />
      </div>

      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Workplaces & Companies</h3>
        <button 
          className="btn btn-primary" 
          style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px' }}
          onClick={() => setShowAddModal(true)}
          aria-label="Add new workplace"
        >
          + Add Workplace
        </button>
      </div>

      {/* 4. Company Grid (1 Col mobile, 2 Col tablet/desktop) */}
      <div className="company-grid">
        {filteredCompanies.map(comp => {
          const stats = getCompanyStats(comp.id);
          const themeColor = comp.color;
          const isSafe = stats.percentage >= comp.targetPercentage;
          const isDetailsOpen = openCompanyDetailsId === comp.id;

          return (
            <SwipeableRow 
              key={comp.id}
              onSwipeRight={() => logAttendance(comp.id, 'PRESENT', 'Swiped present')}
              onSwipeLeft={() => toggleArchiveCompany(comp.id, comp.name)}
              leftLabel="Mark Present"
              rightLabel="Archive"
            >
              <div className="company-card" style={{ marginBottom: 0 }}>
                <div className="company-card-accent" style={{ background: themeColor }}></div>
                <div className="company-card-header">
                  <div className="company-title-group">
                    <h3 style={{ color: 'var(--text-primary)' }}>{comp.name}</h3>
                    {comp.location && (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        📍 {comp.location}
                      </span>
                    )}
                  </div>
                  {/* Status Indicator */}
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      background: isSafe ? 'var(--success-glow)' : 'var(--danger-glow)',
                      color: isSafe ? 'var(--success)' : 'var(--danger)'
                    }}
                  >
                    {isSafe ? 'Safe' : 'Critical'}
                  </span>
                </div>

                <div className="attendance-display" style={{ marginTop: '8px' }}>
                  <div>
                    <span 
                      className="attendance-percentage" 
                      style={{ color: isSafe ? 'var(--color-primary)' : 'var(--color-danger)' }}
                    >
                      {stats.percentage.toFixed(1)}%
                    </span>
                    <span className="attendance-target">Target: {comp.targetPercentage}%</span>
                  </div>
                </div>

                {/* Company Metric Blocks */}
                <div className="company-stats-row">
                  <div className="company-stat-box">
                    <div className="company-stat-value" style={{ color: 'var(--color-primary)' }}>{stats.present}</div>
                    <div className="company-stat-label">Present</div>
                  </div>
                  <div className="company-stat-box">
                    <div className="company-stat-value" style={{ color: 'var(--color-warning)' }}>{stats.leaves}</div>
                    <div className="company-stat-label">Leaves</div>
                  </div>
                </div>

                {/* Action Drill Down Open Trigger */}
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', borderRadius: '12px', fontSize: '13px' }}
                  onClick={() => setOpenCompanyDetailsId(isDetailsOpen ? null : comp.id)}
                  aria-expanded={isDetailsOpen}
                >
                  {isDetailsOpen ? 'Close Actions' : 'Open Actions'}
                </button>

                {/* Detailed Action Panel */}
                {isDetailsOpen && (
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.25s ease-out' }}>
                    <div className="btn-group">
                      <button className="btn btn-success-outline" style={{ flex: 1, padding: '8px' }} onClick={() => logAttendance(comp.id, 'PRESENT')}>
                        Present
                      </button>
                      <button className="btn btn-danger-outline" style={{ flex: 1, padding: '8px' }} onClick={() => logAttendance(comp.id, 'ABSENT')}>
                        Absent
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                        onClick={() => {
                          setActiveCompanyForEdit(comp);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, fontSize: '11px', padding: '6px', color: 'var(--color-warning)' }}
                        onClick={() => toggleArchiveCompany(comp.id, comp.name)}
                      >
                        Archive
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, fontSize: '11px', padding: '6px', color: 'var(--color-danger)' }}
                        onClick={() => deleteCompany(comp.id, comp.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SwipeableRow>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>No Workplaces Found</h3>
            <p>Try searching another keyword or register a new company workplace.</p>
          </div>
        )}
      </div>

      <AddCompanyDialog open={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditCompanyDialog open={showEditModal} onClose={() => { setShowEditModal(false); setActiveCompanyForEdit(null); }} company={activeCompanyForEdit} />
    </div>
  );
}
