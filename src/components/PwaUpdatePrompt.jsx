import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, X } from 'lucide-react'
import { getAccent } from '../utils/themeTokens.js'

/**
 * Prompt-based PWA update UI. Uses virtual:pwa-register when available.
 */
export function PwaUpdatePrompt({ theme = 'green' }) {
  const { t } = useTranslation()
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateSW, setUpdateSW] = useState(null)

  useEffect(() => {
    let disposed = false
    ;(async () => {
      try {
        const mod = await import('virtual:pwa-register')
        if (disposed || typeof mod.registerSW !== 'function') return
        const update = mod.registerSW({
          immediate: true,
          onNeedRefresh() {
            if (!disposed) setNeedRefresh(true)
          },
          onOfflineReady() {
            if (!disposed) setOfflineReady(true)
          },
        })
        if (!disposed) setUpdateSW(() => update)
      } catch {
        // Dev / non-PWA environments may not expose the virtual module.
      }
    })()
    return () => {
      disposed = true
    }
  }, [])

  useEffect(() => {
    if (!offlineReady) return undefined
    const timer = setTimeout(() => setOfflineReady(false), 4000)
    return () => clearTimeout(timer)
  }, [offlineReady])

  if (!needRefresh && !offlineReady) return null

  const accent = getAccent(theme).menuActiveBorder

  return (
    <div className="fixed left-3 right-3 bottom-24 lg:bottom-6 pb-safe z-[9997] pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto flex items-start gap-3 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-3">
        <div className={`shrink-0 p-2.5 rounded-xl border ${accent}`}>
          <RefreshCw className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-medium">
            {needRefresh ? t('pwa.updateTitle') : t('pwa.offlineReady')}
          </p>
          {needRefresh && (
            <p className="text-xs text-gray-400 mt-1">{t('pwa.updateBody')}</p>
          )}
          {needRefresh && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg border ${accent}`}
                onClick={() => {
                  if (typeof updateSW === 'function') updateSW(true)
                  else window.location.reload()
                }}
              >
                {t('pwa.refresh')}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-300"
                onClick={() => setNeedRefresh(false)}
              >
                {t('pwa.later')}
              </button>
            </div>
          )}
        </div>
        {!needRefresh && (
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-white"
            aria-label={t('pwa.dismiss')}
            onClick={() => setOfflineReady(false)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
