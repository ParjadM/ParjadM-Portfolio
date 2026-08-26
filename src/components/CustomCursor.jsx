import React, { useEffect, useRef } from 'react';
import { getAccent } from '../utils/themeTokens.js';
import { getCursorTheme, isCustomCursorEnabled } from '../utils/cursorThemeConfig.js';

export const CustomCursor = ({
  theme,
  darkMode = true,
  reducedMotion = false,
  cursorStyle = 'professional',
}) => {
  const accent = getAccent(theme);
  const cursorTheme = getCursorTheme(cursorStyle);
  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const hoveringRef = useRef(false);
  const pressingRef = useRef(false);
  const visibleRef = useRef(false);

  const customEnabled = isCustomCursorEnabled(cursorStyle);

  useEffect(() => {
    if (reducedMotion || !customEnabled) return;

    document.body.classList.add('custom-cursor-active');

    const applyPosition = () => {
      rafRef.current = null;
      const { x, y } = positionRef.current;
      const opacity = visibleRef.current ? 1 : 0;

      if (rootRef.current) {
        rootRef.current.style.opacity = String(opacity);
        rootRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        rootRef.current.dataset.hover = hoveringRef.current ? 'true' : 'false';
        rootRef.current.dataset.press = pressingRef.current ? 'true' : 'false';
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

    const onMouseDown = () => {
      pressingRef.current = true;
      scheduleUpdate();
    };

    const onMouseUp = () => {
      pressingRef.current = false;
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
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, customEnabled, cursorStyle]);

  if (reducedMotion || !customEnabled || cursorTheme.usesNativePointer) return null;

  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return null;
  }

  const showFocusRing = cursorStyle === 'professional' || cursorStyle === 'classic' || cursorStyle === 'accent';
  const showPointerDot = cursorStyle !== 'crosshair';

  return (
    <div
      ref={rootRef}
      className="custom-cursor-root fixed top-0 left-0 pointer-events-none z-[100] hidden md:block"
      data-style={cursorStyle}
      style={{
        opacity: 0,
        '--cursor-accent': accent.hex,
        '--cursor-accent-soft': darkMode ? `${accent.hex}66` : `${accent.hex}88`,
      }}
      aria-hidden="true"
    >
      {showFocusRing && <div className="custom-cursor-focus" />}
      {cursorStyle === 'crosshair' && <div className="custom-cursor-crosshair" aria-hidden="true" />}
      {showPointerDot && (
        <div className="custom-cursor-pointer">
          <span className="custom-cursor-dot" />
        </div>
      )}
    </div>
  );
};
