import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Analytics, Visitor, AnalyticsDaily, VisitorDay, VisitorDayPath } from '../db/mongo.js'

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
    const path = (req.body && String(req.body.path || '').trim()) || '/'
    const today = new Date().toISOString().slice(0, 10)
    if (visitorId) {
      const result = await Visitor.updateOne({ visitorId }, { $setOnInsert: { visitorId } }, { upsert: true })
      if (result.upsertedCount && result.upsertedCount > 0) incUnique = 1
    }

    const updated = await Analytics.findOneAndUpdate(
      { key: 'global' },
      { $inc: { pageviews: 1, uniqueVisitors: incUnique } },
      { new: true }
    ).lean()

    // Daily global
    let dayIncUnique = 0
    if (visitorId) {
      const r = await VisitorDay.updateOne({ date: today, visitorId }, { $setOnInsert: { date: today, visitorId } }, { upsert: true })
      if (r.upsertedCount && r.upsertedCount > 0) dayIncUnique = 1
    }
    await AnalyticsDaily.updateOne(
      { date: today, key: 'global' },
      { $setOnInsert: { date: today, key: 'global' }, $inc: { pageviews: 1, uniqueVisitors: dayIncUnique } },
      { upsert: true }
    )

    // Daily per-path
    let pathIncUnique = 0
    if (visitorId) {
      const r2 = await VisitorDayPath.updateOne({ date: today, path, visitorId }, { $setOnInsert: { date: today, path, visitorId } }, { upsert: true })
      if (r2.upsertedCount && r2.upsertedCount > 0) pathIncUnique = 1
    }
    await AnalyticsDaily.updateOne(
      { date: today, key: `path:${path}` },
      { $setOnInsert: { date: today, key: `path:${path}` }, $inc: { pageviews: 1, uniqueVisitors: pathIncUnique } },
      { upsert: true }
    )

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

// GET /api/metrics/series?range=7|30
router.get('/series', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ series: [] })
    const range = Math.min(30, Math.max(1, Number(req.query.range || 7)))
    const today = new Date()
    const dates = Array.from({ length: range }).map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (range - 1 - i))
      return d.toISOString().slice(0, 10)
    })
    const docs = await AnalyticsDaily.find({ key: 'global', date: { $in: dates } }).lean()
    const byDate = new Map(docs.map(d => [d.date, d]))
    const series = dates.map(d => ({ date: d, pageviews: byDate.get(d)?.pageviews || 0, uniqueVisitors: byDate.get(d)?.uniqueVisitors || 0 }))
    res.json({ series })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metrics/paths?range=7|30 returns totals per path
router.get('/paths', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ paths: [] })
    const range = Math.min(30, Math.max(1, Number(req.query.range || 7)))
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - (range - 1))
    const startDate = start.toISOString().slice(0, 10)
    const docs = await AnalyticsDaily.aggregate([
      { $match: { key: { $regex: /^path:/ }, date: { $gte: startDate } } },
      { $group: { _id: '$key', pageviews: { $sum: '$pageviews' }, uniqueVisitors: { $sum: '$uniqueVisitors' } } },
      { $sort: { pageviews: -1 } },
      { $limit: 10 },
    ])
    const paths = docs.map(d => ({ path: d._id.replace('path:', ''), pageviews: d.pageviews, uniqueVisitors: d.uniqueVisitors }))
    res.json({ paths })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


