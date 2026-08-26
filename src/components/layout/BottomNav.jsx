import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { openMobileMenu } from '../../utils/mobileMenuEvents.js';
import { LocalizedLink } from '../ui/LocalizedLink.jsx';
import { stripLocalePrefix } from '../../utils/i18nRouting.js';
import { haptic } from '../../utils/haptics.js';
import { getAccent } from '../../utils/themeTokens.js';

export const BottomNav = React.memo(function BottomNav({ theme }) {
    const { t } = useTranslation();
    const location = useLocation();
    const path = stripLocalePrefix(location.pathname);

    const isActive = (itemPath) => {
        if (itemPath === '/explore') {
            return ['/explore', '/cli', '/os', '/algorithm-memorizer', '/intro', '/interview', '/tech-news'].some(
                (p) => path === p || path.startsWith(p + '/')
            );
        }
        return path === itemPath;
    };

    const navItems = [
        { name: t('nav.Home'), path: '/', icon: HomeIcon },
        { name: t('nav.Projects'), path: '/projects', icon: ProjectsIcon },
        { name: t('nav.Explore'), path: '/explore', icon: ExploreIcon },
        { name: t('nav.Stats'), path: '/stats', icon: StatsIcon },
        { name: t('nav.Menu'), action: 'menu', icon: MenuIcon },
    ];

    const activeColor = getAccent(theme).text;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-white/10 pb-safe pt-2 px-2" aria-label="Mobile bottom navigation">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const active = item.action === 'menu' ? false : isActive(item.path);

                    if (item.action === 'menu') {
                        return (
                            <button
                                key="menu"
                                type="button"
                                onClick={() => { haptic(); openMobileMenu(); }}
                                className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-gray-400 hover:text-white transition-colors"
                                aria-label={t('nav.Menu')}
                            >
                                <item.icon className="w-6 h-6 mb-0.5" />
                                <span className="text-[10px] font-semibold tracking-wide">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <LocalizedLink
                            key={item.path}
                            to={item.path}
                            onClick={() => haptic()}
                            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${active ? activeColor : 'text-gray-400 hover:text-white'}`}
                        >
                            <item.icon className={`w-6 h-6 mb-0.5 ${active ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-semibold tracking-wide truncate max-w-full px-0.5">{item.name}</span>
                        </LocalizedLink>
                    );
                })}
            </div>
        </nav>
    );
});

const HomeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const ProjectsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 7a2 2 0 0 1 2-2h3.5l2-2H16a2 2 0 0 1 2 2v1"/><path d="M2 13a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/></svg>
);

const ExploreIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
);

const StatsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);

const MenuIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
