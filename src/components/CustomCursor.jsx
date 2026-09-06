import React, { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAccent } from '../utils/themeTokens.js';
import { getCursorTheme, isCustomCursorEnabled } from '../utils/cursorThemeConfig.js';

export const CustomCursor = ({
  theme,
  darkMode = true,
  reducedMotion = false,
  cursorStyle = 'accent',
}) => {
  const accent = getAccent(theme);
  const cursorTheme = getCursorTheme(cursorStyle);
  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const positionRef = useRef(
    typeof window !== 'undefined'
      ? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      : { x: 0, y: 0 },
  );
  const hoveringRef = useRef(false);
  const pressingRef = useRef(false);
  const visibleRef = useRef(true);
  const cursorStyleRef = useRef(cursorStyle);
  cursorStyleRef.current = cursorStyle;

  const [finePointer, setFinePointer] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    const change = () => setFinePointer(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  const customEnabled = finePointer && isCustomCursorEnabled(cursorStyle);

  const applyPosition = useCallback(() => {
    rafRef.current = null;
    const node = rootRef.current;
    if (!node) return;

    const { x, y } = positionRef.current;
    node.style.opacity = visibleRef.current ? '1' : '0';
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    node.dataset.style = cursorStyleRef.current;
    node.dataset.hover = hoveringRef.current ? 'true' : 'false';
    node.dataset.press = pressingRef.current ? 'true' : 'false';
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(applyPosition);
  }, [applyPosition]);

  const syncCursor = useCallback(() => {
    visibleRef.current = true;
    pressingRef.current = false;
    scheduleUpdate();
  }, [scheduleUpdate]);

  useEffect(() => {
    if (reducedMotion || !customEnabled) {
      document.body.classList.remove('custom-cursor-active');
      return undefined;
    }

    document.body.classList.add('custom-cursor-active');
    return () => document.body.classList.remove('custom-cursor-active');
  }, [reducedMotion, customEnabled]);

  useEffect(() => {
    if (reducedMotion || !customEnabled) return undefined;

    const isClickableTarget = (target) => {
      if (!(target instanceof Element)) return false;
      return (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        !!target.closest('button') ||
        !!target.closest('a') ||
        target.classList.contains('cursor-pointer')
      );
    };

    const onPointerMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      visibleRef.current = e.clientX >= 0 && e.clientY >= 0
        && e.clientX <= window.innerWidth
        && e.clientY <= window.innerHeight;
      hoveringRef.current = isClickableTarget(e.target);
      scheduleUpdate();
    };

    const onPointerDown = () => {
      pressingRef.current = true;
      visibleRef.current = true;
      scheduleUpdate();
    };

    const onPointerUp = () => {
      pressingRef.current = false;
      visibleRef.current = true;
      scheduleUpdate();
    };

    const onWindowBlur = () => {
      pressingRef.current = false;
      scheduleUpdate();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerUp, true);
    window.addEventListener('blur', onWindowBlur);

    syncCursor();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('pointercancel', onPointerUp, true);
      window.removeEventListener('blur', onWindowBlur);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, customEnabled, scheduleUpdate, syncCursor]);

  useLayoutEffect(() => {
    if (reducedMotion || !customEnabled) return;
    syncCursor();
    applyPosition();
  }, [cursorStyle, theme, darkMode, reducedMotion, customEnabled, syncCursor, applyPosition]);

  if (reducedMotion || !customEnabled || cursorTheme.usesNativePointer) return null;

  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return null;
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      key={cursorStyle}
      ref={rootRef}
      className={`custom-cursor-root custom-cursor-root--${cursorStyle} fixed top-0 left-0 pointer-events-none hidden md:block`}
      data-style={cursorStyle}
      style={{
        '--cursor-accent': accent.hex,
        '--cursor-accent-soft': darkMode ? `${accent.hex}88` : `${accent.hex}aa`,
      }}
      aria-hidden="true"
    >
      <div className="custom-cursor-focus" />
      <div className="custom-cursor-crosshair" aria-hidden="true" />
      <div className="custom-cursor-pointer">
        <span className="custom-cursor-dot" />
      </div>
    </div>,
    document.body,
  );
};
