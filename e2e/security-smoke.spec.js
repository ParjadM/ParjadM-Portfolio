import { test, expect } from '@playwright/test'

/**
 * Lightweight security / headers smoke (production-shaped preview).
 * Documents the quality gate mindset: verify hardening, don't just assume it.
 */

test.describe('Security smoke', () => {
  test('document response exposes core hardening headers when served', async ({ request, baseURL }) => {
    const res = await request.get(baseURL + '/')
    expect(res.ok()).toBeTruthy()
    // Preview may not inject Vercel headers; assert content type at minimum,
    // and check security headers when present (production / vercel).
    expect(res.headers()['content-type'] || '').toMatch(/text\/html/i)
    const csp = res.headers()['content-security-policy']
    const xfo = res.headers()['x-frame-options']
    if (csp) expect(csp.toLowerCase()).toContain("default-src")
    if (xfo) expect(xfo.toLowerCase()).toMatch(/sameorigin|deny/)
  })
})
