/** Stable visitor UUID in localStorage — no fingerprinting. */
const KEY = 'visitorId'

export function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem(KEY)
    if (id && /^[0-9a-f-]{36}$/i.test(id)) return id
    if (id && id.length >= 16) {
      // Preserve legacy visitor IDs so existing metrics history stays linked.
      return id
    }
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(KEY, id)
    return id
  } catch {
    return `session-${Date.now()}`
  }
}

export function ensureUuidVisitorId() {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) {
      return existing
    }
    // Prefer UUID for new visitors; keep legacy non-empty ids to avoid orphaning progress
    if (existing && existing.length >= 16) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    return getOrCreateVisitorId()
  }
}
