import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const BottomNav = ({ theme }) => {
    const { t } = useTranslation();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: t('nav.Home'), path: '/', icon: HomeIcon },
        { name: t('nav.Stats'), path: '/stats', icon: StatsIcon },
        { name: t('nav.Blog'), path: '/blog', icon: BlogIcon },
        { name: t('nav.Contact'), path: '/contact', icon: ContactIcon },
    ];

    const activeColor = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400';

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-white/10 pb-safe pt-2 px-4">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${active ? activeColor : 'text-gray-400 hover:text-white'}`}
                        >
                            <item.icon className={`w-6 h-6 mb-1 ${active ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-semibold tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

const HomeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const StatsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);

const BlogIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
);

const ContactIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
