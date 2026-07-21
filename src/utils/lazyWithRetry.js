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

/** Lazy-load a route chunk; reload once if a stale deploy left a broken hash reference. */
export function lazyWithRetry(factory) {
  return React.lazy(() =>
    factory()
      .then((mod) => {
        try { sessionStorage.removeItem(RELOAD_KEY); } catch {}
        return mod;
      })
      .catch((err) => {
        if (isChunkLoadError(err) && !sessionStorage.getItem(RELOAD_KEY)) {
          try { sessionStorage.setItem(RELOAD_KEY, '1'); } catch {}
          window.location.reload();
          return new Promise(() => {});
        }
        try { sessionStorage.removeItem(RELOAD_KEY); } catch {}
        throw err;
      }),
  );
}

export function installChunkLoadRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    // Only swallow the error when we actually reload. Preventing the event
    // without reloading makes the dynamic import resolve with `undefined`,
    // which surfaces later as "Cannot read properties of undefined".
    if (!sessionStorage.getItem(RELOAD_KEY)) {
      event.preventDefault();
      try { sessionStorage.setItem(RELOAD_KEY, '1'); } catch {}
      window.location.reload();
    }
  });
}
