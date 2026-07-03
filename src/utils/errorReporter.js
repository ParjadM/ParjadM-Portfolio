/**
 * Lightweight client-side error reporter. Sends uncaught errors and
 * unhandled promise rejections to /api/client-errors so production
 * crashes are visible in the admin dashboard instead of going unnoticed.
 */
const MAX_REPORTS_PER_SESSION = 5;
const seen = new Set();
let reportCount = 0;

export function reportError(payload) {
    try {
        const key = `${payload.message}`.slice(0, 200);
        if (seen.has(key) || reportCount >= MAX_REPORTS_PER_SESSION) return;
        seen.add(key);
        reportCount++;

        const body = JSON.stringify({
            message: String(payload.message || 'Unknown error').slice(0, 500),
            stack: String(payload.stack || '').slice(0, 2000),
            source: String(payload.source || '').slice(0, 300),
            url: window.location.href.slice(0, 300),
            userAgent: navigator.userAgent.slice(0, 300),
        });

        // sendBeacon survives page unloads; fall back to fetch
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/client-errors', new Blob([body], { type: 'application/json' }));
        } else {
            fetch('/api/client-errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                keepalive: true,
            }).catch(() => {});
        }
    } catch {
        // Reporting must never throw
    }
}

export function installErrorReporter() {
    window.addEventListener('error', (event) => {
        reportError({
            message: event.message,
            stack: event.error?.stack,
            source: `${event.filename || ''}:${event.lineno || 0}:${event.colno || 0}`,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        reportError({
            message: reason?.message || String(reason),
            stack: reason?.stack,
            source: 'unhandledrejection',
        });
    });
}
