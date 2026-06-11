import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../ui/Icons.jsx';
import { GlassCard } from '../ui/GlassCard.jsx';
import { RippleButton } from '../ui/RippleButton.jsx';
import { Toast } from '../ui/Toast.jsx';
import { getAuthToken } from '../../utils/auth.jsx';
import Logo from '../../Images/Logo.png';
import { NewsFeed } from '../ui/NewsFeed.jsx';
import { THEMES } from '../../utils/themeConfig.js';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.jsx';

export const Header = ({ setThemeId, currentThemeId, theme, darkMode = true, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { t } = useTranslation();
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [paletteRect, setPaletteRect] = useState(null);
    const paletteTriggerRef = useRef(null);
    const paletteDropdownRef = useRef(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [moreRect, setMoreRect] = useState(null);
    const moreDropdownRef = useRef(null);
    const [blogPosts, setBlogPosts] = useState([]);
    const [visitors, setVisitors] = useState(() => {
        try {
            const cached = localStorage.getItem('cachedVisitors');
            if (!cached) return null;
            const parsed = Number(cached);
            return Number.isFinite(parsed) ? parsed : null;
        } catch {
            return null;
        }
    });
    const location = useLocation();
    const navItems = [
        { name: t('nav.Home'), path: '/' },
        { name: t('nav.About'), path: '/about' },
        { name: t('nav.Projects'), path: '/projects' },
        { name: t('nav.Blog'), path: '/blog' },
        { name: t('nav.Contact'), path: '/contact' }
    ];

    const handleNavClick = () => {
        if(setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/metrics', { signal: controller.signal })
          .then(res => res.ok ? res.json() : null)
          .then(d => {
            if (!d || typeof d.uniqueVisitors !== 'number') return;
            setVisitors(d.uniqueVisitors);
            try { localStorage.setItem('cachedVisitors', String(d.uniqueVisitors)); } catch {}
          })
          .catch(() => {
            // Keep cached value on network/server errors to avoid flashing/reset.
          });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/blog', { signal: controller.signal })
          .then(res => res.ok ? res.json() : null)
          .then(d => {
            const posts = Array.isArray(d?.posts) ? d.posts : [];
            setBlogPosts(posts.filter(p => p.id && p.title).map(p => ({ id: p.id, title: p.title })));
          })
          .catch(() => {});

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (isPaletteOpen && paletteTriggerRef.current && typeof window !== 'undefined') {
            const rect = paletteTriggerRef.current.getBoundingClientRect();
            const w = 192; // w-48
            setPaletteRect({ top: rect.bottom + 8, left: rect.right - w });
        } else {
            setPaletteRect(null);
        }
    }, [isPaletteOpen]);

    useEffect(() => {
        if (isMoreOpen && moreDropdownRef.current && typeof window !== 'undefined') {
            const rect = moreDropdownRef.current.getBoundingClientRect();
            setMoreRect({ top: rect.bottom + 8, left: rect.left });
        } else {
            setMoreRect(null);
        }
    }, [isMoreOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // Check palette dropdown
            const isPaletteClick = paletteDropdownRef.current?.contains(e.target) || paletteTriggerRef.current?.contains(e.target);
            if (!isPaletteClick) {
                setIsPaletteOpen(false);
            }
            
            // Check more dropdown
            const morePortalDropdown = document.getElementById('more-dropdown-portal');
            const isMoreClick = morePortalDropdown?.contains(e.target) || moreDropdownRef.current?.contains(e.target);
            if (!isMoreClick) {
                setIsMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const paletteEl = isPaletteOpen && paletteRect && typeof document !== 'undefined' && createPortal(
        <div
            ref={paletteDropdownRef}
            className="fixed z-[9999] w-48 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden"
            style={{ top: paletteRect.top, left: paletteRect.left }}
        >
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Themes</div>
            {Object.values(THEMES).map((t) => (
                <button
                    key={t.id}
                    onClick={() => {
                        setThemeId(t.id);
                        setIsPaletteOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentThemeId === t.id ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                    {t.name}
                </button>
            ))}
        </div>,
        document.body
    );

    const moreEl = isMoreOpen && moreRect && typeof document !== 'undefined' && createPortal(
        <div
            id="more-dropdown-portal"
            className="fixed z-[9999] w-48 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden"
            style={{ top: moreRect.top, left: moreRect.left }}
        >
            <Link to="/os" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Operating System</Link>
            <Link to="/tech-news" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Tech News</Link>
            <Link to="/intro" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Intro Cinematic</Link>
            <Link to="/cli" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">CLI Mode</Link>
            <Link to="/interview" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Mock Interview</Link>
            <Link to="/stats" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">{t('nav.Stats')}</Link>
        </div>,
        document.body
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Skip to content for screen readers/keyboard users */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to main content</a>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex container mx-auto px-6 py-4 justify-between items-center" role="navigation" aria-label="Primary">
                <Link to="/" className="text-2xl font-bold text-white tracking-wider inline-flex items-center transition-transform hover:scale-105">
                    <img src={Logo} alt="Logo" className="h-[4.5rem] w-auto drop-shadow-lg" />
                </Link>
                
                <GlassCard className="!rounded-full border border-white/10 shadow-lg backdrop-blur-md" theme={theme}>
                    <div className="flex items-center px-2 py-1.5">
                        {/* Navigation Links */}
                        <div className="flex items-center space-x-1 pr-4 border-r border-white/10">
                            {navItems.map(item => {
                                const isItemActive = isActive(item.path);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            isItemActive 
                                            ? (theme === 'pink' ? 'bg-pink-500/20 text-pink-200 border border-pink-500/20' : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/20') 
                                            : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                                        }`}
                                        aria-current={isItemActive ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <div className="relative" ref={moreDropdownRef}>
                                <button 
                                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/10 border border-transparent`}
                                    aria-expanded={isMoreOpen}
                                >
                                    More ▾
                                </button>
                                {moreEl}
                            </div>
                        </div>

                        {/* Utility Actions */}
                        <div className="flex items-center pl-4 space-x-3">
                            {visitors !== null && (
                                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-inner" title="Unique Visitors">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                    <span className="text-gray-300 text-xs font-semibold tracking-wide whitespace-nowrap">
                                        {t('nav.Visitors', { count: visitors })}
                                    </span>
                                </div>
                            )}
                            
                            <LanguageSwitcher />
                            
                            <div className="relative">
                                <button
                                    ref={paletteTriggerRef}
                                    onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300"
                                    aria-label="Theme Palette"
                                >
                                    <Palette className="w-4 h-4" />
                                </button>
                                {paletteEl}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </nav>

            {/* Mobile & Tablet Navigation */}
            <nav className="lg:hidden px-4 py-3" role="navigation" aria-label="Mobile Primary">
                <GlassCard className="!rounded-2xl border border-white/10 shadow-lg backdrop-blur-md px-4 py-2" theme={theme}>
                    <div className="flex justify-between items-center">
                        <Link to="/" className="inline-flex items-center">
                            <img src={Logo} alt="Logo" className="h-8 w-auto drop-shadow-md" />
                        </Link>
                        
                        <div className="flex items-center space-x-3">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </GlassCard>

                {/* Full-Screen Mobile Menu Overlay */}
                {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[99999] bg-gray-900/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6 transition-all duration-300">
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-6 right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                            aria-label="Close menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        
                        <div className="flex flex-col items-center space-y-6 w-full max-w-sm mt-10">
                            {navItems.map(item => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight transition-all duration-300 ${isActive(item.path) ? (theme === 'pink' ? 'text-pink-400' : 'text-emerald-400') : 'text-gray-300 hover:text-white'}`}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <div className="w-full h-px bg-white/10 my-4" />
                            
                            <div className="flex flex-wrap justify-center gap-4 w-full">
                                <Link to="/os" onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">OS Mode</Link>
                                <Link to="/tech-news" onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">Tech News</Link>
                                <Link to="/intro" onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">Intro</Link>
                                <Link to="/cli" onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">CLI</Link>
                                <Link to="/interview" onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">Interview</Link>
                                <Link to="/stats" onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">Stats</Link>
                            </div>
                            
                            {visitors !== null && (
                                <div className="mt-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-full bg-white/5 border border-white/10">
                                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                    <span className="text-gray-300 text-sm font-semibold tracking-wide">
                                        {t('nav.Visitors', { count: visitors })}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 w-full mt-6">
                                {Object.values(THEMES).map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setThemeId(t.id);
                                            handleNavClick();
                                        }}
                                        className={`text-center px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${currentThemeId === t.id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 border border-white/10 text-gray-300'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </nav>
        </header>
    );
};


