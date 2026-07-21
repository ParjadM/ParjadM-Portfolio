import { Router } from 'express'
import { ClientError } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { notifyErrorSpike } from '../utils/alertNotify.js'
import { checkRateLimit } from '../utils/rateLimit.js'

const router = Router()

// POST /api/client-errors - browser error reports
router.post('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ ok: true })

    const { message, stack, source, url, userAgent } = req.body || {}
    if (!message) return res.status(400).json({ error: 'Missing message' })

    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
    const allowed = await checkRateLimit(`clienterr:${ip}`, 20, 60 * 60 * 1000)
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
