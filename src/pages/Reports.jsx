import { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';

export default function Reports() {
  const { records, deleteRecord, companies, triggerBanner } = useContext(AppContext);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Tag filter states (can choose multiple!)
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);
  
  // Date range state
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  // Exclude helper "SESSION" entries to show clean tracking feeds
  const displayRecs = records.filter(r => r.status !== 'SESSION');

  // Toggle filter arrays
  const toggleStatusFilter = (status) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const toggleShiftFilter = (shift) => {
    if (selectedShifts.includes(shift)) {
      setSelectedShifts(selectedShifts.filter(s => s !== shift));
    } else {
      setSelectedShifts([...selectedShifts, shift]);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedShifts([]);
    setStartDateStr('');
    setEndDateStr('');
    triggerBanner('Cleared all search filters.');
  };

  // ----------------------------------------------------
  // Optimized Fast Filter Engine
  // ----------------------------------------------------
  const getFilteredLogs = () => {
    return displayRecs.filter(rec => {
      const comp = companies.find(c => c.id === rec.companyId);
      const companyName = comp?.name || 'Company';
      const logNotes = rec.notes || '';
      
      const date = new Date(rec.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // 1. Combined Fuzzy Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = companyName.toLowerCase().includes(query);
        const matchesNotes = logNotes.toLowerCase().includes(query);
        const matchesDate = formattedDate.toLowerCase().includes(query);
        
        if (!matchesName && !matchesNotes && !matchesDate) return false;
      }

      // 2. Status Chips Selection (Match any if selected)
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(rec.status)) return false;
      }

      // 3. Shift Chips Selection
      if (selectedShifts.length > 0) {
        const shiftVal = rec.shift || 'GENERAL';
        if (!selectedShifts.includes(shiftVal)) return false;
      }

      // 4. Date Range Filters
      const dateVal = new Date(rec.timestamp);
      dateVal.setHours(0, 0, 0, 0);

      if (startDateStr) {
        const start = new Date(startDateStr);
        start.setHours(0, 0, 0, 0);
        if (dateVal < start) return false;
      }

      if (endDateStr) {
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        if (dateVal > end) return false;
      }

      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="tab-content" role="region" aria-label="Workplace Attendance Reports">
      
      {/* 1. Header Combined Search Box */}
      <div className="action-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="search-container" style={{ flex: 1, marginBottom: 0 }}>
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by workplace, note, date..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Fuzzy search logs"
            />
          </div>
          
          <button 
            className="btn btn-secondary"
            style={{ 
              padding: '12px 16px', 
              borderRadius: '16px', 
              fontSize: '13px', 
              fontWeight: '700',
              borderColor: showAdvanced ? 'var(--color-primary)' : 'var(--card-border)',
              color: showAdvanced ? 'var(--color-primary)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            <span>⚙️</span>
            <span style={{ display: 'none' }}>Filters</span>
          </button>
        </div>

        {/* 2. Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--card-border)', animation: 'slideUp 0.25s ease-out' }}>
            <div className="search-grid">
              
              {/* Status Chips Selector */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Attendance Statuses</label>
                <div className="filter-chip-group">
                  {['PRESENT', 'ABSENT', 'LEAVE', 'HALFDAY', 'HOLIDAY'].map(st => {
                    const isActive = selectedStatuses.includes(st);
                    return (
                      <button
                        key={st}
                        className={`filter-chip ${isActive ? 'active' : ''}`}
                        onClick={() => toggleStatusFilter(st)}
                      >
                        {st.charAt(0) + st.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shift Chips Selector */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Shift Timings</label>
                <div className="filter-chip-group">
                  {['GENERAL', 'MORNING', 'AFTERNOON', 'NIGHT'].map(sh => {
                    const isActive = selectedShifts.includes(sh);
                    return (
                      <button
                        key={sh}
                        className={`filter-chip ${isActive ? 'active' : ''}`}
                        onClick={() => toggleShiftFilter(sh)}
                      >
                        {sh.charAt(0) + sh.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date range pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>From Date</label>
                  <input type="date" className="form-control" value={startDateStr} onChange={e => setStartDateStr(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>To Date</label>
                  <input type="date" className="form-control" value={endDateStr} onChange={e => setEndDateStr(e.target.value)} />
                </div>
              </div>

            </div>

            {/* Clear All triggers */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '12px', color: 'var(--color-danger)' }}
                onClick={resetAllFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Search results counts summary metadata */}
      {(searchQuery.trim() || selectedStatuses.length > 0 || selectedShifts.length > 0 || startDateStr || endDateStr) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Found <strong style={{ color: 'var(--color-primary)' }}>{filteredLogs.length}</strong> matching log records
          </span>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            onClick={resetAllFilters}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* 4. Logs rendering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLogs.map(rec => {
          const date = new Date(rec.timestamp);
          const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const comp = companies.find(c => c.id === rec.companyId);
          const color = comp?.color || 'var(--color-primary)';
          const shiftLabel = rec.shift || 'GENERAL';

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
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}>{comp?.name || 'Company'}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                      {formatted} {rec.notes && `• ${rec.notes}`}
                    </p>
                    <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: '800', background: 'var(--color-outline)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                      Shift: {shiftLabel}
                    </span>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </SwipeableRow>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="empty-state">
            <h3>No Log Reports Found</h3>
            <p>Adjust your search filters or clear tags to display log records.</p>
          </div>
        )}
      </div>
    </div>
  );
}
