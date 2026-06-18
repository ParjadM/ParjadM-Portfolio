import React, { useState } from 'react';

export function BlogAiExplain({ postId, theme = 'green' }) {
  const [tldr, setTldr] = useState('');
  const [junior, setJunior] = useState('');
  const [loadingMode, setLoadingMode] = useState(null);
  const [error, setError] = useState('');

  const btnBase = theme === 'pink'
    ? 'border-pink-500/30 text-pink-200 hover:bg-pink-500/10'
    : 'border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10';

  const fetchExplain = async (mode) => {
    setLoadingMode(mode);
    setError('');
    try {
      const res = await fetch('/api/ai/blog/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      if (mode === 'tldr') setTldr(data.reply);
      else setJunior(data.reply);
    } catch (err) {
      setError(err.message || 'Could not generate explanation');
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/10">
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={() => fetchExplain('tldr')}
          disabled={!!loadingMode}
          className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors disabled:opacity-50 ${btnBase}`}
        >
          {loadingMode === 'tldr' ? 'Generating TL;DR...' : 'TL;DR'}
        </button>
        <button
          type="button"
          onClick={() => fetchExplain('junior')}
          disabled={!!loadingMode}
          className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors disabled:opacity-50 ${btnBase}`}
        >
          {loadingMode === 'junior' ? 'Simplifying...' : "Explain like I'm junior"}
        </button>
      </div>

      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

      {tldr && (
        <div className="mb-4">
          <h3 className="text-white font-semibold text-sm mb-2">TL;DR</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{tldr}</p>
        </div>
      )}

      {junior && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-2">Junior-friendly explanation</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{junior}</p>
        </div>
      )}
    </div>
  );
}
