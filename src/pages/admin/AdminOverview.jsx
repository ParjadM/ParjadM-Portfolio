import React, { useEffect, useState } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { AdminOverviewSkeleton } from './components/AdminSkeleton.jsx';
import { AdminQuickActions } from './AdminQuickActions.jsx';

export const AdminOverview = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminJson('/api/admin/overview')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminOverviewSkeleton />;
  if (!data) return <div className="text-gray-400">Could not load overview.</div>;

  const cards = [
    { label: 'Total pageviews', value: data.pageviews, tab: 'analytics' },
    { label: 'Unique visitors', value: data.uniqueVisitors, tab: 'analytics' },
    { label: "Today's pageviews", value: data.todayPageviews, tab: 'analytics' },
    { label: 'Pending app submissions', value: data.pendingApps, tab: 'app_store', highlight: data.pendingApps > 0 },
    { label: 'Unread contact messages', value: data.unreadContacts, tab: 'contact', highlight: data.unreadContacts > 0 },
    { label: 'Open client errors', value: data.openErrors, tab: 'analytics', highlight: data.openErrors > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl text-white font-bold mb-1">Overview</h3>
        <p className="text-sm text-gray-400">Quick snapshot of site health and pending work.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onNavigate?.(c.tab)}
            className={`text-left p-4 rounded-xl border transition-colors hover:bg-white/10 ${c.highlight ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-white/5'}`}
          >
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{c.label}</div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
          </button>
        ))}
      </div>
      <AdminQuickActions />
    </div>
  );
};
