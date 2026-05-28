import React, { useState } from 'react';

export const GlassCard = ({ children, className = '', theme = 'green', onMouseEnter, onMouseLeave, onClick }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const gradientClass = theme === 'green' 
    ? 'from-emerald-400 via-teal-400 to-cyan-400' 
    : 'from-pink-400 via-red-400 to-purple-400';

  return (
    <div 
      className={`relative bg-white/[0.08] backdrop-blur-lg rounded-2xl border border-white/10 shadow-md transition-all duration-300 hover:border-white/20 hover:shadow-xl group overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { setIsHovered(true); onMouseEnter && onMouseEnter(e); }}
      onMouseLeave={(e) => { setIsHovered(false); onMouseLeave && onMouseLeave(e); }}
      onClick={onClick}
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.05), transparent 40%)`,
      }}
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} style={{ padding: '1px' }}>
        <div className="w-full h-full bg-transparent rounded-2xl"></div>
      </div>
      
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
      
      {/* Subtle Neon Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-[0.08] blur-lg transition-all duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10 group-hover:drop-shadow-sm">
        {children}
      </div>
    </div>
  );
};
