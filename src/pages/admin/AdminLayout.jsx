import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from './AdminContext.jsx';
import { getAdminLoginPath } from '../../utils/i18nRouting.js';
import { getAuthToken } from '../../utils/auth.jsx';
import {
  LayoutDashboard, FileText, FolderKanban, BarChart3, Bot, DollarSign,
  MessageSquare, Store, Mail, Image, ScrollText, LogOut, ExternalLink, BrainCircuit,
} from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'algorithms', label: 'Algorithms', icon: BrainCircuit },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, wide: true },
  { id: 'contact', label: 'Contact', icon: Mail, badgeKey: 'unreadContacts' },
  { id: 'app_store', label: 'App Store', icon: Store, badgeKey: 'pendingApps' },
  { id: 'ai', label: 'AI Context', icon: Bot },
  { id: 'ai_cost', label: 'AI Cost', icon: DollarSign },
  { id: 'interview_ai', label: 'Interview AI', icon: MessageSquare },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'audit', label: 'Audit log', icon: ScrollText },
];

export const AdminLayout = ({ children, activeTab = 'home', setTab }) => {
  const navigate = useNavigate();
  const { badges, refreshBadges } = useAdmin();
  const isWide = TABS.find((t) => t.id === activeTab)?.wide;

  useEffect(() => { refreshBadges(); }, [refreshBadges]);

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token) {
      try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
      try { localStorage.removeItem('authToken'); } catch {}
    }
    navigate(getAdminLoginPath(window.location.pathname), { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row">
      <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between lg:block">
          <div>
            <h1 className="font-bold text-lg">Admin</h1>
            <Link to="/" className="text-xs text-gray-400 hover:text-emerald-400 flex items-center gap-1 mt-1">
              <ExternalLink className="w-3 h-3" /> Back to site
            </Link>
          </div>
          <button type="button" onClick={handleLogout} className="lg:hidden p-2 rounded-lg bg-white/10" aria-label="Log out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-3 lg:pb-4">
          {TABS.map(({ id, label, icon: Icon, badgeKey }) => {
            const badge = badgeKey ? badges[badgeKey] : 0;
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab?.(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${active ? 'bg-emerald-600/30 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={handleLogout} className="hidden lg:flex items-center gap-2 mx-2 mb-4 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </aside>
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-auto ${isWide ? 'max-w-none' : 'max-w-5xl'}`}>
        {children}
      </main>
    </div>
  );
};

export { TABS };
