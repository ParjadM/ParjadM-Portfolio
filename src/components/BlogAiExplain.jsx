import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Zap, GraduationCap } from 'lucide-react';

export function BlogAiExplain({ postId, theme = 'green' }) {
  const { t } = useTranslation();
  const [tldr, setTldr] = useState('');
  const [junior, setJunior] = useState('');
  const [loadingMode, setLoadingMode] = useState(null);
  const [error, setError] = useState('');

  const isPink = theme === 'pink';
  const accent = isPink ? 'text-pink-300' : 'text-emerald-300';
  const accentBg = isPink ? 'from-pink-500/20 to-rose-500/10' : 'from-emerald-500/20 to-teal-500/10';
  const border = isPink ? 'border-pink-400/25' : 'border-emerald-400/25';
  const btnActive = isPink
    ? 'border-pink-400/40 bg-pink-500/15 shadow-[0_0_24px_rgba(244,114,182,0.12)]'
    : 'border-emerald-400/40 bg-emerald-500/15 shadow-[0_0_24px_rgba(52,211,153,0.12)]';
  const btnIdle = isPink
    ? 'border-white/10 bg-white/[0.04] hover:border-pink-400/30 hover:bg-pink-500/10'
    : 'border-white/10 bg-white/[0.04] hover:border-emerald-400/30 hover:bg-emerald-500/10';
  const resultPanel = isPink
    ? 'border-pink-400/20 bg-pink-500/[0.08]'
    : 'border-emerald-400/20 bg-emerald-500/[0.08]';

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
      setError(err.message || t('blog.aiExplain.error'));
    } finally {
      setLoadingMode(null);
    }
  };

  const ActionButton = ({ mode, icon: Icon, title, hint, active }) => (
    <button
      type="button"
      onClick={() => fetchExplain(mode)}
      disabled={!!loadingMode}
      aria-pressed={active}
      className={`group flex flex-1 min-w-[min(100%,14rem)] items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? btnActive : btnIdle
      }`}
    >
      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentBg} ${accent}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white leading-snug">
          {loadingMode === mode ? t(`blog.aiExplain.loading.${mode}`) : title}
        </span>
        <span className="mt-0.5 block text-xs text-white/60 leading-relaxed">{hint}</span>
      </span>
    </button>
  );

  return (
    <div className={`mb-8 overflow-hidden rounded-2xl border ${border} bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm`}>
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentBg} ${accent}`}>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">{t('blog.aiExplain.title')}</h2>
            <p className="text-sm text-white/65">{t('blog.aiExplain.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton
            mode="tldr"
            icon={Zap}
            title={t('blog.aiExplain.tldrTitle')}
            hint={t('blog.aiExplain.tldrHint')}
            active={!!tldr}
          />
          <ActionButton
            mode="junior"
            icon={GraduationCap}
            title={t('blog.aiExplain.juniorTitle')}
            hint={t('blog.aiExplain.juniorHint')}
            active={!!junior}
          />
        </div>

        {error && (
          <p className="text-sm text-red-200 bg-red-950/30 border border-red-400/25 rounded-xl px-4 py-3" role="alert">
            {error}
          </p>
        )}

        {tldr && (
          <div className={`rounded-xl border px-4 py-4 ${resultPanel}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${accent} mb-2`}>
              {t('blog.aiExplain.tldrResultLabel')}
            </p>
            <p className="text-sm text-white/90 leading-relaxed">{tldr}</p>
          </div>
        )}

        {junior && (
          <div className={`rounded-xl border px-4 py-4 ${resultPanel}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${accent} mb-2`}>
              {t('blog.aiExplain.juniorResultLabel')}
            </p>
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{junior}</p>
          </div>
        )}
      </div>
    </div>
  );
}
