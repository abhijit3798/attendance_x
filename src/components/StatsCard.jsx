import React from 'react';

export default function StatsCard({ title, value, icon, colorHex, label, ariaLabel }) {
  return (
    <div 
      className="metric-card" 
      role="region" 
      aria-label={ariaLabel || `${title} Metric`}
    >
      <div className="metric-header">
        <div 
          className="metric-icon" 
          style={{ 
            backgroundColor: `rgba(${hexToRgb(colorHex)}, 0.12)`, 
            color: colorHex 
          }}
        >
          {icon}
        </div>
      </div>
      <div className="metric-value" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="metric-label" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      {label && (
        <div style={{ fontSize: '11px', color: colorHex, fontWeight: '700', marginTop: '4px' }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Helper to convert hex to rgb for container backgrounds
function hexToRgb(hex) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
