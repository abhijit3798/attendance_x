import { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';

export default function Settings() {
  const { 
    userName, setUserName, triggerBanner,
    themeMode, setThemeMode,
    notificationsEnabled, setNotificationsEnabled,
    reminderTime, setReminderTime,
    appLanguage, setAppLanguage,
    defaultCalendarView, setDefaultCalendarView,
    appLockEnabled, setAppLockEnabled,
    appLockPin, setAppLockPin,
    biometricEnabled, setBiometricEnabled,
    triggerManualBackup,
    exportCSV
  } = useContext(AppContext);

  // Profile temporary name state
  const [tempName, setTempName] = useState(userName);
  
  // App Lock states
  const [pinCode, setPinCode] = useState(appLockPin);
  const [pinVisible, setPinVisible] = useState(false);

  const saveProfile = () => {
    if (!tempName.trim()) {
      triggerBanner('Name cannot be empty!');
      return;
    }
    setUserName(tempName);
    triggerBanner(`Display name saved: ${tempName}`);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4); // Only digits, max 4 chars
    setPinCode(val);
  };

  const saveSecuritySettings = () => {
    if (appLockEnabled && pinCode.length < 4) {
      triggerBanner('PIN must be exactly 4 digits!');
      return;
    }
    setAppLockPin(pinCode);
    triggerBanner('Security settings updated successfully!');
  };

  const factoryReset = () => {
    if (window.confirm('WARNING: This will permanently delete ALL workplaces, logs, and settings. This action cannot be undone. Proceed?')) {
      localStorage.clear();
      triggerBanner('Database cleared successfully! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="tab-content" role="region" aria-label="Application Settings Panel">
      
      {/* 1. PROFILE SECTION */}
      <div className="action-card">
        <h3 className="settings-section-divider">👤 User Profile</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Configure your dashboard display name.</p>
        
        <div className="form-group">
          <label>Display Name *</label>
          <input 
            type="text" 
            className="form-control" 
            value={tempName} 
            onChange={e => setTempName(e.target.value)} 
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveProfile}>
          Save Name
        </button>
      </div>

      {/* 2. THEME & INTERFACE SECTION */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 className="settings-section-divider">🎨 Theme & Interface</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Select UI presentation modes.</p>
        
        <div className="profile-switcher-bar" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`profile-btn ${themeMode === 'light' ? 'active' : ''}`} 
            style={{ flex: 1 }}
            onClick={() => setThemeMode('light')}
          >
            ☀️ Light
          </button>
          <button 
            className={`profile-btn ${themeMode === 'dark' ? 'active' : ''}`} 
            style={{ flex: 1 }}
            onClick={() => setThemeMode('dark')}
          >
            🌙 Dark
          </button>
          <button 
            className={`profile-btn ${themeMode === 'system' ? 'active' : ''}`} 
            style={{ flex: 1 }}
            onClick={() => setThemeMode('system')}
          >
            ⚙️ System
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATIONS SECTION */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 className="settings-section-divider">🔔 Alerts & Reminders</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Manage notification frequencies.</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <strong>Enable Reminders</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Daily alarm to clock attendance checks.</p>
          </div>
          <button
            className="btn"
            style={{
              background: notificationsEnabled ? 'var(--color-primary-container)' : 'var(--color-outline)',
              color: notificationsEnabled ? 'var(--color-primary)' : 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              triggerBanner(notificationsEnabled ? 'Reminders Disabled' : 'Reminders Enabled');
            }}
          >
            {notificationsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {notificationsEnabled && (
          <div className="form-group" style={{ animation: 'slideUp 0.25s ease-out' }}>
            <label>Reminder Time</label>
            <input 
              type="time" 
              className="form-control" 
              value={reminderTime} 
              onChange={e => setReminderTime(e.target.value)} 
            />
          </div>
        )}
      </div>

      {/* 4. SECURITY & APP LOCK */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 className="settings-section-divider">🔒 Security App Lock</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Restrict access using secure passwords.</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <strong>PIN Protection Lock</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Prompt for a 4-digit code on app launches.</p>
          </div>
          <button
            className="btn"
            style={{
              background: appLockEnabled ? 'var(--color-primary-container)' : 'var(--color-outline)',
              color: appLockEnabled ? 'var(--color-primary)' : 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}
            onClick={() => {
              setAppLockEnabled(!appLockEnabled);
              triggerBanner(appLockEnabled ? 'PIN Lock Disabled' : 'PIN Lock Enabled');
            }}
          >
            {appLockEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {appLockEnabled && (
          <div style={{ animation: 'slideUp 0.25s ease-out' }}>
            <div className="form-group">
              <label>Enter 4-Digit PIN *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type={pinVisible ? 'text' : 'password'} 
                  className="form-control" 
                  pattern="[0-9]*" 
                  inputMode="numeric"
                  placeholder="e.g. 1234"
                  value={pinCode} 
                  onChange={handlePinChange} 
                />
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0 16px', borderRadius: '12px' }}
                  onClick={() => setPinVisible(!pinVisible)}
                >
                  {pinVisible ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '12px' }} onClick={saveSecuritySettings}>
              Update Security PIN
            </button>
          </div>
        )}

        {/* Biometric Scanner Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '16px', marginTop: '16px' }}>
          <div>
            <strong>Biometric Ready Lock</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Use native fingerprint/face scanning.</p>
          </div>
          <button
            className="btn"
            style={{
              background: biometricEnabled ? 'var(--color-primary-container)' : 'var(--color-outline)',
              color: biometricEnabled ? 'var(--color-primary)' : 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}
            onClick={() => {
              setBiometricEnabled(!biometricEnabled);
              triggerBanner(biometricEnabled ? 'Biometric Bypass Disabled' : 'Biometric Sensor Initialized!');
            }}
          >
            {biometricEnabled ? 'ACTIVE' : 'READY'}
          </button>
        </div>
      </div>

      {/* 5. PREFERENCES SECTION */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 className="settings-section-divider">⚙️ App Preferences</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Adjust regional and view preferences.</p>

        <div className="form-group">
          <label>Preferred Language</label>
          <select className="form-control" value={appLanguage} onChange={e => { setAppLanguage(e.target.value); triggerBanner('Language preference saved.'); }}>
            <option value="en">English (US)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
            <option value="hi">हिन्दी (IN)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Default Calendar View</label>
          <select className="form-control" value={defaultCalendarView} onChange={e => { setDefaultCalendarView(e.target.value); triggerBanner('Default view updated.'); }}>
            <option value="month">Monthly Grid</option>
            <option value="week">Weekly details</option>
            <option value="year">Yearly Heatmap</option>
          </select>
        </div>
      </div>

      {/* 6. BACKUP & EXPORTS SECTION */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 className="settings-section-divider">📥 Data Backup & Exporters</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Keep local logs backed up and restorable.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => triggerManualBackup(true)}>
            🔒 Secure axb Backup
          </button>
          <button className="btn btn-secondary" onClick={exportCSV}>
            📊 Export CSV File
          </button>
        </div>
      </div>

      {/* 7. CRITICAL FACTORY RESET APPLICATION */}
      <div className="action-card" style={{ marginTop: '20px', borderColor: 'var(--color-danger)' }}>
        <h3 style={{ color: 'var(--color-danger)' }}>🚨 Critical Operations</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>Purge all local databases and reset components.</p>
        
        <button 
          className="btn btn-danger-outline" 
          style={{ width: '100%', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
          onClick={factoryReset}
        >
          Factory Reset App Data
        </button>
      </div>

    </div>
  );
}
