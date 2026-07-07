import { Router } from 'express'
import { ClientError, RateLimit } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { notifyErrorSpike } from '../utils/alertNotify.js'

const router = Router()

async function checkRateLimit(key, limit = 20, windowMs = 60 * 60 * 1000) {
  const now = Date.now()
  const doc = await RateLimit.findOne({ key })
  if (!doc) {
    await RateLimit.create({ key, windowStart: new Date(now), count: 1 })
    return true
  }
  const start = doc.windowStart?.getTime?.() || new Date(doc.windowStart).getTime()
  if (now - start > windowMs) {
    doc.windowStart = new Date(now)
    doc.count = 1
    await doc.save()
    return true
  }
  if (doc.count >= limit) return false
  doc.count += 1
  await doc.save()
  return true
}

// POST /api/client-errors - browser error reports
router.post('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ ok: true })

    const { message, stack, source, url, userAgent } = req.body || {}
    if (!message) return res.status(400).json({ error: 'Missing message' })

    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
    const allowed = await checkRateLimit(`clienterr:${ip}`)
    if (!allowed) return res.json({ ok: true })

    await ClientError.create({
      message: String(message).slice(0, 500),
      stack: String(stack || '').slice(0, 2000),
      source: String(source || '').slice(0, 300),
      url: String(url || '').slice(0, 300),
      userAgent: String(userAgent || '').slice(0, 300),
    })

    // Alert if errors are spiking (async, non-blocking)
    const windowMinutes = Number(process.env.ERROR_ALERT_WINDOW_MINUTES || 15);
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    Promise.all([
      ClientError.countDocuments({ createdAt: { $gte: since } }),
      ClientError.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(5).lean(),
    ])
      .then(([count, samples]) => {
        if (count === 0) return;
        notifyErrorSpike({ count, windowMinutes, samples });
      })
      .catch(() => {});

    res.json({ ok: true })
  } catch {
    // Never let error reporting cause more errors client-side
    res.json({ ok: true })
  }
})

export default router
