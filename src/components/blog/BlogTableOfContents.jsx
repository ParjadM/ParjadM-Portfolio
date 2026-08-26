import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'lucide-react';
import { getAccent } from '../../utils/themeTokens.js';

export const BlogTableOfContents = ({ headings, theme = 'emerald', mode = 'both' }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!headings || headings.length < 3) return null;

  const accentTokens = getAccent(theme);
  const accent = accentTokens.text300;
  const showMobile = mode === 'both' || mode === 'mobile';
  const showSidebar = mode === 'both' || mode === 'sidebar';

  return (
    <>
      {showMobile && (
        <nav aria-label={t('blog.tocLabel')} className="mb-8 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white"
          >
            <List className="w-4 h-4" />
            {t('blog.tocTitle')}
          </button>
          {open && (
            <ul className="mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-sm">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                  <a href={`#${h.id}`} className={`${accent} transition-colors`} onClick={() => setOpen(false)}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>
      )}

      {showSidebar && (
        <nav aria-label={t('blog.tocLabel')} className="hidden lg:block sticky top-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{t('blog.tocTitle')}</p>
          <ul className="space-y-2 text-sm border-l border-white/10 pl-4">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
                <a href={`#${h.id}`} className={`${accent} transition-colors line-clamp-2`}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
};
