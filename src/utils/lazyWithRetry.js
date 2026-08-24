import React from 'react';

const RELOAD_KEY = 'chunk-load-reload';

function isChunkLoadError(err) {
  const msg = String(err?.message || err || '');
  const name = String(err?.name || '');
  return (
    name === 'ChunkLoadError'
    || (name === 'TypeError' && /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg))
    || /Failed to fetch dynamically imported module/i.test(msg)
    || /Importing a module script failed/i.test(msg)
    || /error loading dynamically imported module/i.test(msg)
    || /Loading chunk [\d]+ failed/i.test(msg)
    || /Failed to load route module export/i.test(msg)
  );
}

function safeSessionGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

function safeSessionRemove(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

async function clearAssetCaches() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => /workbox|assets|precache|runtime/i.test(key))
        .map((key) => caches.delete(key)),
    );
  } catch {
    // Best-effort; recovery can still reload.
  }
}

async function activateWaitingWorker() {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;

    // Prefer activating a waiting worker so the next load uses the new precache.
    const waiting = reg.waiting;
    if (waiting) {
      await new Promise((resolve) => {
        const onControllerChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
        waiting.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(resolve, 2500);
      });
      return true;
    }

    // Ask for an update; if nothing is waiting yet, fall through to hard recovery.
    await reg.update();
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      await new Promise((r) => setTimeout(r, 500));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function unregisterServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  } catch {
    // ignore
  }
}

/**
 * Recover from a deploy mismatch: old shell/SW referencing deleted hashed chunks.
 * One reload only per tab session to avoid loops.
 */
async function recoverFromStaleChunk() {
  if (safeSessionGet(RELOAD_KEY)) {
    safeSessionRemove(RELOAD_KEY);
    return false;
  }
  safeSessionSet(RELOAD_KEY, '1');

  const activated = await activateWaitingWorker();
  if (!activated) {
    // No waiting worker — clear caches + unregister so the next load is network-fresh.
    await clearAssetCaches();
    await unregisterServiceWorkers();
  }

  // Cache-bust the navigation in case a CDN/edge still has a stale HTML shell.
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('_chunkfix', String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
  return true;
}

/** Lazy-load a route chunk; reload once if a stale deploy left a broken hash reference. */
export function lazyWithRetry(factory) {
  return React.lazy(() =>
    Promise.resolve()
      .then(() => factory())
      .then((mod) => {
        if (!mod || (typeof mod === 'object' && !('default' in mod) && Object.keys(mod).length === 0)) {
          const err = new Error('Failed to load route module export: empty module');
          err.name = 'ChunkLoadError';
          throw err;
        }
        safeSessionRemove(RELOAD_KEY);
        return mod;
      })
      .catch(async (err) => {
        if (isChunkLoadError(err)) {
          const recovering = await recoverFromStaleChunk();
          if (recovering) return new Promise(() => {});
        }
        safeSessionRemove(RELOAD_KEY);
        throw err;
      }),
  );
}

export function installChunkLoadRecovery() {
  window.addEventListener('vite:preloadError', async (event) => {
    // Only swallow the error when we actually reload. Preventing the event
    // without reloading makes the dynamic import resolve with `undefined`.
    const recovering = await recoverFromStaleChunk();
    if (recovering) {
      event.preventDefault();
    }
  });

  // Catch dynamic-import rejections that bypass React.lazy in some browsers.
  window.addEventListener('unhandledrejection', (event) => {
    if (!isChunkLoadError(event.reason)) return;
    event.preventDefault();
    recoverFromStaleChunk();
  });
}

export { isChunkLoadError, recoverFromStaleChunk, activateWaitingWorker, clearAssetCaches };
