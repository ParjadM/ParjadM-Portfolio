import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTransition } from '../components/ui/PageTransition.jsx'
import { SEO } from '../components/SEO.jsx'
import { GlassCard } from '../components/ui/GlassCard.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { PythonCodeEditor } from '../components/algorithmMemorizer/PythonCodeEditor.jsx'
import { createPythonRunner } from '../utils/algorithmMemorizer/createPythonRunner.js'
import { formatElapsed, isNewPersonalBest, pickPersonalBest } from '../utils/algorithmMemorizer/timing.js'
import { ensureUuidVisitorId } from '../utils/algorithmMemorizer/visitorId.js'
import { RUNNER_LIMITS } from '../utils/algorithmMemorizer/runnerTypes.js'

function categoryLabel(cat, t) {
  return t(`algoMem.categories.${cat}`, { defaultValue: cat })
}

export const AlgorithmMemorizerPage = ({ theme }) => {
  const { t } = useTranslation()
  const isPink = theme === 'pink'
  const accent = isPink ? 'text-pink-300' : 'text-emerald-300'
  const btn = isPink
    ? 'bg-gradient-to-r from-pink-500 to-red-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500'

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [algorithmId, setAlgorithmId] = useState('')
  const [detail, setDetail] = useState(null)
  const [mode, setMode] = useState('easy')
  const [code, setCode] = useState('')
  const [active, setActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ attempts: [], personalBest: null, attemptCount: 0 })
  const [lastResult, setLastResult] = useState(null)
  const [runnerReady, setRunnerReady] = useState(false)
  const [runnerError, setRunnerError] = useState('')

  const startAtRef = useRef(0)
  const rafRef = useRef(0)
  const runnerRef = useRef(null)
  const visitorId = useMemo(() => ensureUuidVisitorId(), [])

  const modeBest = useMemo(
    () => pickPersonalBest((progress.attempts || []).filter((a) => a.difficultyMode === mode)),
    [progress.attempts, mode],
  )

  const selectedMeta = list.find((a) => a.id === algorithmId)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/algorithms')
      const data = await res.json()
      const algos = Array.isArray(data.algorithms) ? data.algorithms : []
      setList(algos)
      if (!algorithmId && algos[0]) setAlgorithmId(algos[0].id)
    } catch {
      setStatus(t('algoMem.loadError'))
    } finally {
      setLoading(false)
    }
  }, [algorithmId, t])

  const loadDetail = useCallback(async (id) => {
    if (!id) return
    try {
      const res = await fetch(`/api/algorithms/${encodeURIComponent(id)}?runner=1`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setDetail(data.algorithm)
      if (!active) {
        // Easy Mode: keep editor empty so the skeleton shows as ghost shadow, not as typed text.
        setCode('')
      }
    } catch {
      setStatus(t('algoMem.loadError'))
    }
  }, [active, t])

  const loadProgress = useCallback(async (id) => {
    if (!id) return
    try {
      const q = new URLSearchParams({ visitorId, algorithmId: id })
      const res = await fetch(`/api/algorithms/progress?${q}`)
      const data = await res.json()
      if (res.ok) {
        setProgress({
          attempts: data.attempts || [],
          personalBest: data.personalBest || null,
          attemptCount: data.attemptCount || 0,
        })
      }
    } catch { /* ignore */ }
  }, [visitorId])

  useEffect(() => { loadList() }, [loadList])
  useEffect(() => {
    if (algorithmId) {
      loadDetail(algorithmId)
      loadProgress(algorithmId)
    }
  }, [algorithmId, loadDetail, loadProgress])

  useEffect(() => {
    const runner = createPythonRunner()
    runnerRef.current = runner
    let cancelled = false
    setRunnerReady(false)
    setRunnerError('')
    runner.init()
      .then(() => {
        if (!cancelled) setRunnerReady(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setRunnerError(err?.message || 'Failed to load Python runtime')
          setRunnerReady(false)
        }
      })
    return () => {
      cancelled = true
      runner.dispose()
      runnerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current)
      return undefined
    }
    const tick = () => {
      setElapsed(Date.now() - startAtRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  const confirmLeaveAttempt = () => {
    if (!active) return true
    return window.confirm(t('algoMem.confirmCancel'))
  }

  const onSelectAlgorithm = (id) => {
    if (id === algorithmId) return
    if (!confirmLeaveAttempt()) return
    setActive(false)
    setElapsed(0)
    setLastResult(null)
    setStatus('')
    setAlgorithmId(id)
  }

  const onSelectMode = (next) => {
    if (next === mode) return
    if (!confirmLeaveAttempt()) return
    setActive(false)
    setElapsed(0)
    setLastResult(null)
    setMode(next)
    setCode('')
  }

  const startAttempt = () => {
    if (!detail || !runnerReady) return
    setLastResult(null)
    setStatus('')
    // Easy Mode relies on shadowCode for the skeleton; never prefill the editor.
    if (mode === 'easy') setCode('')
    else if (!code.trim()) setCode('')
    startAtRef.current = Date.now()
    setElapsed(0)
    setActive(true)
  }

  const cancelAttempt = () => {
    if (!confirmLeaveAttempt()) return
    setActive(false)
    setStatus(t('algoMem.cancelled'))
  }

  const finishAttempt = async () => {
    if (!active || !detail || busy) return
    setBusy(true)
    setStatus('')
    const elapsedMs = Date.now() - startAtRef.current
    setElapsed(elapsedMs)
    setActive(false)

    try {
      if (code.length > RUNNER_LIMITS.maxCodeLength) {
        setStatus(t('algoMem.codeTooLong'))
        return
      }

      const tests = detail.runnerTests || detail.testCases || []
      await runnerRef.current?.reset?.()
      const run = await runnerRef.current.runTests({
        code,
        testCases: tests,
        timeoutMs: RUNNER_LIMITS.defaultTimeoutMs,
      })

      const passed = !!run.passed
      setLastResult(run)

      const prevBest = modeBest?.elapsedMilliseconds
      const willBePb = passed && isNewPersonalBest(elapsedMs, prevBest ?? null)

      const res = await fetch('/api/algorithms/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          algorithmId: detail.id,
          difficultyMode: mode,
          elapsedMilliseconds: elapsedMs,
          passed,
          testResults: run.results || [],
          attemptedAt: new Date().toISOString(),
          codeLength: code.length,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus(data.error || t('algoMem.saveError'))
      } else {
        setProgress({
          attempts: [data.attempt, ...(progress.attempts || [])].slice(0, 40),
          personalBest: data.personalBest || progress.personalBest,
          attemptCount: data.attemptCount || progress.attemptCount + 1,
        })
        if (run.status === 'timeout') {
          setStatus(t('algoMem.runnerTimeout'))
        } else if (run.status === 'not_ready') {
          setStatus(t('algoMem.runnerPending'))
        } else if (passed) {
          setStatus(willBePb || data.isPersonalBest ? t('algoMem.passedPb') : t('algoMem.passed'))
        } else {
          setStatus(run.error || t('algoMem.failed'))
        }
      }
      await loadProgress(detail.id)
    } catch {
      setStatus(t('algoMem.saveError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageTransition className="min-h-screen py-20 md:py-24 px-4">
      <SEO
        titleKey="algoMem.seoTitle"
        descriptionKey="algoMem.seoDesc"
      />
      <div className="container mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center mb-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${isPink ? 'bg-pink-500/20 text-pink-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
              {t('algoMem.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">{t('algoMem.title')}</h1>
            <p className="text-gray-300 mt-3 max-w-2xl mx-auto">{t('algoMem.subtitle')}</p>
          </div>
        </Reveal>

        <Reveal>
          <GlassCard className="p-4 md:p-6" theme={theme}>
            <div className="grid lg:grid-cols-[240px_1fr] gap-6">
              <aside className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-gray-400" htmlFor="algo-select">
                  {t('algoMem.selectAlgorithm')}
                </label>
                <select
                  id="algo-select"
                  disabled={loading}
                  value={algorithmId}
                  onChange={(e) => onSelectAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  {list.map((a) => (
                    <option key={a.id} value={a.id} className="bg-gray-900">
                      {a.title}
                    </option>
                  ))}
                </select>

                <fieldset className="space-y-2">
                  <legend className="text-xs uppercase tracking-wider text-gray-400">{t('algoMem.difficultyMode')}</legend>
                  {['easy', 'hard'].map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === m}
                        onChange={() => onSelectMode(m)}
                      />
                      {t(`algoMem.mode.${m}`)}
                    </label>
                  ))}
                </fieldset>

                <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-sm space-y-1">
                  <div className="text-gray-400">{t('algoMem.timer')}</div>
                  <div className={`text-2xl font-mono font-bold ${accent}`} aria-live="polite">
                    {formatElapsed(elapsed)}
                  </div>
                  <div className="text-xs text-gray-400 pt-2">
                    {t('algoMem.personalBest')}:{' '}
                    <span className="text-white">
                      {modeBest
                        ? formatElapsed(modeBest.elapsedMilliseconds)
                        : '—'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {t('algoMem.attempts')}: {progress.attemptCount}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!active ? (
                    <button type="button" disabled={!detail || busy || !runnerReady} onClick={startAttempt} className={`px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50 ${btn}`}>
                      {!runnerReady ? t('algoMem.runnerLoading') : t('algoMem.start')}
                    </button>
                  ) : (
                    <>
                      <button type="button" disabled={busy} onClick={finishAttempt} className={`px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50 ${btn}`}>
                        {busy ? t('algoMem.finishing') : t('algoMem.finish')}
                      </button>
                      <button type="button" onClick={cancelAttempt} className="px-4 py-2 rounded-full text-sm font-semibold text-gray-200 bg-white/10">
                        {t('algoMem.cancel')}
                      </button>
                    </>
                  )}
                </div>

                {runnerError && (
                  <p className="text-xs text-amber-300" role="alert">{t('algoMem.runnerError')}: {runnerError}</p>
                )}
                {!runnerReady && !runnerError && (
                  <p className="text-[11px] text-gray-500">{t('algoMem.runnerLoadingHint')}</p>
                )}

                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  {t('algoMem.antiCheatNote')}
                </p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {t('algoMem.progressNote')}
                </p>
              </aside>

              <div className="space-y-4 min-w-0">
                {detail && (
                  <div>
                    <h2 className="text-xl font-bold text-white">{detail.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {categoryLabel(detail.category, t)} · {detail.difficulty} · {detail.timeComplexity} / {detail.spaceComplexity}
                    </p>
                    <p className="text-gray-300 mt-2 text-sm">{detail.description}</p>
                    {mode === 'easy' && detail.skeleton && (
                      <p className="text-xs text-gray-500 mt-2">{t('algoMem.easyHint')}</p>
                    )}
                  </div>
                )}

                <PythonCodeEditor
                  value={code}
                  onChange={setCode}
                  locked={active}
                  readOnly={false}
                  shadowCode={mode === 'easy' ? (detail?.skeleton || '') : ''}
                  placeholder={mode === 'easy' ? '' : undefined}
                  ariaLabel={t('algoMem.editorLabel')}
                  className="min-h-[320px]"
                />

                {status && (
                  <p className={`text-sm ${accent}`} role="status">{status}</p>
                )}

                {lastResult?.results?.length > 0 && (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <h3 className="text-sm font-semibold text-white mb-2">{t('algoMem.testResults')}</h3>
                    <ul className="space-y-1 text-xs font-mono">
                      {lastResult.results.map((r) => (
                        <li key={r.id} className={r.passed ? 'text-emerald-300' : 'text-amber-200'}>
                          {(r.visible === false ? t('algoMem.hiddenTest') : r.name || r.id)}
                          {': '}
                          {r.passed ? t('algoMem.testPass') : (r.error || t('algoMem.testFail'))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {progress.attempts?.length > 0 && (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <h3 className="text-sm font-semibold text-white mb-2">{t('algoMem.history')}</h3>
                    <ul className="space-y-1 text-xs text-gray-300 max-h-40 overflow-auto">
                      {progress.attempts.slice(0, 12).map((a) => (
                        <li key={a.id}>
                          {new Date(a.attemptedAt).toLocaleString()} · {a.difficultyMode} · {formatElapsed(a.elapsedMilliseconds)} ·{' '}
                          {a.passed ? t('algoMem.testPass') : t('algoMem.testFail')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedMeta?.visibleTestCount != null && (
                  <p className="text-xs text-gray-500">
                    {t('algoMem.visibleTests', { count: selectedMeta.visibleTestCount })}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </PageTransition>
  )
}

export default AlgorithmMemorizerPage;
