import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

function isNewPost(publishAt) {
  if (!publishAt) return false;
  const d = new Date(publishAt);
  if (Number.isNaN(d.getTime())) return false;
  const days = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return days <= 7;
}

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
            const w = 240;
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
    const current = posts[index] ?? posts[0];
    const title = current?.title ?? '';
    const latest5 = posts.slice(0, 5);
    const showNewOnTrigger = isNewPost(current?.publishAt);

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
    const newBadgeClass = darkMode
        ? 'bg-emerald-400/20 text-emerald-300'
        : 'bg-emerald-600/15 text-emerald-700';

    const dropdownEl = isOpen && dropdownRect && typeof document !== 'undefined' && createPortal(
        <div
            ref={dropdownRef}
            className={`fixed z-[9999] min-w-[240px] max-w-[320px] rounded-xl overflow-hidden ${dropdownClasses}`}
            style={{ top: dropdownRect.top, left: dropdownRect.left }}
        >
            <div className="py-2 max-h-[280px] overflow-y-auto">
                <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${headerClasses}`}>Latest posts</div>
                {latest5.map((p) => (
                    <Link
                        key={p.id}
                        to={`/blog/${p.id}`}
                        onClick={() => { setIsOpen(false); onNavigate?.(); }}
                        className={`flex items-center gap-2 px-3 py-2 text-sm truncate ${linkClasses}`}
                    >
                        <span className="truncate flex-1">{p.title}</span>
                        {isNewPost(p.publishAt) && (
                            <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${newBadgeClass}`}>New</span>
                        )}
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
                className={`px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm font-medium hover:text-white hover:bg-white/15 transition-colors duration-300 flex items-center gap-1.5 truncate text-left max-w-[200px] ${compact ? 'ml-2' : 'w-full max-w-[260px] mx-auto'}`}
                title={title}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className={`text-xs font-semibold shrink-0 ${theme === 'pink' ? 'text-pink-400/90' : 'text-emerald-400/90'}`}>Latest:</span>
                <span className="truncate">{title}</span>
                {showNewOnTrigger && (
                    <span className={`shrink-0 text-[9px] font-bold uppercase px-1 py-0.5 rounded ${newBadgeClass}`}>New</span>
                )}
            </button>
            {dropdownEl}
        </div>
    );
};
