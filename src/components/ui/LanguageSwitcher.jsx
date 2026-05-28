import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2 text-sm font-medium">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded transition-colors ${i18n.resolvedLanguage === 'en' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
      >
        EN
      </button>
      <span className="text-gray-500">|</span>
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-2 py-1 rounded transition-colors ${i18n.resolvedLanguage === 'fr' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
      >
        FR
      </button>
    </div>
  );
};
