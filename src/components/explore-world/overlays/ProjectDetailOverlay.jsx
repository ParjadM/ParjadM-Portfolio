import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../../ui/LocalizedLink.jsx';
import { getAccent } from '../../../utils/themeTokens.js';

function isInternalPath(url) {
  return typeof url === 'string' && url.startsWith('/');
}

/**
 * HTML overlay for a featured project inside Projects Lab.
 */
export function ProjectDetailOverlay({ theme, project, onClose }) {
  const { t } = useTranslation();
  const accent = getAccent(theme);
  if (!project) return null;

  const tags = Array.isArray(project.tags) ? project.tags : [];
  const liveUrl = project.liveUrl || '';
  const githubUrl = project.githubUrl || '';
  const image = project.image || '';

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-40 w-full object-cover"
          />
        ) : null}
        <div className="p-6">
          <h2 id="project-detail-title" className="text-xl font-bold text-white">
            {project.title}
          </h2>
          {project.description ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {project.description}
            </p>
          ) : null}
          {tags.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t('exploreWorld.projectOverlay.close')}
            </button>
            {liveUrl ? (
              isInternalPath(liveUrl) ? (
                <LocalizedLink
                  to={liveUrl}
                  className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${accent.gradientBtn}`}
                >
                  {t('exploreWorld.projectOverlay.viewProject')}
                </LocalizedLink>
              ) : (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${accent.gradientBtn}`}
                >
                  {t('exploreWorld.projectOverlay.viewProject')}
                </a>
              )
            ) : null}
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t('exploreWorld.projectOverlay.github')}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
