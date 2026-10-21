import { useEffect, useState } from 'react'

const CACHE_KEY = 'verifiedVisitors'
export function useVisitorCount() {
  const [count, setCount] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached === null) return null
      const value = Number(cached)
      return Number.isSafeInteger(value) && value >= 0 ? value : null
    } catch { return null }
  })
  useEffect(() => {
    const controller = new AbortController()
    let timer
    let pending = false
    const refresh = async () => {
      if (pending || controller.signal.aborted) return
      pending = true
      clearTimeout(timer)
      let delay = 60_000
      try {
        // Versioned URL avoids previously cached successful-looking fallback zeros.
        const res = await fetch('/api/metrics?v=2', { cache: 'no-store', signal: controller.signal })
        if (!res.ok) throw new Error('Metrics unavailable')
        const data = await res.json()
        if (data.available !== true || !Number.isSafeInteger(data.uniqueVisitors) || data.uniqueVisitors < 0) {
          throw new Error('Unverified metrics')
        }
        if (controller.signal.aborted) return
        setCount(data.uniqueVisitors)
        try { localStorage.setItem(CACHE_KEY, String(data.uniqueVisitors)) } catch { /* Storage may be disabled. */ }
      } catch {
        // Keep verified data; never turn an outage into a zero.
        delay = 10_000
      } finally {
        pending = false
        if (!controller.signal.aborted) timer = setTimeout(refresh, delay)
      }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    refresh()
    window.addEventListener('online', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      controller.abort()
      clearTimeout(timer)
      window.removeEventListener('online', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return count
}
