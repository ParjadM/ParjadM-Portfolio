import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';

const resources = {
  en: { translation: translationEN },
};

function syncDocumentLanguage(lng) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng?.startsWith('fr') ? 'fr-CA' : 'en';
}

export async function ensureLocale(lng) {
  const code = lng?.startsWith('fr') ? 'fr' : 'en';
  if (code === 'en' || i18n.hasResourceBundle('fr', 'translation')) return code;
  const { default: translationFR } = await import('./locales/fr/translation.json');
  i18n.addResourceBundle('fr', 'translation', translationFR, true, true);
  return 'fr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', syncDocumentLanguage);
syncDocumentLanguage(i18n.language);

export default i18n;
