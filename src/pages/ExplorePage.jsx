import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { SITE_URL } from '../config/site.js';

const EXPLORE_LINKS = [
  { path: '/cli', label: 'CLI Mode', desc: 'Terminal-style navigation' },
  { path: '/os', label: 'Desktop OS', desc: 'A playful desktop environment' },
  { path: '/intro', label: 'Intro Cinematic', desc: 'Animated welcome sequence' },
  { path: '/interview', label: 'Mock Interview', desc: 'Chat with AI Parjad' },
  { path: '/tech-news', label: 'Tech Hub', desc: 'Top dev articles today' },
  { path: '/stats', label: 'Stats & ClickUp', desc: 'GitHub, LeetCode, and the counter' },
  { path: '/blog', label: 'Blog', desc: 'Articles and tutorials' },
  { path: '/projects/lqftBenchmark', label: 'LQFT Benchmark', desc: 'Performance playground' },
];

export const ExplorePage = ({ theme }) => {
  const { t } = useTranslation();
  const accent = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400';
  const tagClass = theme === 'pink' ? 'bg-pink-500/20 text-pink-200' : 'bg-emerald-500/20 text-emerald-200';

  return (
    <PageTransition className="min-h-screen py-24 px-4">
      <SEO
        title="Explore — Parjad Minooei"
        description="Hidden gems and interactive experiences across parjadm.ca."
        url={`${SITE_URL}/explore`}
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
          {EXPLORE_LINKS.map((item) => (
            <Reveal key={item.path}>
              <Link to={item.path} className="block h-full">
                <GlassCard className="p-5 h-full hover:scale-[1.02] transition-transform duration-300" theme={theme}>
                  <h2 className={`font-bold text-lg text-white group-hover:text-white ${accent}`}>{item.label}</h2>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                  <span className={`text-xs font-medium mt-3 inline-block ${accent}`}>Open →</span>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};
