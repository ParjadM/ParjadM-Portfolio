export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function slugContext(context) {
  if (!context) return ''
  return normalizeText(String(context).slice(0, 120))
}

export function extractLastUserMessage(messages) {
  if (!Array.isArray(messages)) return ''
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    const text = message?.parts?.[0]?.text ?? message?.content ?? message?.text
    if (text && (message.role === 'user' || !message.role)) {
      return String(text)
    }
  }
  return ''
}

export function trimMessages(messages, maxTurns) {
  if (!Array.isArray(messages) || messages.length === 0) return []
  const limit = Math.max(2, maxTurns * 2)
  return messages.slice(-limit)
}

export function formatInterviewTranscript(messages, maxChars = 6000) {
  if (!Array.isArray(messages)) return ''
  const lines = messages.map((message) => {
    const text = message?.parts?.[0]?.text ?? message?.content ?? message?.text ?? ''
    const role = message.role === 'user' ? 'Interviewer' : 'Parjad'
    return `${role}: ${String(text).trim()}`
  }).filter((line) => line.length > 12)

  let transcript = lines.join('\n')
  if (transcript.length > maxChars) {
    transcript = transcript.slice(-maxChars)
  }
  return transcript
}

export function countUserTurns(messages) {
  if (!Array.isArray(messages)) return 0
  return messages.filter((message) => {
    const text = message?.parts?.[0]?.text ?? message?.content ?? message?.text
    return text && message.role === 'user'
  }).length
}
