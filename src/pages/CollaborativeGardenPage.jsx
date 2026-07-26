import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { SITE_URL } from '../config/site.js';
import { stripLocalePrefix } from '../utils/i18nRouting.js';

const PATHS_KEY = 'garden_session_paths';
const DWELL_KEY = 'garden_session_start';
const AI_KEY = 'garden_used_ai';

function getVisitorId() {
  try {
    return localStorage.getItem('visitorId') || '';
  } catch {
    return '';
  }
}

function readPaths() {
  try {
    const raw = sessionStorage.getItem(PATHS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String).slice(-40) : [];
  } catch {
    return [];
  }
}

function pushPath(path) {
  try {
    const next = [...readPaths().filter((p) => p !== path), path].slice(-40);
    sessionStorage.setItem(PATHS_KEY, JSON.stringify(next));
    return next;
  } catch {
    return readPaths();
  }
}

function collectSignals(theme) {
  const paths = readPaths();
  let dwellSec = 0;
  try {
    const start = Number(sessionStorage.getItem(DWELL_KEY) || 0);
    if (start) dwellSec = Math.max(0, Math.round((Date.now() - start) / 1000));
  } catch { /* ignore */ }

  let usedAi = false;
  let usedOs = false;
  try {
    usedAi = sessionStorage.getItem(AI_KEY) === '1';
    usedOs = paths.includes('/os') || paths.includes('/cli') || !!localStorage.getItem('os_wallpaper');
  } catch { /* ignore */ }

  let themeName = theme || 'green';
  try {
    const stored = localStorage.getItem('portfolio_theme_id') || '';
    if (stored.includes('pink')) themeName = 'pink';
    else if (stored.includes('terminal')) themeName = 'terminal';
    else if (theme === 'pink') themeName = 'pink';
  } catch { /* ignore */ }

  return { paths, theme: themeName, dwellSec, usedAi, usedOs };
}

function drawField(ctx, field, w, h, isPink, t) {
  if (!field?.values?.length || !field.size) return;
  const size = field.size;
  const cellW = w / size;
  const cellH = h / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = field.values[y * size + x];
      if (v < 0.12) continue;
      const alpha = v * 0.22;
      ctx.fillStyle = isPink
        ? `rgba(236, 72, 153, ${alpha})`
        : `rgba(52, 211, 153, ${alpha})`;
      ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
    }
  }

  if (Array.isArray(field.veins)) {
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < field.veins.length; i++) {
      const path = field.veins[i];
      if (!path?.length) continue;
      const pulse = 0.25 + Math.sin(t * 0.0015 + i) * 0.08;
      ctx.strokeStyle = isPink
        ? `rgba(251, 113, 133, ${pulse})`
        : `rgba(110, 231, 183, ${pulse})`;
      ctx.beginPath();
      ctx.moveTo(path[0].x * w, path[0].y * h);
      for (let p = 1; p < path.length; p++) {
        ctx.lineTo(path[p].x * w, path[p].y * h);
      }
      ctx.stroke();
    }
  }
}

