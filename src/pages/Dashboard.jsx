import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';
import { AddCompanyDialog, EditCompanyDialog } from '../components/Dialogs';
import WorkplaceCalendar from './WorkplaceCalendar';

export default function Dashboard() {
  const {
    userName,
    companies, deleteCompany, toggleArchiveCompany,
    records, logAttendance,
    leaves,
    streak,
    holidays,
    triggerBanner,
    activeCompanyId, setActiveCompanyId
  } = useContext(AppContext);

  // States
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeCompanyForEdit, setActiveCompanyForEdit] = useState(null);

  // Filter out archived companies
  const activeCompanies = companies.filter(c => !c.isArchived);

  // Calculate stats reactively
  const getCompanyStats = (companyId) => {
    const compRecs = records.filter(r => r.companyId === companyId);
    const compLeaves = leaves.filter(l => l.companyId === companyId && l.status === 'APPROVED');

    let present = 0;
    let absent = 0;
    let holiday = 0;
    let weekoff = 0;
    let leave = compLeaves.length;

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

    const workingDays = present + absent + leave;
    const percentage = workingDays > 0 ? (present / workingDays) * 100 : 100.0;

    return { present, absent, leaves: leave, holiday, weekoff, percentage };
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

  // Sub-routing: If a workplace calendar is opened, render WorkplaceCalendar
  if (activeCompanyId !== null) {
    return (
      <WorkplaceCalendar 
        companyId={activeCompanyId} 
        onBack={() => setActiveCompanyId(null)} 
      />
    );
  }

  return (
    <div className="tab-content" role="region" aria-label="Attendance Dashboard">
      
      {/* SECTION 1: ATTENDANCE SUMMARY CARD */}
      <div className="attendance-summary-card">
        <div className="summary-avatar" aria-label="User Avatar icon">
          {userName ? userName[0].toUpperCase() : 'A'}
        </div>
        <div className="summary-info">
          <h3 className="summary-name">{userName}</h3>
          <span className="summary-status">Ready to clock in</span>
        </div>
        <div className="summary-percentage">
          {overallPercentage.toFixed(0)}%
        </div>
      </div>

      {/* SECTION 2: SEARCH */}
      <div className="search-container-redesign">
        <span className="search-icon-redesign">🔍</span>
        <input 
          type="text" 
          className="search-input-redesign" 
          placeholder="Search workplaces..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search workplaces"
        />
      </div>

      {/* SECTION 3: ADD WORKPLACE */}
      <div className="add-workplace-container">
        <button 
          className="btn-pill-green" 
          onClick={() => setShowAddModal(true)}
          aria-label="Add new workplace"
        >
          + Add Workplace
        </button>
      </div>

      {/* SECTION 4: WORKPLACE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredCompanies.map(comp => {
          const stats = getCompanyStats(comp.id);
          const isSafe = stats.percentage >= comp.targetPercentage;

          return (
            <SwipeableRow 
              key={comp.id}
              onSwipeRight={() => logAttendance(comp.id, 'PRESENT', 'Swiped present')}
              onSwipeLeft={() => toggleArchiveCompany(comp.id, comp.name)}
              leftLabel="Mark Present"
              rightLabel="Archive"
            >
              <div 
                className="workplace-card-new" 
                style={{ marginBottom: 0 }}
                onClick={() => setActiveCompanyId(comp.id)}
              >
                <div className="workplace-card-accent-new" style={{ background: comp.color }}></div>
                <h3 className="workplace-name-new">{comp.name}</h3>
                {comp.location && (
                  <p className="workplace-location-new">📍 {comp.location}</p>
                )}

                <div className="workplace-metrics-new">
                  <div className="workplace-percentage-row-new">
                    <span 
                      className="workplace-percentage-new" 
                      style={{ color: isSafe ? 'var(--color-success)' : 'var(--color-danger)' }}
                    >
                      {stats.percentage.toFixed(0)}%
                    </span>
                    <span className="workplace-target-new">Target: {comp.targetPercentage.toFixed(0)}%</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {/* Row 1: Present | Absent | Leave */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="workplace-count-badge-new present" style={{ flex: 1, minWidth: '70px', textAlign: 'center' }}>Present: {stats.present}</span>
                      <span className="workplace-count-badge-new absent" style={{ flex: 1, minWidth: '70px', textAlign: 'center' }}>Absent: {stats.absent}</span>
                      <span className="workplace-count-badge-new leaves" style={{ flex: 1, minWidth: '70px', textAlign: 'center' }}>Leave: {stats.leaves}</span>
                    </div>
                    {/* Row 2: Holiday | Week Off */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="workplace-count-badge-new holiday" style={{ flex: 1, minWidth: '100px', textAlign: 'center' }}>Holiday: {stats.holiday}</span>
                      <span className="workplace-count-badge-new weekoff" style={{ flex: 1, minWidth: '100px', textAlign: 'center' }}>Week Off: {stats.weekoff}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SwipeableRow>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="empty-state">
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
