import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from './Icons.jsx';
import { GlassCard } from './GlassCard.jsx';
import { RippleButton } from './RippleButton.jsx';
import { Toast } from './Toast.jsx';
import { getAuthToken } from '../../utils/auth.jsx';

export const NewsFeed = ({ posts, theme, onNavigate, compact, darkMode = true }) => {
    const [index, setIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!posts?.length) return;
        const id = setInterval(() => setIndex(i => (i + 1) % posts.length), 10000);
        return () => clearInterval(id);
    }, [posts?.length]);

    useEffect(() => {
        if (isOpen && triggerRef.current && typeof window !== 'undefined') {
            const rect = triggerRef.current.getBoundingClientRect();
            const w = 220;
            const left = compact ? Math.max(8, rect.right - w) : Math.max(8, Math.min(rect.left + (rect.width / 2) - (w / 2), window.innerWidth - w - 8));
            setDropdownRect({ top: rect.bottom + 8, left, width: w });
        } else {
            setDropdownRect(null);
        }
    }, [isOpen, compact]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!posts?.length) return null;
    const title = posts[index]?.title ?? '';
    const latest5 = posts.slice(0, 5);

    const dropdownClasses = darkMode
        ? 'bg-emerald-900/90 backdrop-blur-lg border border-emerald-700/40 shadow-2xl'
        : 'bg-emerald-50/98 backdrop-blur-lg border border-emerald-200/80 shadow-2xl';
    const headerClasses = darkMode ? 'text-emerald-200/90' : 'text-gray-500';
    const linkClasses = darkMode
        ? 'text-emerald-100 hover:bg-emerald-700/30'
        : 'text-gray-800 hover:bg-emerald-100/80';
    const dividerClasses = darkMode ? 'border-emerald-700/30' : 'border-emerald-200/60';
    const viewAllClasses = darkMode
        ? `${theme === 'pink' ? 'text-pink-400 hover:bg-emerald-700/30' : 'text-emerald-300 hover:bg-emerald-700/30'}`
        : `${theme === 'pink' ? 'text-pink-600 hover:bg-emerald-100/80' : 'text-emerald-600 hover:bg-emerald-100/80'}`;

    const dropdownEl = isOpen && dropdownRect && typeof document !== 'undefined' && createPortal(
        <div
            ref={dropdownRef}
            className={`fixed z-[9999] min-w-[220px] max-w-[320px] rounded-xl overflow-hidden ${dropdownClasses}`}
            style={{ top: dropdownRect.top, left: dropdownRect.left }}
        >
            <div className="py-2 max-h-[280px] overflow-y-auto">
                <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${headerClasses}`}>Latest posts</div>
                {latest5.map((p) => (
                    <Link
                        key={p.id}
                        to={`/blog/${p.id}`}
                        onClick={() => { setIsOpen(false); onNavigate?.(); }}
                        className={`block px-3 py-2 text-sm truncate ${linkClasses}`}
                    >
                        {p.title}
                    </Link>
                ))}
                <div className={`my-1 border-t ${dividerClasses}`} />
                <Link
                    to="/blog"
                    onClick={() => { setIsOpen(false); onNavigate?.(); }}
                    className={`block px-3 py-2.5 text-sm font-medium truncate ${viewAllClasses}`}
                >
                    View all posts →
                </Link>
            </div>
        </div>,
        document.body
    );

    return (
        <div className={`relative inline-block ${compact ? '' : 'w-full flex justify-center'}`}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className={`px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm font-medium hover:text-white hover:bg-white/15 transition-colors duration-300 block truncate text-left w-full ${compact ? 'ml-2 max-w-[180px]' : 'w-full max-w-[260px] mx-auto'}`}
                title={title}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className={`text-xs font-semibold mr-1.5 ${theme === 'pink' ? 'text-pink-400/90' : 'text-emerald-400/90'}`}>Latest:</span>
                {title}
            </button>
            {dropdownEl}
        </div>
    );
};

