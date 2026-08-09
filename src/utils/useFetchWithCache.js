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

  useEffect(() => {
    if (!url) return undefined

    let cancelled = false
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null

    const run = async () => {
      const existing = peekApi(url)
      if (existing !== undefined && !cancelled) {
        setData(existing)
        setIsLoading(false)
      } else if (!cancelled) {
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
        }
      } catch (err) {
        if (cancelled || err?.name === 'AbortError') return
        setError(err.message || String(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
      controller?.abort()
    }
  }, [url, ttlMs, swrMs])

  return { data, isLoading, error }
}
