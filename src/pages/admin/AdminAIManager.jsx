import React, { useState, useEffect } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { AdminPanelSkeleton } from './components/AdminSkeleton.jsx';

export const AdminAIManager = () => {
  const { showToast } = useAdmin();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJson('/api/admin/ai-knowledge')
      .then((d) => setContent(d.content || ''))
      .catch((e) => showToast(e.message || 'Failed to load', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const save = async () => {
    setSaving(true);
    try {
      await adminJson('/api/admin/ai-knowledge', { method: 'PUT', body: JSON.stringify({ content }) });
      showToast('Knowledge saved');
    } catch (e) {
      showToast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminPanelSkeleton />;

  return (
    <div className="text-gray-300">
      <h3 className="text-xl text-white font-bold mb-4">AI knowledge base</h3>
      <p className="mb-4 text-sm text-gray-400">The chatbot uses this text to answer questions about you.</p>
      <div className="space-y-4">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={15} placeholder="Hi, I am Parjad…" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg font-sans" />
        <button type="button" onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-600/80 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
};
