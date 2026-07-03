import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
    const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

    useEffect(() => {
        const goOffline = () => setOffline(true);
        const goOnline = () => setOffline(false);
        window.addEventListener('offline', goOffline);
        window.addEventListener('online', goOnline);
        return () => {
            window.removeEventListener('offline', goOffline);
            window.removeEventListener('online', goOnline);
        };
    }, []);

    if (!offline) return null;

    return (
        <div
            role="status"
            className="fixed top-0 left-0 right-0 z-[99999] flex items-center justify-center gap-2 bg-amber-500/95 text-amber-950 text-sm font-semibold py-2 px-4 pt-safe-or-4 sm:pt-2"
        >
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You&apos;re offline — some content may be unavailable.</span>
        </div>
    );
};
