import { useContext, useState } from 'react';
import { AppContext } from '../context/AppState';

export default function About() {
  const { triggerBanner } = useContext(AppContext);
  
  // Custom dialog toggles
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [userStars, setUserStars] = useState(5);
  
  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AttendanceX',
        text: 'Download AttendanceX to manage your attendance, shifts, leaves, and reports easily!',
        url: window.location.origin
      }).catch(err => console.log('Share failed', err));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      triggerBanner('App Share Link copied to clipboard!');
    }
  };

  const submitRating = () => {
    setShowRating(false);
    triggerBanner(`Thank you for rating us ${userStars} Stars!`);
  };

  return (
    <div className="tab-content" role="region" aria-label="About App Information">
      
      {/* Brand Hero Card */}
      <div className="action-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.3))' }}>🟢</div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          AttendanceX
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '800', background: 'var(--color-primary-container)', padding: '4px 12px', borderRadius: '10px', display: 'inline-block', marginTop: '6px' }}>
          Version 1.0.0 (Release Build)
        </span>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '24px auto', maxWidth: '360px', lineHeight: '1.6', fontWeight: '500' }}>
          AttendanceX helps users manage attendance, shifts, leave and reports.
        </p>

        {/* Specifications list */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Developed By</span>
            <strong style={{ color: 'var(--text-primary)' }}>Stark Labs AI</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Copyright</span>
            <strong style={{ color: 'var(--text-primary)' }}>© 2026 Stark Labs AI</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Engine Target</span>
            <strong style={{ color: 'var(--text-primary)' }}>Android 10+ (API 29+)</strong>
          </div>
        </div>
      </div>

      {/* Modern Interaction Buttons Grid */}
      <div className="action-card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>Quick Interactions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowPrivacy(true)}>
            📄 Privacy Policy
          </button>
          <button className="btn btn-secondary" onClick={shareApp}>
            🔗 Share App
          </button>
          <button className="btn btn-secondary" onClick={() => setShowRating(true)}>
            ⭐ Rate App
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => window.open('mailto:support@starklabs.ai?subject=AttendanceX%20Feedback')}
          >
            ✉️ Contact Support
          </button>
        </div>
      </div>

      {/* 1. Privacy Policy Modal dialog */}
      {showPrivacy && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true" aria-label="Privacy Policy Modal">
            <div className="modal-header">
              <h3>Privacy Policy</h3>
              <button className="modal-close" onClick={() => setShowPrivacy(false)}>×</button>
            </div>
            
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '6px' }}>
              <p>
                Stark Labs AI is committed to securing your personal tracking data.
              </p>
              <strong>1. Data Minimization</strong>
              <p>
                All attendance, schedules, leaves, and custom notebooks logs remain completely on your local device. No telemetry data is captured or shared.
              </p>
              <strong>2. Data Encryption</strong>
              <p>
                Backup databases exported through `.axb` files are protected by custom Unicode XOR encryption to prevent external tampering during downloads.
              </p>
              <strong>3. Offline Isolation</strong>
              <p>
                This Progressive Web Application runs entirely in isolated sandboxed sandboxes with complete offline capability, ensuring no background server pings.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowPrivacy(false)}>
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* 2. Rate App Modal dialog */}
      {showRating && (
        <div className="modal-overlay">
          <div className="modal-content" role="dialog" aria-modal="true" aria-label="Rate App Modal">
            <div className="modal-header">
              <h3>Rate AttendanceX</h3>
              <button className="modal-close" onClick={() => setShowRating(false)}>×</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
              How would you rate your tracking experience on Android?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '32px', marginBottom: '24px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  onClick={() => setUserStars(star)}
                  style={{ opacity: userStars >= star ? 1 : 0.25, transition: 'all 0.15s ease' }}
                >
                  ⭐
                </span>
              ))}
            </div>

            <div className="btn-group">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRating(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={submitRating}>
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
