import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx';

const EXPLORE_LINK_KEYS = [
  { path: '/cli', labelKey: 'explore.links.cli.label', descKey: 'explore.links.cli.desc' },
  { path: '/os', labelKey: 'explore.links.os.label', descKey: 'explore.links.os.desc' },
  { path: '/algorithm-memorizer', labelKey: 'explore.links.algoMem.label', descKey: 'explore.links.algoMem.desc' },
  { path: '/intro', labelKey: 'explore.links.intro.label', descKey: 'explore.links.intro.desc' },
  { path: '/interview', labelKey: 'explore.links.interview.label', descKey: 'explore.links.interview.desc' },
  { path: '/tech-news', labelKey: 'explore.links.techNews.label', descKey: 'explore.links.techNews.desc' },
  { path: '/stats', labelKey: 'explore.links.stats.label', descKey: 'explore.links.stats.desc' },
  { path: '/blog', labelKey: 'explore.links.blog.label', descKey: 'explore.links.blog.desc' },
  { path: '/projects/lqftBenchmark', labelKey: 'explore.links.lqft.label', descKey: 'explore.links.lqft.desc' },
  { path: '/projects/cameraFx', labelKey: 'explore.links.cameraFx.label', descKey: 'explore.links.cameraFx.desc' },
];

export const ExplorePage = ({ theme }) => {
  const { t } = useTranslation();
  const accent = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400';
  const tagClass = theme === 'pink' ? 'bg-pink-500/20 text-pink-200' : 'bg-emerald-500/20 text-emerald-200';

  return (
    <PageTransition className="min-h-screen py-24 px-4">
      <SEO
        titleKey="explore.seoTitle"
        descriptionKey="explore.seoDesc"
      />
      <div className="container mx-auto max-w-4xl">
        <Reveal>
          <div className="text-center mb-12">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${tagClass}`}>
              {t('explore.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">{t('explore.title')}</h1>
            <p className="text-gray-300 mt-3 max-w-xl mx-auto">{t('explore.subtitle')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXPLORE_LINK_KEYS.map((item) => (
            <Reveal key={item.path}>
              <LocalizedLink to={item.path} className="block h-full">
                <GlassCard className="p-5 h-full hover:scale-[1.02] transition-transform duration-300" theme={theme}>
                  <h2 className={`font-bold text-lg text-white group-hover:text-white ${accent}`}>{t(item.labelKey)}</h2>
                  <p className="text-gray-400 text-sm mt-1">{t(item.descKey)}</p>
                  <span className={`text-xs font-medium mt-3 inline-block ${accent}`}>{t('explore.open')}</span>
                </GlassCard>
              </LocalizedLink>
            </Reveal>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default ExplorePage;
