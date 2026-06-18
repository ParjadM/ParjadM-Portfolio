const KEY = 'parjadm_os_session';

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSession(patch) {
  const current = loadSession();
  const next = { ...current, ...patch, updatedAt: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function pushCommandHistory(cmd) {
  const s = loadSession();
  const history = [...(s.cmdHistory || []), cmd].slice(-100);
  saveSession({ cmdHistory: history });
}

export function getCommandHistory() {
  return loadSession().cmdHistory || [];
}

export function pushRecentApp(appId) {
  const s = loadSession();
  const recent = [appId, ...(s.recentApps || []).filter(id => id !== appId)].slice(0, 6);
  saveSession({ recentApps: recent });
}

export function getRecentApps() {
  return loadSession().recentApps || [];
}

export function setTerminalPath(pathArr) {
  saveSession({ terminalPath: pathArr });
}

export function getTerminalPath() {
  return loadSession().terminalPath;
}
