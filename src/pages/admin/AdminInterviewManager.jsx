import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth.jsx';

export const AdminInterviewManager = ({ theme }) => {
  const token = getAuthToken();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/ai-knowledge?key=interview', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      .then(d => setContent(d.content || ''))
      .catch(() => setError('Failed to load Interview knowledge'))
      .finally(() => setLoading(false));
  }, [token]);

  const save = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/ai-knowledge?key=interview', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed');
      alert('Interview Knowledge saved successfully!');
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-gray-300">
      <h3 className="text-xl text-white font-bold mb-4">Interview Knowledge Base</h3>
      <p className="mb-4 text-sm text-gray-400">Paste your resume and professional background here. The AI will strictly roleplay as you during Mock Interviews based on this context.</p>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {error && <div className="text-red-300">{error}</div>}
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={15} 
            placeholder="Paste your full resume and work experience here..." 
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded font-sans" 
          />
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-emerald-600/80 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Interview Knowledge'}
          </button>
        </div>
      )}
    </div>
  );
};
