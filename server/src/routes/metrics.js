import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Analytics, Visitor } from '../db/mongo.js'

const router = Router()

async function ensureAnalyticsDoc() {
  await Analytics.updateOne({ key: 'global' }, { $setOnInsert: { pageviews: 0, uniqueVisitors: 0 } }, { upsert: true })
}

// POST /api/metrics/visit { visitorId?: string }
router.post('/visit', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      return res.json({ ok: true, pageviews: 0, uniqueVisitors: 0 })
    }

    await ensureAnalyticsDoc()

    let incUnique = 0
    const visitorId = (req.body && String(req.body.visitorId || '').trim()) || ''
    if (visitorId) {
      const result = await Visitor.updateOne({ visitorId }, { $setOnInsert: { visitorId } }, { upsert: true })
      if (result.upsertedCount && result.upsertedCount > 0) incUnique = 1
    }

    const updated = await Analytics.findOneAndUpdate(
      { key: 'global' },
      { $inc: { pageviews: 1, uniqueVisitors: incUnique } },
      { new: true }
    ).lean()

    res.json({ ok: true, pageviews: updated?.pageviews || 0, uniqueVisitors: updated?.uniqueVisitors || 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metrics
router.get('/', async (_req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ pageviews: 0, uniqueVisitors: 0 })
    await ensureAnalyticsDoc()
    const doc = await Analytics.findOne({ key: 'global' }).lean()
    res.json({ pageviews: doc?.pageviews || 0, uniqueVisitors: doc?.uniqueVisitors || 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


