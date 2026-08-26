import React, { useEffect, useRef } from 'react';
import { getAccent } from '../utils/themeTokens.js';

export const CustomCursor = ({ theme, darkMode = true, reducedMotion = false }) => {
  const accent = getAccent(theme);
  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const hoveringRef = useRef(false);
  const visibleRef = useRef(false);

  const dotColor = darkMode ? accent.cursor.dotDark : accent.cursor.dotLight;
  const ringColor = accent.cursor.ring;

  useEffect(() => {
    if (reducedMotion) return;

    document.body.classList.add('custom-cursor-active');

    const applyPosition = () => {
      rafRef.current = null;
      const { x, y } = positionRef.current;
      const hovering = hoveringRef.current;
      const opacity = visibleRef.current ? 1 : 0;

      if (rootRef.current) {
        rootRef.current.style.opacity = String(opacity);
        rootRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        rootRef.current.dataset.hover = hovering ? 'true' : 'false';
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
      document.body.classList.remove('custom-cursor-active');
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
    <div
      ref={rootRef}
      className="custom-cursor-root fixed top-0 left-0 pointer-events-none z-[100] hidden md:block"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <div className="custom-cursor-body">
        <div
          className="custom-cursor-ring"
          style={{ borderColor: ringColor }}
        />
        <div
          className="custom-cursor-dot"
          style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${ringColor}` }}
        />
      </div>
    </div>
  );
};
