import { useState, useEffect } from 'react'
import { fetchApi, peekApi, apiCache } from './apiClient.js'

export { apiCache, fetchApi, peekApi }
export { invalidateApi, canonicalizeUrl, __resetApiClient } from './apiClient.js'

/**
 * React hook over fetchApi — shows cached data immediately, revalidates in background.
 */
export const useFetchWithCache = (url, { ttlMs, swrMs } = {}) => {
  const cached = url ? peekApi(url) : null
  const [data, setData] = useState(cached || null)
  const [isLoading, setIsLoading] = useState(!cached)
  const [error, setError] = useState(null)
  const [errorStatus, setErrorStatus] = useState(null)

  useEffect(() => {
    if (!url) return undefined

    let cancelled = false
    let retryTimer
    let pending = false
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null

    const run = async () => {
      if (pending || cancelled) return
      pending = true
      clearTimeout(retryTimer)
      const existing = peekApi(url)
      if (existing !== undefined && !cancelled) {
        setData(existing)
        setIsLoading(false)
      } else if (!cancelled) {
        setData(null)
        setIsLoading(true)
      }

      try {
        const result = await fetchApi(url, {
          ttlMs,
          swrMs,
          signal: controller?.signal,
        })
        if (!cancelled) {
          setData(result)
          setError(null)
          setErrorStatus(null)
        }
      } catch (err) {
        if (cancelled || err?.name === 'AbortError') return
        setError(err.message || String(err))
        setErrorStatus(err.status || null)
        if (!err.status || err.status >= 500 || err.status === 429) retryTimer = setTimeout(run, 10_000)
      } finally {
        pending = false
        if (!cancelled) setIsLoading(false)
      }
    }

    const onVisible = () => { if (document.visibilityState === 'visible') run() }
    run()
    window.addEventListener('online', run)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearTimeout(retryTimer)
      window.removeEventListener('online', run)
      document.removeEventListener('visibilitychange', onVisible)
      controller?.abort()
    }
  }, [url, ttlMs, swrMs])

  return { data, isLoading, error, errorStatus }
}
