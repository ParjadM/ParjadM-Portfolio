import crypto from 'crypto'
import { redisClient } from '../db/redis.js'
import { AiCache } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { normalizeText } from './normalize.js'

export function buildCacheKey(feature, userMessage, contextSlug, knowledgeVersion) {
  const normalized = normalizeText(userMessage)
  const raw = `${feature}|${normalized}|${contextSlug || ''}|${knowledgeVersion || '0'}`
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function redisKey(cacheKey) {
  return `ai_cache:${cacheKey}`
}

async function getMongoCache(cacheKey) {
  if (currentEngine !== 'mongo') return null
  const doc = await AiCache.findOne({ key: cacheKey }).lean()
  if (!doc) return null
  if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
    await AiCache.deleteOne({ key: cacheKey })
    return null
  }
  return doc.value
}

async function setMongoCache(cacheKey, value, ttlSeconds) {
  if (currentEngine !== 'mongo') return
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
  await AiCache.findOneAndUpdate(
    { key: cacheKey },
    { value, expiresAt },
    { upsert: true, new: true }
  )
}

export async function getCached(cacheKey, asJson = false) {
  if (redisClient) {
    try {
      const cached = await redisClient.get(redisKey(cacheKey))
      if (cached != null) {
        if (asJson) {
          return typeof cached === 'string' ? JSON.parse(cached) : cached
        }
        return typeof cached === 'string' ? cached : JSON.stringify(cached)
      }
    } catch (err) {
      console.error('Redis cache retrieval error:', err)
    }
  }

  try {
    const mongoValue = await getMongoCache(cacheKey)
    if (mongoValue == null) return null
    return asJson ? JSON.parse(mongoValue) : mongoValue
  } catch (err) {
    console.error('Mongo cache retrieval error:', err)
    return null
  }
}

export async function setCached(cacheKey, value, ttlSeconds, asJson = false) {
  const serialized = asJson ? JSON.stringify(value) : String(value)

  if (redisClient) {
    try {
      await redisClient.set(redisKey(cacheKey), serialized, { ex: ttlSeconds })
    } catch (err) {
      console.error('Redis cache save error:', err)
    }
  }

  try {
    await setMongoCache(cacheKey, serialized, ttlSeconds)
  } catch (err) {
    console.error('Mongo cache save error:', err)
  }
}
