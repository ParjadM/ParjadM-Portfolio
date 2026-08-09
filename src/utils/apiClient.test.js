import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  fetchApi,
  peekApi,
  invalidateApi,
  canonicalizeUrl,
  __resetApiClient,
} from './apiClient.js'

describe('apiClient', () => {
  beforeEach(() => {
    __resetApiClient()
    vi.restoreAllMocks()
  })

  it('canonicalizes query param order', () => {
    expect(canonicalizeUrl('/api/blog?b=2&a=1')).toBe('/api/blog?a=1&b=2')
  })

  it('deduplicates in-flight requests', async () => {
    let resolveFetch
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = () =>
            resolve({
              ok: true,
              json: async () => ({ posts: [1] }),
            })
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const p1 = fetchApi('/api/blog?page=1')
    const p2 = fetchApi('/api/blog?page=1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    resolveFetch()
    const [a, b] = await Promise.all([p1, p2])
    expect(a).toEqual({ posts: [1] })
    expect(b).toEqual({ posts: [1] })
  })

  it('serves fresh cache without refetch', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    await fetchApi('/api/health', { ttlMs: 60_000 })
    await fetchApi('/api/health', { ttlMs: 60_000 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(peekApi('/api/health')).toEqual({ ok: true })
  })

  it('invalidates by prefix', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ posts: [] }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    await fetchApi('/api/blog?page=1')
    invalidateApi('/api/blog')
    expect(peekApi('/api/blog?page=1')).toBeUndefined()
  })
})
