import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../ui/LocalizedLink.jsx';
import { getAccent } from '../../utils/themeTokens.js';

/**
 * Accessible HTML overlay for landmark info (not rendered as 3D textures).
 */
export function WorldOverlay({ theme, onClose }) {
  const { t } = useTranslation();
  const accent = getAccent(theme);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-world-overlay-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <h2 id="explore-world-overlay-title" className="text-xl font-bold text-white">
          {t('exploreWorld.overlay.projectsTitle')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {t('exploreWorld.overlay.projectsBody')}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t('exploreWorld.overlay.close')}
          </button>
          <LocalizedLink
            to="/projects"
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${accent.gradientBtn}`}
          >
            {t('exploreWorld.overlay.viewProjects')}
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
}
