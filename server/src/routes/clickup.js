import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { ClickUp, RateLimit } from '../db/mongo.js'

const router = Router()
const RATE_WINDOW_MS = 3000 // 3 seconds between clicks per visitor

async function ensureClickUpDoc() {
  await ClickUp.updateOne({ key: 'global' }, { $setOnInsert: { key: 'global', count: 0 } }, { upsert: true })
}

function getClientKey(req) {
  const visitorId = (req.body && String(req.body.visitorId || '').trim()) || ''
  if (visitorId) return `clickup:${visitorId}`
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  return `clickup:ip:${ip}`
}

async function isRateLimited(key) {
  const now = Date.now()
  const doc = await RateLimit.findOne({ key }).lean()
  if (!doc) return false
  const elapsed = now - new Date(doc.windowStart).getTime()
  if (elapsed >= RATE_WINDOW_MS) return false
  return doc.count >= 1
}

async function recordRateLimit(key) {
  const now = new Date()
  const doc = await RateLimit.findOne({ key }).lean()
  if (!doc || now.getTime() - new Date(doc.windowStart).getTime() >= RATE_WINDOW_MS) {
    await RateLimit.updateOne(
      { key },
      { $set: { key, windowStart: now, count: 1 } },
      { upsert: true }
    )
    return
  }
  await RateLimit.updateOne({ key }, { $inc: { count: 1 } })
}

// GET /api/clickup - current count
router.get('/', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10')
    if (currentEngine !== 'mongo') {
      return res.json({ count: 0, available: false })
    }
    await ensureClickUpDoc()
    const doc = await ClickUp.findOne({ key: 'global' }).lean()
    res.json({ count: doc?.count ?? 0, available: true })
  } catch (err) {
    res.status(500).json({ error: err.message, available: false })
  }
})

// POST /api/clickup - increment by 1 (rate limited)
router.post('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      return res.status(503).json({ error: 'Counter unavailable', available: false, count: 0 })
    }

    const key = getClientKey(req)
    if (await isRateLimited(key)) {
      return res.status(429).json({ error: 'Slow down! Wait a few seconds.', rateLimited: true })
    }

    await ensureClickUpDoc()
    const doc = await ClickUp.findOneAndUpdate(
      { key: 'global' },
      { $inc: { count: 1 } },
      { new: true }
    ).lean()

    await recordRateLimit(key)
    res.json({ count: doc?.count ?? 0, available: true })
  } catch (err) {
    res.status(500).json({ error: err.message, available: false })
  }
})

export default router
