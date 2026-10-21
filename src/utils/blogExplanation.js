function abortableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve() }, ms)
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })
}

export async function requestBlogExplanation({ postId, mode, signal, onRetry }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch('/api/ai/blog/explain', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, mode }), signal,
    })
    const data = await res.json()
    // Only retry a known pre-generation database failure. Never automatically
    // repeat a provider, quota, network or timeout error that may have spent a call.
    const unavailable = res.status === 503 && (data.code === 'DATABASE_UNAVAILABLE' || data.error === 'Data temporarily unavailable. Please retry.')
    if (unavailable && attempt === 0) {
      onRetry?.()
      const seconds = Number(res.headers.get('Retry-After')) || 10
      await abortableDelay(Math.min(30, Math.max(1, seconds)) * 1000, signal)
      continue
    }
    if (!res.ok) throw Object.assign(new Error(data.error || 'Summary unavailable'), { code: unavailable ? 'DATABASE_UNAVAILABLE' : undefined })
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Empty summary')
    return data
  }
}
