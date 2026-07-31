import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin } from '../components/ui/Icons.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx';
import { useFetchWithCache } from '../utils/useFetchWithCache.js';
import { formatDate } from '../utils/formatDate.js';
import ParjadM from '../Images/ParjadM.webp';

const SKILLS = [
  'React', 'Node.js', 'Express', 'MongoDB', 'Python',
  'JavaScript', 'C++', 'Java', 'SQL', 'Git',
];

const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const HomeSection = ({ theme }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isPink = theme === 'pink';

  const { data: projectsData } = useFetchWithCache('/api/projects');
  const featuredProjects = (Array.isArray(projectsData?.projects) ? projectsData.projects : []).slice(0, 3);

  const [latestPosts, setLatestPosts] = useState([]);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const posts = Array.isArray(data.posts) ? data.posts : [];
        setLatestPosts(posts.slice(0, 2));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const accentText = isPink ? 'text-pink-400' : 'text-emerald-400';
  const tagClasses = isPink ? 'bg-pink-500/20 text-pink-300' : 'bg-emerald-500/20 text-emerald-300';
  const gradientText = isPink ? 'from-pink-400 via-red-400 to-purple-400' : 'from-emerald-400 via-teal-400 to-cyan-400';
  const borderTheme = isPink ? 'portrait-border--pink' : '';
  const glowTheme = isPink ? 'portrait-border-glow--pink' : '';

  return (
  <PageTransition className="text-white relative overflow-hidden">
    <SEO 
        title="Parjad Minooei — Software Engineer Portfolio"
        description="Software Engineer building beautiful, fast, user-centric apps."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Parjad Minooei',
          url: 'https://parjadm.ca/',
          inLanguage: ['en', 'fr-CA'],
        }}
    />

    {/* Hero */}
    <section className="relative py-10 md:py-0 md:min-h-[calc(100vh-6rem)] flex items-center">
      <div className="z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-10 items-center">
        {/* Left: Text content */}
        <div className="text-left">
          <Reveal>
          <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight bg-gradient-to-r ${gradientText} bg-clip-text text-transparent`}>
            {t('home.title')}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-2xl">
            {t('home.subtitle1')}<span className={accentText}>{t('home.subtitle2')}</span>{t('home.subtitle3')}
          </p>
          <div className="mt-8 flex justify-start space-x-4">
            <a href="https://github.com/ParjadM" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:bg-white/15 hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5"><Github size={26} /></a>
            <a href="https://www.linkedin.com/in/parjadminooei" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:bg-white/15 hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5"><Linkedin size={26} /></a>
          </div>
          <RippleButton 
            onClick={() => navigate('/contact')} 
            className="mt-10 w-full sm:w-auto px-8 py-3.5 rounded-full text-lg font-semibold shadow-lg"
            theme={theme}
          >
            {t('home.cta')}
          </RippleButton>
          </Reveal>
        </div>

        {/* Right: Portrait image */}
        <div className="flex justify-center md:justify-end mt-4 md:mt-0">
          <Reveal>
          <div className="relative inline-block">
            <div aria-hidden="true" className={`portrait-border-glow ${glowTheme}`} />
            <div className={`portrait-border ${borderTheme}`}>
              <img 
                src={ParjadM} 
                alt="Parjad Minooei"
                width={368}
                height={368}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-60 sm:w-72 md:w-80 lg:w-[26rem] h-auto"
              />
            </div>
          </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center text-gray-400 pointer-events-none select-none">
        <span className="text-xs uppercase tracking-widest mb-1">{t('home.scroll')}</span>
        <ChevronDownIcon className="w-5 h-5 animate-bounce" />
      </div>
    </section>

    {/* Featured projects */}
    {featuredProjects.length > 0 && (
      <section className="relative py-12 md:py-20 px-6 section-glow">
        <div className="container mx-auto max-w-6xl">
          <Reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t('home.featuredTitle')}</h2>
            <LocalizedLink to="/projects" className={`text-sm font-semibold ${accentText} hover:underline shrink-0`}>
              {t('home.viewAllProjects')}
            </LocalizedLink>
          </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => {
              const href = typeof project.liveUrl === 'string' && project.liveUrl.startsWith('/') && !project.liveUrl.startsWith('//')
                ? project.liveUrl
                : '/projects';
              return (
              <Reveal key={project.id || project.title}>
                <LocalizedLink to={href} className="block h-full">
                  <GlassCard className="p-0 flex flex-col overflow-hidden h-full cursor-pointer">
                    <div className="w-full aspect-video bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
                      {project.image ? (
                        <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-semibold">{project.title}</div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[1.75rem]">
                        {(project.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} className={`${tagClasses} text-xs font-semibold px-2.5 py-1 rounded-full`}>{tag}</span>
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">{project.description}</p>
                    </div>
                  </GlassCard>
                </LocalizedLink>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    )}

    {/* Skills strip */}
    <section className="relative py-10 md:py-14 px-6 bg-dots">
      <div className="container mx-auto max-w-5xl text-center">
        <Reveal>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{t('home.skillsTitle')}</h2>
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
          {SKILLS.map((skill) => (
            <span key={skill} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-colors">
              {skill}
            </span>
          ))}
        </div>
        </Reveal>
      </div>
    </section>

    {/* Latest blog posts */}
    {latestPosts.length > 0 && (
      <section className="relative py-12 md:py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <Reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t('home.latestPosts')}</h2>
            <LocalizedLink to="/blog" className={`text-sm font-semibold ${accentText} hover:underline shrink-0`}>
              {t('home.viewBlog')}
            </LocalizedLink>
          </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestPosts.map((post) => (
              <Reveal key={post.id}>
                <LocalizedLink to={`/blog/${post.id}`} className="block h-full">
                  <GlassCard className="p-6 h-full cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tagClasses}`}>{post.category || 'personal'}</span>
                      <span className="text-gray-400 text-xs">{formatDate(post.date, i18n.language)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-300 text-sm line-clamp-3">{post.excerpt}</p>
                  </GlassCard>
                </LocalizedLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )}

    {/* Closing CTA */}
    <section className="relative py-12 md:py-20 px-6 section-glow">
      <div className="container mx-auto max-w-4xl">
        <Reveal>
        <GlassCard className="p-7 md:p-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">{t('home.ctaTitle')}</h2>
          <p className="text-gray-300 text-base md:text-lg mb-8 max-w-xl mx-auto">{t('home.ctaSubtitle')}</p>
          <RippleButton
            onClick={() => navigate('/contact')}
            className="w-full sm:w-auto px-10 py-3.5 rounded-full text-lg font-semibold shadow-lg"
            theme={theme}
          >
            {t('home.cta')}
          </RippleButton>
        </GlassCard>
        </Reveal>
      </div>
    </section>
  </PageTransition>
);
};
