import { test, expect } from '@playwright/test'

test('both blog summary styles work after a transient database outage', async ({ page }) => {
  const post = { id: 'test-summary', title: 'Summary test article', content: 'Published content for this browser test.', tags: [], date: '2026-10-20' }
  await page.route('**/api/blog/test-summary', route => route.fulfill({ json: { post } }))
  await page.route('**/api/blog/test-summary/related?*', route => route.fulfill({ json: { posts: [] } }))
  let attempts = 0
  await page.route('**/api/ai/blog/explain', route => {
    attempts++
    if (attempts === 1) return route.fulfill({ status: 503, headers: { 'Retry-After': '1' }, json: { code: 'DATABASE_UNAVAILABLE', error: 'Temporarily unavailable' } })
    const { mode } = route.request().postDataJSON()
    return route.fulfill({ json: { reply: mode === 'tldr' ? 'The short test summary.' : 'The beginner test explanation.', mode } })
  })
  await page.goto('/blog/test-summary')
  await page.getByRole('button', { name: /Too long/ }).click()
  await expect(page.getByRole('status')).toContainText(/reconnecting/i)
  await expect(page.getByText('The short test summary.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Explain like/ }).click()
  await expect(page.getByText('The beginner test explanation.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Too long/ }).click()
  expect(attempts).toBe(3)
  await expect(page.getByRole('alert')).toHaveCount(0)
})
