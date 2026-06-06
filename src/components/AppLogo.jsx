import React from 'react';

export default function AppLogo({ size = 34, style }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      style={{ 
        display: 'block', 
        flexShrink: 0, 
        WebkitTextFillColor: 'initial', // Avoid inheriting parent transparent text-clipping
        ...style 
      }}
      aria-hidden="true"
    >
      {/* Circle background in white, border in emerald green */}
      <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#10B981" strokeWidth="6" />
      
      {/* Calendar outlines in dark navy (#0F172A) */}
      <rect x="25" y="32" width="50" height="42" rx="6" fill="none" stroke="#0F172A" strokeWidth="5.5" />
      
      {/* Calendar Rings */}
      <line x1="38" y1="26" x2="38" y2="34" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="62" y1="26" x2="62" y2="34" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
      
      {/* Calendar Grid Divider */}
      <line x1="25" y1="46" x2="75" y2="46" stroke="#0F172A" strokeWidth="4.5" />
      
      {/* Big "A" in Dark Navy inside the calendar */}
      <text 
        x="50" 
        y="65" 
        fontSize="17" 
        fontWeight="900" 
        fontFamily="'Outfit', 'Inter', sans-serif" 
        textAnchor="middle" 
        fill="#0F172A"
        style={{ WebkitTextFillColor: '#0F172A' }}
      >
        A
      </text>
      
      {/* White circle badge for checkmark at bottom-right */}
      <circle cx="70" cy="70" r="16" fill="#FFFFFF" stroke="#10B981" strokeWidth="3.5" />
      
      {/* Green checkmark inside badge */}
      <path 
        d="M64 70 L68 74 L76 64" 
        fill="none" 
        stroke="#10B981" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
