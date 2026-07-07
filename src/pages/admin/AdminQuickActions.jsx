import React from 'react';
import { useAdmin } from './AdminContext.jsx';
import { adminFetch, adminJson } from '../../utils/adminApi.js';
import { SITE_URL } from '../../config/site.js';

export const AdminQuickActions = () => {
  const { showToast } = useAdmin();

  const clearCache = async () => {
    try {
      await adminJson('/api/admin/actions/clear-ai-cache', { method: 'POST' });
      showToast('AI cache cleared');
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const exportCsv = async () => {
    try {
      const res = await adminFetch('/api/admin/metrics/export?range=7');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-7d.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Analytics exported');
    } catch (e) {
      showToast(e.message || 'Export failed', 'error');
    }
  };

  const links = [
    { label: 'View live site', href: SITE_URL },
    { label: 'View blog', href: `${SITE_URL}/blog` },
    { label: 'View sitemap', href: `${SITE_URL}/sitemap.xml` },
  ];

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <h4 className="text-white font-semibold mb-3">Quick actions</h4>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={clearCache} className="px-3 py-2 rounded-lg bg-white/10 text-sm text-gray-200 hover:bg-white/20">
          Clear AI cache
        </button>
        <button type="button" onClick={exportCsv} className="px-3 py-2 rounded-lg bg-white/10 text-sm text-gray-200 hover:bg-white/20">
          Export analytics CSV
        </button>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-white/10 text-sm text-gray-200 hover:bg-white/20"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
};
