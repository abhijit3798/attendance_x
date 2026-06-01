import React, { useState, useRef } from 'react';

export default function SwipeableRow({ children, onSwipeLeft, onSwipeRight, leftLabel = "Log Active", rightLabel = "Remove" }) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef(null);

  const touchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const touchMove = (e) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    // Cap swipe distance for visual aesthetics
    if (Math.abs(diff) < 120) {
      setCurrentX(diff);
    }
  };

  const touchEnd = () => {
    setIsSwiping(false);
    
    // Swipe thresholds to trigger actions
    if (currentX > 80 && onSwipeRight) {
      onSwipeRight();
    } else if (currentX < -80 && onSwipeLeft) {
      onSwipeLeft();
    }
    
    // Reset position
    setCurrentX(0);
  };

  return (
    <div 
      className="swipe-row-container" 
      ref={containerRef}
      onTouchStart={touchStart}
      onTouchMove={touchMove}
      onTouchEnd={touchEnd}
    >
      {/* Background Left - Slide Right (Success action) */}
      {currentX > 10 && onSwipeRight && (
        <div className="swipe-background-left">
          {leftLabel}
        </div>
      )}

      {/* Background Right - Slide Left (Danger action) */}
      {currentX < -10 && onSwipeLeft && (
        <div className="swipe-background-right">
          {rightLabel}
        </div>
      )}

      {/* Foreground Contents carrying children */}
      <div 
        className="swipe-foreground"
        style={{ 
          transform: `translateX(${currentX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
