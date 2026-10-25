import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../ui/LocalizedLink.jsx';
import { getAccent } from '../../utils/themeTokens.js';

/**
 * Desktop-first gate for touch / narrow viewports in Phase 1.
 */
export function MobileGate({ theme }) {
  const { t } = useTranslation();
  const accent = getAccent(theme);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 px-6 py-16 text-center">
      <div className="max-w-md">
        <p className={`mb-3 text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
          {t('exploreWorld.title')}
        </p>
        <h1 className="text-2xl font-bold text-white">{t('exploreWorld.mobileTitle')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {t('exploreWorld.mobileBody')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LocalizedLink
            to="/explore"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
          >
            {t('exploreWorld.backToExplore')}
          </LocalizedLink>
          <LocalizedLink
            to="/"
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${accent.gradientBtn}`}
          >
            {t('exploreWorld.exit')}
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}
