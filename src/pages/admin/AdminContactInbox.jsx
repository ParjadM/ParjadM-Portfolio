import React, { useEffect, useState } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { AdminListSkeleton } from './components/AdminSkeleton.jsx';

export const AdminContactInbox = () => {
  const { showToast, refreshBadges } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    adminJson('/api/admin/contact')
      .then((d) => setMessages(d.messages || []))
      .catch(() => showToast('Failed to load messages', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id, read = true) => {
    await adminJson(`/api/admin/contact/${id}/read`, { method: 'PATCH', body: JSON.stringify({ read }) });
    load();
    refreshBadges();
    showToast(read ? 'Marked as read' : 'Marked as unread');
  };

  const remove = async (id) => {
    await adminJson(`/api/admin/contact/${id}`, { method: 'DELETE' });
    if (selected?.id === id) setSelected(null);
    load();
    refreshBadges();
    showToast('Message deleted');
  };

  return (
    <div className="text-gray-300">
      <h3 className="text-xl text-white font-bold mb-4">Contact inbox</h3>
      {loading ? <AdminListSkeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[400px]">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 && <p className="text-gray-500 text-sm">No messages yet.</p>}
            {messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setSelected(m); if (!m.read) markRead(m.id, true); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${selected?.id === m.id ? 'border-emerald-500/50 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} ${!m.read ? 'border-l-4 border-l-amber-400' : ''}`}
              >
                <div className="font-medium text-white truncate">{m.subject}</div>
                <div className="text-xs text-gray-400">{m.name} · {new Date(m.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 min-h-[200px]">
            {selected ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-semibold">{selected.subject}</h4>
                    <p className="text-sm text-gray-400">{selected.name} · <a href={`mailto:${selected.email}`} className="text-emerald-400">{selected.email}</a></p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <button type="button" onClick={() => remove(selected.id)} className="text-red-400 text-sm hover:underline">Delete</button>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Select a message to read.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
