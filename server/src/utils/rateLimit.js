import { RateLimit } from '../db/mongo.js'

/**
 * Atomic fixed-window rate limit. Replaces the previous find + save pattern
 * (2-3 DB round trips, race-prone) with a single findOneAndUpdate using an
 * aggregation-pipeline update: expired windows reset to count=1, otherwise
 * the counter increments.
 */
function toMeta(doc, limit, windowMs, now = new Date()) {
  const count = doc?.count ?? 0
  const windowStart = doc?.windowStart ? new Date(doc.windowStart) : now
  const resetAt = new Date(windowStart.getTime() + windowMs)
  const remaining = Math.max(0, limit - count)
  const allowed = count <= limit
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000))
  return { allowed, remaining, limit, count, resetAt: resetAt.toISOString(), retryAfterSeconds }
}

export async function peekRateLimit(key, limit, windowMs) {
  const now = new Date()
  const windowFloor = new Date(now.getTime() - windowMs)
  const doc = await RateLimit.findOne({ key }).lean()
  if (!doc?.windowStart || new Date(doc.windowStart) < windowFloor) {
    return { allowed: true, remaining: limit, limit, count: 0, resetAt: null, retryAfterSeconds: 0 }
  }
  return toMeta(doc, limit, windowMs, now)
}

export async function consumeRateLimit(key, limit, windowMs) {
  const now = new Date()
  const windowFloor = new Date(now.getTime() - windowMs)
  const isExpired = { $lt: [{ $ifNull: ['$windowStart', new Date(0)] }, windowFloor] }

  const doc = await RateLimit.findOneAndUpdate(
    { key },
    [{
      $set: {
        windowStart: { $cond: [isExpired, now, '$windowStart'] },
        count: { $cond: [isExpired, 1, { $add: [{ $ifNull: ['$count', 0] }, 1] }] },
      },
    }],
    { new: true, upsert: true }
  ).lean()

  return toMeta(doc, limit, windowMs, now)
}

export async function checkRateLimit(key, limit, windowMs) {
  const meta = await consumeRateLimit(key, limit, windowMs)
  return meta.allowed
}
