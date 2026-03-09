import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { ClickUp } from '../db/mongo.js'

const router = Router()

async function ensureClickUpDoc() {
  await ClickUp.updateOne({ key: 'global' }, { $setOnInsert: { key: 'global', count: 0 } }, { upsert: true })
}

// GET /api/clickup - current count
router.get('/', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10')
    if (currentEngine !== 'mongo') return res.json({ count: 0 })
    await ensureClickUpDoc()
    const doc = await ClickUp.findOne({ key: 'global' }).lean()
    res.json({ count: doc?.count ?? 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/clickup - increment by 1
router.post('/', async (_req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ count: 0 })
    await ensureClickUpDoc()
    const doc = await ClickUp.findOneAndUpdate(
      { key: 'global' },
      { $inc: { count: 1 } },
      { new: true }
    ).lean()
    res.json({ count: doc?.count ?? 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
