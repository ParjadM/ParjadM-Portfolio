import React, { useEffect, useState } from 'react';

export const CustomCursor = ({ theme }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const target = e.target;
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer');
      
      setIsHovering(!!isClickable);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  // Only show on non-touch devices
  if (typeof navigator !== 'undefined' &&  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return null;
  }

  const color = theme === 'pink' ? 'rgba(244, 114, 182, 0.5)' : 'rgba(52, 211, 153, 0.5)';
  const ringColor = theme === 'pink' ? 'rgba(244, 114, 182, 1)' : 'rgba(52, 211, 153, 1)';

  return (
    <>
      <div
        className="fixed pointer-events-none z-[100] transition-opacity duration-300 hidden md:block"
        style={{
          left: position.x,
          top: position.y,
          opacity: isVisible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
        }}
      >
        <div 
          className="w-4 h-4 rounded-full transition-transform duration-200"
          style={{ backgroundColor: ringColor }}
        ></div>
      </div>
      <div
        className="fixed pointer-events-none z-[99] transition-all duration-500 ease-out hidden md:block"
        style={{
          left: position.x,
          top: position.y,
          opacity: isVisible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${isHovering ? 2 : 1})`,
        }}
      >
        <div 
          className="w-8 h-8 rounded-full border transition-all duration-300"
          style={{ borderColor: color, borderWidth: '1px' }}
        ></div>
      </div>
    </>
  );
};


