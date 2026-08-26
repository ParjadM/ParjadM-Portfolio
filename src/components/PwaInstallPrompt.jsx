import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAccent } from '../utils/themeTokens.js';

const DISMISS_KEY = 'pwa_install_dismissed';

export const PwaInstallPrompt = ({ theme = 'green' }) => {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer;
        const onBeforeInstall = (e) => {
            e.preventDefault();
            try {
                if (localStorage.getItem(DISMISS_KEY)) return;
            } catch {}
            setDeferredPrompt(e);
            // Give the visitor a moment with the site before offering the install
            timer = setTimeout(() => setVisible(true), 15000);
        };

        const onInstalled = () => {
            setVisible(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch {}
        setVisible(false);
        setDeferredPrompt(null);
    };

    const dismiss = () => {
        setVisible(false);
        try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    };

    if (!visible || !deferredPrompt) return null;

    const accent = getAccent(theme).menuActiveBorder;

    return (
        <div className="lg:hidden fixed left-3 right-3 bottom-24 pb-safe z-[9998]">
            <div className="max-w-md mx-auto flex items-center gap-3 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-3">
                <div className={`shrink-0 p-2.5 rounded-xl border ${accent}`}>
                    <Download className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{t('pwa.title')}</p>
                    <p className="text-xs text-gray-400">{t('pwa.subtitle')}</p>
                </div>
                <button
                    onClick={install}
                    className={`shrink-0 px-3 py-2 rounded-xl border text-sm font-semibold ${accent}`}
                >
                    {t('pwa.install')}
                </button>
                <button
                    onClick={dismiss}
                    className="shrink-0 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10"
                    aria-label={t('pwa.dismiss')}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
