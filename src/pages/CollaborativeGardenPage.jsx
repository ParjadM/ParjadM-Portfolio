import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { SITE_URL } from '../config/site.js';

function getVisitorId() {
  try {
    return localStorage.getItem('visitorId') || '';
  } catch {
    return '';
  }
}

function drawBloom(ctx, mark, w, h, t, highlight) {
  const x = mark.x * w;
  const y = mark.y * h;
  const base = 10 + mark.size * 18;
  const pulse = 1 + Math.sin(t * 0.002 + mark.x * 12 + mark.y * 9) * 0.08;
  const r = base * pulse * (highlight ? 1.25 : 1);
  const alpha = highlight ? 0.95 : 0.72;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
  grad.addColorStop(0, `hsla(${mark.hue}, 85%, 68%, 0.9)`);
  grad.addColorStop(0.45, `hsla(${(mark.hue + 40) % 360}, 75%, 55%, 0.35)`);
  grad.addColorStop(1, `hsla(${mark.hue}, 70%, 40%, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const petals = 4 + (mark.shape % 4);
  ctx.fillStyle = `hsla(${mark.hue}, 80%, 62%, 0.85)`;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + t * 0.0003;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * r * 0.45,
      Math.sin(a) * r * 0.45,
      r * 0.38,
      r * 0.18,
      a,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = `hsla(${(mark.hue + 20) % 360}, 90%, 78%, 0.95)`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const CollaborativeGardenPage = ({ theme }) => {
  const { t } = useTranslation();
  const isPink = theme === 'pink';
  const canvasRef = useRef(null);
  const marksRef = useRef([]);
  const highlightRef = useRef(null);
  const rafRef = useRef(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [planting, setPlanting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const accent = isPink ? 'text-pink-300' : 'text-emerald-300';
  const btnClass = isPink
    ? 'bg-gradient-to-r from-pink-500 to-red-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  const paint = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const needW = Math.floor(cssW * dpr);
    const needH = Math.floor(cssH * dpr);
    if (canvas.width !== needW || canvas.height !== needH) {
      canvas.width = needW;
      canvas.height = needH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW;
    const h = cssH;

    // Atmosphere
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, isPink ? '#1a0f1c' : '#0b1f1a');
    sky.addColorStop(0.55, isPink ? '#2a1524' : '#0f2f28');
    sky.addColorStop(1, isPink ? '#1c1220' : '#0a1a16');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Soft soil band
    const soil = ctx.createLinearGradient(0, h * 0.7, 0, h);
    soil.addColorStop(0, 'rgba(0,0,0,0)');
    soil.addColorStop(1, isPink ? 'rgba(80,30,50,0.35)' : 'rgba(20,60,45,0.4)');
    ctx.fillStyle = soil;
    ctx.fillRect(0, 0, w, h);

    // Dot mist
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 40; i++) {
      const px = ((i * 97) % 100) / 100 * w;
      const py = ((i * 53) % 100) / 100 * h;
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const marks = marksRef.current;
    for (let i = 0; i < marks.length; i++) {
      drawBloom(ctx, marks[i], w, h, time, marks[i].id === highlightRef.current);
    }
  }, [isPink]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/garden')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        marksRef.current = Array.isArray(data.marks) ? data.marks : [];
        setTotal(typeof data.total === 'number' ? data.total : marksRef.current.length);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = (time) => {
      paint(time);
      if (!reduced) rafRef.current = requestAnimationFrame(loop);
    };
    if (reduced) {
      paint(0);
      return undefined;
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paint, loaded]);

  const plantAt = async (nx, ny) => {
    if (planting) return;
    setPlanting(true);
    setStatus('');
    try {
      const res = await fetch('/api/garden/plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: nx, y: ny, visitorId: getVisitorId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || t('garden.error'));
        return;
      }
      if (data.mark) {
        marksRef.current = [...marksRef.current, data.mark];
        highlightRef.current = data.mark.id;
        setTotal((n) => n + 1);
        setStatus(t('garden.planted'));
        setTimeout(() => {
          if (highlightRef.current === data.mark.id) highlightRef.current = null;
        }, 4000);
      }
    } catch {
      setStatus(t('garden.error'));
    } finally {
      setPlanting(false);
    }
  };

  const onCanvasPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || planting) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    plantAt(Math.min(1, Math.max(0, nx)), Math.min(1, Math.max(0, ny)));
  };

  return (
    <PageTransition className="min-h-screen py-20 md:py-24 px-4">
      <SEO
        title={t('garden.seoTitle')}
        description={t('garden.seoDesc')}
        url={`${SITE_URL}/garden`}
      />
      <div className="container mx-auto max-w-5xl">
        <Reveal>
          <div className="text-center mb-8 md:mb-10">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${isPink ? 'bg-pink-500/20 text-pink-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
              {t('garden.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">{t('garden.title')}</h1>
            <p className="text-gray-300 mt-3 max-w-2xl mx-auto">{t('garden.subtitle')}</p>
          </div>
        </Reveal>

        <Reveal>
          <GlassCard className="p-3 md:p-4 overflow-hidden" theme={theme}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 px-1">
              <div className="text-sm text-gray-300">
                <span className={`font-semibold ${accent}`}>{total.toLocaleString()}</span>{' '}
                {t('garden.bloomCount')}
              </div>
              <button
                type="button"
                disabled={planting}
                onClick={() => plantAt(0.35 + Math.random() * 0.3, 0.4 + Math.random() * 0.35)}
                className={`px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50 ${btnClass}`}
              >
                {planting ? t('garden.planting') : t('garden.plantRandom')}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <canvas
                ref={canvasRef}
                onClick={onCanvasPointer}
                className="w-full h-[55vh] min-h-[320px] max-h-[560px] cursor-crosshair touch-manipulation bg-transparent"
                role="img"
                aria-label={t('garden.canvasLabel')}
              />
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm bg-black/20">
                  {t('garden.loading')}
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-400 px-1">
              {t('garden.hint')}
            </p>
            {status && (
              <p className={`mt-2 text-sm px-1 ${status === t('garden.planted') ? accent : 'text-amber-300'}`}>
                {status}
              </p>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </PageTransition>
  );
};
