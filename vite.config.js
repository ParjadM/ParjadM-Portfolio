import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Static manifest lives in public/manifest.webmanifest; the plugin only
      // provides the service worker + precaching.
      manifest: false,
      workbox: {
        // Precache the app shell + homepage assets only. Heavy optional routes
        // (admin, OS, Algorithm Memorizer, markdown/editor) use runtime CacheFirst.
        globPatterns: [
          'index.html',
          'manifest.webmanifest',
          'favicon.svg',
          // Small install icons only — keep offline PWA icon UX without the
          // ~340 KiB 512px pair that blew the shell precache budget.
          'icons/icon-192.png',
          'icons/apple-touch-icon.png',
          'assets/app-*.js',
          'assets/vendor-react-*.js',
          'assets/vendor-i18n-*.js',
          'assets/index-*.css',
          'assets/ParjadM-*.webp',
          'assets/Logo-*.webp',
          'assets/outfit-*.woff2',
        ],
        globIgnores: [
          '**/AlgorithmMemorizer*',
          '**/Admin*',
          '**/DesktopOS*',
          '**/CliMode*',
          '**/IntroCinematic*',
          '**/MockInterview*',
          '**/CameraFx*',
          '**/QaLab*',
          '**/garden/**',
          '**/icons/icon-512.png',
          '**/icons/icon-maskable-512.png',
        ],
        maximumFileSizeToCacheInBytes: 1 * 1024 * 1024,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api\//, /^\/assets\//],
        runtimeCaching: [
          {
            // Never pin online visitors to the HTML from an older precache.
            urlPattern: ({ request, url }) => request.mode === 'navigate'
              && url.origin === self.location.origin
              && !url.pathname.startsWith('/api/')
              && !url.pathname.startsWith('/assets/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'page-navigations',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
          {
            // Prefer network for hashed JS so a new deploy's entry can fetch
            // current chunks even if an older SW is still installed. Fall back
            // to cache for offline / flaky networks. CSS/fonts/images stay
            // CacheFirst via the catch-all below.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin
              && url.pathname.startsWith('/assets/')
              && url.pathname.endsWith('.js'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-js',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin
              && url.pathname.startsWith('/assets/')
              && !url.pathname.endsWith('.js'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-immutable',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Stable entry prefix so Workbox can precache the shell without matching
        // unrelated async "index-*" chunks.
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // NOTE: framer-motion and react-markdown are intentionally NOT listed.
        // They are only imported by lazy chunks, so Rollup splits them into
        // async chunks automatically.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false,
      },
      '/feed.xml': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
