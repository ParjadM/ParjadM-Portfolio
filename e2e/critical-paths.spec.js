import { test, expect } from '@playwright/test'

/**
 * Critical-path E2E suite (QA risk-based selection).
 * Prefer fewer high-value journeys over click-soup coverage.
 * Flaky assertions are defects — keep selectors role-based and deterministic.
 */

test.describe('Critical journeys', () => {
  test('home renders brand and primary navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible()
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.locator('img[alt="Logo"]').first()).toBeVisible()
  })

  test('header navigation reaches projects without a blank route', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /projects|projets/i }).first().click()
    await expect(page).toHaveURL(/\/projects\/?$/)
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.locator('body')).not.toContainText(/page not found|page introuvable/i)
  })

  test('projects index is reachable and lists content region', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.locator('body')).not.toContainText(/page not found|page introuvable/i)
  })

  test('Camera FX project page loads without crashing', async ({ page }) => {
    await page.goto('/projects/cameraFx')
    await expect(page.getByRole('heading', { name: /camera fx/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start camera/i }).first()).toBeVisible()
  })

  test('QA Lab showcase page loads with pyramid evidence', async ({ page }) => {
    await page.goto('/projects/qaLab')
    await expect(page.getByRole('heading', { name: /quality engineering/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /test pyramid/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /risk/i }).first()).toBeVisible()
    await expect(page.locator('pre')).toContainText('npm run test:e2e')
    await expect(page.locator('pre')).toContainText('npm run test:server')
  })

  test('Explore surfaces QA Lab as a discoverable project', async ({ page }) => {
    await page.goto('/explore')
    const qaLink = page.getByRole('link', { name: /qa engineering lab|labo qa/i }).first()
    await expect(qaLink).toBeVisible()
    await qaLink.click()
    await expect(page).toHaveURL(/\/projects\/qaLab/)
    await expect(page.getByRole('heading', { name: /quality engineering|ingénierie qualité/i })).toBeVisible()
  })

  test('French locale keeps primary chrome and contact form', async ({ page }) => {
    await page.goto('/fr/contact')
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('form').first()).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', /fr/i)
  })

  test('404 page is intentional and offers recovery', async ({ page }) => {
    await page.goto('/this-route-should-not-exist-qa')
    await expect(page.getByRole('heading', { name: /page not found|page introuvable/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /home|accueil/i }).first()).toBeVisible()
  })
})

test.describe('Accessibility smoke', () => {
  test('skip link is present and can receive focus', async ({ page }) => {
    await page.goto('/')
    const skip = page.locator('a[href="#main-content"]').first()
    await expect(skip).toBeAttached()
    await skip.focus()
    await expect(skip).toBeFocused()
    await expect(page.locator('#main-content')).toBeVisible()
  })
})
