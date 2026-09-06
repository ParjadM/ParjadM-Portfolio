import React from 'react';

const RELOAD_KEY = 'chunk-load-reload';
let recoveryPromise;
let attemptedRecovery = false;
const RECOVERY_COOLDOWN_MS = 60_000;

function recentlyRecovered() {
  const stored = Number(safeSessionGet(RELOAD_KEY));
  const query = Number(new URL(window.location.href).searchParams.get('_chunkfix'));
  const last = Math.max(stored || 0, query || 0);
  return last > 1 && Date.now() - last < RECOVERY_COOLDOWN_MS;
}

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
 * One automatic reload per minute, shared across handlers, to avoid loops.
 */
function recoverFromStaleChunk() {
  if (recoveryPromise) return recoveryPromise;
  if (navigator.onLine === false || attemptedRecovery || recentlyRecovered()) {
    return Promise.resolve(false);
  }
  attemptedRecovery = true;
  safeSessionSet(RELOAD_KEY, String(Date.now()));
  recoveryPromise = performRecovery();
  return recoveryPromise;
}

async function performRecovery() {

  // A waiting worker can still contain a stale shell. Remove its registration
  // and asset caches before navigating instead of trusting activation timing.
  await unregisterServiceWorkers();
  await clearAssetCaches();

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
        return mod;
      })
      .catch(async (err) => {
        if (isChunkLoadError(err)) {
          const recovering = await recoverFromStaleChunk();
          if (recovering) return new Promise(() => {});
        }
        throw err;
      }),
  );
}

export function installChunkLoadRecovery() {
  const onPreloadError = (event) => {
    if (!isChunkLoadError(event.payload)) return;
    // Keep the rejection intact so lazyWithRetry can await the shared recovery.
    // Preventing Vite's event would turn the import into an empty module.
    void recoverFromStaleChunk();
  };
  const onRejection = (event) => {
    if (!isChunkLoadError(event.reason)) return;
    if (navigator.onLine === false) return;
    if (recoveryPromise || (!attemptedRecovery && !recentlyRecovered())) {
      event.preventDefault();
      void recoverFromStaleChunk();
    }
  };
  window.addEventListener('vite:preloadError', onPreloadError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('vite:preloadError', onPreloadError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

export { isChunkLoadError, recoverFromStaleChunk, activateWaitingWorker, clearAssetCaches };
