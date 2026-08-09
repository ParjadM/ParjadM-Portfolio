import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Download, Sparkles, Aperture, CircleStop, Hand } from 'lucide-react'
import { PageTransition } from '../components/ui/PageTransition.jsx'
import { SEO } from '../components/SEO.jsx'
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx'
import { setActivePageContext, clearActivePageContext } from '../utils/chatbotEvents.js'
import { CAMERA_FX_MODES, createCameraFxEngine } from '../utils/cameraFx/engine.js'

export const CameraFxPage = ({ theme }) => {
  const { t } = useTranslation()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const streamRef = useRef(null)
  const settingsRef = useRef({
    mode: 'hands',
    intensity: 0.85,
    sensitivity: 0.55,
    handLights: true,
  })

  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('hands')
  const [intensity, setIntensity] = useState(0.85)
  const [sensitivity, setSensitivity] = useState(0.55)
  const [handLights, setHandLights] = useState(true)
  const [shotUrl, setShotUrl] = useState('')
  const [handStatus, setHandStatus] = useState('idle')
  const [handInfo, setHandInfo] = useState({ handCount: 0, gestures: [] })

  const isPink = theme === 'pink'

  useEffect(() => {
    setActivePageContext({
      type: 'project',
      pathname: '/projects/cameraFx',
      title: 'Camera FX',
      description: 'Webcam playground with dual-hand gesture tracking and neon finger lighting. All processing stays on-device.',
      tags: ['WebRTC', 'MediaPipe', 'Hand Tracking', 'Canvas'],
      liveUrl: '/projects/cameraFx',
    })
    return () => clearActivePageContext()
  }, [])

  useEffect(() => {
    settingsRef.current = { mode, intensity, sensitivity, handLights }
  }, [mode, intensity, sensitivity, handLights])

  const stopCamera = useCallback(() => {
    engineRef.current?.stop()
    engineRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
    setHandStatus('idle')
    setHandInfo({ handCount: 0, gestures: [] })
  }, [])

  const startCamera = useCallback(async () => {
    setError('')
    setShotUrl('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('unsupported')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      const engine = createCameraFxEngine({
        canvas: canvasRef.current,
        video,
        getSettings: () => settingsRef.current,
        onHandTrackerStatus: (status) => setHandStatus(status),
        onHandsUpdate: (result) => {
          setHandInfo({
            handCount: result.handCount,
            gestures: (result.hands || []).map((h) => ({
              side: h.side,
              gesture: h.gesture,
            })),
          })
        },
      })
      engineRef.current = engine
      await engine.start()
      setActive(true)
    } catch (err) {
      console.error(err)
      stopCamera()
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError(t('cameraFx.errors.denied'))
      } else if (err?.message === 'unsupported') {
        setError(t('cameraFx.errors.unsupported'))
      } else {
        setError(t('cameraFx.errors.generic'))
      }
    }
  }, [stopCamera, t])

  useEffect(() => () => stopCamera(), [stopCamera])

  const capture = () => {
    const url = engineRef.current?.capture?.()
    if (url) setShotUrl(url)
  }

  const gestureLabel = (gesture) => t(`cameraFx.gestures.${gesture}`, { defaultValue: gesture })

  return (
    <PageTransition className="relative min-h-[100dvh]">
      <SEO titleKey="seo.cameraFxTitle" descriptionKey="seo.cameraFxDesc" />

      <style>{`
        .camera-fx-shell {
          --fx-bg: #05070d;
          --fx-panel: rgba(8, 14, 24, 0.72);
          --fx-line: rgba(140, 220, 255, 0.22);
          --fx-glow: ${isPink ? 'rgba(244, 114, 182, 0.45)' : 'rgba(34, 211, 238, 0.4)'};
          --fx-accent: ${isPink ? '#f472b6' : '#22d3ee'};
          --fx-accent-2: ${isPink ? '#fb7185' : '#a3e635'};
        }
        .camera-fx-grid {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.08), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(244, 114, 182, 0.08), transparent 35%),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: auto, auto, 48px 48px, 48px 48px;
        }
        .camera-fx-canvas {
          box-shadow: 0 0 0 1px var(--fx-line), 0 20px 80px rgba(0,0,0,0.55), 0 0 60px var(--fx-glow);
        }
        .camera-fx-btn {
          transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
        }
        .camera-fx-btn:hover { transform: translateY(-1px); }
        .camera-fx-mode[aria-pressed="true"] {
          background: linear-gradient(120deg, color-mix(in srgb, var(--fx-accent) 35%, transparent), color-mix(in srgb, var(--fx-accent-2) 25%, transparent));
          border-color: color-mix(in srgb, var(--fx-accent) 60%, white 10%);
          color: white;
        }
        @keyframes camera-fx-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .camera-fx-live {
          animation: camera-fx-pulse 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="camera-fx-shell camera-fx-grid relative min-h-[100dvh] bg-[var(--fx-bg)] text-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_75%)]" />

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-28 md:pb-10 max-w-6xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <LocalizedLink
                to="/projects"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                {t('cameraFx.back')}
              </LocalizedLink>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--fx-accent)]">
                  <Hand className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    {t('cameraFx.title')}
                  </h1>
                  <p className="text-white/60 text-sm md:text-base max-w-xl mt-1">
                    {t('cameraFx.subtitle')}
                  </p>
                </div>
              </div>
            </div>
            {active && (
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white/70">
                  <span className="camera-fx-live h-2 w-2 rounded-full bg-rose-400" aria-hidden="true" />
                  {t('cameraFx.live')}
                </div>
                {handStatus === 'loading' && (
                  <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-100">
                    {t('cameraFx.handsLoading')}
                  </div>
                )}
                {handStatus === 'ready' && (
                  <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100">
                    {t('cameraFx.handsReady', { count: handInfo.handCount })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="relative">
              <div className="camera-fx-canvas relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-black/80">
                <video ref={videoRef} className="hidden" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

                {!active && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                    <div className="rounded-full border border-white/10 bg-white/5 p-5 text-[var(--fx-accent)]">
                      <Camera className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{t('cameraFx.idleTitle')}</p>
                      <p className="mt-1 text-sm text-white/55 max-w-md">{t('cameraFx.idleBody')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="camera-fx-btn inline-flex items-center gap-2 rounded-full border border-white/15 bg-[var(--fx-accent)]/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--fx-accent)]/30"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      {t('cameraFx.start')}
                    </button>
                  </div>
                )}

                {active && handInfo.gestures.length > 0 && (
                  <div className="absolute left-3 bottom-3 flex flex-wrap gap-2">
                    {handInfo.gestures.map((g, idx) => (
                      <span
                        key={`${g.side}-${idx}`}
                        className="rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-medium backdrop-blur"
                      >
                        {g.side}: {gestureLabel(g.gesture)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
                  {error}
                </p>
              )}
              {handStatus === 'error' && (
                <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-50" role="status">
                  {t('cameraFx.errors.handsModel')}
                </p>
              )}

              <p className="mt-3 text-xs text-white/40">{t('cameraFx.privacy')}</p>
            </div>

            <aside className="rounded-[1.5rem] border border-white/10 bg-[var(--fx-panel)] backdrop-blur-xl p-4 h-fit">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 mb-3">
                {t('cameraFx.controls')}
              </h2>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {CAMERA_FX_MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="camera-fx-mode camera-fx-btn rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-white/80"
                    aria-pressed={mode === item.id}
                    onClick={() => setMode(item.id)}
                  >
                    {t(item.labelKey)}
                  </button>
                ))}
              </div>

              <label className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 text-white/80">
                  <Aperture className="h-4 w-4 text-[var(--fx-accent)]" aria-hidden="true" />
                  {t('cameraFx.handLights')}
                </span>
                <input
                  type="checkbox"
                  checked={handLights || mode === 'hands'}
                  disabled={mode === 'hands'}
                  onChange={(e) => setHandLights(e.target.checked)}
                  className="h-4 w-4 accent-[var(--fx-accent)]"
                />
              </label>

              <label className="block mb-4">
                <div className="mb-1.5 flex justify-between text-xs text-white/50">
                  <span>{t('cameraFx.intensity')}</span>
                  <span>{Math.round(intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.4"
                  step="0.05"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-[var(--fx-accent)]"
                />
              </label>

              <label className="block mb-5">
                <div className="mb-1.5 flex justify-between text-xs text-white/50">
                  <span>{t('cameraFx.sensitivity')}</span>
                  <span>{Math.round(sensitivity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.9"
                  step="0.05"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-[var(--fx-accent)]"
                />
              </label>

              <div className="flex flex-col gap-2">
                {!active ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="camera-fx-btn inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    {t('cameraFx.start')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="camera-fx-btn inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15"
                  >
                    <CircleStop className="h-4 w-4" aria-hidden="true" />
                    {t('cameraFx.stop')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={capture}
                  disabled={!active}
                  className="camera-fx-btn inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[var(--fx-accent)]/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t('cameraFx.capture')}
                </button>
              </div>

              {shotUrl && (
                <a
                  href={shotUrl}
                  download={`camera-fx-${mode}.jpg`}
                  className="mt-3 block overflow-hidden rounded-xl border border-white/10"
                >
                  <img src={shotUrl} alt={t('cameraFx.captureAlt')} className="w-full aspect-video object-cover" />
                  <span className="block px-3 py-2 text-xs text-white/60">{t('cameraFx.downloadShot')}</span>
                </a>
              )}

              <p className="mt-4 text-xs leading-relaxed text-white/40">
                {t('cameraFx.tip')}
              </p>
            </aside>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default CameraFxPage
