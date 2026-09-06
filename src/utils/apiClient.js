/**
 * Unified API client with TTL cache, stale-while-revalidate, and in-flight
 * request deduplication. Prefer this over raw fetch for public GETs.
 */

const DEFAULT_TTL_MS = 30_000
const DEFAULT_SWR_MS = 5 * 60_000

/** @type {Map<string, { data: any, fetchedAt: number, promise?: Promise<any> }>} */
const store = new Map()

export function canonicalizeUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(url, 'http://local.invalid')
    const params = [...u.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b))
    const qs = new URLSearchParams(params).toString()
    return `${u.pathname}${qs ? `?${qs}` : ''}`
  } catch {
    return String(url)
  }
}

function isFresh(entry, ttlMs) {
  return entry && Date.now() - entry.fetchedAt < ttlMs
}

function isUsable(entry, ttlMs, swrMs) {
  return entry?.data !== undefined && Date.now() - entry.fetchedAt < ttlMs + swrMs
}

/**
 * Fetch JSON from a same-origin API URL with caching.
 * @returns {Promise<any>}
 */
async function fetchShared(url, {
  ttlMs = DEFAULT_TTL_MS,
  swrMs = DEFAULT_SWR_MS,
  force = false,
} = {}) {
  const key = canonicalizeUrl(url)
  if (!key) throw new Error('fetchApi: url required')

  const existing = store.get(key)
  if (!force && existing?.promise) return existing.promise
  if (!force && isFresh(existing, ttlMs)) return existing.data

  const shouldRevalidate = !force && isUsable(existing, ttlMs, swrMs)

  const promise = (async () => {
    const res = await fetch(key)
    if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`)
    const data = await res.json()
    store.set(key, { data, fetchedAt: Date.now() })
    return data
  })()

  store.set(key, {
    data: existing?.data,
    fetchedAt: existing?.fetchedAt ?? 0,
    promise,
  })

  try {
    return await promise
  } catch (err) {
    const cur = store.get(key)
    if (cur?.promise === promise) {
      store.set(key, { data: cur.data, fetchedAt: cur.fetchedAt })
    }
    if (shouldRevalidate && existing?.data !== undefined) return existing.data
    throw err
  } finally {
    const cur = store.get(key)
    if (cur?.promise === promise) {
      store.set(key, { data: cur.data, fetchedAt: cur.fetchedAt })
    }
  }
}

/** Cancellation belongs to the caller, never to a shared network request. */
export function fetchApi(url, options = {}) {
  const { signal, ...sharedOptions } = options
  if (signal?.aborted) return Promise.reject(new DOMException('Request aborted', 'AbortError'))
  const request = fetchShared(url, sharedOptions)
  if (!signal) return request
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Request aborted', 'AbortError'))
    signal.addEventListener('abort', abort, { once: true })
    request.then(
      data => { signal.removeEventListener('abort', abort); resolve(data) },
      error => { signal.removeEventListener('abort', abort); reject(error) },
    )
  })
}

/** Read cached data without fetching (may be stale). */
export function peekApi(url) {
  const entry = store.get(canonicalizeUrl(url))
  return entry?.data
}

/** Invalidate one key or every key starting with prefix. */
export function invalidateApi(prefixOrUrl) {
  if (!prefixOrUrl) {
    store.clear()
    return
  }
  const needle = String(prefixOrUrl)
  for (const key of [...store.keys()]) {
    if (key === needle || key.startsWith(needle)) store.delete(key)
  }
}

/** Test helper */
export function __resetApiClient() {
  store.clear()
}

/** Back-compat shim used by CLI — mimics Map get/set on canonical paths. */
export const apiCache = {
  get(url) {
    return peekApi(url)
  },
  set(url, data) {
    store.set(canonicalizeUrl(url), { data, fetchedAt: Date.now() })
  },
  has(url) {
    return peekApi(url) !== undefined
  },
  clear() {
    store.clear()
  },
}
