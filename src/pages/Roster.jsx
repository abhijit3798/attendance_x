import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';
import { AddStudentDialog } from '../components/Dialogs';

export default function Roster() {
  const {
    students, removeStudent,
    subjects, activeSession, setActiveSession,
    markRosterStatus, getRosterMarkedStatus, triggerBanner
  } = useContext(AppContext);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const activeSubjectName = subjects.find(s => s.id === activeSession?.subjectId)?.name || 'Course';

  return (
    <div className="tab-content" role="region" aria-label="Roster Dashboard">
      {/* Active bulk session alert banner */}
      {activeSession ? (
        <div className="active-roster-alert">
          <div>
            <h4>Active Roll Call</h4>
            <p style={{ color: 'var(--color-on-primary-container)', opacity: 0.8 }}>
              Mark students for: <strong>{activeSubjectName}</strong>
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setActiveSession(null);
              triggerBanner('Completed bulk session taking!');
            }}
          >
            Finish
          </button>
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '500' }}>
          * Start bulk session roll-calls inside your course listings to check-in students.
        </p>
      )}

      {/* Catalog of profiles */}
      {students.map(stud => {
        const isSession = activeSession !== null;
        const status = isSession ? getRosterMarkedStatus(stud.id) : '';

        return (
          <div className="roster-card" key={stud.id}>
            <div className="roster-info">
              <div className="roster-name">
                <h4 style={{ color: 'var(--text-primary)' }}>{stud.name}</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  ID: {stud.rollNumber || 'N/A'} • {stud.email || 'No email'}
                </p>
              </div>
              {isSession ? (
                <span className={`roster-badge ${status.toLowerCase()}`}>
                  {status}
                </span>
              ) : (
                <button 
                  className="delete-btn" 
                  onClick={() => removeStudent(stud.id, stud.name)}
                  aria-label={`Delete student ${stud.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              )}
            </div>

            {/* Attendance selection keys */}
            {isSession && (
              <div className="roster-actions">
                <button
                  className={status === 'PRESENT' ? 'selected-present' : ''}
                  onClick={() => markRosterStatus(stud.id, 'PRESENT')}
                  aria-label={`Mark ${stud.name} Present`}
                >
                  Present
                </button>
                <button
                  className={status === 'ABSENT' ? 'selected-absent' : ''}
                  onClick={() => markRosterStatus(stud.id, 'ABSENT')}
                  aria-label={`Mark ${stud.name} Absent`}
                >
                  Absent
                </button>
                <button
                  className={status === 'LATE' ? 'selected-late' : ''}
                  onClick={() => markRosterStatus(stud.id, 'LATE')}
                  aria-label={`Mark ${stud.name} Late`}
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
          <h3>No Students Registered</h3>
          <p>Enroll student profiles using the FAB button to unlock roster directories.</p>
        </div>
      )}

      {/* Floating Action Button */}
      {!activeSession && (
        <button 
          className="fab" 
          onClick={() => setShowStudentModal(true)}
          aria-label="Add new student"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}

      <AddStudentDialog open={showStudentModal} onClose={() => setShowStudentModal(false)} />
    </div>
  );
}
