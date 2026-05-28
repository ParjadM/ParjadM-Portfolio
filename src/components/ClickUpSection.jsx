import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard.jsx';

export const ClickUpSection = ({ theme }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    fetch('/api/clickup')
      .then(res => res.ok ? res.json() : { count: 0 })
      .then(d => { setCount(d?.count ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleClick = () => {
    setClicking(true);
    fetch('/api/clickup', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(res => res.ok ? res.json() : { count })
      .then(d => { setCount(d?.count ?? count); })
      .catch(() => {})
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
        <div className="text-6xl md:text-7xl font-extrabold text-white mb-6 tabular-nums">
          {loading ? '—' : count.toLocaleString()}
        </div>
        <button
          onClick={handleClick}
          disabled={loading || clicking}
          className={`px-8 py-4 rounded-full font-bold text-white text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${gradientClass}`}
        >
          {clicking ? '...' : 'Click Up!'}
        </button>
      </div>
    </GlassCard>
  );
};
