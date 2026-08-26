import { redisClient } from '../db/redis.js'
import { AiUsage } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { aiConfig } from '../config/ai.js'

const DAY_SECONDS = 86400

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function getClientIp(req) {
  const rawIp = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || 'unknown'
  return typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : 'unknown'
}

function featureLimit(feature, customDailyLimit) {
  if (customDailyLimit != null) return customDailyLimit
  if (feature === 'chat') return aiConfig.chatDailyPerIp
  if (feature === 'interview') return aiConfig.interviewDailyPerIp
  if (feature === 'job-fit') return aiConfig.jobFitDailyPerIp
  if (feature === 'debrief') return aiConfig.debriefDailyPerIp
  if (feature === 'blog-explain') return aiConfig.blogExplainDailyPerIp
  return null
}

async function getCount(storageKey) {
  if (redisClient) {
    try {
      const value = await redisClient.get(storageKey)
      return Number(value || 0)
    } catch (err) {
      console.error('Redis limit read error:', err)
    }
  }

  if (currentEngine !== 'mongo') return 0

  const doc = await AiUsage.findOne({
    key: storageKey,
    windowKey: todayKey(),
  }).lean()
  return doc?.count || 0
}

async function incrementCount(storageKey) {
  if (redisClient) {
    try {
      const count = await redisClient.incr(storageKey)
      if (count === 1) {
        await redisClient.expire(storageKey, DAY_SECONDS)
      }
      return count
    } catch (err) {
      console.error('Redis limit increment error:', err)
    }
  }

  if (currentEngine !== 'mongo') return 0

  const doc = await AiUsage.findOneAndUpdate(
    { key: storageKey, windowKey: todayKey() },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  )
  return doc.count
}

function limitErrorMessage(feature, limit) {
  if (feature === 'chat') {
    return `You've reached your limit of ${limit} questions for today. Please come back tomorrow!`
  }
  if (feature === 'interview') {
    return `You've reached your limit of ${limit} questions. If you'd like to ask more, please contact Parjad directly!`
  }
  if (feature === 'job-fit') {
    return `You've reached your daily limit of ${limit} job fit analyses. Please try again tomorrow.`
  }
  if (feature === 'debrief') {
    return `You've reached your daily limit of ${limit} interview debriefs. Please try again tomorrow.`
  }
  if (feature === 'blog-explain') {
    return `You've reached your daily limit of ${limit} blog explanations. Please try again tomorrow.`
  }
  return `Daily AI limit reached (${limit}). Please try again tomorrow.`
}

export async function peekFeatureLimit(feature, ip, customDailyLimit) {
  const limit = featureLimit(feature, customDailyLimit)
  if (limit == null) return { allowed: true, limit: null, count: 0 }

  const storageKey = `ai_limit:${feature}:${ip}`
  const count = await getCount(storageKey)
  return {
    allowed: count < limit,
    limit,
    count,
    storageKey,
  }
}

export async function peekGlobalBudget() {
  const storageKey = `ai_budget:global:${todayKey()}`
  const count = await getCount(storageKey)
  return {
    allowed: count < aiConfig.dailyCallLimit,
    limit: aiConfig.dailyCallLimit,
    count,
    storageKey,
  }
}

export async function assertCanCallGemini({ feature, ip, customDailyLimit }) {
  const featureState = await peekFeatureLimit(feature, ip, customDailyLimit)
  if (!featureState.allowed) {
    return {
      ok: false,
      status: 429,
      error: limitErrorMessage(feature, featureState.limit),
    }
  }

  const globalState = await peekGlobalBudget()
  if (!globalState.allowed) {
    return {
      ok: false,
      status: 429,
      error: 'The AI assistant has reached its daily capacity. Please try again tomorrow.',
    }
  }

  return {
    ok: true,
    featureStorageKey: featureState.storageKey,
    globalStorageKey: globalState.storageKey,
  }
}

export async function recordGeminiCall({ featureStorageKey, globalStorageKey }) {
  if (featureStorageKey) {
    await incrementCount(featureStorageKey)
  }
  if (globalStorageKey) {
    await incrementCount(globalStorageKey)
  }
}

export async function getUsageSnapshot(ip) {
  const [chat, interview, global] = await Promise.all([
    peekFeatureLimit('chat', ip),
    peekFeatureLimit('interview', ip),
    peekGlobalBudget(),
  ])

  return {
    chat: { count: chat.count, limit: chat.limit },
    interview: { count: interview.count, limit: interview.limit },
    global: { count: global.count, limit: global.limit },
  }
}
