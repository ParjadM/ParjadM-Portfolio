import React, { useState, useEffect, useCallback } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { AdminModal } from './components/AdminModal.jsx';
import { AdminListSkeleton } from './components/AdminSkeleton.jsx';

const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-300',
  approved: 'bg-emerald-500/20 text-emerald-300',
  rejected: 'bg-red-500/20 text-red-300',
};

export const AdminAppStoreManager = () => {
  const { showToast, refreshBadges } = useAdmin();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminJson('/api/admin/apps');
      setApps(Array.isArray(data.apps) ? data.apps : []);
      refreshBadges();
    } catch (e) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, refreshBadges]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action, body) => {
    try {
      await adminJson(`/api/admin/apps/${id}/${action}`, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      showToast(action === 'approve' ? 'App approved' : 'App rejected');
      load();
    } catch (e) {
      showToast(e.message || 'Action failed', 'error');
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await adminJson(`/api/admin/apps/${deleteId}`, { method: 'DELETE' });
      showToast('Submission deleted');
      setDeleteId(null);
      load();
    } catch (e) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    await act(rejectModal, 'reject', { reason: rejectReason });
    setRejectModal(null);
    setRejectReason('');
  };

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xl text-white font-bold">App Store submissions</h3>
        <div className="flex gap-1">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm capitalize ${filter === f ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <AdminListSkeleton /> : filtered.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">No {filter === 'all' ? '' : filter} submissions.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {app.iconUrl && <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover bg-white/10" />}
                    <span className="font-semibold text-white">{app.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[app.status] || ''}`}>{app.status}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{app.description}</p>
                  <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                    <div>
                      URL: <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline break-all">{app.url}</a>
                    </div>
                    <div>By {app.author}{app.authorEmail ? ` — ${app.authorEmail}` : ''} · {new Date(app.createdAt).toLocaleString()}</div>
                    {app.status === 'rejected' && app.rejectionReason && <div className="text-red-400">Reason: {app.rejectionReason}</div>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {app.status !== 'approved' && (
                    <button type="button" onClick={() => act(app.id, 'approve')} className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-sm">Approve</button>
                  )}
                  {app.status !== 'rejected' && (
                    <button type="button" onClick={() => { setRejectModal(app.id); setRejectReason(''); }} className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm">Reject</button>
                  )}
                  <button type="button" onClick={() => setDeleteId(app.id)} className="px-3 py-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={!!rejectModal}
        title="Reject submission"
        onClose={() => setRejectModal(null)}
        footer={
          <>
            <button type="button" onClick={() => setRejectModal(null)} className="px-3 py-2 rounded-lg bg-white/10">Cancel</button>
            <button type="button" onClick={confirmReject} className="px-3 py-2 rounded-lg bg-amber-600/80">Reject</button>
          </>
        }
      >
        <label className="block text-sm mb-2">Reason (optional)</label>
        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" placeholder="Why is this being rejected?" />
      </AdminModal>

      <AdminModal
        open={!!deleteId}
        title="Delete submission?"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <button type="button" onClick={() => setDeleteId(null)} className="px-3 py-2 rounded-lg bg-white/10">Cancel</button>
            <button type="button" onClick={remove} className="px-3 py-2 rounded-lg bg-red-600/80">Delete</button>
          </>
        }
      >
        This permanently removes the submission.
      </AdminModal>
    </div>
  );
};
