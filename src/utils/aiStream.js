export async function consumeAiChatStream(response, { onMeta, onToken }) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Stream request failed')
    }
    onMeta?.({ source: data.source || 'gemini' })
    onToken?.(data.reply || '')
    return { fullText: data.reply || '', source: data.source || 'gemini' }
  }

  if (!response.body) {
    throw new Error('Streaming not supported in this browser')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''
  let source = 'gemini'

  const processEventBlock = (block) => {
    const lines = block.split('\n')
    let eventName = 'message'
    let dataLine = ''

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataLine += line.slice(5).trim()
      }
    }

    if (!dataLine) return

    let payload
    try {
      payload = JSON.parse(dataLine)
    } catch {
      return
    }

    if (eventName === 'meta') {
      source = payload.source || source
      onMeta?.(payload)
    } else if (eventName === 'token' && payload.text) {
      fullText += payload.text
      onToken?.(payload.text)
    } else if (eventName === 'error') {
      throw new Error(payload.error || 'Stream error')
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''
    for (const block of blocks) {
      if (block.trim()) processEventBlock(block)
    }
  }

  if (buffer.trim()) {
    processEventBlock(buffer)
  }

  return { fullText, source }
}

export async function sendChatStream(payload) {
  return fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
