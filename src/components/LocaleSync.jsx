import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocaleFromPath } from '../utils/i18nRouting.js';
import { ensureLocale } from '../i18n.js';

export function LocaleSync() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    let cancelled = false;

    ensureLocale(locale).then((resolved) => {
      if (cancelled) return;
      if (i18n.language !== resolved) {
        i18n.changeLanguage(resolved);
      }
      document.documentElement.lang = resolved === 'fr' ? 'fr-CA' : 'en';
    });

    return () => { cancelled = true; };
  }, [location.pathname, i18n]);

  return null;
}
