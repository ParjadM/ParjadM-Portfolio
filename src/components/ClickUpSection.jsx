import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from './ui/GlassCard.jsx';

function getVisitorId() {
  try {
    let vid = localStorage.getItem('visitorId');
    if (vid) return vid;
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      vid = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('visitorId', vid);
      return vid;
    }
  } catch {}
  return '';
}

export const ClickUpSection = ({ theme }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clicking, setClicking] = useState(false);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState('');
  const [justClicked, setJustClicked] = useState(false);
  const [blogPostId, setBlogPostId] = useState(null);

  useEffect(() => {
    fetch('/api/clickup')
      .then(res => res.ok ? res.json() : { count: 0, available: false })
      .then(d => {
        setCount(d?.count ?? 0);
        setAvailable(d?.available !== false);
        if (d?.available === false) setError('Counter offline — database unavailable.');
      })
      .catch(() => {
        setAvailable(false);
        setError('Could not load counter.');
      })
      .finally(() => setLoading(false));

    fetch('/api/blog')
      .then(res => res.ok ? res.json() : { posts: [] })
      .then(d => {
        const posts = Array.isArray(d?.posts) ? d.posts : [];
        const match = posts.find(p => /clickup/i.test(p.title || ''));
        if (match?.id) setBlogPostId(match.id);
      })
      .catch(() => {});
  }, []);

  const handleClick = () => {
    if (!available || clicking) return;
    setClicking(true);
    setError('');
    fetch('/api/clickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    })
      .then(async res => {
        const d = await res.json();
        if (res.status === 429) {
          setError(d.error || 'Slow down! Wait a few seconds.');
          return;
        }
        if (!res.ok) {
          setAvailable(false);
          setError(d.error || 'Counter unavailable.');
          return;
        }
        setCount(d?.count ?? count);
        setJustClicked(true);
        setTimeout(() => setJustClicked(false), 400);
      })
      .catch(() => setError('Network error. Try again.'))
      .finally(() => setClicking(false));
  };

  const gradientClass = theme === 'pink'
    ? 'bg-gradient-to-r from-pink-500 to-red-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';
  const textClass = theme === 'pink' ? 'text-pink-200' : 'text-emerald-200';

  return (
    <GlassCard className="p-8 md:p-10" theme={theme}>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">ClickUp</h2>
        <p className={`text-sm mb-6 ${textClass}`}>Everyone adds +1. How high can we go?</p>
        <div className={`text-6xl md:text-7xl font-extrabold text-white mb-2 tabular-nums transition-transform duration-300 ${justClicked ? 'scale-110' : ''}`}>
          {loading ? '—' : count.toLocaleString()}
        </div>
        {justClicked && (
          <div className={`text-sm font-semibold mb-4 animate-pulse ${textClass}`}>+1!</div>
        )}
        {!justClicked && <div className="mb-4" />}
        {error && (
          <p className="text-amber-300/90 text-sm mb-4">{error}</p>
        )}
        <button
          onClick={handleClick}
          disabled={loading || clicking || !available}
          className={`px-8 py-4 rounded-full font-bold text-white text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${gradientClass}`}
        >
          {clicking ? '...' : 'Click Up!'}
        </button>
        {blogPostId && (
          <p className="mt-4 text-sm">
            <Link to={`/blog/${blogPostId}`} className={`${textClass} hover:underline`}>
              Read the story behind ClickUp →
            </Link>
          </p>
        )}
      </div>
    </GlassCard>
  );
};
