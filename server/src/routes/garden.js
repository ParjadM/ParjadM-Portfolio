import { Router } from 'express'
import { createHash } from 'crypto'
import { GardenMark } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { checkRateLimit } from '../utils/rateLimit.js'
import { cacheGet, cacheSet, cacheInvalidate } from '../utils/microCache.js'

const router = Router()
const LIST_CACHE_KEY = 'garden:marks'
const LIST_TTL_MS = 20_000
const MAX_MARKS_RESPONSE = 1200

/** In-memory fallback when Mongo is unavailable (local/dev). */
const memoryGarden = []
const memoryRate = new Map()

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
}

function hashVisitor(raw) {
  const s = String(raw || '').slice(0, 128)
  if (!s) return ''
  return createHash('sha256').update(s).digest('hex').slice(0, 16)
}

function serialize(doc) {
  return {
    id: doc._id?.toString?.() || doc.id,
    x: doc.x,
    y: doc.y,
    hue: doc.hue,
    size: doc.size,
    shape: doc.shape,
    createdAt: doc.createdAt,
  }
}

function seedMark(visitorKey) {
  let h = 0
  for (let i = 0; i < visitorKey.length; i++) h = (h * 31 + visitorKey.charCodeAt(i)) >>> 0
  return {
    hue: h % 360,
    size: 0.55 + ((h >>> 8) % 70) / 100,
    shape: (h >>> 16) % 4,
  }
}

async function allowRate(key, limit, windowMs) {
  if (currentEngine === 'mongo') {
    try {
      return await checkRateLimit(key, limit, windowMs)
    } catch {
      // Fall through to memory limiter if Mongo rate collection is unavailable.
    }
  }
  const now = Date.now()
  const entry = memoryRate.get(key)
  if (!entry || now - entry.start > windowMs) {
    memoryRate.set(key, { start: now, count: 1 })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}

router.get('/', async (_req, res) => {
  try {
    const cached = cacheGet(LIST_CACHE_KEY)
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60')
      return res.json(cached)
    }

    let marks = []
    let total = 0

    if (currentEngine === 'mongo') {
      total = await GardenMark.estimatedDocumentCount()
      const docs = await GardenMark.find({}, { x: 1, y: 1, hue: 1, size: 1, shape: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(MAX_MARKS_RESPONSE)
        .lean()
      marks = docs.reverse().map(serialize)
    } else {
      total = memoryGarden.length
      marks = memoryGarden.slice(-MAX_MARKS_RESPONSE).map(serialize)
    }

    const payload = { marks, total }
    cacheSet(LIST_CACHE_KEY, payload, LIST_TTL_MS)
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60')
    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load garden' })
  }
})

router.post('/plant', async (req, res) => {
  try {
    const { x, y, visitorId } = req.body || {}
    const nx = Number(x)
    const ny = Number(y)

    if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx < 0 || nx > 1 || ny < 0 || ny > 1) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    const ip = clientIp(req)
    const visitorKey = hashVisitor(visitorId || ip)

    const allowedIp = await allowRate(`garden:ip:${ip}`, 8, 24 * 60 * 60 * 1000)
    if (!allowedIp) return res.status(429).json({ error: 'Daily garden limit reached. Come back tomorrow to plant more.' })

    const allowedBurst = await allowRate(`garden:burst:${visitorKey || ip}`, 1, 12_000)
    if (!allowedBurst) return res.status(429).json({ error: 'Slow down — let your last bloom settle.' })

    const { hue, size, shape } = seedMark(visitorKey || String(Date.now()))
    const mark = {
      x: Math.min(1, Math.max(0, nx)),
      y: Math.min(1, Math.max(0, ny)),
      hue: (hue + Math.floor(Math.random() * 24) - 12 + 360) % 360,
      size: Math.min(1.4, Math.max(0.35, size + (Math.random() - 0.5) * 0.2)),
      shape,
      visitorKey,
    }

    let saved
    if (currentEngine === 'mongo') {
      const doc = await GardenMark.create(mark)
      saved = serialize(doc.toObject())
    } else {
      saved = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...mark,
        createdAt: new Date(),
      }
      memoryGarden.push(saved)
      if (memoryGarden.length > MAX_MARKS_RESPONSE) {
        memoryGarden.splice(0, memoryGarden.length - MAX_MARKS_RESPONSE)
      }
      saved = serialize(saved)
    }

    cacheInvalidate('garden:')
    res.status(201).json({ ok: true, mark: saved })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to plant' })
  }
})

export default router
