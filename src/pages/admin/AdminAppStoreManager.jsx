import React, { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../../utils/auth.jsx';

const STATUS_STYLES = {
    pending: 'bg-amber-500/20 text-amber-300',
    approved: 'bg-emerald-500/20 text-emerald-300',
    rejected: 'bg-red-500/20 text-red-300',
};

export const AdminAppStoreManager = () => {
    const token = getAuthToken();
    const [apps, setApps] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/admin/apps', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setApps(Array.isArray(data.apps) ? data.apps : []);
        } catch {
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const act = async (id, action, body) => {
        await fetch(`/api/admin/apps/${id}/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: body ? JSON.stringify(body) : undefined,
        });
        load();
    };

    const remove = async (id) => {
        if (!confirm('Permanently delete this submission?')) return;
        await fetch(`/api/admin/apps/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        load();
    };

    const reject = (id) => {
        const reason = prompt('Rejection reason (optional):') || '';
        act(id, 'reject', { reason });
    };

    const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
    const pendingCount = apps.filter(a => a.status === 'pending').length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-xl text-white font-bold">
                    App Store Submissions
                    {pendingCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs align-middle">
                            {pendingCount} pending
                        </span>
                    )}
                </h3>
                <div className="flex gap-1">
                    {['pending', 'approved', 'rejected', 'all'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded text-sm capitalize ${filter === f ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="text-red-300 mb-3">{error}</div>}
            {loading && <div className="text-gray-300">Loading…</div>}
            {!loading && filtered.length === 0 && (
                <div className="text-gray-400 text-sm py-8 text-center">No {filter === 'all' ? '' : filter} submissions.</div>
            )}

            <div className="space-y-3">
                {filtered.map(app => (
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
                                        <span className="ml-2 text-gray-600">(open and review before approving)</span>
                                    </div>
                                    <div>By {app.author}{app.authorEmail ? ` — ${app.authorEmail}` : ''} · submitted {new Date(app.createdAt).toLocaleString()}</div>
                                    {app.status === 'rejected' && app.rejectionReason && <div className="text-red-400">Reason: {app.rejectionReason}</div>}
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {app.status !== 'approved' && (
                                    <button onClick={() => act(app.id, 'approve')} className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-sm">
                                        Approve
                                    </button>
                                )}
                                {app.status !== 'rejected' && (
                                    <button onClick={() => reject(app.id)} className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm">
                                        Reject
                                    </button>
                                )}
                                <button onClick={() => remove(app.id)} className="px-3 py-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
