import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';
import { GlassCard } from './ui/GlassCard.jsx';
import { fetchApi } from '../utils/apiClient.js';
import { SITE_URL } from '../config/site.js';

const CLICKUP_API_URL = `${SITE_URL.replace(/\/$/, '')}/api/clickup`;
const DAILY_LIMIT = 5;

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
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clicking, setClicking] = useState(false);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState('');
  const [justClicked, setJustClicked] = useState(false);
  const [blogPostId, setBlogPostId] = useState(null);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const vid = getVisitorId();
    const qs = vid ? `?visitorId=${encodeURIComponent(vid)}` : '';
    fetch(`/api/clickup${qs}`)
      .then(res => res.ok ? res.json() : { count: 0, available: false })
      .then(d => {
        setCount(d?.count ?? 0);
        setAvailable(d?.available !== false);
        if (typeof d?.remaining === 'number') setRemaining(d.remaining);
        if (d?.available === false) setError(t('stats.clickUpCard.offline'));
      })
      .catch(() => {
        setAvailable(false);
        setError(t('stats.clickUpCard.loadError'));
      })
      .finally(() => setLoading(false));

    fetchApi('/api/blog?search=clickup&limit=1')
      .then((d) => {
        const posts = Array.isArray(d?.posts) ? d.posts : [];
        const match = posts.find((p) => /clickup/i.test(p.title || '')) || posts[0];
        if (match?.id) setBlogPostId(match.id);
      })
      .catch(() => {});
  }, [t]);

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
        if (typeof d?.remaining === 'number') setRemaining(d.remaining);
        if (res.status === 429) {
          setError(d.error || t('stats.clickUpCard.limitReached'));
          return;
        }
        if (!res.ok) {
          setAvailable(false);
          setError(d.error || t('stats.clickUpCard.unavailable'));
          return;
        }
        setCount(d?.count ?? count);
        setJustClicked(true);
        setTimeout(() => setJustClicked(false), 400);
      })
      .catch(() => setError(t('stats.clickUpCard.networkError')))
      .finally(() => setClicking(false));
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(CLICKUP_API_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const gradientClass = theme === 'pink'
    ? 'bg-gradient-to-r from-pink-500 to-red-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';
  const textClass = theme === 'pink' ? 'text-pink-200' : 'text-emerald-200';
  const muted = 'text-white/75';
  const subtle = 'text-white/60';

  return (
    <GlassCard className="p-8 md:p-10" theme={theme}>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">ClickUp</h2>
        <p className={`text-sm mb-6 ${textClass}`}>{t('stats.clickUpCard.subtitle')}</p>
        <div className={`text-6xl md:text-7xl font-extrabold text-white mb-2 tabular-nums transition-transform duration-300 ${justClicked ? 'scale-110' : ''}`}>
          {loading ? '—' : count.toLocaleString()}
        </div>
        {justClicked && (
          <div className={`text-sm font-semibold mb-4 animate-pulse ${textClass}`}>+1!</div>
        )}
        {!justClicked && (
          <p className="text-gray-400 text-xs mb-4">
            {t('stats.clickUpCard.remaining', { count: remaining, limit: DAILY_LIMIT })}
          </p>
        )}
        {error && (
          <p className="text-amber-300/90 text-sm mb-4">{error}</p>
        )}
        <button
          onClick={handleClick}
          disabled={loading || clicking || !available || remaining <= 0}
          className={`px-8 py-4 rounded-full font-bold text-white text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${gradientClass}`}
        >
          {clicking ? '...' : t('stats.clickUpCard.button')}
        </button>
        {blogPostId && (
          <p className="mt-4 text-sm">
            <Link to={`/blog/${blogPostId}`} className={`${textClass} hover:underline`}>
              {t('stats.clickUpCard.story')}
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 text-left">
        <p className={`text-sm font-semibold mb-1 ${textClass}`}>{t('stats.clickUpCard.postmanTitle')}</p>
        <p className="text-gray-400 text-xs mb-3">{t('stats.clickUpCard.postmanHint')}</p>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 min-w-0 truncate rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-gray-200 font-mono">
            POST {CLICKUP_API_URL}
          </code>
          <button
            type="button"
            onClick={copyUrl}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-gray-200 hover:bg-white/10 transition-colors"
            aria-label={t('stats.clickUpCard.copyUrl')}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="mt-2 text-gray-500 text-xs">{t('stats.clickUpCard.postmanLimit')}</p>
      </div>
    </GlassCard>
  );
};
