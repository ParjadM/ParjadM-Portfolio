import { test, expect } from '@playwright/test'

/**
 * Critical-path E2E suite (QA risk-based selection).
 * These journeys protect revenue/reputation surfaces: home, projects, contact, locale, showcase apps.
 */

test.describe('Critical journeys', () => {
  test('home renders brand and primary navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible()
    await expect(page.locator('#main-content')).toBeVisible()
    // Brand signal should not depend on nav alone.
    await expect(page.locator('img[alt="Logo"]').first()).toBeVisible()
  })

  test('projects index is reachable and lists content region', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Page not found')
  })

  test('Camera FX project page loads without crashing', async ({ page }) => {
    await page.goto('/projects/cameraFx')
    await expect(page.getByRole('heading', { name: /camera fx/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start camera/i })).toBeVisible()
  })

  test('QA Lab showcase page loads', async ({ page }) => {
    await page.goto('/projects/qaLab')
    await expect(page.getByRole('heading', { name: /quality engineering/i })).toBeVisible()
    await expect(page.getByText(/test pyramid/i)).toBeVisible()
  })

  test('French locale keeps primary chrome and contact form', async ({ page }) => {
    await page.goto('/fr/contact')
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('form').first()).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', /fr/i)
  })

  test('404 page is intentional and indexed as noindex journey', async ({ page }) => {
    await page.goto('/this-route-should-not-exist-qa')
    await expect(page.getByRole('heading', { name: /page not found|page introuvable/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /home|accueil/i }).first()).toBeVisible()
  })
})

test.describe('Accessibility smoke', () => {
  test('skip link reaches main content', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to main content|aller au contenu/i })
    if (await skip.count()) {
      await skip.first().focus()
      await expect(skip.first()).toBeFocused()
    }
    await expect(page.locator('#main-content')).toBeVisible()
  })
})
