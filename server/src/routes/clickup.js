import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { ClickUp } from '../db/mongo.js'
import { consumeRateLimit, peekRateLimit } from '../utils/rateLimit.js'
import { SITE_URL } from '../config/site.js'

const router = Router()
export const CLICKUP_DAILY_LIMIT = 5
export const CLICKUP_WINDOW_MS = 24 * 60 * 60 * 1000
const CLICKUP_URL = `${SITE_URL.replace(/\/$/, '')}/api/clickup`

function apiDocs() {
  return {
    url: CLICKUP_URL,
    method: 'POST',
    limit: CLICKUP_DAILY_LIMIT,
    window: '24h',
    postman: 'Open Postman, create a POST request to this URL, and send it to ClickUp. Limit: 5 requests per day.',
  }
}

function setRateLimitHeaders(res, meta) {
  if (!meta) return
  res.setHeader('RateLimit-Limit', String(meta.limit))
  res.setHeader('RateLimit-Remaining', String(meta.remaining))
  if (meta.resetAt) {
    res.setHeader('RateLimit-Reset', String(Math.ceil(new Date(meta.resetAt).getTime() / 1000)))
  }
  if (!meta.allowed && meta.retryAfterSeconds) {
    res.setHeader('Retry-After', String(meta.retryAfterSeconds))
  }
}

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
  const visitorId =
    (req.body && String(req.body.visitorId || '').trim()) ||
    (req.query && String(req.query.visitorId || '').trim()) ||
    ''
  if (visitorId) return `clickup:${visitorId}`
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  return `clickup:ip:${ip}`
}

// GET /api/clickup - current count + Postman usage docs
router.get('/', async (req, res) => {
  const docs = apiDocs()
  try {
    res.setHeader('Cache-Control', 'private, no-store')
    if (currentEngine !== 'mongo') {
      return res.json({ count: 0, available: false, remaining: 0, ...docs })
    }
    await ensureClickUpDoc()
    const doc = await ClickUp.findOne({ key: 'global' }).lean()
    let remaining = CLICKUP_DAILY_LIMIT
    try {
      const meta = await peekRateLimit(getClientKey(req), CLICKUP_DAILY_LIMIT, CLICKUP_WINDOW_MS)
      remaining = meta.remaining
      setRateLimitHeaders(res, { ...meta, allowed: true })
    } catch {}
    res.json({ count: doc?.count ?? 0, available: true, remaining, ...docs })
  } catch (err) {
    res.status(500).json({ error: err.message, available: false, ...docs })
  }
})

// POST /api/clickup - increment by 1 (5 requests per day; works from Postman)
router.post('/', async (req, res) => {
  const docs = apiDocs()
  try {
    if (currentEngine !== 'mongo') {
      return res.status(503).json({ error: 'Counter unavailable', available: false, count: 0, remaining: 0, ...docs })
    }

    const key = getClientKey(req)
    const meta = await consumeRateLimit(key, CLICKUP_DAILY_LIMIT, CLICKUP_WINDOW_MS)
    setRateLimitHeaders(res, meta)
    if (!meta.allowed) {
      return res.status(429).json({
        error: 'Daily limit reached. You get 5 ClickUps per day.',
        rateLimited: true,
        remaining: 0,
        resetAt: meta.resetAt,
        ...docs,
      })
    }

    await ensureClickUpDoc()
    const doc = await ClickUp.findOneAndUpdate(
      { key: 'global' },
      { $inc: { count: 1 } },
      { new: true }
    ).lean()

    res.json({
      count: doc?.count ?? 0,
      available: true,
      remaining: meta.remaining,
      resetAt: meta.resetAt,
      ...docs,
    })
  } catch (err) {
    res.status(500).json({ error: err.message, available: false, ...docs })
  }
})

export default router
