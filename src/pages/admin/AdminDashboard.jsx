import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../../components/ui/Icons.jsx';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { RippleButton } from '../../components/ui/RippleButton.jsx';
import { Toast } from '../../components/ui/Toast.jsx';
import { Chart } from '../../components/ui/Chart.jsx';
import { AdminBlogManager } from './AdminBlogManager.jsx';
import { AdminProjectsManager } from './AdminProjectsManager.jsx';
import { AdminAIManager } from './AdminAIManager.jsx';
import { AdminAICostDashboard } from './AdminAICostDashboard.jsx';
import { AdminInterviewManager } from './AdminInterviewManager.jsx';
import { PremiumAnalytics } from './PremiumAnalytics.jsx';
import { getAuthToken } from '../../utils/auth.jsx';

export const AdminDashboard = ({ theme }) => {
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('blog'); // 'blog' | 'projects' | 'analytics' | 'ai'
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch('/api/admin/db-status', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(setDbStatus)
      .catch(() => setError('Failed to load admin data'))
  }, []);

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token) {
      try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
      try { localStorage.removeItem('authToken'); } catch {}
    }
    navigate('/admin/login', { replace: true });
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <GlassCard className="p-8" theme={theme}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <button onClick={handleLogout} className="px-4 py-2 rounded bg-white/10 text-gray-200 hover:bg-white/20">Log out</button>
          </div>
          {error && <div className="text-red-300 mb-4">{error}</div>}

          {/* Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {['blog','projects','analytics','ai','ai_cost','interview_ai'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded ${activeTab===tab ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {tab === 'blog' ? 'Blog' : tab === 'projects' ? 'Projects' : tab === 'analytics' ? 'Analytics' : tab === 'ai' ? 'AI Context' : tab === 'ai_cost' ? 'AI Cost' : 'Interview AI'}
              </button>
            ))}
          </div>

          {activeTab === 'analytics' && (
            <PremiumAnalytics theme={theme} dbStatus={dbStatus} />
          )}

          {activeTab === 'blog' && <AdminBlogManager theme={theme} />}
          {activeTab === 'projects' && <AdminProjectsManager theme={theme} />}
          {activeTab === 'ai' && <AdminAIManager theme={theme} />}
          {activeTab === 'ai_cost' && <AdminAICostDashboard theme={theme} />}
          {activeTab === 'interview_ai' && <AdminInterviewManager theme={theme} />}
        </GlassCard>
      </div>
    </section>
  );
};

