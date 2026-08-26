import React, { useState } from 'react';
import { getAccent } from '../../utils/themeTokens.js';

export const RippleButton = ({ children, onClick, className = '', theme = 'green', ...props }) => {
  const [ripples, setRipples] = useState([]);
  const accent = getAccent(theme);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  const gradientClass = accent.gradientBtn;

  return (
    <button
      className={`relative overflow-hidden transform transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-95 ${gradientClass} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms',
          }}
        />
      ))}
      
      {/* Button Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
