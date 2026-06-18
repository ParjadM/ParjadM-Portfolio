import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
};

function syncDocumentLanguage(lng) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng?.startsWith('fr') ? 'fr-CA' : 'en';
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
