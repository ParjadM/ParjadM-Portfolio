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
          '**/garden/**',
          '**/icons/icon-512.png',
          '**/icons/icon-maskable-512.png',
        ],
        maximumFileSizeToCacheInBytes: 1 * 1024 * 1024,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/assets\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
          {
            // Hashed Vite assets are immutable — CacheFirst is safe and preserves
            // previously visited route chunks across deployments.
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/assets/'),
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
