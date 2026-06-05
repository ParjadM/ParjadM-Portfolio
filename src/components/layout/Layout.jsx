import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { BackgroundBlobs } from '../ui/BackgroundBlobs.jsx';
import { CustomCursor } from '../CustomCursor.jsx';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import Chatbot from '../Chatbot.jsx';
import { Toast } from '../ui/Toast.jsx';
import { getAuthToken, RequireAuth } from '../../utils/auth.jsx';
import { AnimatePresence } from 'framer-motion';

import { getThemeConfig } from '../../utils/themeConfig.js';

const HomeSection = React.lazy(() => import('../../pages/HomeSection.jsx').then(m => ({default: m.HomeSection})));
const AboutSection = React.lazy(() => import('../../pages/AboutSection.jsx').then(m => ({default: m.AboutSection})));
const ProjectsSection = React.lazy(() => import('../../pages/ProjectsSection.jsx').then(m => ({default: m.ProjectsSection})));
const LQFTBenchmarkPage = React.lazy(() => import('../../pages/LQFTBenchmarkPage.jsx').then(m => ({default: m.LQFTBenchmarkPage})));
const StatsPage = React.lazy(() => import('../../pages/StatsPage.jsx').then(m => ({default: m.StatsPage})));
const BlogSection = React.lazy(() => import('../../pages/BlogSection.jsx').then(m => ({default: m.BlogSection})));
const BlogPostPage = React.lazy(() => import('../../pages/BlogPostPage.jsx').then(m => ({default: m.BlogPostPage})));
const ContactSection = React.lazy(() => import('../../pages/ContactSection.jsx').then(m => ({default: m.ContactSection})));
const AdminLoginPage = React.lazy(() => import('../../pages/admin/AdminLoginPage.jsx').then(m => ({default: m.AdminLoginPage})));
const AdminDashboard = React.lazy(() => import('../../pages/admin/AdminDashboard.jsx').then(m => ({default: m.AdminDashboard})));
const NotFoundPage = React.lazy(() => import('../../pages/NotFoundPage.jsx').then(m => ({default: m.NotFoundPage})));
const IntroCinematic = React.lazy(() => import('../../pages/IntroCinematic.jsx').then(m => ({default: m.IntroCinematic})));
const CliMode = React.lazy(() => import('../../pages/CliMode.jsx').then(m => ({default: m.CliMode})));
const MockInterviewPage = React.lazy(() => import('../../pages/MockInterviewPage.jsx').then(m => ({default: m.MockInterviewPage})));
export const Layout = ({ themeId, setThemeId, toast, setToast }) => {
    const location = useLocation();
    const [visitorId, setVisitorId] = useState(null);
    const themeConfig = getThemeConfig(themeId);
    
    const isFullscreenRoute = location?.pathname === '/intro' || location?.pathname === '/cli';

    useEffect(() => {
        // Ensure stable visitorId
        try {
            let vid = null
            try { vid = localStorage.getItem('visitorId') } catch {}
            if (!vid && typeof window !== 'undefined' && window.crypto?.getRandomValues) {
                const arr = new Uint8Array(16)
                window.crypto.getRandomValues(arr)
                vid = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
                try { localStorage.setItem('visitorId', vid) } catch {}
            }
            setVisitorId(vid)
        } catch {}
    }, [])

    useEffect(() => {
        // Track each route view
        try {
            const path = location?.pathname || '/'
            fetch('/api/metrics/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId: visitorId || '', path })
            }).catch(() => {})
        } catch {}
    }, [location?.pathname, visitorId])

    // Manual SEO moved to SEO.jsx component on individual pages

    return (
        <div className={`font-sans transition-colors duration-500 ${
            themeConfig.backgroundClass
        } ${!themeConfig.isDark ? 'light-mode text-gray-900' : 'text-white'} ${themeConfig.isTerminal ? 'terminal-mode' : ''}`}>
            <style>{`
                body { font-family: 'Inter', sans-serif; }
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

            <BackgroundBlobs theme={themeConfig.accentPrefix} darkMode={themeConfig.isDark} customBlobClasses={themeConfig.blobClasses} />
            <CustomCursor theme={themeConfig.accentPrefix} darkMode={themeConfig.isDark} />
            
            {!isFullscreenRoute && (
                <Header setThemeId={setThemeId} currentThemeId={themeId} theme={themeConfig.accentPrefix} darkMode={themeConfig.isDark} />
            )}
            
            <main id="main-content" role="main" tabIndex={-1} className={`transition-all duration-500 ${!isFullscreenRoute ? 'pt-20 md:pt-24' : ''}`}>
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center py-20 px-4 text-gray-300">
                        Loading...
                    </div>
                }>
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<HomeSection theme={themeConfig.accentPrefix} />} />
                            <Route path="/about" element={<AboutSection theme={themeConfig.accentPrefix} />} />
                            <Route path="/projects" element={<ProjectsSection theme={themeConfig.accentPrefix} />} />
                            <Route path="/projects/lqftBenchmark" element={<LQFTBenchmarkPage theme={themeConfig.accentPrefix} />} />
                            <Route path="/stats" element={<StatsPage theme={themeConfig.accentPrefix} />} />
                            <Route path="/blog" element={<BlogSection theme={themeConfig.accentPrefix} />} />
                            <Route path="/blog/:id" element={<BlogPostPage theme={themeConfig.accentPrefix} />} />
                            <Route path="/contact" element={<ContactSection theme={themeConfig.accentPrefix} />} />
                            <Route path="/admin/login" element={<AdminLoginPage theme={themeConfig.accentPrefix} />} />
                            <Route path="/admin" element={<RequireAuth><AdminDashboard theme={themeConfig.accentPrefix} /></RequireAuth>} />
                            <Route path="/intro" element={<IntroCinematic theme={themeConfig.accentPrefix} />} />
                            <Route path="/cli" element={<CliMode theme={themeConfig.accentPrefix} />} />
                            <Route path="/interview" element={<MockInterviewPage theme={themeConfig.accentPrefix} />} />
                            <Route path="*" element={<NotFoundPage theme={themeConfig.accentPrefix} />} />
                        </Routes>
                    </AnimatePresence>
                </Suspense>
            </main>

            {/* Footer */}
            {!isFullscreenRoute && <Footer theme={themeConfig.accentPrefix} />}
            
            {/* AI Chatbot */}
            {!isFullscreenRoute && <Chatbot theme={themeConfig.accentPrefix} />}
            
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