function drawBloom(ctx, mark, w, h, t, highlight) {
  const x = mark.x * w;
  const y = mark.y * h;
  const energy = typeof mark.energy === 'number' ? mark.energy : 0.72;
  const gen = mark.generation || 0;
  const base = 8 + mark.size * 16 * (0.7 + energy * 0.45);
  const pulse = 1 + Math.sin(t * 0.002 + mark.x * 12 + mark.y * 9) * (0.05 + energy * 0.06);
  const r = base * pulse * (highlight ? 1.25 : 1);
  const alpha = (highlight ? 0.95 : 0.55 + energy * 0.4) * Math.max(0.25, energy);

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
  grad.addColorStop(0, `hsla(${mark.hue}, 85%, ${58 + energy * 14}%, 0.9)`);
  grad.addColorStop(0.45, `hsla(${(mark.hue + 40) % 360}, 75%, 55%, ${0.25 + energy * 0.2})`);
  grad.addColorStop(1, `hsla(${mark.hue}, 70%, 40%, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const petals = 4 + (mark.shape % 4) + (gen > 2 ? 1 : 0);
  ctx.fillStyle = `hsla(${mark.hue}, 80%, 62%, ${0.7 + energy * 0.25})`;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + t * 0.0003 * (0.6 + energy);
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * r * 0.45,
      Math.sin(a) * r * 0.45,
      r * (0.32 + energy * 0.1),
      r * 0.16,
      a,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = `hsla(${(mark.hue + 20) % 360}, 90%, 78%, 0.95)`;
  ctx.beginPath();
  ctx.arc(0, 0, r * (0.18 + energy * 0.08), 0, Math.PI * 2);
  ctx.fill();

  // Faint ring for branched generations
  if (gen > 0) {
    ctx.strokeStyle = `hsla(${mark.hue}, 70%, 70%, ${0.2 + Math.min(gen, 5) * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const CollaborativeGardenPage = ({ theme }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isPink = theme === 'pink';
  const canvasRef = useRef(null);
  const marksRef = useRef([]);
  const fieldRef = useRef(null);
  const highlightRef = useRef(null);
  const rafRef = useRef(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [planting, setPlanting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [morphNote, setMorphNote] = useState('');
  const [speciesHint, setSpeciesHint] = useState('');

  const accent = isPink ? 'text-pink-300' : 'text-emerald-300';
  const btnClass = isPink
    ? 'bg-gradient-to-r from-pink-500 to-red-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(DWELL_KEY)) {
        sessionStorage.setItem(DWELL_KEY, String(Date.now()));
      }
      const path = stripLocalePrefix(location?.pathname || '/garden');
      pushPath(path);
    } catch { /* ignore */ }
  }, [location?.pathname]);

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

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, isPink ? '#1a0f1c' : '#0b1f1a');
    sky.addColorStop(0.55, isPink ? '#2a1524' : '#0f2f28');
    sky.addColorStop(1, isPink ? '#1c1220' : '#0a1a16');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    drawField(ctx, fieldRef.current, w, h, isPink, time);

    const soil = ctx.createLinearGradient(0, h * 0.7, 0, h);
    soil.addColorStop(0, 'rgba(0,0,0,0)');
    soil.addColorStop(1, isPink ? 'rgba(80,30,50,0.35)' : 'rgba(20,60,45,0.4)');
    ctx.fillStyle = soil;
    ctx.fillRect(0, 0, w, h);

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
        fieldRef.current = data.field || null;
        setTotal(typeof data.total === 'number' ? data.total : marksRef.current.length);
        if (data.morph?.ticked && (data.morph.spawned || data.morph.merged || data.morph.decayed)) {
          setMorphNote(t('garden.morphTick', {
            spawned: data.morph.spawned || 0,
            merged: data.morph.merged || 0,
            decayed: data.morph.decayed || 0,
          }));
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [t]);

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
      const signals = collectSignals(theme);
      const res = await fetch('/api/garden/plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: nx, y: ny, visitorId: getVisitorId(), signals }),
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
        if (data.species || data.mark.species) {
          setSpeciesHint(t('garden.species', { species: data.species || data.mark.species }));
        }
        // Refresh field after plant
        fetch('/api/garden')
          .then((r) => (r.ok ? r.json() : null))
          .then((fresh) => {
            if (!fresh) return;
            marksRef.current = Array.isArray(fresh.marks) ? fresh.marks : marksRef.current;
            fieldRef.current = fresh.field || fieldRef.current;
            setTotal(typeof fresh.total === 'number' ? fresh.total : marksRef.current.length);
          })
          .catch(() => {});
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
            {speciesHint && (
              <p className="mt-1 text-xs text-gray-400 px-1">{speciesHint}</p>
            )}
            {morphNote && (
              <p className="mt-1 text-xs text-gray-500 px-1">{morphNote}</p>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </PageTransition>
  );
};
