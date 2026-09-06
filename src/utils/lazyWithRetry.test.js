import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isChunkLoadError, recoverFromStaleChunk } from './lazyWithRetry.js';

describe('isChunkLoadError', () => {
  it('detects failed dynamic import messages', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://www.parjadm.ca/assets/StatsPage-4hKsI1U1.js',
        ),
      ),
    ).toBe(true);
  });

  it('detects missing route export failures used by lazyNamed', () => {
    const err = new Error('Failed to load route module export: DesktopOS');
    err.name = 'ChunkLoadError';
    expect(isChunkLoadError(err)).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isChunkLoadError(new Error('Network offline for /api/blog'))).toBe(false);
  });
});

describe('recoverFromStaleChunk', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns false on the second attempt in the same tab session', async () => {
    sessionStorage.setItem('chunk-load-reload', String(Date.now()));
    await expect(recoverFromStaleChunk()).resolves.toBe(false);
    expect(Number(sessionStorage.getItem('chunk-load-reload'))).toBeGreaterThan(1);
    await expect(recoverFromStaleChunk()).resolves.toBe(false);
  });
});


describe('recovery coordination', () => {
  it('shares one recovery between simultaneous failures', async () => {
    vi.resetModules();
    sessionStorage.clear();
    const update = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('navigator', { onLine: true, serviceWorker: { getRegistrations: update } });
    try {
      const { recoverFromStaleChunk: recover } = await import('./lazyWithRetry.js');
      const first = recover();
      expect(recover()).toBe(first);
      await Promise.resolve();
      expect(update).toHaveBeenCalledTimes(1);
    } finally { vi.unstubAllGlobals(); }
  });
  it('does not reload or consume recovery while offline', async () => {
    vi.resetModules();
    sessionStorage.clear();
    vi.stubGlobal('navigator', { onLine: false });
    try {
      const { recoverFromStaleChunk: recover } = await import('./lazyWithRetry.js');
      await expect(recover()).resolves.toBe(false);
      expect(sessionStorage.getItem('chunk-load-reload')).toBeNull();
    } finally { vi.unstubAllGlobals(); }
  });
});
