const METRIC_NAMES = ['CLS', 'INP', 'LCP', 'FCP', 'TTFB'];

function sendMetric({ name, value, rating, path, visitorId }) {
  const body = JSON.stringify({ name, value, rating, path, visitorId: visitorId || '' });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics/vitals', new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {}
  fetch('/api/metrics/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

/** Report Core Web Vitals to the backend (no-op if web-vitals unavailable). */
export async function installWebVitalsReporter() {
  if (typeof window === 'undefined') return;
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');
    const visitorId = (() => { try { return localStorage.getItem('visitorId') || ''; } catch { return ''; } })();
    const path = window.location.pathname;

    const report = (metric) => {
      if (!METRIC_NAMES.includes(metric.name)) return;
      sendMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        path,
        visitorId,
      });
    };

    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  } catch {
    // web-vitals optional
  }
}
