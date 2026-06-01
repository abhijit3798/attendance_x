import React, { useState, useEffect } from 'react';

// Custom inline SVG Icons for maximum performance and offline compliance
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  Courses: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  Roster: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Add: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Place: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  Person: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Close: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  Delete: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Export: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  )
};

export default function App() {
  // ----------------------------------------------------
  // Persistent State Management (IndexedDB/LocalStorage fallback)
  // ----------------------------------------------------
  const [subjects, setSubjects] = useState(() => {
    const local = localStorage.getItem('ax_subjects');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Mathematics', room: 'Lobby A', teacher: 'Dr. Euler', targetPercentage: 75.0, color: '#6366F1' },
      { id: 2, name: 'Physics Mechanics', room: 'Lab 402', teacher: 'Prof. Newton', targetPercentage: 75.0, color: '#8B5CF6' }
    ];
  });

  const [students, setStudents] = useState(() => {
    const local = localStorage.getItem('ax_students');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Alice Smith', rollNumber: 'CS-101', email: 'alice@univ.edu' },
      { id: 2, name: 'Bob Johnson', rollNumber: 'CS-102', email: 'bob@univ.edu' }
    ];
  });

  const [records, setRecords] = useState(() => {
    const local = localStorage.getItem('ax_records');
    return local ? JSON.parse(local) : [];
  });

  const [studentAttendance, setStudentAttendance] = useState(() => {
    const local = localStorage.getItem('ax_student_attendance');
    return local ? JSON.parse(local) : [];
  });

  // Navigation and overlay dialog visibility states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [activeSession, setActiveSession] = useState(null); // { subjectId, recordId }

  // New Course inputs
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseRoom, setNewCourseRoom] = useState('');
  const [newCourseTeacher, setNewCourseTeacher] = useState('');
  const [newCourseTarget, setNewCourseTarget] = useState('75');
  const courseColors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#F43F5E'];
  const [newCourseColor, setNewCourseColor] = useState(courseColors[0]);

  // New Student inputs
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Quick check-in helper inputs
  const [quickSubId, setQuickSubId] = useState('');
  const [quickStatus, setQuickStatus] = useState('PRESENT');

  // Custom Reactive Banner Toast State
  const [banner, setBanner] = useState({ active: false, text: '' });

  // Sync state changes to storage
  useEffect(() => {
    localStorage.setItem('ax_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('ax_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ax_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('ax_student_attendance', JSON.stringify(studentAttendance));
  }, [studentAttendance]);

  // Banner trigger utility
  const triggerBanner = (msg) => {
    setBanner({ active: true, text: msg });
    setTimeout(() => {
      setBanner({ active: false, text: '' });
    }, 3000);
  };

  // ----------------------------------------------------
  // Core Statistics Calculations
  // ----------------------------------------------------
  // Exclude bulk helper "SESSION" marks for stats
  const validRecords = records.filter(r => r.status !== 'SESSION');
  const overallTotal = validRecords.length;
  const overallPresent = validRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const overallPercentage = overallTotal > 0 ? (overallPresent / overallTotal) * 100 : 100.0;

  // Breakdown statistics per course: subjectId -> Pair(Present count, Total count)
  const courseStats = {};
  subjects.forEach(sub => {
    const subRecords = validRecords.filter(r => r.subjectId === sub.id);
    const subTotal = subRecords.length;
    const subPresent = subRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    courseStats[sub.id] = { present: subPresent, total: subTotal };
  });

  // ----------------------------------------------------
  // Actions / Intents
  // ----------------------------------------------------
  const addCourse = () => {
    if (!newCourseName.trim()) return;
    const target = parseFloat(newCourseTarget) || 75;
    const newSub = {
      id: Date.now(),
      name: newCourseName,
      room: newCourseRoom,
      teacher: newCourseTeacher,
      targetPercentage: target,
      color: newCourseColor
    };
    setSubjects([...subjects, newSub]);
    triggerBanner(`Added Course: ${newCourseName}`);
    // Clear inputs
    setNewCourseName('');
    setNewCourseRoom('');
    setNewCourseTeacher('');
    setNewCourseTarget('75');
    setNewCourseColor(courseColors[0]);
    setShowAddCourse(false);
  };

  const deleteCourse = (id, name) => {
    if (window.confirm(`Delete ${name} and all associated attendance logs?`)) {
      setSubjects(subjects.filter(s => s.id !== id));
      setRecords(records.filter(r => r.subjectId !== id));
      triggerBanner(`Removed Course: ${name}`);
    }
  };

  const addStudent = () => {
    if (!newStudentName.trim()) return;
    const newStud = {
      id: Date.now(),
      name: newStudentName,
      rollNumber: newStudentRoll,
      email: newStudentEmail
    };
    setStudents([...students, newStud]);
    triggerBanner(`Enrolled Student: ${newStudentName}`);
    setNewStudentName('');
    setNewStudentRoll('');
    setNewStudentEmail('');
    setShowAddStudent(false);
  };

  const deleteStudent = (id, name) => {
    if (window.confirm(`Remove student ${name}?`)) {
      setStudents(students.filter(s => s.id !== id));
      setStudentAttendance(studentAttendance.filter(a => a.studentId !== id));
      triggerBanner(`Removed Student: ${name}`);
    }
  };

  const logAttendance = (subjectId, status, notes = 'Manual check-in') => {
    const newRecord = {
      id: Date.now(),
      subjectId,
      timestamp: Date.now(),
      status,
      notes
    };
    setRecords([newRecord, ...records]);
    const subName = subjects.find(s => s.id === subjectId)?.name || 'Course';
    triggerBanner(`Marked ${status} for ${subName}`);

    // Check-in safety logic alert check
    const currentStats = courseStats[subjectId] || { present: 0, total: 0 };
    const newTotal = currentStats.total + 1;
    const newPresent = currentStats.present + (status === 'PRESENT' || status === 'LATE' ? 1 : 0);
    const newPercentage = (newPresent / newTotal) * 100;
    const target = subjects.find(s => s.id === subjectId)?.targetPercentage || 75;

    if (newPercentage < target) {
      setTimeout(() => {
        triggerBanner(`Warning: ${subName} attendance dropped below ${target}%!`);
      }, 1000);
    }
  };

  const deleteRecord = (id) => {
    if (window.confirm('Delete this log entry?')) {
      setRecords(records.filter(r => r.id !== id));
      triggerBanner('Deleted attendance record.');
    }
  };

  // Bulk roll call sessions
  const startRosterSession = (subjectId) => {
    const recId = Date.now();
    const sessionRecord = {
      id: recId,
      subjectId,
      timestamp: Date.now(),
      status: 'SESSION',
      notes: 'Roster roll call session'
    };
    // Add record session
    setRecords([sessionRecord, ...records]);
    setActiveSession({ subjectId, recordId: recId });
    setActiveTab('roster');
    triggerBanner('Started Roll Call. Please mark student statuses.');
  };

  const markRosterStatus = (studentId, status) => {
    if (!activeSession) return;
    const recordId = activeSession.recordId;
    // Remove existing if marked, then add new
    const clean = studentAttendance.filter(a => !(a.studentId === studentId && a.recordId === recordId));
    setStudentAttendance([...clean, { studentId, recordId, status }]);
  };

  const getRosterMarkedStatus = (studentId) => {
    if (!activeSession) return 'ABSENT';
    const match = studentAttendance.find(a => a.studentId === studentId && a.recordId === activeSession.recordId);
    return match ? match.status : 'ABSENT';
  };

  // CSV Exporter
  const exportCSV = () => {
    if (records.length === 0) {
      triggerBanner('No logs available to export!');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Time,Course,Status,Notes\r\n';

    records.forEach(r => {
      const date = new Date(r.timestamp);
      const sub = subjects.find(s => s.id === r.subjectId)?.name || 'Unknown';
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString().replace(/,/g, '');
      csvContent += `${formattedDate},${formattedTime},"${sub}",${r.status},"${r.notes}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ax_attendance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBanner('Exported CSV successfully!');
  };

  // ----------------------------------------------------
  // Dynamic Mathematical Computations
  // ----------------------------------------------------
  const calculateRecovery = (attended, total, target) => {
    const ratio = target / 100;
    if (total === 0) return { safe: true, margin: 0 };
    const percentage = (attended / total) * 100;

    if (percentage >= target) {
      // Safe: Attended / (Total + X) >= Ratio => X <= (Attended - Ratio * Total) / Ratio
      const maxMiss = Math.floor((attended - ratio * total) / ratio);
      return { safe: true, margin: maxMiss >= 0 ? maxMiss : 0 };
    } else {
      // Critical: (Attended + Y) / (Total + Y) >= Ratio => Y >= (Ratio * Total - Attended) / (1 - Ratio)
      const need = Math.ceil((ratio * total - attended) / (1 - ratio));
      return { safe: false, margin: need };
    }
  };

  // Date formatted
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="app-container">
      {/* Dynamic Toast banner notifications */}
      <div className={`notification-banner ${banner.active ? 'active' : ''}`}>
        <div className="notification-content">
          <div style={{ color: 'var(--success)' }}>
            <Icons.Check />
          </div>
          <div className="notification-text">{banner.text}</div>
        </div>
      </div>

      {/* Sticky Header Top App Bar */}
      <header className="top-bar">
        <div>
          <h1>Attendance X</h1>
          <div className="date">{todayStr}</div>
        </div>
        {activeTab === 'dashboard' && validRecords.length > 0 && (
          <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={exportCSV}>
            <Icons.Export /> Export
          </button>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* DASHBOARD TAB VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="tab-content">
          {/* Ring statistics display card */}
          <div className="stats-ring-card">
            <div className="ring-container">
              <svg width="96" height="96" className="svg-ring">
                <defs>
                  <linearGradient id="indigoVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>
                <circle cx="48" cy="48" r="40" className="ring-bg" strokeWidth="8" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="ring-progress"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - overallPercentage / 100)}
                />
              </svg>
              <div className="percentage-text" style={{ color: overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                {overallPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="stats-info">
              <h3>Overall Attendance</h3>
              <p style={{ color: overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
                {overallPercentage >= 75 ? 'You are safely above the 75% target limit.' : 'Critical! You are below target.'}
              </p>
            </div>
          </div>

          {/* Metric grid counters */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>
                  <Icons.Check />
                </div>
              </div>
              <div className="metric-value">{overallPresent}</div>
              <div className="metric-label">Classes Attended</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'var(--danger-glow)', color: 'var(--danger)' }}>
                  <Icons.Close style={{ strokeWidth: '3px' }} />
                </div>
              </div>
              <div className="metric-value">{overallTotal - overallPresent}</div>
              <div className="metric-label">Classes Missed</div>
            </div>
          </div>

          {/* Quick logger dashboard panel */}
          {subjects.length > 0 && (
            <div className="action-card">
              <h3>Quick Logging</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select
                    className="form-control"
                    value={quickSubId}
                    onChange={(e) => setQuickSubId(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (!quickSubId) {
                        triggerBanner('Please select a course!');
                        return;
                      }
                      logAttendance(parseInt(quickSubId), 'PRESENT');
                    }}
                  >
                    Mark Attended
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={() => {
                      if (!quickSubId) {
                        triggerBanner('Please select a course!');
                        return;
                      }
                      logAttendance(parseInt(quickSubId), 'ABSENT');
                    }}
                  >
                    Mark Missed
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty Course states */}
          {subjects.length === 0 && (
            <div className="empty-state">
              <Icons.Courses />
              <h3>No courses added yet!</h3>
              <p>Go to the Courses tab and add your first course to begin logging your class attendance.</p>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* COURSES TAB VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'courses' && (
        <div className="tab-content">
          {subjects.map(sub => {
            const stats = courseStats[sub.id] || { present: 0, total: 0 };
            const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 100;
            const recovery = calculateRecovery(stats.present, stats.total, sub.targetPercentage);
            const themeColor = sub.color;

            return (
              <div className="course-card" key={sub.id}>
                <div className="course-accent" style={{ background: themeColor }}></div>
                <div className="course-header">
                  <div className="course-title-group">
                    <h3>{sub.name}</h3>
                    <div className="course-meta">
                      {sub.room && <span className="meta-item"><Icons.Place /> {sub.room}</span>}
                      {sub.teacher && <span className="meta-item"><Icons.Person /> {sub.teacher}</span>}
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => deleteCourse(sub.id, sub.name)}>
                    <Icons.Delete />
                  </button>
                </div>

                <div className="attendance-display">
                  <div>
                    <span className="attendance-percentage" style={{ color: percentage >= sub.targetPercentage ? 'var(--success)' : 'var(--danger)' }}>
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="attendance-target">Target: {sub.targetPercentage}%</span>
                  </div>
                  <span className="attendance-ratio">{stats.present} / {stats.total} Classes</span>
                </div>

                {/* Linear progress bar */}
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: `linear-gradient(90deg, ${themeColor}, #a5b4fc)`
                    }}
                  ></div>
                </div>

                {/* Safety margins Warning / Success box */}
                <div className={`recovery-box ${recovery.safe ? 'safe' : 'critical'}`}>
                  <div style={{ transform: 'scale(1.2)' }}>
                    <Icons.Check />
                  </div>
                  <div>
                    {recovery.safe ? (
                      recovery.margin > 0 ? (
                        <span>Safe Margin! You can miss the next <strong>{recovery.margin}</strong> classes straight.</span>
                      ) : (
                        <span>Marginal! You cannot afford to miss the next class session.</span>
                      )
                    ) : (
                      <span>Critical! You must attend the next <strong>{recovery.margin}</strong> classes in a row to recover.</span>
                    )}
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="btn-group">
                  <button className="btn btn-success-outline" style={{ flex: 1 }} onClick={() => logAttendance(sub.id, 'PRESENT')}>
                    Attended
                  </button>
                  <button className="btn btn-danger-outline" style={{ flex: 1 }} onClick={() => logAttendance(sub.id, 'ABSENT')}>
                    Missed
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1.2 }} onClick={() => startRosterSession(sub.id)}>
                    Roll Call
                  </button>
                </div>
              </div>
            );
          })}

          {subjects.length === 0 && (
            <div className="empty-state">
              <Icons.Courses />
              <h3>Course catalog is empty</h3>
              <p>Add courses like Mathematics, Chemistry or Physics using the "+" floating action button below.</p>
            </div>
          )}

          {/* Floating Action Button */}
          <button className="fab" onClick={() => setShowAddCourse(true)}>
            <Icons.Add />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ROSTER TAB VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'roster' && (
        <div className="tab-content">
          {/* Active Roster take bar alert */}
          {activeSession ? (
            <div className="active-roster-alert">
              <div>
                <h4>Active Roll Call</h4>
                <p>Course: {subjects.find(s => s.id === activeSession.subjectId)?.name}</p>
              </div>
              <button className="btn btn-primary" onClick={() => {
                setActiveSession(null);
                triggerBanner('Roll call completed! Roster records locked.');
              }}>
                Finish
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '500' }}>
              Note: Select "Roll Call" inside any course card to take a live class roll check.
            </p>
          )}

          {/* Student marking card catalog */}
          {students.map(stud => {
            const isSession = activeSession !== null;
            const status = isSession ? getRosterMarkedStatus(stud.id) : '';

            return (
              <div className="roster-card" key={stud.id}>
                <div className="roster-info">
                  <div className="roster-name">
                    <h4>{stud.name}</h4>
                    <p>Roll: {stud.rollNumber || 'N/A'} • {stud.email || 'No email'}</p>
                  </div>
                  {isSession ? (
                    <span className={`roster-badge ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  ) : (
                    <button className="delete-btn" onClick={() => deleteStudent(stud.id, stud.name)}>
                      <Icons.Delete />
                    </button>
                  )}
                </div>

                {isSession && (
                  <div className="roster-actions">
                    <button
                      className={status === 'PRESENT' ? 'selected-present' : ''}
                      onClick={() => markRosterStatus(stud.id, 'PRESENT')}
                    >
                      Present
                    </button>
                    <button
                      className={status === 'ABSENT' ? 'selected-absent' : ''}
                      onClick={() => markRosterStatus(stud.id, 'ABSENT')}
                    >
                      Absent
                    </button>
                    <button
                      className={status === 'LATE' ? 'selected-late' : ''}
                      onClick={() => markRosterStatus(stud.id, 'LATE')}
                    >
                      Late
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {students.length === 0 && (
            <div className="empty-state">
              <Icons.Roster />
              <h3>Student roster is empty</h3>
              <p>Enroll students by clicking the "+" floating button. You can then mark bulk class rolls.</p>
            </div>
          )}

          {/* Floating Action Button */}
          {!activeSession && (
            <button className="fab" onClick={() => setShowAddStudent(true)}>
              <Icons.Add />
            </button>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* HISTORY TAB VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="tab-content">
          {validRecords.map(rec => {
            const sub = subjects.find(s => s.id === rec.subjectId);
            const date = new Date(rec.timestamp);
            const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div className="history-card" key={rec.id} style={{ borderLeftColor: sub?.color || 'var(--primary)' }}>
                <div className="history-left">
                  <div className="history-indicator" style={{ background: sub?.color || 'var(--primary)' }}></div>
                  <div className="history-details">
                    <h4>{sub?.name || 'Deleted Course'}</h4>
                    <p>{formatted} {rec.notes && rec.notes !== 'Manual check-in' && `• ${rec.notes}`}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`history-badge ${rec.status.toLowerCase()}`}>
                    {rec.status}
                  </span>
                  <button className="delete-btn" onClick={() => deleteRecord(rec.id)}>
                    <Icons.Delete />
                  </button>
                </div>
              </div>
            );
          })}

          {validRecords.length === 0 && (
            <div className="empty-state">
              <Icons.History />
              <h3>No history logs recorded</h3>
              <p>Mark attendance inside your course modules or check-in quickly from the dashboard to display logs.</p>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DIALOGS AND BOTTOM SHEET POPUPS */}
      {/* ---------------------------------------------------- */}

      {/* Add Course popup sheet */}
      {showAddCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Course</h3>
              <button className="modal-close" onClick={() => setShowAddCourse(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="form-group">
              <label>Course Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mathematics"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Room / Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Hall B / Lab 2"
                value={newCourseRoom}
                onChange={(e) => setNewCourseRoom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Teacher</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. Euler"
                value={newCourseTeacher}
                onChange={(e) => setNewCourseTeacher(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Target Attendance Percentage</label>
              <input
                type="number"
                className="form-control"
                placeholder="75"
                value={newCourseTarget}
                onChange={(e) => setNewCourseTarget(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Select Tag Color</label>
              <div className="color-picker-grid">
                {courseColors.map(c => (
                  <div
                    key={c}
                    className={`color-dot ${newCourseColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewCourseColor(c)}
                  >
                    {newCourseColor === c && <Icons.Check style={{ stroke: 'white' }} />}
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={addCourse}>
              Add Course
            </button>
          </div>
        </div>
      )}

      {/* Add Student popup sheet */}
      {showAddStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Enroll Student</h3>
              <button className="modal-close" onClick={() => setShowAddStudent(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bob Johnson"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Roll Number / ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CS-102"
                value={newStudentRoll}
                onChange={(e) => setNewStudentRoll(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. bob@univ.edu"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={addStudent}>
              Enroll Student
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bottom Bar */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Icons.Dashboard />
          <span>Dashboard</span>
        </button>
        <button className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          <Icons.Courses />
          <span>Courses</span>
        </button>
        <button className={`nav-item ${activeTab === 'roster' ? 'active' : ''}`} onClick={() => setActiveTab('roster')}>
          <Icons.Roster />
          <span>Roster</span>
        </button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <Icons.History />
          <span>History</span>
        </button>
      </nav>
    </div>
  );
}
