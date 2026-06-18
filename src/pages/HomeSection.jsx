import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route, useParams } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reveal } from '../components/Reveal.jsx';
import { getAuthToken } from '../utils/auth.jsx';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.
import ParjadImage from '../Images/Parjad.jpg';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import ParjadM from '../Images/ParjadM.png';
import Logo from '../Images/Logo.png';
import CodeQuestImage from '../Images/CodeQuest.jpg';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.jpg';
import SpaceShooterImage from '../Images/SpaceShooter.jpg';

export const HomeSection = ({ theme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Visitors shown in header now

  return (
  <PageTransition className="min-h-screen flex items-center text-white relative overflow-hidden">
    <SEO 
        title="Parjad Minooei — Software Engineer Portfolio"
        description="Software Engineer building beautiful, fast, user-centric apps."
    />
    <div className="z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Left: Text content */}
      <div className="p-6 md:p-0 text-left">
        <Reveal>
        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight bg-gradient-to-r ${theme !== 'pink' ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-pink-400 via-red-400 to-purple-400'} bg-clip-text text-transparent`}>
          {t('home.title')}
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-2xl">
          {t('home.subtitle1')}<span className={theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}>{t('home.subtitle2')}</span>{t('home.subtitle3')}
        </p>
        <div className="mt-8 flex justify-start space-x-6">
          <a href="https://github.com/ParjadM" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"><Github size={32} /></a>
          <a href="https://www.linkedin.com/in/parjadminooei" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"><Linkedin size={32} /></a>
        </div>

        <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-gray-400">{t('home.mainPath')}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <RippleButton onClick={() => navigate('/about')} className="px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg" theme={theme}>
            {t('nav.About')}
          </RippleButton>
          <RippleButton onClick={() => navigate('/projects')} className="px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg" theme={theme}>
            {t('nav.Projects')}
          </RippleButton>
          <RippleButton onClick={() => navigate('/contact')} className="px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg" theme={theme}>
            {t('nav.Contact')}
          </RippleButton>
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-gray-400">{t('home.exploreLabel')}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link to="/stats" className={`${theme === 'pink' ? 'text-pink-300 hover:text-pink-200' : 'text-emerald-300 hover:text-emerald-200'} hover:underline`}>{t('nav.Stats')}</Link>
          <Link to="/blog" className={`${theme === 'pink' ? 'text-pink-300 hover:text-pink-200' : 'text-emerald-300 hover:text-emerald-200'} hover:underline`}>{t('nav.Blog')}</Link>
          <Link to="/explore" className={`${theme === 'pink' ? 'text-pink-300 hover:text-pink-200' : 'text-emerald-300 hover:text-emerald-200'} hover:underline`}>{t('home.exploreAll')}</Link>
        </div>
        </Reveal>
        
      </div>

      {/* Right: Portrait image */}
      <div className="flex justify-center md:justify-end p-6 md:p-0">
        <Reveal>
        <img 
          src={ParjadM} 
          alt="Parjad Minooei"
          loading="lazy"
          decoding="async"
          className="w-64 md:w-80 lg:w-[28rem]"
        />
        </Reveal>
      </div>
    </div>
  </PageTransition>
);
};