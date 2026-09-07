import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Minimal non-gamey HUD for Explore World.
 */
export function WorldHud({ promptText, onExit }) {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
          <p className="text-sm font-semibold tracking-wide text-white">{t('exploreWorld.title')}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
            {t('exploreWorld.controls')}
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/10"
        >
          {t('exploreWorld.exit')}
        </button>
      </div>

      {promptText ? (
        <div className="mx-auto mb-10 rounded-full border border-emerald-400/30 bg-black/55 px-5 py-2.5 text-sm font-medium text-emerald-200 backdrop-blur-md">
          {promptText}
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
