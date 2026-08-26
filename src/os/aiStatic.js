import staticData from '../../shared/ai-static.json'

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findTopic(query) {
  const normalized = normalize(query)
  let best = null
  let bestLen = 0
  for (const [key, answer] of Object.entries(staticData.topics || {})) {
    const keyNorm = normalize(key)
    if (normalized.includes(keyNorm) && keyNorm.length > bestLen) {
      best = answer
      bestLen = keyNorm.length
    }
  }
  return best
}

export function getCliStaticAnswer(query, pathname = '') {
  const normalized = normalize(query)
  if (!normalized) return null

  const topic = findTopic(query)
  if (topic) return topic

  if (pathname && staticData.pages?.[pathname]) {
    const pagePatterns = ['this page', 'where am i', 'what is this page']
    if (pagePatterns.some((p) => normalized.includes(normalize(p)))) {
      return staticData.pages[pathname]
    }
  }

  for (const [key, answer] of Object.entries(staticData.projects || {})) {
    if (normalized.includes(normalize(key))) return answer
  }

  return staticData.pages?.[pathname] || null
}

export function getCliPageSummary(pathname) {
  return staticData.pages?.[pathname] || null
}

export const CLI_AI_HELP = `AI subcommands (static — no API tokens):
  ai help                     Show this help
  ai explain <topic>          Explain a topic (e.g. lqft, react)
  ai summarize <path>         Summarize a site page (e.g. /projects)
  ai                          Enter interactive AI chat mode`
