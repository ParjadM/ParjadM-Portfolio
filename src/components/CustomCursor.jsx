import React, { useEffect, useRef } from 'react';

export const CustomCursor = ({ theme, darkMode = true, reducedMotion = false }) => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rafRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const hoveringRef = useRef(false);
  const visibleRef = useRef(false);

  const color = theme === 'pink' ? 'rgba(244, 114, 182, 0.5)' : 'rgba(52, 211, 153, 0.5)';
  const ringColor = theme === 'pink'
    ? (darkMode ? 'rgba(244, 114, 182, 1)' : 'rgba(219, 39, 119, 1)')
    : (darkMode ? 'rgba(52, 211, 153, 1)' : 'rgba(5, 150, 105, 1)');

  useEffect(() => {
    if (reducedMotion) return;

    const applyPosition = () => {
      rafRef.current = null;
      const { x, y } = positionRef.current;
      const scale = hoveringRef.current ? 1.5 : 1;
      const ringScale = hoveringRef.current ? 2 : 1;
      const opacity = visibleRef.current ? '1' : '0';

      if (dotRef.current) {
        dotRef.current.style.left = `${x}px`;
        dotRef.current.style.top = `${y}px`;
        dotRef.current.style.opacity = opacity;
        dotRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${x}px`;
        ringRef.current.style.top = `${y}px`;
        ringRef.current.style.opacity = opacity;
        ringRef.current.style.transform = `translate(-50%, -50%) scale(${ringScale})`;
      }
    };

    const scheduleUpdate = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(applyPosition);
    };

    const onMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      visibleRef.current = true;

      const target = e.target;
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer');

      hoveringRef.current = !!isClickable;
      scheduleUpdate();
    };

    const onMouseLeave = () => {
      visibleRef.current = false;
      scheduleUpdate();
    };

    const onMouseEnter = () => {
      visibleRef.current = true;
      scheduleUpdate();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[100] transition-opacity duration-300 hidden md:block"
        style={{ opacity: 0 }}
      >
        <div
          className="w-4 h-4 rounded-full transition-transform duration-200"
          style={{ backgroundColor: ringColor }}
        />
      </div>
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[99] transition-all duration-500 ease-out hidden md:block"
        style={{ opacity: 0 }}
      >
        <div
          className="w-8 h-8 rounded-full border transition-all duration-300"
          style={{ borderColor: color, borderWidth: '1px' }}
        />
      </div>
    </>
  );
};
