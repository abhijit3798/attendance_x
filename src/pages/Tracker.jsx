import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import SwipeableRow from '../components/SwipeableRow';
import { AddCourseDialog, AddShiftDialog, AddProjectDialog } from '../components/Dialogs';

export default function Tracker() {
  const {
    role,
    subjects, deleteCourse,
    shifts, deleteShift,
    projects, deleteProject,
    records, logAttendance, triggerBanner, startRosterSession
  } = useContext(AppContext);

  // Dialog states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  // 1. Math recovery algorithms
  const calculateRecovery = (attended, total, target) => {
    const ratio = target / 100;
    if (total === 0) return { safe: true, margin: 0 };
    const percentage = (attended / total) * 100;

    if (percentage >= target) {
      const maxMiss = Math.floor((attended - ratio * total) / ratio);
      return { safe: true, margin: maxMiss >= 0 ? maxMiss : 0 };
    } else {
      const need = Math.ceil((ratio * total - attended) / (1 - ratio));
      return { safe: false, margin: need };
    }
  };

  const validRecords = records.filter(r => r.status !== 'SESSION');

  return (
    <div className="tab-content" role="region" aria-label="Tracker Lists">
      {/* ---------------------------------------------------- */}
      {/* STUDENT PROFILE VIEW */}
      {/* ---------------------------------------------------- */}
      {role === 'student' && (
        <>
          {subjects.map(sub => {
            const subRecs = validRecords.filter(r => r.subjectId === sub.id);
            const total = subRecs.length;
            const attended = subRecs.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
            const percentage = total > 0 ? (attended / total) * 100 : 100;
            const recovery = calculateRecovery(attended, total, sub.targetPercentage);
            const themeColor = sub.color;

            return (
              <SwipeableRow 
                key={sub.id} 
                onSwipeRight={() => logAttendance(sub.id, 'PRESENT', 'Swiped present')} 
                onSwipeLeft={() => deleteCourse(sub.id, sub.name)}
                leftLabel="Mark Attended"
                rightLabel="Delete"
              >
                <div className="course-card" style={{ marginBottom: 0 }}>
                  <div className="course-accent" style={{ background: themeColor }}></div>
                  <div className="course-header">
                    <div className="course-title-group">
                      <h3>{sub.name}</h3>
                      <div className="course-meta">
                        {sub.room && <span className="meta-item">📍 {sub.room}</span>}
                        {sub.teacher && <span className="meta-item">👤 {sub.teacher}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="attendance-display">
                    <div>
                      <span className="attendance-percentage" style={{ color: percentage >= sub.targetPercentage ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="attendance-target">Target: {sub.targetPercentage}%</span>
                    </div>
                    <span className="attendance-ratio">{attended} / {total} Classes</span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(percentage, 100)}%`, background: themeColor }}></div>
                  </div>

                  {/* Recovery Calculator warning boxes */}
                  <div className={`recovery-box ${recovery.safe ? 'safe' : 'critical'}`}>
                    {recovery.safe ? (
                      recovery.margin > 0 ? (
                        <span>Safe Margin! You can miss the next <strong>{recovery.margin}</strong> classes.</span>
                      ) : (
                        <span>Marginal! You cannot afford to miss the next class.</span>
                      )
                    ) : (
                      <span>Critical! You must attend the next <strong>{recovery.margin}</strong> classes in a row.</span>
                    )}
                  </div>

                  {/* Control triggers */}
                  <div className="btn-group">
                    <button className="btn btn-success-outline" style={{ flex: 1 }} onClick={() => logAttendance(sub.id, 'PRESENT')}>Attended</button>
                    <button className="btn btn-danger-outline" style={{ flex: 1 }} onClick={() => logAttendance(sub.id, 'ABSENT')}>Missed</button>
                    <button className="btn btn-primary" style={{ flex: 1.2 }} onClick={() => startRosterSession(sub.id)}>Roll Call</button>
                  </div>
                </div>
              </SwipeableRow>
            );
          })}

          {subjects.length === 0 && (
            <div className="empty-state">
              <h3>Empty Courses</h3>
              <p>Add subjects using the "+" floating button below to unlock trackers.</p>
            </div>
          )}

          <button className="fab" onClick={() => setShowCourseModal(true)} aria-label="Add course item"><IconsAdd /></button>
          <AddCourseDialog open={showCourseModal} onClose={() => setShowCourseModal(false)} />
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* EMPLOYEE & SHIFTWORKER PROFILE VIEW */}
      {/* ---------------------------------------------------- */}
      {(role === 'employee' || role === 'shiftworker') && (
        <>
          {shifts.map(sh => {
            const shiftRecs = validRecords.filter(r => r.shiftId === sh.id);
            const completedHours = shiftRecs.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
            const percentage = Math.min((completedHours / sh.targetHours) * 100, 100);
            const isTargetMet = completedHours >= sh.targetHours;
            const themeColor = sh.color;

            // Shift duration calculator helper
            const getDuration = () => {
              const [shHour, shMin] = sh.startTime.split(':').map(Number);
              const [ehHour, ehMin] = sh.endTime.split(':').map(Number);
              let diff = (ehHour * 60 + ehMin) - (shHour * 60 + shMin);
              if (diff < 0) diff += 24 * 60;
              return diff / 60;
            };
            const duration = getDuration();

            return (
              <SwipeableRow 
                key={sh.id} 
                onSwipeRight={() => {
                  logAttendance(sh.id, 'CLOCKED_OUT', 'Shift logged', { hours: duration });
                  triggerBanner(`Logged ${sh.name}`);
                }}
                onSwipeLeft={() => deleteShift(sh.id, sh.name)}
                leftLabel="Log Completed"
                rightLabel="Delete"
              >
                <div className="course-card" style={{ marginBottom: 0 }}>
                  <div className="course-accent" style={{ background: themeColor }}></div>
                  <div className="course-header">
                    <div className="course-title-group">
                      <h3>{sh.name}</h3>
                      <div className="course-meta">
                        <span className="meta-item">⏱️ {sh.startTime} - {sh.endTime} ({duration.toFixed(1)} hrs)</span>
                      </div>
                    </div>
                  </div>

                  <div className="attendance-display">
                    <div>
                      <span className="attendance-percentage" style={{ color: isTargetMet ? 'var(--color-success)' : 'var(--color-primary)' }}>
                        {completedHours.toFixed(1)} hr
                      </span>
                      <span className="attendance-target">Target: {sh.targetHours} hr</span>
                    </div>
                    <span className="attendance-ratio">{shiftRecs.length} Shifts Logged</span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: themeColor }}></div>
                  </div>

                  <div className={`recovery-box ${isTargetMet ? 'safe' : 'critical'}`} style={{ color: isTargetMet ? 'var(--color-success)' : 'var(--color-warning)', background: isTargetMet ? 'var(--color-success-container)' : 'var(--color-warning-container)', borderColor: isTargetMet ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)' }}>
                    {isTargetMet ? (
                      <span>Target Met! You have completed your work hours for this shift.</span>
                    ) : (
                      <span>Target Hours Pending: <strong>{(sh.targetHours - completedHours).toFixed(1)} hrs</strong> remaining.</span>
                    )}
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                    logAttendance(sh.id, 'CLOCKED_OUT', 'Standard shift check-in', { hours: duration });
                  }}>
                    Log Completed Shift
                  </button>
                </div>
              </SwipeableRow>
            );
          })}

          {shifts.length === 0 && (
            <div className="empty-state">
              <h3>Empty Shifts</h3>
              <p>Add work schedule profiles using the "+" floating button below.</p>
            </div>
          )}

          <button className="fab" onClick={() => setShowShiftModal(true)} aria-label="Add shift item"><IconsAdd /></button>
          <AddShiftDialog open={showShiftModal} onClose={() => setShowShiftModal(false)} />
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* FREELANCER PROFILE VIEW */}
      {/* ---------------------------------------------------- */}
      {role === 'freelancer' && (
        <>
          {projects.map(proj => {
            const projRecs = validRecords.filter(r => r.projectId === proj.id);
            const billedHours = projRecs.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
            const earnings = projRecs.reduce((sum, r) => sum + (parseFloat(r.earnings) || 0), 0);
            const themeColor = proj.color;

            return (
              <SwipeableRow 
                key={proj.id} 
                onSwipeRight={() => {
                  const hours = parseFloat(prompt(`Enter billable hours spent on ${proj.name}:`, '2')) || 0;
                  if (hours <= 0) return;
                  const revenue = hours * proj.hourlyRate;
                  logAttendance(proj.id, 'BILLED', 'Billable task logged', { hours, earnings: revenue });
                }}
                onSwipeLeft={() => deleteProject(proj.id, proj.name)}
                leftLabel="Log Billable"
                rightLabel="Delete"
              >
                <div className="course-card" style={{ marginBottom: 0 }}>
                  <div className="course-accent" style={{ background: themeColor }}></div>
                  <div className="course-header">
                    <div className="course-title-group">
                      <h3>{proj.name}</h3>
                      <div className="course-meta">
                        {proj.client && <span className="meta-item">💼 Client: {proj.client}</span>}
                        <span className="meta-item">💵 Rate: ${proj.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="attendance-display">
                    <div>
                      <span className="attendance-percentage" style={{ color: 'var(--color-success)' }}>
                        ${earnings.toFixed(2)}
                      </span>
                      <span className="attendance-target">Accumulated Revenue</span>
                    </div>
                    <span className="attendance-ratio">{billedHours.toFixed(1)} Billable Hours</span>
                  </div>

                  <div className="btn-group">
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      const hours = parseFloat(prompt(`Enter billable hours spent on ${proj.name}:`, '4')) || 0;
                      if (hours <= 0) return;
                      const revenue = hours * proj.hourlyRate;
                      logAttendance(proj.id, 'BILLED', 'Recorded billable task hours', { hours, earnings: revenue });
                    }}>
                      Record Billable Hours
                    </button>
                  </div>
                </div>
              </SwipeableRow>
            );
          })}

          {projects.length === 0 && (
            <div className="empty-state">
              <h3>Empty Projects</h3>
              <p>Add freelancing contract targets using the "+" floating button below.</p>
            </div>
          )}

          <button className="fab" onClick={() => setShowProjModal(true)} aria-label="Add project item"><IconsAdd /></button>
          <AddProjectDialog open={showProjModal} onClose={() => setShowProjModal(false)} />
        </>
      )}
    </div>
  );
}

// Simple internal icon component for FAB
function IconsAdd() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  );
}
