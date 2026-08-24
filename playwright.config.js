import { defineConfig, devices } from '@playwright/test'

/**
 * Risk-based E2E suite for critical user journeys.
 * Run after `npm run build`: `npm run test:e2e`
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Flaky tests are defects: one CI retry for infra noise, then fail loudly.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Prefer DOM readiness over networkidle (API proxy noise is flake fuel).
    navigationTimeout: 30_000,
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npx vite preview --port 4173 --strictPort --host 127.0.0.1',
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
