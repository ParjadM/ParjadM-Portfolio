import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocaleFromPath } from '../utils/i18nRouting.js';

export function LocaleSync() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale === 'fr' ? 'fr-CA' : 'en';
  }, [location.pathname, i18n]);

  return null;
}
