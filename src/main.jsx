import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource-variable/outfit'
import './index.css'
import { ensureLocale } from './i18n.js'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { installErrorReporter } from './utils/errorReporter.js'
import { installWebVitalsReporter } from './utils/webVitals.js'
import { installChunkLoadRecovery } from './utils/lazyWithRetry.js'

installChunkLoadRecovery()
installErrorReporter()
installWebVitalsReporter()

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
