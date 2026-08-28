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

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  for (const { path, check } of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

    const headerVisible = await page.locator('header').first().isVisible().catch(() => false);
    const bodyText = (await page.textContent('body'))?.trim() ?? '';
    let formVisible = true;
    if (check === 'form') {
      const form = page.locator('#main-content form, main form').first();
      formVisible = await form.waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => true)
        .catch(() => false);
    }

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
  await mobilePage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
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

  // Tablet menu: scroll panel reaches cursor themes
  const tablet = await browser.newContext({ ...devices['iPad Mini'] });
  const tabletPage = await tablet.newPage();
  await tabletPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  const tabletMenuBtn = tabletPage.locator('nav[aria-label="Mobile Primary"]').getByRole('button', { name: /open menu|ouvrir le menu/i });
  const tabletMenuVisible = await tabletMenuBtn.isVisible({ timeout: 3_000 }).catch(() => false);
  if (tabletMenuVisible) {
    await tabletMenuBtn.click({ timeout: 10_000 });
    const tabletDialog = tabletPage.getByRole('dialog', { name: /site menu/i });
    await tabletDialog.waitFor({ state: 'visible', timeout: 5_000 });
    const scrollPanel = tabletDialog.locator('.mobile-menu-scroll');
    await scrollPanel.waitFor({ state: 'visible', timeout: 5_000 });
    await scrollPanel.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    const cursorOption = tabletPage.getByRole('button', { name: /accent glow|lueur accent/i });
    await cursorOption.scrollIntoViewIfNeeded();
    const cursorVisible = await cursorOption.isVisible().catch(() => false);
    if (!cursorVisible) {
      console.error('FAIL tablet menu: cursor themes not visible after scroll');
      failed = true;
    } else {
      console.log('PASS tablet menu scroll + cursor themes');
    }
  } else {
    console.log('SKIP tablet menu (button not visible)');
  }
  await tablet.close();

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
