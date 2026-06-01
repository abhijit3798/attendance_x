import React, { useContext, useRef, useState } from 'react';
import { AppContext } from '../context/AppState';

export default function BackupRestore() {
  const {
    backupHistory,
    autoBackupEnabled,
    setAutoBackupEnabled,
    triggerManualBackup,
    restoreFromBackup,
    deleteBackupFromHistory,
    triggerBanner
  } = useContext(AppContext);

  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // File selection triggers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const isEncrypted = file.name.endsWith('.axb');
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataStr = e.target.result;
      restoreFromBackup(dataStr, isEncrypted);
    };

    reader.readAsText(file);
  };

  // Drag and Drop triggers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Get details of the latest backup
  const lastBackup = backupHistory[0] || null;

  return (
    <div className="tab-content" role="region" aria-label="Backup and Restore Dashboard">
      
      {/* 1. Last Backup Prominent Indicator */}
      {lastBackup ? (
        <div className="stats-ring-card">
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--color-primary)' }}>Last Backup</h3>
            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '15px', marginTop: '6px' }}>
              {lastBackup.filename}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
              Size: {lastBackup.size}  •  {new Date(lastBackup.timestamp).toLocaleString()}
            </span>
          </div>
          <span 
            className="history-badge present" 
            style={{ 
              background: lastBackup.encrypted ? 'var(--secondary-glow)' : 'var(--success-glow)', 
              color: lastBackup.encrypted ? 'var(--color-secondary)' : 'var(--color-success)',
              fontWeight: '800'
            }}
          >
            {lastBackup.encrypted ? 'Encrypted' : 'JSON'}
          </span>
        </div>
      ) : (
        <div className="stats-ring-card">
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>No backups created yet</h3>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Log data or click below to trigger a backup.</p>
          </div>
        </div>
      )}

      {/* 2. Manual Backup Trigger & Auto Option */}
      <div className="action-card">
        <h3>Manual Backup</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 16px 0' }}>
          Instantly download your local database backup copy.
        </p>

        <div className="btn-group" style={{ marginBottom: '20px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1 }}
            onClick={() => triggerManualBackup(false)}
          >
            Raw JSON
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1.2 }}
            onClick={() => triggerManualBackup(true)}
          >
            Encrypted (.axb)
          </button>
        </div>

        {/* Auto Backup Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
          <div>
            <strong style={{ fontSize: '14px' }}>Automated Background Backup</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Creates a local restore point on data changes.
            </p>
          </div>
          
          <button
            className="btn"
            style={{
              background: autoBackupEnabled ? 'var(--color-primary-container)' : 'var(--color-outline)',
              color: autoBackupEnabled ? 'var(--color-primary)' : 'var(--text-primary)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '12px'
            }}
            onClick={() => {
              setAutoBackupEnabled(!autoBackupEnabled);
              triggerBanner(autoBackupEnabled ? 'Auto Backup Disabled' : 'Auto Backup Enabled');
            }}
          >
            {autoBackupEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 3. Drag and Drop File Upload zone */}
      <div 
        className="action-card"
        style={{
          border: isDragOver ? '2px dashed var(--color-primary)' : '1px dashed var(--card-border)',
          background: isDragOver ? 'var(--primary-glow)' : '',
          textAlign: 'center',
          padding: '30px 20px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📤</span>
        <strong style={{ fontSize: '14px' }}>Upload Backup File</strong>
        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
          Drag & drop or tap to select a `.json` or `.axb` file.
        </p>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json,.axb"
          onChange={handleFileChange}
        />
      </div>

      {/* 4. Local Backup History List */}
      <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '24px 0 16px 0' }}>Local Backup History</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {backupHistory.map(b => {
          const date = new Date(b.timestamp);
          const formatted = date.toLocaleDateString() + '  ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div 
              key={b.id}
              className="history-card"
              style={{ 
                borderLeftColor: b.encrypted ? 'var(--color-secondary)' : 'var(--color-success)',
                marginBottom: 0
              }}
            >
              <div className="history-left">
                <div className="history-indicator" style={{ background: b.encrypted ? 'var(--color-secondary)' : 'var(--color-success)' }}></div>
                <div className="history-details">
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{b.filename}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{formatted}  •  {b.size}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}
                  onClick={() => restoreFromBackup(b.data, b.encrypted)}
                  aria-label={`Restore backup from ${b.filename}`}
                >
                  Restore
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteBackupFromHistory(b.id)}
                  aria-label="Delete backup from history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          );
        })}

        {backupHistory.length === 0 && (
          <div className="empty-state">
            <h3>History is Empty</h3>
            <p>Stored backup snapshots will list here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
