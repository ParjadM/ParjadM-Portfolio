import React, { useState, useEffect } from 'react';
import { Store, ArrowLeft, ExternalLink, Send, Loader2, PackageOpen, CheckCircle2, Globe } from 'lucide-react';

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50";

const AppIcon = ({ app, size = 'w-12 h-12' }) => (
    app.iconUrl ? (
        <img src={app.iconUrl} alt="" className={`${size} rounded-xl object-cover bg-white/10`} loading="lazy" />
    ) : (
        <div className={`${size} rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-emerald-300 font-bold text-lg uppercase`}>
            {app.name?.charAt(0) || '?'}
        </div>
    )
);

export const AppStoreApp = () => {
    const [tab, setTab] = useState('browse'); // 'browse' | 'submit'
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runningApp, setRunningApp] = useState(null);

    const [form, setForm] = useState({ name: '', description: '', url: '', iconUrl: '', author: '', authorEmail: '', company: '' });
    const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

    useEffect(() => {
        fetch('/api/apps')
            .then(res => res.ok ? res.json() : null)
            .then(d => setApps(Array.isArray(d?.apps) ? d.apps : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitState({ status: 'sending', message: '' });
        try {
            const res = await fetch('/api/apps/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            setSubmitState({ status: 'done', message: '' });
            setForm({ name: '', description: '', url: '', iconUrl: '', author: '', authorEmail: '', company: '' });
        } catch (err) {
            setSubmitState({ status: 'error', message: err.message });
        }
    };

    if (runningApp) {
        return (
            <div className="h-full flex flex-col bg-gray-950">
                <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-white/10">
                    <button
                        onClick={() => setRunningApp(null)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300"
                        aria-label="Back to store"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <AppIcon app={runningApp} size="w-6 h-6" />
                    <span className="text-sm text-white font-medium truncate">{runningApp.name}</span>
                    <span className="text-xs text-gray-500 truncate hidden sm:inline">by {runningApp.author}</span>
                    <a
                        href={runningApp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-gray-300"
                        title="Open in new tab"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                <iframe
                    src={runningApp.url}
                    title={runningApp.name}
                    className="flex-1 w-full border-0 bg-white"
                    sandbox="allow-scripts allow-forms allow-popups allow-pointer-lock"
                    referrerPolicy="no-referrer"
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-950 text-white">
            <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-emerald-400" />
                    <h2 className="font-bold text-lg">App Store</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab('browse')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'browse' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:bg-white/10'}`}
                    >
                        Browse
                    </button>
                    <button
                        onClick={() => setTab('submit')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'submit' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:bg-white/10'}`}
                    >
                        Submit your app
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {tab === 'browse' && (
                    <>
                        {loading && (
                            <div className="flex items-center justify-center py-16 text-gray-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                        {!loading && apps.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-3">
                                <PackageOpen className="w-10 h-10" />
                                <p className="text-sm">No community apps yet.</p>
                                <button onClick={() => setTab('submit')} className="text-emerald-400 text-sm hover:underline">
                                    Be the first to submit one
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {apps.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => setRunningApp(app)}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group"
                                >
                                    <AppIcon app={app} />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">{app.name}</div>
                                        <div className="text-xs text-gray-500 mb-1">by {app.author}</div>
                                        <p className="text-xs text-gray-400 line-clamp-2">{app.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {tab === 'submit' && (
                    submitState.status === 'done' ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            <p className="text-white font-semibold">Submitted for review</p>
                            <p className="text-sm text-gray-400 max-w-xs">
                                Your app is pending approval. Once reviewed and approved, it will appear in the store.
                            </p>
                            <button onClick={() => setSubmitState({ status: 'idle', message: '' })} className="text-emerald-400 text-sm hover:underline">
                                Submit another app
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="max-w-md mx-auto space-y-3">
                            <p className="text-xs text-gray-400 flex items-start gap-2">
                                <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                                Share a link to your web app. All submissions are reviewed before appearing in the store, and run in a sandbox.
                            </p>
                            <input required maxLength={60} placeholder="App name *" value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
                            <textarea required maxLength={300} rows={3} placeholder="Short description *" value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
                            <input required type="url" placeholder="App URL (https://...) *" value={form.url}
                                onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={inputClass} />
                            <input type="url" placeholder="Icon URL (optional)" value={form.iconUrl}
                                onChange={e => setForm(f => ({ ...f, iconUrl: e.target.value }))} className={inputClass} />
                            <input required maxLength={60} placeholder="Your name *" value={form.author}
                                onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className={inputClass} />
                            <input type="email" placeholder="Your email (optional, for questions)" value={form.authorEmail}
                                onChange={e => setForm(f => ({ ...f, authorEmail: e.target.value }))} className={inputClass} />
                            {/* Honeypot — hidden from real users */}
                            <input tabIndex={-1} autoComplete="off" value={form.company}
                                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                                className="hidden" aria-hidden="true" placeholder="Company" />
                            {submitState.status === 'error' && (
                                <p className="text-sm text-red-400">{submitState.message}</p>
                            )}
                            <button
                                type="submit"
                                disabled={submitState.status === 'sending'}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors font-semibold text-sm disabled:opacity-50"
                            >
                                {submitState.status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Submit for review
                            </button>
                        </form>
                    )
                )}
            </div>
        </div>
    );
};
