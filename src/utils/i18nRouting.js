export const SUPPORTED_LOCALES = ['en', 'fr'];
export const DEFAULT_LOCALE = 'en';
export const LOCALE_PREFIX = '/fr';

export function getLocaleFromPath(pathname = '/') {
  if (pathname === LOCALE_PREFIX || pathname.startsWith(`${LOCALE_PREFIX}/`)) {
    return 'fr';
  }
  return DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname = '/') {
  if (pathname === LOCALE_PREFIX) return '/';
  if (pathname.startsWith(`${LOCALE_PREFIX}/`)) {
    return pathname.slice(LOCALE_PREFIX.length) || '/';
  }
  return pathname;
}

export function localizePath(path, locale = DEFAULT_LOCALE) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const stripped = stripLocalePrefix(normalized);

  if (locale === 'fr') {
    return stripped === '/' ? LOCALE_PREFIX : `${LOCALE_PREFIX}${stripped}`;
  }
  return stripped;
}

export function isFullscreenPath(pathname) {
  const path = stripLocalePrefix(pathname);
  return path === '/intro' || path === '/cli' || path === '/os';
}
