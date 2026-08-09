import { useCallback, useEffect, useId, useRef } from 'react';

export function getMenuItems(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll('[role="menuitem"]')).filter((el) => {
    if (el.getAttribute('aria-disabled') === 'true' || el.disabled) return false;
    if (el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]')) return false;
    const style = typeof window !== 'undefined' ? window.getComputedStyle(el) : null;
    if (style && (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')) {
      return false;
    }
    // Avoid getBoundingClientRect size checks: jsdom reports 0×0 for all nodes.
    return true;
  });
}

/**
 * Non-modal menu keyboard/pointer behavior for Header popovers.
 * Handles initial focus, arrows, Home/End, Escape, Tab exit, outside dismiss,
 * and restoring focus to the trigger on close.
 */
export function useMenuPopover({
  open,
  onClose,
  triggerRefs = [],
}) {
  const menuId = useId();
  const menuRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const triggerRefsRef = useRef(triggerRefs);
  onCloseRef.current = onClose;
  triggerRefsRef.current = triggerRefs;

  const close = useCallback(() => {
    onCloseRef.current?.();
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;
    let restoreOnClose = true;

    const focusFirst = () => {
      const items = getMenuItems(menuRef.current);
      if (items[0]) items[0].focus();
      else if (menuRef.current) {
        menuRef.current.setAttribute('tabindex', '-1');
        menuRef.current.focus();
      }
    };
    const raf = requestAnimationFrame(focusFirst);

    const handleKeyDown = (e) => {
      const items = getMenuItems(menuRef.current);
      const idx = items.indexOf(document.activeElement);

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        restoreOnClose = true;
        close();
        return;
      }

      if (e.key === 'Tab') {
        // Non-modal: Tab leaves the menu and closes it without stealing focus back.
        restoreOnClose = false;
        close();
        return;
      }

      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = idx < 0 ? 0 : (idx + 1) % items.length;
        items[next].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length;
        items[next].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    };

    const handlePointerDown = (e) => {
      const inMenu = menuRef.current?.contains(e.target);
      const inTrigger = (triggerRefsRef.current || []).some((ref) => ref?.current?.contains?.(e.target));
      if (!inMenu && !inTrigger) {
        restoreOnClose = false;
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handlePointerDown);
      if (!restoreOnClose) return;
      const el = restoreFocusRef.current;
      if (el && typeof el.focus === 'function') {
        try {
          el.focus({ preventScroll: true });
        } catch {
          el.focus();
        }
      }
    };
  }, [open, close]);

  return { menuId, menuRef, close };
}
