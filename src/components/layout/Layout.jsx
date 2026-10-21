import React, { useState, useEffect } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { BackgroundBlobs } from '../ui/BackgroundBlobs.jsx';
import { CustomCursor } from '../CustomCursor.jsx';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { BottomNav } from './BottomNav.jsx';
import { buildAppRouteElements } from './AppRoutes.jsx';
import { LocaleSync } from '../LocaleSync.jsx';
import { ChatbotLauncher } from '../ChatbotLauncher.jsx';
import { Toast } from '../ui/Toast.jsx';
import { OfflineBanner } from '../OfflineBanner.jsx';
import { PwaInstallPrompt } from '../PwaInstallPrompt.jsx';
import { PwaUpdatePrompt } from '../PwaUpdatePrompt.jsx';
import { NavigationEffects } from './NavigationEffects.jsx';

import { getAccent } from '../../utils/themeTokens.js';
import { getThemeConfig } from '../../utils/themeConfig.js';
import { useReducedMotion } from '../../utils/useReducedMotion.js';
import { isFullscreenPath, stripLocalePrefix } from '../../utils/i18nRouting.js';

export const Layout = ({ themeId, setThemeId, cursorThemeId, setCursorThemeId, toast, setToast }) => {
    const location = useLocation();
    const [visitorId, setVisitorId] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const themeConfig = getThemeConfig(themeId);
    const reducedMotion = useReducedMotion();
    const [staticBlobs, setStaticBlobs] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
    );

    const isFullscreenRoute = isFullscreenPath(location?.pathname);

    const showLanguageToast = (message) => {
        setToast({ isVisible: true, message, type: 'success' });
    };

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px)');
        const onChange = (e) => setStaticBlobs(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        // Ensure stable visitorId
        try {
            let vid = null
            try { vid = localStorage.getItem('visitorId') } catch {}
            if (!vid && typeof window !== 'undefined' && window.crypto?.randomUUID) {
                vid = window.crypto.randomUUID()
                try { localStorage.setItem('visitorId', vid) } catch {}
            } else if (!vid && typeof window !== 'undefined' && window.crypto?.getRandomValues) {
                const arr = new Uint8Array(16)
                window.crypto.getRandomValues(arr)
                vid = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
                try { localStorage.setItem('visitorId', vid) } catch {}
            }
            setVisitorId(vid)
        } catch {}
    }, [])

    useEffect(() => {
        try {
            const path = stripLocalePrefix(location?.pathname || '/')
            if (path.startsWith('/admin') || path === '/os' || path === '/cli') return
            fetch('/api/metrics/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId: visitorId || '', path })
            }).catch(() => {})
        } catch {}
    }, [location?.pathname, visitorId])

    // Manual SEO moved to SEO.jsx component on individual pages

    return (
        <div data-theme={themeId} style={{ '--site-accent': getAccent(themeConfig.accentPrefix).hex }} className={`site-shell relative min-h-screen overflow-x-hidden font-sans transition-colors duration-500 ${
            themeConfig.backgroundClass
        } ${!themeConfig.isDark ? 'light-mode text-gray-900' : 'text-white'} ${themeConfig.isTerminal ? 'terminal-mode' : ''}`}>
            <LocaleSync />
            <style>{`
                body { font-family: 'Outfit Variable', 'Outfit', sans-serif; }
                .lqft-select option { color: #0f172a; background: #f8fafc; }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-blob { animation: none !important; }
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>

            <BackgroundBlobs theme={themeConfig.accentPrefix} darkMode={themeConfig.isDark} customBlobClasses={themeConfig.blobClasses} reducedMotion={reducedMotion} staticOnMobile={staticBlobs} />
            <CustomCursor
                theme={themeConfig.accentPrefix}
                darkMode={themeConfig.isDark}
                reducedMotion={reducedMotion}
                cursorStyle={cursorThemeId}
            />
            
            {!isFullscreenRoute && (
                <Header 
                    setThemeId={setThemeId} 
                    currentThemeId={themeId}
                    setCursorThemeId={setCursorThemeId}
                    currentCursorThemeId={cursorThemeId}
                    theme={themeConfig.accentPrefix} 
                    darkMode={themeConfig.isDark} 
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    onLanguageChange={showLanguageToast}
                />
            )}
            
            <main id="main-content" role="main" tabIndex={-1} className={`relative z-10 transition-all duration-500 ${!isFullscreenRoute ? 'responsive-content pt-[4.75rem] sm:pt-20 md:pt-24 pb-28 lg:pb-0' : ''}`}>
                <Routes location={location} key={location.pathname}>
                    {buildAppRouteElements(themeConfig.accentPrefix)}
                </Routes>
            </main>

            {/* Footer */}
            {!isFullscreenRoute && <Footer theme={themeConfig.accentPrefix} />}
            
            {/* Mobile Bottom Navigation */}
            {!isFullscreenRoute && <BottomNav theme={themeConfig.accentPrefix} />}
            
            {/* AI Chatbot */}
            {!isFullscreenRoute && <ChatbotLauncher theme={themeConfig.accentPrefix} />}
            
            <NavigationEffects />
            <OfflineBanner />
            <PwaInstallPrompt theme={themeConfig.accentPrefix} />
            <PwaUpdatePrompt theme={themeConfig.accentPrefix} />

            {/* Toast Notifications */}
            <Toast 
                isVisible={toast.isVisible} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, isVisible: false })} 
            />
        </div>
    );
};

