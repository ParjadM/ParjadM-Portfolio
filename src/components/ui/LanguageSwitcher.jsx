import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { localizePath, stripLocalePrefix } from '../../utils/i18nRouting.js';

export const LanguageSwitcher = ({ onLanguageChange }) => {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const current = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const changeLanguage = (lng) => {
    if (lng === current) return;
    const stripped = stripLocalePrefix(location.pathname);
    const search = location.search || '';
    const hash = location.hash || '';
    const newPath = `${localizePath(stripped, lng)}${search}${hash}`;
    i18n.changeLanguage(lng);
    navigate(newPath, { replace: true });
    onLanguageChange?.(lng === 'fr' ? t('language.toastFr') : t('language.toastEn'));
  };

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="inline-flex items-center rounded-full bg-white/5 border border-white/10 p-0.5 text-xs font-semibold"
    >
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        aria-pressed={current === 'en'}
        className={`px-2.5 py-1.5 min-h-[36px] min-w-[36px] rounded-full transition-colors ${
          current === 'en' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('fr')}
        aria-pressed={current === 'fr'}
        className={`px-2.5 py-1.5 min-h-[36px] min-w-[36px] rounded-full transition-colors ${
          current === 'fr' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        FR
      </button>
    </div>
  );
};
