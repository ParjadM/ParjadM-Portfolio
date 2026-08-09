import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRouteMeta } from '../../config/publicRoutes.js';
import { isFullscreenPath, stripLocalePrefix } from '../../utils/i18nRouting.js';

const scrollPositions = new Map();

function focusHashTarget(hash) {
  const id = decodeURIComponent(String(hash || '').replace(/^#/, ''));
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.scrollIntoView({ block: 'start' });
  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
  return true;
}

function focusMain() {
  const main = document.getElementById('main-content');
  if (!main) return;
  try {
    main.focus({ preventScroll: true });
  } catch {
    main.focus();
  }
}

function runAfterLazyPaint(fn) {
  const timers = [];
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
  timers.push(setTimeout(fn, 50));
  timers.push(setTimeout(fn, 200));
  timers.push(setTimeout(fn, 500));
  return () => timers.forEach(clearTimeout);
}

/**
 * Restores focus/scroll after client-side navigations and announces the new page title.
 */
export function NavigationEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState('');
  const isInitialLoad = useRef(true);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Continuously remember scroll for the current history entry (back/forward restore).
  useEffect(() => {
    const key = location.key || location.pathname;
    const onScroll = () => {
      scrollPositions.set(key, window.scrollY || window.pageYOffset || 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.key, location.pathname]);

  useEffect(() => {
    const pathname = location.pathname;
    const hash = location.hash;
    const key = location.key || pathname;
    const stripped = stripLocalePrefix(pathname) || '/';
    const fullscreen = isFullscreenPath(pathname);
    const prev = prevPathname.current;
    const localeOnly =
      stripLocalePrefix(prev) === stripped &&
      prev !== pathname;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevPathname.current = pathname;
      if (hash) {
        return runAfterLazyPaint(() => focusHashTarget(hash));
      }
      return undefined;
    }

    if (localeOnly && !hash) {
      prevPathname.current = pathname;
      return undefined;
    }

    const routeMeta = getRouteMeta(stripped);
    const title = routeMeta?.titleKey
      ? t(routeMeta.titleKey)
      : (document.title || stripped);
    setAnnouncement(t('a11y.routeAnnouncement', { title }));

    let cancelPaint = () => {};

    if (navigationType === 'POP') {
      const y = scrollPositions.get(key) ?? 0;
      cancelPaint = runAfterLazyPaint(() => {
        if (hash && focusHashTarget(hash)) return;
        window.scrollTo(0, y);
      });
    } else if (hash) {
      cancelPaint = runAfterLazyPaint(() => {
        if (!focusHashTarget(hash) && !fullscreen) {
          window.scrollTo(0, 0);
          focusMain();
        }
      });
    } else if (!fullscreen) {
      window.scrollTo(0, 0);
      cancelPaint = runAfterLazyPaint(() => {
        window.scrollTo(0, 0);
        focusMain();
      });
    }

    prevPathname.current = pathname;
    return cancelPaint;
  }, [location.pathname, location.hash, location.key, navigationType, t]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}

/** Test helper — clear remembered scroll positions between cases. */
export function __resetNavigationScrollMemory() {
  scrollPositions.clear();
}
