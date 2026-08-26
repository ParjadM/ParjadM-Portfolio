import React from 'react';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import { ClickUpSection } from '../components/ClickUpSection.jsx';
import { ComplexityAnalyzer } from '../components/ComplexityAnalyzer.jsx';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { MobileCollapsible } from '../components/ui/MobileCollapsible.jsx';
import { getAccent } from '../utils/themeTokens.js';

export const StatsPage = ({ theme }) => {
  const { t } = useTranslation();
  const accent = getAccent(theme);
  return (
    <PageTransition className="min-h-screen flex items-center justify-center py-24 px-4">
      <SEO 
        titleKey="seo.statsTitle"
        descriptionKey="seo.statsDesc"
      />
      <div className="container mx-auto max-w-6xl w-full">
        {/* Header */}
        <Reveal>
        <div className="mb-10">
          <GlassCard className="p-8 md:p-10" theme={theme}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{t('stats.title')}</h1>
                <p className="mt-2 text-gray-300 max-w-2xl">{t('stats.subtitle')}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${accent.tag200}`}>{t('stats.autoRefreshed')}</div>
            </div>
          </GlassCard>
        </div>
        </Reveal>

        {/* Stats Grid */}
        <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <GitHubStats theme={theme} />
          <LeetCodeStats theme={theme} />
        </div>
        </Reveal>

        {/* Complexity Analyzer */}
        <Reveal>
        <div className="mt-8">
          <MobileCollapsible title={t('stats.sections.complexity')} defaultOpen={false} theme={theme}>
            <ComplexityAnalyzer theme={theme} />
          </MobileCollapsible>
        </div>
        </Reveal>

        {/* ClickUp - fun interactive game */}
        <Reveal>
        <div className="mt-8">
          <MobileCollapsible title={t('stats.sections.clickUp')} defaultOpen={false} theme={theme}>
            <ClickUpSection theme={theme} />
          </MobileCollapsible>
        </div>
        </Reveal>

        {/* Footer note */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          {t('stats.footer')}
        </div>
      </div>
    </PageTransition>
  );
};

export default StatsPage;
