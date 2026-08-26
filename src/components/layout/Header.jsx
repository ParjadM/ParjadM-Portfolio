import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Palette, Menu } from '../ui/Icons.jsx';
import { Monitor, Newspaper, Film, Terminal, MessageSquare, Activity, ChevronDown } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.jsx';
import Logo from '../../Images/Logo.webp';
import { THEMES } from '../../utils/themeConfig.js';
import { getAccent } from '../../utils/themeTokens.js';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.jsx';
import { LocalizedLink } from '../ui/LocalizedLink.jsx';
import { MOBILE_MENU_OPEN } from '../../utils/mobileMenuEvents.js';
import { stripLocalePrefix } from '../../utils/i18nRouting.js';
import { useSwipeDown } from '../../utils/useSwipeDown.js';
import { useFocusTrap } from '../../utils/useFocusTrap.js';
import { useMenuPopover } from '../../utils/useMenuPopover.js';

export const Header = ({ setThemeId, currentThemeId, theme, darkMode = true, isMobileMenuOpen, setIsMobileMenuOpen, onLanguageChange }) => {
    const accent = getAccent(theme);
    const { t } = useTranslation();
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [paletteRect, setPaletteRect] = useState(null);
    const paletteTriggerRef = useRef(null);
    const mobilePaletteTriggerRef = useRef(null);
    const activePaletteTriggerRef = useRef(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [moreRect, setMoreRect] = useState(null);
    const moreTriggerRef = useRef(null);
    const navLinksRef = useRef(null);
    const [navIndicator, setNavIndicator] = useState(null);
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
        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const menuSwipeHandlers = useSwipeDown(() => setIsMobileMenuOpen?.(false));
    const menuTrapRef = useFocusTrap(isMobileMenuOpen, () => setIsMobileMenuOpen?.(false));

    const isActive = (path) => stripLocalePrefix(location.pathname) === path;

    const MORE_ITEMS = [
        { name: t('more.os'), path: '/os', icon: <Monitor className="w-4 h-4" />, description: t('more.osDesc') },
        { name: t('more.techNews'), path: '/tech-news', icon: <Newspaper className="w-4 h-4" />, description: t('more.techNewsDesc') },
        { name: t('more.intro'), path: '/intro', icon: <Film className="w-4 h-4" />, description: t('more.introDesc') },
        { name: t('more.cli'), path: '/cli', icon: <Terminal className="w-4 h-4" />, description: t('more.cliDesc') },
        { name: t('more.interview'), path: '/interview', icon: <MessageSquare className="w-4 h-4" />, description: t('more.interviewDesc') },
        { name: t('nav.Stats'), path: '/stats', icon: <Activity className="w-4 h-4" />, description: t('more.statsDesc') }
    ];

    const paletteTriggers = useMemo(
        () => [paletteTriggerRef, mobilePaletteTriggerRef],
        [],
    );

    const moreTriggers = useMemo(() => [moreTriggerRef], []);

    const {
        menuId: paletteMenuId,
        menuRef: paletteDropdownRef,
    } = useMenuPopover({
        open: isPaletteOpen,
        onClose: () => setIsPaletteOpen(false),
        triggerRefs: paletteTriggers,
    });

    const {
        menuId: moreMenuId,
        menuRef: moreMenuRef,
    } = useMenuPopover({
        open: isMoreOpen,
        onClose: () => setIsMoreOpen(false),
        triggerRefs: moreTriggers,
    });

    const getPaletteTriggerEl = () => {
        const isVisible = (el) => {
            if (!el) return false;
            const { width, height } = el.getBoundingClientRect();
            return width > 0 && height > 0;
        };
        const active = activePaletteTriggerRef.current?.current;
        if (isVisible(active)) return active;
        if (isVisible(mobilePaletteTriggerRef.current)) return mobilePaletteTriggerRef.current;
        if (isVisible(paletteTriggerRef.current)) return paletteTriggerRef.current;
        return active || mobilePaletteTriggerRef.current || paletteTriggerRef.current;
    };

    const updatePaletteRect = () => {
        const trigger = getPaletteTriggerEl();
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const w = 192;
        const margin = 8;
        const left = Math.max(margin, Math.min(rect.right - w, window.innerWidth - w - margin));
        setPaletteRect({ top: rect.bottom + margin, left });
    };

    const updateMoreRect = () => {
        const trigger = moreTriggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        setMoreRect({ top: rect.bottom + 8, left: rect.left });
    };

    const openPalette = (triggerRef) => {
        activePaletteTriggerRef.current = triggerRef;
        setIsMoreOpen(false);
        setIsPaletteOpen((open) => {
            const next = !open;
            if (next) {
                // Position synchronously so the portal exists before menu focus runs.
                const trigger = triggerRef?.current || getPaletteTriggerEl();
                if (trigger) {
                    const rect = trigger.getBoundingClientRect();
                    const w = 192;
                    const margin = 8;
                    const left = Math.max(margin, Math.min(rect.right - w, window.innerWidth - w - margin));
                    setPaletteRect({ top: rect.bottom + margin, left });
                }
            }
            return next;
        });
    };

    const openMore = () => {
        setIsPaletteOpen(false);
        setIsMoreOpen((open) => {
            const next = !open;
            if (next && moreTriggerRef.current) {
                const rect = moreTriggerRef.current.getBoundingClientRect();
                setMoreRect({ top: rect.bottom + 8, left: rect.left });
            }
            return next;
        });
    };

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

    useLayoutEffect(() => {
        if (!isPaletteOpen || typeof window === 'undefined') {
            setPaletteRect(null);
            return undefined;
        }
        updatePaletteRect();
        window.addEventListener('resize', updatePaletteRect);
        window.addEventListener('scroll', updatePaletteRect, true);
        return () => {
            window.removeEventListener('resize', updatePaletteRect);
            window.removeEventListener('scroll', updatePaletteRect, true);
        };
    }, [isPaletteOpen]);

    useLayoutEffect(() => {
        if (!isMoreOpen || typeof window === 'undefined') {
            setMoreRect(null);
            return undefined;
        }
        updateMoreRect();
        window.addEventListener('resize', updateMoreRect);
        window.addEventListener('scroll', updateMoreRect, true);
        return () => {
            window.removeEventListener('resize', updateMoreRect);
            window.removeEventListener('scroll', updateMoreRect, true);
        };
    }, [isMoreOpen]);

    // Sliding indicator that follows the active desktop nav link.
    useEffect(() => {
        const update = () => {
            const container = navLinksRef.current;
            if (!container) return;
            const active = container.querySelector('a[aria-current="page"]');
            if (!active) {
                setNavIndicator(null);
                return;
            }
            setNavIndicator({ left: active.offsetLeft, width: active.offsetWidth });
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [location.pathname, t]);

    useEffect(() => {
        const onOpenMenu = () => setIsMobileMenuOpen?.(true);
        window.addEventListener(MOBILE_MENU_OPEN, onOpenMenu);
        return () => window.removeEventListener(MOBILE_MENU_OPEN, onOpenMenu);
    }, [setIsMobileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [isMobileMenuOpen]);

    // Close popovers on route changes.
    useEffect(() => {
        setIsPaletteOpen(false);
        setIsMoreOpen(false);
        setIsMobileMenuOpen?.(false);
    }, [location.pathname, setIsMobileMenuOpen]);

    const paletteEl = isPaletteOpen && paletteRect && typeof document !== 'undefined' && createPortal(
        <div
            ref={paletteDropdownRef}
            id={paletteMenuId}
            role="menu"
            aria-label={t('a11y.themeMenu')}
            className="fixed z-[9999] w-48 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden"
            style={{ top: paletteRect.top, left: paletteRect.left }}
        >
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('a11y.themes')}</div>
            {Object.values(THEMES).map((themeOption) => (
                <button
                    key={themeOption.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        setThemeId(themeOption.id);
                        setIsPaletteOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentThemeId === themeOption.id ? accent.menuActive : 'text-gray-300 hover:bg-gray-800'}`}
                >
                    {themeOption.name}
                </button>
            ))}
        </div>,
        document.body
    );

    const moreEl = typeof document !== 'undefined' && isMoreOpen && moreRect && createPortal(
        <div
            ref={moreMenuRef}
            id={moreMenuId}
            role="menu"
            aria-label={t('a11y.moreMenu')}
            className="dropdown-pop fixed z-[9999] w-64 rounded-2xl bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden p-2 flex flex-col gap-1"
            style={{ top: moreRect.top, left: moreRect.left }}
        >
            {MORE_ITEMS.map((item) => (
                <LocalizedLink
                    key={item.path}
                    to={item.path}
                    role="menuitem"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                    <div className="mt-0.5 p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/20 transition-colors">
                        {item.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{item.name}</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">{item.description}</span>
                    </div>
                </LocalizedLink>
            ))}
        </div>,
        document.body
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded">
                {t('a11y.skipToContent')}
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex container mx-auto px-6 py-4 justify-between items-center" role="navigation" aria-label="Primary">
                <LocalizedLink to="/" className="text-2xl font-bold text-white tracking-wider inline-flex items-center transition-transform hover:scale-105">
                    <img src={Logo} alt="Logo" className="h-[4.5rem] w-auto drop-shadow-lg" />
                </LocalizedLink>

                <GlassCard className="!rounded-full border border-white/10 shadow-lg backdrop-blur-md" theme={theme}>
                    <div className="flex items-center px-2 py-1.5">
                        <div ref={navLinksRef} className="relative flex items-center space-x-1 pr-4 border-r border-white/10">
                            {navIndicator && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute top-1/2 -translate-y-1/2 h-9 rounded-full transition-all duration-300 ease-out pointer-events-none ${accent.navIndicator}`}
                                    style={{ left: navIndicator.left, width: navIndicator.width }}
                                />
                            )}
                            {navItems.map(item => {
                                const isItemActive = isActive(item.path);
                                return (
                                    <LocalizedLink
                                        key={item.name}
                                        to={item.path}
                                        className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 border border-transparent ${
                                            isItemActive
                                            ? accent.navActiveText
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                        }`}
                                        aria-current={isItemActive ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </LocalizedLink>
                                );
                            })}
                            <div className="relative">
                                <button
                                    ref={moreTriggerRef}
                                    type="button"
                                    onClick={openMore}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-transparent ${isMoreOpen ? 'bg-white/10 text-white shadow-inner' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                                    aria-haspopup="menu"
                                    aria-expanded={isMoreOpen}
                                    aria-controls={isMoreOpen ? moreMenuId : undefined}
                                    aria-label={t('a11y.moreMenu')}
                                >
                                    <span>{t('nav.More')}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMoreOpen ? 'rotate-180 text-white' : 'text-gray-400'}`} aria-hidden="true" />
                                </button>
                                {moreEl}
                            </div>
                        </div>

                        <div className="flex items-center pl-4 space-x-3">
                            {visitors !== null && (
                                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-inner" title={t('a11y.uniqueVisitors')}>
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${accent.bgDot}`}></div>
                                    <span className="text-gray-300 text-xs font-semibold tracking-wide whitespace-nowrap">
                                        {t('nav.Visitors', { count: visitors })}
                                    </span>
                                </div>
                            )}

                            <LanguageSwitcher onLanguageChange={onLanguageChange} />

                            <div className="relative">
                                <button
                                    ref={paletteTriggerRef}
                                    type="button"
                                    onClick={() => openPalette(paletteTriggerRef)}
                                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300"
                                    aria-label={t('a11y.themeMenu')}
                                    aria-haspopup="menu"
                                    aria-expanded={isPaletteOpen}
                                    aria-controls={isPaletteOpen ? paletteMenuId : undefined}
                                >
                                    <Palette className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </nav>

            {/* Mobile & Tablet Navigation */}
            <nav className="lg:hidden px-4 pt-safe-or-4 pb-3" role="navigation" aria-label="Mobile Primary">
                <GlassCard className="!rounded-2xl border border-white/10 shadow-lg backdrop-blur-md px-4 py-2" theme={theme}>
                    <div className="flex justify-between items-center gap-2">
                        <LocalizedLink to="/" className="inline-flex items-center shrink-0">
                            <img src={Logo} alt="Logo" className="h-8 w-auto drop-shadow-md" />
                        </LocalizedLink>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <LanguageSwitcher onLanguageChange={onLanguageChange} />
                            <button
                                ref={mobilePaletteTriggerRef}
                                type="button"
                                onClick={() => openPalette(mobilePaletteTriggerRef)}
                                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all"
                                aria-label={t('a11y.themeMenu')}
                                aria-haspopup="menu"
                                aria-expanded={isPaletteOpen}
                                aria-controls={isPaletteOpen ? paletteMenuId : undefined}
                            >
                                <Palette className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen?.(true)}
                                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all"
                                aria-label={t('a11y.openMenu')}
                                aria-expanded={isMobileMenuOpen}
                                aria-haspopup="dialog"
                            >
                                <Menu className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
                    <div
                        ref={menuTrapRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('a11y.siteMenu')}
                        className="fixed inset-0 z-[99999] bg-gray-900/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6 transition-all duration-300 overflow-y-auto"
                        {...menuSwipeHandlers}
                    >
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-6 right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                            aria-label={t('a11y.closeMenu')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="flex flex-col items-center space-y-6 w-full max-w-sm mt-10">
                            {navItems.map(item => (
                                <LocalizedLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight transition-all duration-300 ${isActive(item.path) ? accent.text : 'text-gray-300 hover:text-white'}`}
                                >
                                    {item.name}
                                </LocalizedLink>
                            ))}

                            <LocalizedLink
                                to="/explore"
                                onClick={handleNavClick}
                                className={`text-2xl font-bold tracking-tight ${isActive('/explore') ? accent.text : 'text-gray-300 hover:text-white'}`}
                            >
                                {t('nav.Explore')}
                            </LocalizedLink>

                            <div className="w-full h-px bg-white/10 my-4" />

                            <div className="flex flex-wrap justify-center gap-4 w-full">
                                {MORE_ITEMS.map((item) => (
                                    <LocalizedLink key={item.path} to={item.path} onClick={handleNavClick} className="text-gray-400 hover:text-white font-medium">
                                        {item.name}
                                    </LocalizedLink>
                                ))}
                            </div>

                            {visitors !== null && (
                                <div className="mt-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-full bg-white/5 border border-white/10">
                                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${accent.bgDot}`}></div>
                                    <span className="text-gray-300 text-sm font-semibold tracking-wide">
                                        {t('nav.Visitors', { count: visitors })}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 w-full mt-6">
                                {Object.values(THEMES).map((themeOption) => (
                                    <button
                                        key={themeOption.id}
                                        type="button"
                                        onClick={() => {
                                            setThemeId(themeOption.id);
                                            handleNavClick();
                                        }}
                                        className={`text-center px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${currentThemeId === themeOption.id ? accent.menuActiveBorder : 'bg-white/5 border border-white/10 text-gray-300'}`}
                                    >
                                        {themeOption.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </nav>

            {paletteEl}
        </header>
    );
};
