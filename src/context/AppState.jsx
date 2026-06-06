import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Personal User Profile
  const [userName, setUserName] = useState('Abhijit');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 1b. Role State
  const [role, setRole] = useState(() => {
    const local = localStorage.getItem('ax_role');
    return local || 'employee';
  });

  // 1c. Subjects (Courses) State
  const [subjects, setSubjects] = useState(() => {
    const local = localStorage.getItem('ax_subjects');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Advanced Mathematics', room: 'Room 302', teacher: 'Dr. Euler', targetPercentage: 75.0, color: '#10B981' },
      { id: 2, name: 'Quantum Physics', room: 'Lab 4', teacher: 'Dr. Bohr', targetPercentage: 80.0, color: '#059669' }
    ];
  });

  // 1d. Shifts State
  const shifts = [];

  // 1e. Projects State
  const [projects, setProjects] = useState(() => {
    const local = localStorage.getItem('ax_projects');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Website Redesign', client: 'Acme Corp', hourlyRate: 50.0, color: '#10B981' },
      { id: 2, name: 'Mobile App', client: 'Globex', hourlyRate: 65.0, color: '#059669' }
    ];
  });

  // 1f. Records (Attendance Clockings) State
  const [records, setRecords] = useState(() => {
    const local = localStorage.getItem('ax_records');
    return local ? JSON.parse(local) : [
      { id: 1, subjectId: 1, status: 'PRESENT', notes: 'Math class present', timestamp: Date.now() - 48*60*60*1000 },
      { id: 2, shiftId: 1, status: 'CLOCKED_OUT', notes: 'Completed shift', hours: 8, timestamp: Date.now() - 24*60*60*1000 },
      { id: 3, projectId: 1, status: 'BILLED', notes: 'Worked on layouts', hours: 4, earnings: 200, timestamp: Date.now() }
    ];
  });

  // 1g. Application Preferences & Settings states
  const [themeMode, setThemeMode] = useState(() => {
    const local = localStorage.getItem('ax_theme_mode');
    return local || 'system';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const local = localStorage.getItem('ax_notifications_enabled');
    return local ? JSON.parse(local) : true;
  });

  const [reminderTime, setReminderTime] = useState(() => {
    const local = localStorage.getItem('ax_reminder_time');
    return local || '18:00';
  });

  const [appLanguage, setAppLanguage] = useState(() => {
    const local = localStorage.getItem('ax_app_language');
    return local || 'en';
  });

  const [defaultCalendarView, setDefaultCalendarView] = useState(() => {
    const local = localStorage.getItem('ax_default_calendar_view');
    return local || 'month';
  });

  const [appLockEnabled, setAppLockEnabled] = useState(() => {
    const local = localStorage.getItem('ax_app_lock_enabled');
    return local ? JSON.parse(local) : false;
  });

  const [appLockPin, setAppLockPin] = useState(() => {
    const local = localStorage.getItem('ax_app_lock_pin');
    return local || '';
  });

  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    const local = localStorage.getItem('ax_biometric_enabled');
    return local ? JSON.parse(local) : false;
  });

  // 2. Companies list
  const [companies, setCompanies] = useState(() => {
    const local = localStorage.getItem('ax_companies');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Tech Solutions Inc.', location: 'HQ - Room 302', targetPercentage: 80.0, color: '#10B981', isArchived: false },
      { id: 2, name: 'Apex Design Corp', location: 'Remote', targetPercentage: 75.0, color: '#059669', isArchived: false }
    ];
  });

  // 3. Calendar Database Dictionary: 'YYYY-MM-DD' -> { status, shift, notes, customStatus, customShift }
  const [calendarLogs, setCalendarLogs] = useState(() => {
    const local = localStorage.getItem('ax_calendar_logs');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
    return local ? JSON.parse(local) : {
      [yesterday]: { status: 'PRESENT', shift: 'GENERAL', notes: 'Completed day shift' },
      [today]: { status: 'PRESENT', shift: 'GENERAL', notes: 'Logged clock-in' }
    };
  });

  // 4. Transactional Undo History Stack
  const [undoStack, setUndoStack] = useState([]);

  // 5. Leave Registry database
  const [leaves, setLeaves] = useState([]);

  // 6. Notes Database
  const notes = [];

  // 7. Holidays Database
  const [holidays, setHolidays] = useState(() => {
    const local = localStorage.getItem('ax_holidays');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Independence Day', date: '2026-07-04' },
      { id: 2, name: 'Labor Day', date: '2026-09-07' },
      { id: 3, name: 'Thanksgiving Day', date: '2026-11-26' }
    ];
  });

  // 8. Advanced Local Backup System States
  const [backupHistory, setBackupHistory] = useState(() => {
    const local = localStorage.getItem('ax_backup_history');
    return local ? JSON.parse(local) : [];
  });

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    const local = localStorage.getItem('ax_auto_backup_enabled');
    return local ? JSON.parse(local) : true;
  });

  // 9. Custom Banner notification state
  const [banner, setBanner] = useState({ active: false, text: '' });
  const [undoBannerActive, setUndoBannerActive] = useState(false);

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem('ax_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('ax_calendar_logs', JSON.stringify(calendarLogs));
  }, [calendarLogs]);



  useEffect(() => {
    localStorage.setItem('ax_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('ax_backup_history', JSON.stringify(backupHistory));
  }, [backupHistory]);

  useEffect(() => {
    localStorage.setItem('ax_auto_backup_enabled', JSON.stringify(autoBackupEnabled));
  }, [autoBackupEnabled]);

  useEffect(() => {
    localStorage.setItem('ax_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('ax_subjects', JSON.stringify(subjects));
  }, [subjects]);



  useEffect(() => {
    localStorage.setItem('ax_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ax_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('ax_theme_mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('ax_notifications_enabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('ax_reminder_time', reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem('ax_app_language', appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    localStorage.setItem('ax_default_calendar_view', defaultCalendarView);
  }, [defaultCalendarView]);

  useEffect(() => {
    localStorage.setItem('ax_app_lock_enabled', JSON.stringify(appLockEnabled));
  }, [appLockEnabled]);

  useEffect(() => {
    localStorage.setItem('ax_app_lock_pin', appLockPin);
  }, [appLockPin]);

  useEffect(() => {
    localStorage.setItem('ax_biometric_enabled', JSON.stringify(biometricEnabled));
  }, [biometricEnabled]);

  const [activeCompanyId, setActiveCompanyIdInternal] = useState(null);
  const [lastCompanyId, setLastCompanyId] = useState(() => {
    const local = localStorage.getItem('ax_last_company_id');
    if (local) return parseInt(local);
    const localComps = localStorage.getItem('ax_companies');
    if (localComps) {
      const parsed = JSON.parse(localComps);
      if (parsed && parsed.length > 0) return parsed[0].id;
    }
    return 1;
  });

  const setActiveCompanyId = (id) => {
    setActiveCompanyIdInternal(id);
    if (id !== null) {
      setLastCompanyId(id);
      localStorage.setItem('ax_last_company_id', id.toString());
    }
  };

  // Persistent Theme Mode Applier (Light/Dark/System)
  useEffect(() => {
    const rootEl = document.documentElement;
    if (themeMode === 'dark') {
      rootEl.classList.toggle('dark', true);
    } else if (themeMode === 'light') {
      rootEl.classList.toggle('dark', false);
    } else {
      // System mode: sync with system prefers-color-scheme
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystem = (e) => {
        rootEl.classList.toggle('dark', e.matches);
      };
      
      // Initial check
      rootEl.classList.toggle('dark', media.matches);

      // Listen for changes
      media.addEventListener('change', applySystem);
      return () => media.removeEventListener('change', applySystem);
    }
  }, [themeMode]);

  // Unified background auto backup
  useEffect(() => {
    if (!autoBackupEnabled) return;

    // Throttled: limit auto backup triggers to once every 1 minute to avoid write cycles
    const lastAuto = localStorage.getItem('ax_last_auto_backup_time') || 0;
    if (Date.now() - Number(lastAuto) < 60 * 1000) return;

    const database = { 
      companies, calendarLogs, leaves, notes, holidays, userName, role, subjects, shifts, projects, records,
      themeMode, notificationsEnabled, reminderTime, appLanguage, defaultCalendarView, appLockEnabled, appLockPin, biometricEnabled
    };
    const dataStr = JSON.stringify(database);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const sizeKb = (blob.size / 1024).toFixed(2);

    const newBackup = {
      id: Date.now(),
      filename: `attendancex_auto_backup_${Date.now()}.json`,
      timestamp: Date.now(),
      size: `${sizeKb} KB`,
      encrypted: false,
      data: dataStr
    };

    setBackupHistory(prev => [newBackup, ...prev].slice(0, 5));
    localStorage.setItem('ax_last_auto_backup_time', Date.now().toString());
  }, [companies, calendarLogs, leaves, notes, holidays, userName, role, subjects, shifts, projects, records, 
      themeMode, notificationsEnabled, reminderTime, appLanguage, defaultCalendarView, appLockEnabled, appLockPin, biometricEnabled, autoBackupEnabled]);

  // Dispatchers
  const triggerBanner = (text) => {
    setBanner({ active: true, text });
    setTimeout(() => setBanner({ active: false, text: '' }), 3000);
  };

  const pushToUndoStack = () => {
    setUndoStack([...undoStack, JSON.stringify(calendarLogs)]);
    setUndoBannerActive(true);
    setTimeout(() => setUndoBannerActive(false), 6000);
  };

  const undoLastChange = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setCalendarLogs(JSON.parse(previous));
    setUndoStack(undoStack.slice(0, -1));
    setUndoBannerActive(false);
    triggerBanner('Undo applied successfully!');
  };

  // ----------------------------------------------------
  // XOR Encryption/Decryption Cipher Utilities
  // ----------------------------------------------------
  const CIPHER_KEY = 'ATTENDANCEX_SECURE_KEY';

  const encryptString = (str) => {
    try {
      // XOR Cipher + Base64
      const xor = str.split('').map((char, idx) => {
        return String.fromCharCode(char.charCodeAt(0) ^ CIPHER_KEY.charCodeAt(idx % CIPHER_KEY.length));
      }).join('');
      return btoa(unescape(encodeURIComponent(xor))); // Safe unicode Base64 encoding
    } catch (err) {
      console.error('Encryption failed', err);
      return str;
    }
  };

  const decryptString = (b64) => {
    try {
      const decoded = decodeURIComponent(escape(atob(b64)));
      return decoded.split('').map((char, idx) => {
        return String.fromCharCode(char.charCodeAt(0) ^ CIPHER_KEY.charCodeAt(idx % CIPHER_KEY.length));
      }).join('');
    } catch (err) {
      console.error('Decryption failed', err);
      return b64;
    }
  };

  // ----------------------------------------------------
  // Actions / Intents
  // ----------------------------------------------------

  // 1. Company Actions
  const addCompany = (name, location, target, color) => {
    const newComp = { id: Date.now(), name, location, targetPercentage: parseFloat(target) || 75.0, color, isArchived: false };
    setCompanies([...companies, newComp]);
    triggerBanner(`Added Workplace: ${name}`);
  };

  const editCompany = (id, name, location, target, color) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, name, location, targetPercentage: parseFloat(target) || 75.0, color } : c));
    triggerBanner(`Updated workplace details.`);
  };

  const deleteCompany = (id, name) => {
    setCompanies(companies.filter(c => c.id !== id));
    setRecords(prevRecs => prevRecs.filter(r => r.companyId !== id));
    setLeaves(prevLeaves => prevLeaves.filter(l => l.companyId !== id));
    triggerBanner(`Workplace deleted successfully`);
  };

  const toggleArchiveCompany = (id, name) => {
    setCompanies(companies.map(c => {
      if (c.id === id) {
        const next = !c.isArchived;
        triggerBanner(next ? `Archived: ${name}` : `Restored: ${name}`);
        return { ...c, isArchived: next };
      }
      return c;
    }));
  };

  // 2. Calendar logging transactions
  const logAttendanceForDate = (dateString, status, shift, notes = '') => {
    pushToUndoStack();
    const updated = { ...calendarLogs };
    updated[dateString] = { status, shift, notes };
    setCalendarLogs(updated);
    triggerBanner(`Attendance marked for ${dateString}.`);
  };

  const bulkUpdateDates = (dateStrings, status, shift, notes = 'Bulk update logs') => {
    pushToUndoStack();
    const updated = { ...calendarLogs };
    dateStrings.forEach(date => {
      updated[date] = { status, shift, notes };
    });
    setCalendarLogs(updated);
    triggerBanner(`Bulk updated ${dateStrings.length} days successfully.`);
  };

  const removeAttendanceForDate = (dateString) => {
    pushToUndoStack();
    const updated = { ...calendarLogs };
    delete updated[dateString];
    setCalendarLogs(updated);
    triggerBanner(`Cleared log entry for ${dateString}.`);
  };



  // 5. Holiday CRUD
  const addHoliday = (name, date) => {
    const newHol = { id: Date.now(), name, date };
    setHolidays([...holidays, newHol]);
    triggerBanner(`Added Holiday: ${name}`);
  };

  const deleteHoliday = (id) => {
    setHolidays(holidays.filter(h => h.id !== id));
    triggerBanner('Removed holiday.');
  };

  // 5b. Course / Shift / Project CRUD
  const deleteCourse = (id, name) => {
    setSubjects(subjects.filter(s => s.id !== id));
    triggerBanner(`Deleted course: ${name}`);
  };



  const deleteProject = (id, name) => {
    setProjects(projects.filter(p => p.id !== id));
    triggerBanner(`Deleted project: ${name}`);
  };

  const logAttendance = (itemId, status, notes = '', extra = {}) => {
    const newRecord = {
      id: Date.now(),
      status,
      notes,
      timestamp: Date.now(),
      ...extra
    };

    if (role === 'student') {
      newRecord.subjectId = itemId;
    } else if (role === 'employee' || role === 'shiftworker') {
      newRecord.shiftId = itemId;
      newRecord.companyId = itemId;
    } else if (role === 'freelancer') {
      newRecord.projectId = itemId;
    } else {
      newRecord.companyId = itemId;
    }

    setRecords([newRecord, ...records]);
    triggerBanner(`Attendance logged: ${status}`);
  };

  const deleteRecord = (id) => {
    setRecords(records.filter(r => r.id !== id));
    triggerBanner('Removed attendance record.');
  };

  const startRosterSession = (itemId) => {
    triggerBanner('Roster session started.');
  };

  // 6. Streak counter
  const calculateStreak = () => {
    const presentDates = Object.keys(calendarLogs)
      .filter(date => calendarLogs[date].status === 'PRESENT' || calendarLogs[date].status === 'HALFDAY' || calendarLogs[date].status === 'WFH')
      .sort((a, b) => new Date(b) - new Date(a));

    if (presentDates.length === 0) return 0;

    let streak = 0;
    let expected = new Date();
    expected.setHours(0, 0, 0, 0);

    const lastDate = new Date(presentDates[0]);
    lastDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(expected - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0;

    for (let i = 0; i < presentDates.length; i++) {
      const d = new Date(presentDates[i]);
      d.setHours(0, 0, 0, 0);
      
      const expectedCheck = new Date(expected);
      expectedCheck.setDate(expected.getDate() - i);
      expectedCheck.setHours(0, 0, 0, 0);

      if (d.getTime() === expectedCheck.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // 7. General CSV Report Exporter
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Status,Shift,Notes\r\n';
    Object.keys(calendarLogs).forEach(date => {
      const log = calendarLogs[date];
      csvContent += `${date},${log.status},${log.shift},"${log.notes}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'attendancex_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBanner('Report downloaded successfully!');
  };

  // 8. Advanced Local Backup System Intents
  const triggerManualBackup = (encrypted = false) => {
    const database = {
      companies,
      calendarLogs,
      leaves,
      notes,
      holidays,
      userName,
      role,
      subjects,
      shifts,
      projects,
      records,
      themeMode,
      notificationsEnabled,
      reminderTime,
      appLanguage,
      defaultCalendarView,
      appLockEnabled,
      appLockPin,
      biometricEnabled
    };

    let dataStr = JSON.stringify(database, null, 2);
    let filename = `attendancex_backup_${Date.now()}.json`;

    if (encrypted) {
      dataStr = encryptString(dataStr);
      filename = `attendancex_backup_encrypted_${Date.now()}.axb`; // Custom encrypted extension axb
    }

    const blob = new Blob([dataStr], { type: encrypted ? 'text/plain' : 'application/json' });
    const sizeKb = (blob.size / 1024).toFixed(2);
    
    // Download backup file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save backup to history list
    const newBackup = {
      id: Date.now(),
      filename,
      timestamp: Date.now(),
      size: `${sizeKb} KB`,
      encrypted,
      data: dataStr // Keep cached data in storage
    };

    setBackupHistory([newBackup, ...backupHistory]);
    triggerBanner(`Backup created: ${sizeKb} KB`);
  };

  // Automatic Background Backups
  const restoreFromBackup = (dataStr, encrypted = false) => {
    try {
      let parsedStr = dataStr;
      if (encrypted) {
        parsedStr = decryptString(dataStr);
      }

      const data = JSON.parse(parsedStr);
      if (data.calendarLogs) {
        setCalendarLogs(data.calendarLogs);
        if (data.companies) setCompanies(data.companies);
        if (data.leaves) setLeaves(data.leaves);
        if (data.holidays) setHolidays(data.holidays);
        if (data.userName) setUserName(data.userName);
        if (data.role) setRole(data.role);
        if (data.subjects) setSubjects(data.subjects);
        if (data.projects) setProjects(data.projects);
        if (data.records) setRecords(data.records);
        
        if (data.themeMode) setThemeMode(data.themeMode);
        if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
        if (data.reminderTime) setReminderTime(data.reminderTime);
        if (data.appLanguage) setAppLanguage(data.appLanguage);
        if (data.defaultCalendarView) setDefaultCalendarView(data.defaultCalendarView);
        if (data.appLockEnabled !== undefined) setAppLockEnabled(data.appLockEnabled);
        if (data.appLockPin !== undefined) setAppLockPin(data.appLockPin);
        if (data.biometricEnabled !== undefined) setBiometricEnabled(data.biometricEnabled);

        triggerBanner('Database backup restored successfully!');
      } else {
        triggerBanner('Error: Invalid JSON database backup format!');
      }
    } catch (err) {
      console.error('Restore failed', err);
      triggerBanner('Error: Decryption or parsing failed!');
    }
  };

  const deleteBackupFromHistory = (id) => {
    setBackupHistory(backupHistory.filter(b => b.id !== id));
    triggerBanner('Removed backup log.');
  };

  return (
    <AppContext.Provider value={{
      userName, setUserName,
      drawerOpen, setDrawerOpen,
      activeCompanyId, setActiveCompanyId,
      lastCompanyId,
      companies, addCompany, editCompany, deleteCompany, toggleArchiveCompany,
      calendarLogs, logAttendanceForDate, removeAttendanceForDate, bulkUpdateDates,
      leaves, setLeaves, logLeave: () => {}, deleteLeave: () => {},
      notes: [], addNote: () => {}, deleteNote: () => {},
      holidays, addHoliday, deleteHoliday,
      streak: calculateStreak(),
      undoBannerActive, undoLastChange,
      backupHistory, autoBackupEnabled, setAutoBackupEnabled,
      triggerManualBackup, restoreFromBackup, deleteBackupFromHistory,
      exportCSV,
      banner, triggerBanner,
      role, setRole,
      subjects, setSubjects, deleteCourse,
      shifts: [], setShifts: () => {}, deleteShift: () => {},
      projects, setProjects, deleteProject,
      records, setRecords, logAttendance, deleteRecord, startRosterSession,
      themeMode, setThemeMode,
      notificationsEnabled, setNotificationsEnabled,
      reminderTime, setReminderTime,
      appLanguage, setAppLanguage,
      defaultCalendarView, setDefaultCalendarView,
      appLockEnabled, setAppLockEnabled,
      appLockPin, setAppLockPin,
      biometricEnabled, setBiometricEnabled
    }}>
      {children}
    </AppContext.Provider>
  );
};
