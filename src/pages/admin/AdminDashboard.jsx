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
import { getAuthToken } from '../../utils/auth.jsx';

export const AdminDashboard = ({ theme }) => {
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [range, setRange] = useState(7);
  const [series, setSeries] = useState([]);
  const [paths, setPaths] = useState([]);
  const [activeTab, setActiveTab] = useState('blog'); // 'blog' | 'projects' | 'status'
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch('/api/admin/db-status', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(setDbStatus)
      .catch(() => setError('Failed to load admin data'))
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(setMetrics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Public metrics time series
    fetch(`/api/metrics/series?range=${range}`)
      .then(res => res.ok ? res.json() : { series: [] })
      .then(d => setSeries(Array.isArray(d.series) ? d.series : []))
      .catch(() => setSeries([]))
  }, [range]);

  useEffect(() => {
    // Top paths breakdown
    fetch(`/api/metrics/paths?range=${range}`)
      .then(res => res.ok ? res.json() : { paths: [] })
      .then(d => setPaths(Array.isArray(d.paths) ? d.paths : []))
      .catch(() => setPaths([]))
  }, [range]);

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
      <div className="container mx-auto max-w-3xl">
        <GlassCard className="p-8" theme={theme}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <button onClick={handleLogout} className="px-4 py-2 rounded bg-white/10 text-gray-200 hover:bg-white/20">Log out</button>
          </div>
          {error && <div className="text-red-300 mb-4">{error}</div>}

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {['blog','projects','status','ai'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded ${activeTab===tab ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {tab === 'blog' ? 'Blog' : tab === 'projects' ? 'Projects' : tab === 'status' ? 'System' : 'AI Context'}
              </button>
            ))}
          </div>

          {activeTab === 'status' && (
            <div className="text-gray-300">
              <div className="mb-2">DB Engine: <span className="text-white">{dbStatus?.engine || 'unknown'}</span></div>
              {dbStatus && 'connected' in dbStatus && (
                <div className="mb-4">Connected: <span className="text-white">{String(dbStatus.connected)}</span></div>
              )}
              {metrics && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded bg-white/5 border border-white/10 text-center">
                    <div className="text-2xl font-bold">{metrics.uniqueVisitors}</div>
                    <div className="text-sm text-gray-300">Visitors</div>
                  </div>
                  <div className="p-4 rounded bg-white/5 border border-white/10 text-center">
                    <div className="text-2xl font-bold">{metrics.pageviews}</div>
                    <div className="text-sm text-gray-300">Impressions</div>
                  </div>
                </div>
              )}

              {/* Range toggle */}
              <div className="mt-6 flex gap-2">
                {[7,30,90].map(r => (
                  <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded ${range===r ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'}`}>{r}-day</button>
                ))}
              </div>

              {/* Simple SVG line chart */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded">
                <Chart theme={theme} data={series} />
              </div>

              {/* Top pages table */}
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded">
                <h4 className="text-white font-semibold mb-3">Top Pages (last {range} days)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-300">
                        <th className="py-2 pr-4">Path</th>
                        <th className="py-2 pr-4">Pageviews</th>
                        <th className="py-2 pr-4">Visitors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paths.map((p) => (
                        <tr key={p.path} className="border-t border-white/10 text-gray-200">
                          <td className="py-2 pr-4 font-mono">{p.path}</td>
                          <td className="py-2 pr-4">{p.pageviews}</td>
                          <td className="py-2 pr-4">{p.uniqueVisitors}</td>
                        </tr>
                      ))}
                      {paths.length === 0 && (
                        <tr><td colSpan={3} className="py-3 text-gray-400">No data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blog' && <AdminBlogManager theme={theme} />}
          {activeTab === 'projects' && <AdminProjectsManager theme={theme} />}
          {activeTab === 'ai' && <AdminAIManager theme={theme} />}
        </GlassCard>
      </div>
    </section>
  );
};

