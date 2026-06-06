import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import { EditCompanyDialog } from './Dialogs';
import AppLogo from './AppLogo';

// Inline SVGs for lightweight design and complete offline capability
const Icons = {
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
  ),
  Delete: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Fast: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Reports: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  Backup: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  About: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  ),
  Theme: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  )
};

export default function Layout({ children, activeScreen, setActiveScreen }) {
  const context = useContext(AppContext) || {};
  const { 
    banner = { active: false, text: '' }, 
    drawerOpen = false, 
    setDrawerOpen = () => {},
    themeMode = 'system',
    setThemeMode = () => {},
    activeCompanyId = null,
    setActiveCompanyId = () => {},
    companies = [],
    deleteCompany = () => {}
  } = context;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConfirmDelete = () => {
    const comp = companies.find(c => c.id === activeCompanyId);
    if (comp) {
      deleteCompany(comp.id, comp.name);
      setActiveCompanyId(null);
    }
    setShowDeleteModal(false);
  };

  const toggleTheme = () => {
    if (themeMode === 'dark') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(isSystemDark ? 'light' : 'dark');
    }
  };
  const [touchStartX, setTouchStartX] = useState(0);

  // Map Screen IDs to Titles
  const screenTitles = {
    dashboard: 'Dashboard',
    calendar: 'Attendance Calendar',
    quick: 'Quick Attendance',
    reports: 'Attendance Reports',
    analytics: 'Analytics',
    backup: 'Backup & Restore',
    settings: 'Settings',
    about: 'About App'
  };

  const currentTitle = screenTitles[activeScreen] || 'AttendanceX';

  // 1. Edge touch swiping handles
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    // Edge swipe right: Open Drawer (If touch started near left edge < 35px)
    if (touchStartX < 35 && diff > 80) {
      setDrawerOpen(true);
    }

    // Swipe left inside open Drawer: Close it
    if (drawerOpen && diff < -60) {
      setDrawerOpen(false);
    }
  };

  const navigateTo = (screenId) => {
    setActiveScreen(screenId);
    setActiveCompanyId(null);
    setDrawerOpen(false); // Close collapsible drawer on mobile selection
  };

  return (
    <div 
      className="app-layout"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Edge Swipe Detector Strip */}
      <div className="edge-swipe-detector" aria-hidden="true" />

      {/* Slide Toast notification banner */}
      <div className={`notification-banner ${banner?.active ? 'active' : ''}`}>
        <div className="notification-content">
          <div style={{ color: 'var(--success)' }}>
            <Icons.Check />
          </div>
          <div className="notification-text">{banner?.text || ''}</div>
        </div>
      </div>

      {/* Collapsible Left Drawer Overlay backdrop */}
      <div 
        className={`left-drawer-overlay ${drawerOpen ? 'active' : ''}`} 
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Collapsible/Pinned Left Drawer Menus */}
      <aside 
        className={`left-drawer ${drawerOpen ? 'active' : ''}`}
        role="navigation"
        aria-label="Sidebar Menu Directory"
      >
        <div className="drawer-logo" style={{ gap: '12px' }}>
          <AppLogo size={34} />
          <span>AttendanceX</span>
        </div>

        <nav className="drawer-menu">
          <button className={`drawer-item ${activeScreen === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
            <Icons.Dashboard /> Dashboard
          </button>
          <button className={`drawer-item ${activeScreen === 'reports' ? 'active' : ''}`} onClick={() => navigateTo('reports')}>
            <Icons.Reports /> Reports
          </button>
          <button className={`drawer-item ${activeScreen === 'analytics' ? 'active' : ''}`} onClick={() => navigateTo('analytics')}>
            <Icons.Analytics /> Analytics
          </button>
          <button className={`drawer-item ${activeScreen === 'backup' ? 'active' : ''}`} onClick={() => navigateTo('backup')}>
            <Icons.Backup /> Backup
          </button>
          <button className={`drawer-item ${activeScreen === 'settings' ? 'active' : ''}`} onClick={() => navigateTo('settings')}>
            <Icons.Settings /> Settings
          </button>
          <button className={`drawer-item ${activeScreen === 'about' ? 'active' : ''}`} onClick={() => navigateTo('about')}>
            <Icons.About /> About
          </button>
        </nav>
      </aside>

      {/* Content wrapper taking up offset margins */}
      <div className="main-content">
        {/* Sticky App Header Bar */}
        {activeCompanyId && activeScreen === 'dashboard' ? (
          <header className="top-bar" style={{ display: 'flex', alignItems: 'center', height: '56px', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <button 
                className="wp-calendar-back-btn" 
                onClick={() => setActiveCompanyId(null)}
                aria-label="Go back to Dashboard"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '50%' }}
              >
                <Icons.Back />
              </button>
              <h2 className="wp-calendar-title" style={{ flexGrow: 1, marginLeft: '12px', fontSize: '18px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                {companies.find(c => c.id === activeCompanyId)?.name}
              </h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="wp-calendar-action-btn" 
                  onClick={() => setShowEditModal(true)} 
                  aria-label="Edit workplace details"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                >
                  <Icons.Edit />
                </button>
                <button 
                  className="wp-calendar-action-btn" 
                  onClick={() => setShowDeleteModal(true)} 
                  aria-label="Delete workplace"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                >
                  <Icons.Delete />
                </button>
              </div>
            </div>
          </header>
        ) : (
          <header className="top-bar">
            <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Collapsible Menu Drawer button for mobile viewports */}
              <button 
                className="header-action-btn"
                style={{ display: 'flex' }}
                onClick={() => setDrawerOpen(true)}
                aria-label="Toggle Navigation Drawer Menu"
              >
                <Icons.Menu />
              </button>
              <h2>{currentTitle}</h2>
            </div>

            <div className="header-actions">
              <button className="header-action-btn" aria-label="Toggle notifications"><Icons.Bell /></button>
              <button 
                className="header-action-btn" 
                onClick={toggleTheme}
                aria-label="Switch Theme Dark / Light mode"
              >
                {themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
            </div>
          </header>
        )}

        {/* Presentation panels mount point */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* Floating Bottom Nav bar for quick mobile overlays */}
        <nav className="bottom-nav" role="navigation" aria-label="Bottom Navigation Bar Quick Tabs">
          <button className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveScreen('dashboard'); setActiveCompanyId(null); }}>
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeScreen === 'calendar' ? 'active' : ''}`} onClick={() => { setActiveScreen('calendar'); setActiveCompanyId(null); }}>
            <Icons.Calendar />
            <span>Calendar</span>
          </button>
          <button className={`nav-item ${activeScreen === 'quick' ? 'active' : ''}`} onClick={() => { setActiveScreen('quick'); setActiveCompanyId(null); }}>
            <Icons.Fast />
            <span>Quick Mark</span>
          </button>

        </nav>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Delete Workplace Confirmation" style={{ maxWidth: '360px', padding: '24px', borderRadius: '20px' }}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Delete Workplace</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Close modal">×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px', textAlign: 'left' }}>
              This will permanently remove workplace data and attendance records.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '700' }} 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, padding: '12px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }} 
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <EditCompanyDialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        company={companies.find(c => c.id === activeCompanyId)}
      />
    </div>
  );
}
