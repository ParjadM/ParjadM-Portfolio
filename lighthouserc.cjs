/** @type {import('lighthouse').Flags} */
module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4173/'],
      startServerCommand: 'npx vite preview --port 4173 --strictPort --host 127.0.0.1',
      startServerReadyPattern: 'Local',
      numberOfRuns: 1,
      settings: {
        // Cloud/CI Chrome often needs these flags to avoid interstitial failures.
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
