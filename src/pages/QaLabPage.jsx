import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlaskConical, ShieldCheck, Layers3, Route, Gauge, Bug } from 'lucide-react'
import { PageTransition } from '../components/ui/PageTransition.jsx'
import { SEO } from '../components/SEO.jsx'
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx'
import { setActivePageContext, clearActivePageContext } from '../utils/chatbotEvents.js'

const PYRAMID = [
  { id: 'unit', weight: '60%', cmd: 'npm run test:unit' },
  { id: 'contract', weight: '20%', cmd: 'npm --prefix server test' },
  { id: 'e2e', weight: '15%', cmd: 'npm run test:e2e' },
  { id: 'explore', weight: '5%', cmd: 'manual / exploratory' },
]

const GATES = [
  { id: 'lint', icon: Bug },
  { id: 'i18n', icon: Layers3 },
  { id: 'unit', icon: FlaskConical },
  { id: 'server', icon: Route },
  { id: 'build', icon: ShieldCheck },
  { id: 'e2e', icon: Route },
  { id: 'lighthouse', icon: Gauge },
]

export const QaLabPage = ({ theme }) => {
  const { t } = useTranslation()
  const isPink = theme === 'pink'
  const accent = isPink ? 'text-pink-300' : 'text-teal-300'
  const bar = isPink
    ? 'from-pink-500/80 to-rose-400/40'
    : 'from-teal-400/80 to-cyan-300/30'

  useEffect(() => {
    setActivePageContext({
      type: 'project',
      pathname: '/projects/qaLab',
      title: 'Quality Engineering Lab',
      description: 'Risk-based test strategy, CI quality gates, and automated coverage for parjadm.ca — a QA engineering showcase.',
      tags: ['QA', 'Playwright', 'Vitest', 'CI', 'API Contracts'],
      liveUrl: '/projects/qaLab',
    })
    return () => clearActivePageContext()
  }, [])

  return (
    <PageTransition className="relative min-h-[100dvh]">
      <SEO titleKey="seo.qaLabTitle" descriptionKey="seo.qaLabDesc" />

      <style>{`
        .qa-lab {
          --qa-ink: #e8f6f3;
          --qa-muted: rgba(232, 246, 243, 0.62);
          --qa-line: rgba(94, 234, 212, 0.22);
          --qa-panel: rgba(6, 18, 20, 0.72);
          --qa-glow: ${isPink ? 'rgba(244,114,182,0.28)' : 'rgba(45,212,191,0.28)'};
        }
        .qa-lab-bg {
          background:
            radial-gradient(ellipse 80% 55% at 15% 10%, var(--qa-glow), transparent 55%),
            radial-gradient(ellipse 60% 45% at 90% 20%, rgba(56,189,248,0.12), transparent 50%),
            linear-gradient(160deg, #041014 0%, #071a1c 45%, #0a1218 100%);
        }
        .qa-reveal {
          animation: qa-rise 700ms ease both;
        }
        .qa-reveal-delay { animation-delay: 120ms; }
        .qa-reveal-delay-2 { animation-delay: 220ms; }
        @keyframes qa-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qa-bar {
          transform-origin: left center;
          animation: qa-grow 900ms ease both;
        }
        @keyframes qa-grow {
          from { transform: scaleX(0.2); opacity: 0.4; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div className="qa-lab qa-lab-bg relative min-h-[100dvh] text-[var(--qa-ink)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }} />

        <div className="relative z-10 container mx-auto max-w-5xl px-4 pt-10 pb-28 md:pb-16">
          <LocalizedLink to="/projects" className="text-sm text-white/45 hover:text-white transition-colors">
            {t('qaLab.back')}
          </LocalizedLink>

          <header className="qa-reveal mt-6 mb-12 md:mb-16 max-w-3xl">
            <p className={`text-xs uppercase tracking-[0.28em] ${accent} mb-3`}>{t('qaLab.kicker')}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              {t('qaLab.title')}
            </h1>
            <p className="mt-4 text-base md:text-lg text-[var(--qa-muted)] max-w-2xl">
              {t('qaLab.subtitle')}
            </p>
          </header>

          <section className="qa-reveal qa-reveal-delay mb-16">
            <h2 className="text-sm uppercase tracking-[0.22em] text-white/45 mb-4">{t('qaLab.pyramidTitle')}</h2>
            <p className="text-sm text-[var(--qa-muted)] mb-6 max-w-2xl">{t('qaLab.pyramidBody')}</p>
            <div className="space-y-3">
              {PYRAMID.map((layer, idx) => (
                <div key={layer.id} className="rounded-2xl border border-[var(--qa-line)] bg-[var(--qa-panel)] backdrop-blur-md px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-semibold">{t(`qaLab.pyramid.${layer.id}`)}</span>
                    <span className="text-xs text-white/45 font-mono">{layer.weight} · {layer.cmd}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`qa-bar h-full rounded-full bg-gradient-to-r ${bar}`}
                      style={{ width: layer.weight, animationDelay: `${idx * 90}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="qa-reveal qa-reveal-delay-2 mb-16 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-sm uppercase tracking-[0.22em] text-white/45 mb-3">{t('qaLab.riskTitle')}</h2>
              <p className="text-sm text-[var(--qa-muted)] leading-relaxed">{t('qaLab.riskBody')}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {['nav', 'projects', 'camera', 'locale', 'deploy'].map((key) => (
                  <li key={key} className="flex gap-2">
                    <span className={`${accent}`}>▸</span>
                    <span>{t(`qaLab.risks.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-[0.22em] text-white/45 mb-3">{t('qaLab.gatesTitle')}</h2>
              <p className="text-sm text-[var(--qa-muted)] mb-4">{t('qaLab.gatesBody')}</p>
              <div className="flex flex-wrap gap-2">
                {GATES.map(({ id, icon: Icon }) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--qa-line)] bg-black/30 px-3 py-1.5 text-xs"
                  >
                    <Icon className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
                    {t(`qaLab.gates.${id}`)}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-sm uppercase tracking-[0.22em] text-white/45 mb-3">{t('qaLab.improveTitle')}</h2>
            <ol className="space-y-4 text-sm md:text-base text-[var(--qa-muted)] max-w-3xl">
              {['one', 'two', 'three', 'four'].map((key, i) => (
                <li key={key} className="flex gap-3">
                  <span className={`font-mono text-xs mt-1 ${accent}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{t(`qaLab.improve.${key}`)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--qa-line)] bg-[var(--qa-panel)] backdrop-blur-xl p-5 md:p-7">
            <h2 className="text-lg font-semibold mb-2">{t('qaLab.runTitle')}</h2>
            <p className="text-sm text-[var(--qa-muted)] mb-4">{t('qaLab.runBody')}</p>
            <pre className="overflow-x-auto rounded-xl bg-black/50 border border-white/10 p-4 text-xs md:text-sm text-teal-100/90 font-mono leading-relaxed">
{`npm run lint && npm run test:i18n
npm run test:unit
npm --prefix server test
npm run build
npm run test:e2e
npm run test:lighthouse`}
            </pre>
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

export default QaLabPage
