import React from 'react';

const RELOAD_KEY = 'chunk-load-reload';

function isChunkLoadError(err) {
  const msg = err?.message || '';
  return (
    err?.name === 'ChunkLoadError'
    || msg.includes('Failed to fetch dynamically imported module')
    || msg.includes('Importing a module script failed')
    || msg.includes('error loading dynamically imported module')
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

async function activateWaitingWorker() {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;

    if (reg.waiting) {
      await new Promise((resolve) => {
        const onControllerChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Don't hang forever if activation never happens.
        setTimeout(resolve, 2500);
      });
      return true;
    }

    await reg.update();
    return false;
  } catch {
    return false;
  }
}

async function recoverFromStaleChunk() {
  if (safeSessionGet(RELOAD_KEY)) {
    safeSessionRemove(RELOAD_KEY);
    return false;
  }
  safeSessionSet(RELOAD_KEY, '1');
  await activateWaitingWorker();
  window.location.reload();
  return true;
}

/** Lazy-load a route chunk; reload once if a stale deploy left a broken hash reference. */
export function lazyWithRetry(factory) {
  return React.lazy(() =>
    factory()
      .then((mod) => {
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
}

export { isChunkLoadError, recoverFromStaleChunk, activateWaitingWorker };
