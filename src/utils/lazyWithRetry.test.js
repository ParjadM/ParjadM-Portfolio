import { describe, it, expect, beforeEach } from 'vitest';
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
    sessionStorage.setItem('chunk-load-reload', '1');
    await expect(recoverFromStaleChunk()).resolves.toBe(false);
    expect(sessionStorage.getItem('chunk-load-reload')).toBeNull();
  });
});
