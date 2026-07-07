import React, { useEffect, useState } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { AdminListSkeleton } from './components/AdminSkeleton.jsx';

export const AdminAuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminJson('/api/admin/audit-log')
      .then((d) => setEntries(d.entries || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="text-gray-300">
      <h3 className="text-xl text-white font-bold mb-2">Audit log</h3>
      <p className="text-sm text-gray-400 mb-4">Recent admin actions (last 100).</p>
      {loading ? <AdminListSkeleton rows={6} /> : entries.length === 0 ? (
        <p className="text-gray-500 text-sm">No audit entries yet.</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {entries.map((e) => (
            <div key={e.id} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-emerald-400 font-mono">{e.action}</span>
                <span className="text-xs text-gray-500 shrink-0">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">by {e.username}{e.ip ? ` · ${e.ip}` : ''}</div>
              {e.details && Object.keys(e.details).length > 0 && (
                <pre className="mt-1 text-xs text-gray-500 overflow-x-auto">{JSON.stringify(e.details)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
