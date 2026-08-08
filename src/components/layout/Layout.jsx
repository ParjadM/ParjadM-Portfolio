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

import { getThemeConfig } from '../../utils/themeConfig.js';
import { useReducedMotion } from '../../utils/useReducedMotion.js';
import { isFullscreenPath, stripLocalePrefix } from '../../utils/i18nRouting.js';

export const Layout = ({ themeId, setThemeId, toast, setToast }) => {
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
        <div className={`relative min-h-screen overflow-x-hidden font-sans transition-colors duration-500 ${
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
                .light-mode .text-white { color: rgb(17 24 39) !important; }
                .light-mode .text-gray-300 { color: rgb(75 85 99) !important; }
                .light-mode .text-gray-400 { color: rgb(107 114 128) !important; }
                .light-mode .text-gray-500 { color: rgb(107 114 128) !important; }
                .light-mode [class*="bg-white/"] { --tw-bg-opacity: 0.06; background-color: rgb(0 0 0 / var(--tw-bg-opacity)) !important; }
                .light-mode [class*="border-white/"] { border-color: rgb(229 231 235 / 0.8) !important; }
                .light-mode .border-white\\/10 { border-color: rgb(229 231 235) !important; }
                .light-mode .hover\\:border-white\\/20:hover { border-color: rgb(156 163 175) !important; }
                .light-mode .hover\\:border-white\\/40:focus { border-color: rgb(107 114 128) !important; }
                .light-mode .focus\\:border-white\\/40:focus { border-color: rgb(107 114 128) !important; }
                .light-mode .placeholder-gray-400::placeholder { color: rgb(156 163 175); }
                .light-mode header a, .light-mode header button { color: rgb(17 24 39) !important; }
                .light-mode header nav a:hover { color: rgb(17 24 39) !important; }
                .light-mode header nav a[aria-current="page"] { background-color: rgba(16 185 129 / 0.2) !important; color: rgb(5 150 105) !important; }
                .light-mode header img[alt="Logo"] { filter: brightness(0); }
                .light-mode .text-gray-200 { color: rgb(55 65 81) !important; }
                .light-mode footer .text-gray-300 { color: rgb(75 85 99) !important; }
                .light-mode footer .text-gray-500 { color: rgb(107 114 128) !important; }
                .light-mode footer a { color: rgb(75 85 99) !important; }
                .light-mode footer a:hover { color: rgb(34 197 94) !important; }
                .light-mode ::placeholder { color: rgb(156 163 175); opacity: 1; }

                .terminal-mode { color: #4ade80 !important; }
                .terminal-mode .text-white, .terminal-mode .text-gray-300, .terminal-mode .text-gray-400, .terminal-mode .text-gray-500 { color: #4ade80 !important; }
                .terminal-mode [class*="bg-white/"] { background-color: rgba(74, 222, 128, 0.05) !important; }
                .terminal-mode [class*="border-white/"] { border-color: rgba(74, 222, 128, 0.3) !important; }
                .terminal-mode header img[alt="Logo"] { filter: sepia(100%) hue-rotate(80deg) saturate(400%) brightness(1.2); }
            `}</style>

            <BackgroundBlobs theme={themeConfig.accentPrefix} darkMode={themeConfig.isDark} customBlobClasses={themeConfig.blobClasses} reducedMotion={reducedMotion} staticOnMobile={staticBlobs} />
            <CustomCursor theme={themeConfig.accentPrefix} darkMode={themeConfig.isDark} reducedMotion={reducedMotion} />
            
            {!isFullscreenRoute && (
                <Header 
                    setThemeId={setThemeId} 
                    currentThemeId={themeId} 
                    theme={themeConfig.accentPrefix} 
                    darkMode={themeConfig.isDark} 
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    onLanguageChange={showLanguageToast}
                />
            )}
            
            <main id="main-content" role="main" tabIndex={-1} className={`relative z-10 transition-all duration-500 ${!isFullscreenRoute ? 'pt-[4.75rem] sm:pt-20 md:pt-24 pb-28 lg:pb-0' : ''}`}>
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
            
            <OfflineBanner />
            <PwaInstallPrompt theme={themeConfig.accentPrefix} />

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

