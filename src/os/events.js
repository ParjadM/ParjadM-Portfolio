const LAUNCH = 'parjadm:launch-app';
const NOTIFY = 'parjadm:notify';
const OPEN_FILE = 'parjadm:open-file';

export function launchApp(appId, options = {}) {
  window.dispatchEvent(new CustomEvent(LAUNCH, { detail: { appId, ...options } }));
}

export function onLaunchApp(handler) {
  const fn = (e) => handler(e.detail);
  window.addEventListener(LAUNCH, fn);
  return () => window.removeEventListener(LAUNCH, fn);
}

export function notify(message, type = 'info') {
  window.dispatchEvent(new CustomEvent(NOTIFY, { detail: { message, type } }));
}

export function onNotify(handler) {
  const fn = (e) => handler(e.detail);
  window.addEventListener(NOTIFY, fn);
  return () => window.removeEventListener(NOTIFY, fn);
}

export function openFileInApp(file, appId = 'notepad') {
  window.dispatchEvent(new CustomEvent(OPEN_FILE, { detail: { file, appId } }));
}

export function onOpenFile(handler) {
  const fn = (e) => handler(e.detail);
  window.addEventListener(OPEN_FILE, fn);
  return () => window.removeEventListener(OPEN_FILE, fn);
}

export function setPendingLaunch(appId, options = {}) {
  try {
    localStorage.setItem('parjadm_pending_launch', JSON.stringify({ appId, options, ts: Date.now() }));
  } catch {}
}

export function consumePendingLaunch() {
  try {
    const raw = localStorage.getItem('parjadm_pending_launch');
    if (!raw) return null;
    localStorage.removeItem('parjadm_pending_launch');
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > 30000) return null;
    return data;
  } catch {
    return null;
  }
}
