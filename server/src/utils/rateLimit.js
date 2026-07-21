import { RateLimit } from '../db/mongo.js'

/**
 * Atomic fixed-window rate limit. Replaces the previous find + save pattern
 * (2-3 DB round trips, race-prone) with a single findOneAndUpdate using an
 * aggregation-pipeline update: expired windows reset to count=1, otherwise
 * the counter increments. Returns true when the request is allowed.
 */
export async function checkRateLimit(key, limit, windowMs) {
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

  return (doc?.count ?? 1) <= limit
}
