import React, { useState } from 'react';

export const GlassCard = ({ children, className = '', theme = 'green', onMouseEnter, onMouseLeave, onClick }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const gradientClass = theme !== 'pink' 
    ? 'from-emerald-400 via-teal-400 to-cyan-400' 
    : 'from-pink-400 via-red-400 to-purple-400';

  return (
    <div 
      className={`relative bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] group overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Interactive Radial Gradient */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} style={{ padding: '1px' }}>
        <div className="w-full h-full bg-transparent rounded-2xl"></div>
      </div>
      
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.15] via-white/[0.02] to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Subtle Neon Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-[0.08] blur-xl transition-all duration-500 pointer-events-none`}></div>
      
      {/* Content */}
      <div className="relative z-10 transition-all duration-500 group-hover:drop-shadow-md">
        {children}
      </div>
    </div>
  );
};
