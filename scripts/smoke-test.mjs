/**
 * Post-build smoke test: serves the dist/ output with `vite preview` and
 * verifies the app actually renders (catches crashes like a ReferenceError
 * in a top-level component that would ship a blank page to production).
 *
 * Run after `npm run build`: node scripts/smoke-test.mjs
 */
import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';

const PORT = 4200 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  { path: '/', check: 'header' },
  { path: '/fr', check: 'header' },
  { path: '/projects', check: 'header' },
  { path: '/fr/projects', check: 'header' },
  { path: '/projects/cameraFx', check: 'header' },
  { path: '/projects/qaLab', check: 'header' },
  { path: '/contact', check: 'form' },
  { path: '/blog', check: 'header' },
];

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
  await page.addInitScript(() => {
    localStorage.setItem('parjadm_intro_seen', '1');
  });

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  for (const { path, check } of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

    const headerVisible = await page.locator('header').first().isVisible().catch(() => false);
    const bodyText = (await page.textContent('body'))?.trim() ?? '';
    const formVisible = check === 'form'
      ? await page.locator('form').first().isVisible().catch(() => false)
      : true;

    if (!headerVisible || bodyText.length < 20 || !formVisible) {
      console.error(`FAIL ${path}: header=${headerVisible}, form=${formVisible}, bodyLen=${bodyText.length}`);
      failed = true;
    } else {
      console.log(`PASS ${path}`);
    }
  }

  // Mobile menu opens and closes
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const mobilePage = await mobile.newPage();
  await mobilePage.addInitScript(() => {
    localStorage.setItem('parjadm_intro_seen', '1');
  });
  await mobilePage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForURL((url) => !new URL(url).pathname.includes('/intro'), { timeout: 10_000 });
  const menuBtn = mobilePage.getByRole('button', { name: /open menu|ouvrir le menu|menu/i }).first();
  const menuVisible = await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false);
  if (menuVisible) {
    await menuBtn.click({ timeout: 10_000 });
    const dialog = mobilePage.getByRole('dialog', { name: /site menu/i });
    const menuOpen = await dialog.isVisible().catch(() => false);
    if (!menuOpen) {
      console.error('FAIL mobile menu: dialog did not open');
      failed = true;
    } else {
      await mobilePage.keyboard.press('Escape');
      const menuClosed = await dialog.isHidden().catch(() => false);
      if (!menuClosed) {
        console.error('FAIL mobile menu: Escape did not close dialog');
        failed = true;
      } else {
        console.log('PASS mobile menu open/close');
      }
    }
  } else {
    console.log('SKIP mobile menu (button not visible)');
  }
  await mobile.close();

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
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
      killer.on('exit', resolve);
      killer.on('error', resolve);
    });
  }
}

process.exit(failed ? 1 : 0);
