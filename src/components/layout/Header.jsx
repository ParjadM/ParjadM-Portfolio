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

export const Header = ({ setThemeId, currentThemeId, theme, darkMode = true }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
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
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Projects', path: '/projects' },
        { name: 'Stats', path: '/stats' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' }
    ];

    const handleNavClick = () => {
        setIsMenuOpen(false);
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

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Skip to content for screen readers/keyboard users */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to main content</a>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center" role="navigation" aria-label="Primary">
                <Link to="/" className="text-2xl font-bold text-white tracking-wider inline-flex items-center">
                    <img src={Logo} alt="Logo" className="h-[4.5rem] w-auto" />
                </Link>
                
                {/* Desktop Menu */}
                <div className="hidden md:block">
                     <GlassCard className="!rounded-full" theme={theme}>
                        <div className="flex items-center space-x-1 px-3 py-2">
                            {navItems.map(item => (
                                <React.Fragment key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
                                        aria-current={isActive(item.path) ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.name === 'Contact' && <NewsFeed posts={blogPosts} theme={theme} darkMode={darkMode} compact />}
                                </React.Fragment>
                            ))}
                            {visitors !== null && (
                              <div className="ml-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm font-semibold whitespace-nowrap">
                                {visitors} Visitors
                              </div>
                            )}
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                                    className="p-2 rounded-full bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/15 transition-colors duration-300"
                                    aria-label="Theme Palette"
                                >
                                    <Palette className="w-5 h-5" />
                                </button>
                                {isPaletteOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden z-50">
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
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white" aria-controls="primary-menu" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
                        <Menu size={28} />
                    </button>
                </div>
            </nav>
            {/* Mobile Menu */}
            {isMenuOpen && (
                 <div className="md:hidden mt-2 px-6" id="primary-menu">
                    <GlassCard className="w-full" theme={theme}>
                        <div className="flex flex-col items-center space-y-2 p-4">
                            {navItems.map(item => (
                                <React.Fragment key={item.name}>
                                    <Link
                                        to={item.path}
                                        onClick={handleNavClick}
                                        className={`block w-full text-center px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-300 ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
                                        aria-current={isActive(item.path) ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.name === 'Contact' && (
                                        <div className="w-full flex justify-center">
                                            <NewsFeed posts={blogPosts} theme={theme} darkMode={darkMode} onNavigate={handleNavClick} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                            {visitors !== null && (
                              <div className="mt-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm w-full text-center">
                                {visitors} Visitors
                              </div>
                            )}
                            
                            <div className="mt-2 w-full">
                                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Themes</div>
                                <div className="grid grid-cols-1 gap-2 mt-1">
                                    {Object.values(THEMES).map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setThemeId(t.id);
                                                handleNavClick();
                                            }}
                                            className={`w-full text-center px-4 py-2 rounded-lg text-sm transition-colors ${currentThemeId === t.id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </header>
    );
};


