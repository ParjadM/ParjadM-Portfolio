import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../../components/ui/Icons.jsx';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { RippleButton } from '../../components/ui/RippleButton.jsx';
import { Toast } from '../../components/ui/Toast.jsx';
import { getAuthToken } from '../../utils/auth.jsx';

export const AdminAIManager = ({ theme }) => {
  const token = getAuthToken();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/ai-knowledge', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      .then(d => setContent(d.content || ''))
      .catch(() => setError('Failed to load AI knowledge'))
      .finally(() => setLoading(false));
  }, [token]);

  const save = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/ai-knowledge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed');
      alert('Saved successfully!');
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-gray-300">
      <h3 className="text-xl text-white font-bold mb-4">AI Knowledge Base</h3>
      <p className="mb-4 text-sm text-gray-400">Feed information about yourself here. The chatbot will use this text to answer questions about you.</p>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {error && <div className="text-red-300">{error}</div>}
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={15} 
            placeholder="Hi, I am Parjad. I am a web developer..." 
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded font-sans" 
          />
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-emerald-600/80 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Knowledge'}
          </button>
        </div>
      )}
    </div>
  );
};

