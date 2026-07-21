import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { ClickUp } from '../db/mongo.js'
import { checkRateLimit } from '../utils/rateLimit.js'

const router = Router()
const RATE_WINDOW_MS = 3000 // 3 seconds between clicks per visitor

// The global counter doc only needs seeding once per process.
let clickUpSeedPromise = null
function ensureClickUpDoc() {
  if (!clickUpSeedPromise) {
    clickUpSeedPromise = ClickUp.updateOne(
      { key: 'global' },
      { $setOnInsert: { key: 'global', count: 0 } },
      { upsert: true }
    ).catch(() => { clickUpSeedPromise = null })
  }
  return clickUpSeedPromise
}

function getClientKey(req) {
  const visitorId = (req.body && String(req.body.visitorId || '').trim()) || ''
  if (visitorId) return `clickup:${visitorId}`
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  return `clickup:ip:${ip}`
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
    const allowed = await checkRateLimit(key, 1, RATE_WINDOW_MS)
    if (!allowed) {
      return res.status(429).json({ error: 'Slow down! Wait a few seconds.', rateLimited: true })
    }

    await ensureClickUpDoc()
    const doc = await ClickUp.findOneAndUpdate(
      { key: 'global' },
      { $inc: { count: 1 } },
      { new: true }
    ).lean()

    res.json({ count: doc?.count ?? 0, available: true })
  } catch (err) {
    res.status(500).json({ error: err.message, available: false })
  }
})

export default router
