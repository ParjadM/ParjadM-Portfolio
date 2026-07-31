/** Format ms as m:ss.cs (centiseconds). */
export function formatElapsed(ms) {
  const n = Math.max(0, Math.floor(Number(ms) || 0))
  const minutes = Math.floor(n / 60000)
  const seconds = Math.floor((n % 60000) / 1000)
  const centis = Math.floor((n % 1000) / 10)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
}

/**
 * Pure helper: decide if a new passed attempt is a personal best.
 */
export function isNewPersonalBest(elapsedMilliseconds, previousBestMs) {
  if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0) return false
  if (previousBestMs == null || !Number.isFinite(previousBestMs)) return true
  return elapsedMilliseconds < previousBestMs
}

/**
 * Pick personal best from attempt list (passed only, lowest elapsed).
 */
export function pickPersonalBest(attempts) {
  const passed = (attempts || []).filter((a) => a && a.passed)
  if (!passed.length) return null
  return passed.reduce((best, a) => {
    if (!best || a.elapsedMilliseconds < best.elapsedMilliseconds) return a
    return best
  }, null)
}
