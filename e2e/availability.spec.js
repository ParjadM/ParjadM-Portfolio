import { test, expect } from '@playwright/test'

test('visitor badge recovers from an outage without showing cached zero', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cachedVisitors', '0'))
  let attempts = 0
  await page.route('**/api/metrics?*', route => {
    attempts++
    return route.fulfill(attempts === 1
      ? { status: 503, json: { error: 'Temporary outage' } }
      : { json: { available: true, uniqueVisitors: 2034, pageviews: 10234 } })
  })
  await page.goto('/')
  await expect(page.getByText('0 Visitors', { exact: true })).toHaveCount(0)
  await expect(page.getByText(/2,?034 Visitors/).first()).toBeVisible({ timeout: 20000 })
  expect(attempts).toBeGreaterThanOrEqual(2)
})

for (const type of ['projects', 'blog']) {
  test(`${type} recovers after a failed initial load`, async ({ page }) => {
    let attempts = 0
    const item = { id: 'test-recovered', title: `Recovered ${type}`, description: 'Test content', excerpt: 'Test excerpt', content: 'Test content', tags: [], category: 'technology', date: '2026-10-20', readTime: '1 min', featured: false }
    await page.route(`**/api/${type}?*`, route => {
      attempts++
      return route.fulfill(attempts === 1
        ? { status: 503, json: { error: 'Temporary outage' } }
        : { json: { [type === 'blog' ? 'posts' : 'projects']: [item], pagination: { page: 1, totalPages: 1, totalItems: 1 }, featuredPost: null } })
    })
    await page.goto(`/${type}`)
    await expect(page.getByText(`Recovered ${type}`, { exact: true }).first()).toBeVisible({ timeout: 20000 })
    expect(attempts).toBeGreaterThanOrEqual(2)
  })
}

test('article outages show an error and recover, rather than claiming deletion', async ({ page }) => {
  let available = false
  await page.route('**/api/blog/test-article', route => route.fulfill(available
    ? { json: { post: { id: 'test-article', title: 'Recovered article', content: 'The article is still here.', tags: [], date: '2026-10-20' } } }
    : { status: 503, json: { error: 'Temporary outage' } }))
  await page.route('**/api/blog/test-article/related?*', route => route.fulfill({ json: { posts: [] } }))
  await page.goto('/blog/test-article')
  await expect(page.getByText(/post not found/i)).toHaveCount(0)
  await expect(page.locator('main')).toContainText(/failed|error|unable|try again/i)
  available = true
  await expect(page.getByRole('heading', { name: 'Recovered article', exact: true })).toBeVisible({ timeout: 20000 })
})
