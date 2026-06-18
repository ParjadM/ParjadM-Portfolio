import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { normalizeText } from './normalize.js'
import { normalizePageContext } from './pageContext.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const staticPath = join(__dirname, '../../../shared/ai-static.json')

let staticData = null

function loadStaticData() {
  if (staticData) return staticData
  try {
    staticData = JSON.parse(readFileSync(staticPath, 'utf8'))
  } catch {
    staticData = { topics: {}, pages: {}, projects: {} }
  }
  return staticData
}

function findTopicMatch(normalizedQuestion, topics) {
  const entries = Object.entries(topics || {})
  let best = null
  let bestLen = 0
  for (const [key, answer] of entries) {
    const normalizedKey = normalizeText(key)
    if (!normalizedKey) continue
    if (normalizedQuestion.includes(normalizedKey) && normalizedKey.length > bestLen) {
      best = answer
      bestLen = normalizedKey.length
    }
  }
  return best
}

function buildProjectBlurb(ctx) {
  const data = loadStaticData()
  const titleKey = normalizeText(ctx.title)
  for (const [key, answer] of Object.entries(data.projects || {})) {
    if (titleKey.includes(normalizeText(key)) || normalizeText(key).includes(titleKey)) {
      return answer
    }
  }

  const tags = ctx.tags?.length ? ` Tech: ${ctx.tags.join(', ')}.` : ''
  const links = []
  if (ctx.githubUrl) links.push(`GitHub: ${ctx.githubUrl}`)
  if (ctx.liveUrl) links.push(`Demo: ${ctx.liveUrl}`)
  const linkText = links.length ? ` ${links.join(' | ')}` : ''
  return `${ctx.title} — ${ctx.description || 'A portfolio project by Parjad.'}${tags}${linkText}`
}

export function matchStaticAnswer(userMessage, pageContext) {
  const normalizedQuestion = normalizeText(userMessage)
  if (!normalizedQuestion) return null

  const data = loadStaticData()
  const ctx = normalizePageContext(pageContext)

  const genericProjectPatterns = [
    'this project',
    'about this project',
    'tell me about this',
    'what is this project',
    'what does this do',
    'how does this work',
    'explain this project',
  ]
  if (ctx?.type === 'project' && ctx.title) {
    const isGeneric = genericProjectPatterns.some((p) => normalizedQuestion.includes(normalizeText(p)))
    const mentionsTitle = normalizedQuestion.includes(normalizeText(ctx.title))
    if (isGeneric || mentionsTitle) {
      return buildProjectBlurb(ctx)
    }
  }

  if (ctx?.type === 'blog' && ctx.title) {
    const blogPatterns = ['summarize', 'summary', 'tldr', 'explain this article', 'explain this post', 'what is this about']
    const matchesBlog = blogPatterns.some((p) => normalizedQuestion.includes(normalizeText(p)))
    if (matchesBlog && ctx.excerpt) {
      return `${ctx.title}: ${ctx.excerpt}`
    }
  }

  if (ctx?.pathname && data.pages?.[ctx.pathname]) {
    const pagePatterns = ['this page', 'where am i', 'what is this page', 'what can i do here']
    if (pagePatterns.some((p) => normalizedQuestion.includes(normalizeText(p)))) {
      return data.pages[ctx.pathname]
    }
  }

  const topicAnswer = findTopicMatch(normalizedQuestion, data.topics)
  if (topicAnswer) return topicAnswer

  for (const [key, answer] of Object.entries(data.projects || {})) {
    if (normalizedQuestion.includes(normalizeText(key))) {
      return answer
    }
  }

  return null
}

export function getStaticPageSummary(pathname) {
  const data = loadStaticData()
  return data.pages?.[pathname] || null
}

export function getStaticTopicAnswer(query) {
  const data = loadStaticData()
  const normalized = normalizeText(query)
  return findTopicMatch(normalized, data.topics)
}
