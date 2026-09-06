import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource-variable/outfit'
import './index.css'
import './visual-polish.css'
import { ensureLocale } from './i18n.js'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { installErrorReporter } from './utils/errorReporter.js'
import { installWebVitalsReporter } from './utils/webVitals.js'
import { installChunkLoadRecovery } from './utils/lazyWithRetry.js'

installChunkLoadRecovery()
installErrorReporter()
installWebVitalsReporter()

// Drop one-shot recovery cache-bust param after a successful boot.
try {
  const url = new URL(window.location.href)
  if (url.searchParams.has('_chunkfix')) {
    url.searchParams.delete('_chunkfix')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }
} catch {}

async function bootstrap() {
  const initialLocale = window.location.pathname.startsWith('/fr') ? 'fr' : 'en'
  await ensureLocale(initialLocale)
  // URL locale must win over detector/localStorage before first paint.
  const { default: i18n } = await import('./i18n.js')
  if (i18n.language !== initialLocale) {
    await i18n.changeLanguage(initialLocale)
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}

bootstrap()
