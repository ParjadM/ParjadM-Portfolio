/**
 * Post-build smoke test: serves the dist/ output with `vite preview` and
 * verifies the app actually renders (catches crashes like a ReferenceError
 * in a top-level component that would ship a blank page to production).
 *
 * Run after `npm run build`: node scripts/smoke-test.mjs
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const ROUTES = ['/', '/fr', '/projects', '/fr/projects'];

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe',
  shell: process.platform === 'win32',
});

const waitForServer = async () => {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('vite preview did not start within 30s');
};

let failed = false;
try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });

    const headerVisible = await page.locator('header').first().isVisible().catch(() => false);
    const bodyText = (await page.textContent('body'))?.trim() ?? '';

    if (!headerVisible || bodyText.length < 20) {
      console.error(`FAIL ${route}: header visible=${headerVisible}, body text length=${bodyText.length}`);
      failed = true;
    } else {
      console.log(`PASS ${route}`);
    }
  }

  if (pageErrors.length > 0) {
    console.error('Uncaught page errors:');
    for (const e of pageErrors) console.error(`  - ${e}`);
    failed = true;
  }

  await browser.close();
} catch (err) {
  console.error(err);
  failed = true;
} finally {
  preview.kill();
  if (process.platform === 'win32' && preview.pid) {
    // `shell: true` on Windows wraps the command; kill the whole tree.
    spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
  }
}

process.exit(failed ? 1 : 0);
