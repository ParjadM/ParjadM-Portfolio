import { AiAnalyticsDaily, AiTopicDaily } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { peekGlobalBudget } from './limits.js'
import { normalizeText } from './normalize.js'

const FREE_SOURCES = new Set(['faq', 'static', 'cache', 'stored'])

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function dateRange(days) {
  const dates = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function buildTopicSlug(userMessage) {
  return normalizeText(userMessage).slice(0, 60)
}

export function recordAiEvent({ feature, source, userMessage, pathname }) {
  if (!feature || !source) return Promise.resolve()

  const date = todayKey()
  const topicSlug = buildTopicSlug(userMessage)
  const pageSlug = pathname ? String(pathname).slice(0, 80) : ''

  const tasks = []

  if (currentEngine === 'mongo') {
    tasks.push(
      AiAnalyticsDaily.findOneAndUpdate(
        { date, feature, source },
        { $inc: { count: 1 } },
        { upsert: true }
      )
    )

    if (topicSlug.length >= 3) {
      tasks.push(
        AiTopicDaily.findOneAndUpdate(
          { date, feature, topicSlug },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      )
    }

    if (pageSlug && source === 'gemini') {
      tasks.push(
        AiAnalyticsDaily.findOneAndUpdate(
          { date, feature: `${feature}:page`, source: pageSlug },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      )
    }
  }

  return Promise.all(tasks).catch((err) => {
    console.error('AI analytics log error:', err)
  })
}

export async function getAdminAiStats(rangeDays = 7) {
  const days = Math.min(30, Math.max(1, Number(rangeDays) || 7))
  const dates = dateRange(days)
  const globalBudget = await peekGlobalBudget()

  if (currentEngine !== 'mongo') {
    return {
      global: globalBudget,
      today: { total: 0, gemini: 0, free: 0, cacheHitRate: 0, byFeature: {} },
      series: dates.map((date) => ({ date, gemini: 0, free: 0, total: 0 })),
      topTopics: [],
      model: process.env.AI_GEMINI_MODEL || 'gemini-3.1-flash-lite',
    }
  }

  const docs = await AiAnalyticsDaily.find({ date: { $in: dates } }).lean()
  const topicDocs = await AiTopicDaily.find({ date: { $in: dates } })
    .sort({ count: -1 })
    .limit(20)
    .lean()

  const today = todayKey()
  const todayDocs = docs.filter((doc) => doc.date === today && !doc.feature.includes(':page'))

  let todayGemini = 0
  let todayFree = 0
  const byFeature = {}

  for (const doc of todayDocs) {
    const count = doc.count || 0
    if (!byFeature[doc.feature]) {
      byFeature[doc.feature] = { gemini: 0, free: 0, sources: {} }
    }
    byFeature[doc.feature].sources[doc.source] = count
    if (doc.source === 'gemini') {
      todayGemini += count
      byFeature[doc.feature].gemini += count
    } else if (FREE_SOURCES.has(doc.source)) {
      todayFree += count
      byFeature[doc.feature].free += count
    }
  }

  const todayTotal = todayGemini + todayFree
  const cacheHitRate = todayTotal > 0 ? Math.round((todayFree / todayTotal) * 100) : 0

  const series = dates.map((date) => {
    const dayDocs = docs.filter((d) => d.date === date && !d.feature.includes(':page'))
    let gemini = 0
    let free = 0
    for (const doc of dayDocs) {
      if (doc.source === 'gemini') gemini += doc.count || 0
      else if (FREE_SOURCES.has(doc.source)) free += doc.count || 0
    }
    return { date, gemini, free, total: gemini + free }
  })

  const topicMap = new Map()
  for (const doc of topicDocs) {
    const key = `${doc.feature}|${doc.topicSlug}`
    topicMap.set(key, (topicMap.get(key) || 0) + (doc.count || 0))
  }

  const topTopics = [...topicMap.entries()]
    .map(([key, count]) => {
      const [feature, topicSlug] = key.split('|')
      return { feature, topicSlug, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  return {
    global: globalBudget,
    today: {
      total: todayTotal,
      gemini: todayGemini,
      free: todayFree,
      cacheHitRate,
      byFeature,
    },
    series,
    topTopics,
    model: process.env.AI_GEMINI_MODEL || 'gemini-3.1-flash-lite',
  }
}
