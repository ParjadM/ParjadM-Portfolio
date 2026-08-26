import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../components/Reveal.jsx';
import { SEO } from '../components/SEO.jsx';
import { getAccent } from '../utils/themeTokens.js';

export const NotFoundPage = ({ theme }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const accent = getAccent(theme);
    const gradientClass = accent.gradientBtn;

    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4">
            <SEO titleKey="seo.notFoundTitle" descriptionKey="seo.notFoundDesc" noindex />
            <div className="container mx-auto max-w-2xl text-center">
                <Reveal>
                <GlassCard className="p-12 md:p-16" theme={theme}>
                    <div className={`text-8xl md:text-9xl font-extrabold ${accent.textMuted}`}>404</div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mt-4">{t('notFound.title')}</h1>
                    <p className="text-gray-300 mt-2 max-w-md mx-auto">
                        {t('notFound.desc')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className={`px-6 py-3 rounded-full font-semibold text-white ${gradientClass} hover:opacity-90 transition-opacity`}
                        >
                            {t('notFound.home')}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-full font-semibold bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15 hover:text-white transition-colors"
                        >
                            {t('notFound.back')}
                        </button>
                    </div>
                </GlassCard>
                </Reveal>
            </div>
        </section>
    );
};


export default NotFoundPage;
