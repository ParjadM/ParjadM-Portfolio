import { act, renderHook, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useVisitorCount } from './useVisitorCount.js'
import { useFetchWithCache, __resetApiClient } from './useFetchWithCache.js'
const response = data => ({ ok: true, json: async () => data })
beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); __resetApiClient() })
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

it('ignores the old cached fallback zero and recovers without a reload', async () => {
  localStorage.setItem('cachedVisitors', '0')
  const fetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValue(response({ available: true, uniqueVisitors: 2034 }))
  vi.stubGlobal('fetch', fetch)
  const hook = renderHook(() => useVisitorCount())
  await act(async () => {})
  expect(hook.result.current).toBe(null)
  await act(async () => { await vi.advanceTimersByTimeAsync(10000) })
  expect(hook.result.current).toBe(2034)
  expect(localStorage.getItem('verifiedVisitors')).toBe('2034')
})

it('retains verified count when a server returns an unverified zero', async () => {
  localStorage.setItem('verifiedVisitors', '2034')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ uniqueVisitors: 0 })))
  const hook = renderHook(() => useVisitorCount())
  await act(async () => {})
  expect(hook.result.current).toBe(2034)
})

it('accepts a genuinely verified zero and cancels polling on unmount', async () => {
  const fetch = vi.fn().mockResolvedValue(response({ available: true, uniqueVisitors: 0 }))
  vi.stubGlobal('fetch', fetch)
  const hook = renderHook(() => useVisitorCount())
  await act(async () => {})
  expect(hook.result.current).toBe(0)
  hook.unmount()
  await act(async () => { await vi.advanceTimersByTimeAsync(60000) })
  expect(fetch).toHaveBeenCalledTimes(1)
})

it('retries content after an outage instead of leaving the page empty', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValue(response({ projects: [{ id: 'restored' }] })))
  const hook = renderHook(() => useFetchWithCache('/api/projects'))
  await act(async () => {})
  expect(hook.result.current.error).toBeTruthy()
  await act(async () => { await vi.advanceTimersByTimeAsync(10000) })
  expect(hook.result.current.data.projects[0].id).toBe('restored')
  expect(hook.result.current.error).toBe(null)
})

it('does not repeatedly retry a genuine 404', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })
  vi.stubGlobal('fetch', fetch)
  const hook = renderHook(() => useFetchWithCache('/api/blog/missing'))
  await act(async () => {})
  expect(hook.result.current.errorStatus).toBe(404)
  await act(async () => { await vi.advanceTimersByTimeAsync(30000) })
  expect(fetch).toHaveBeenCalledTimes(1)
})
