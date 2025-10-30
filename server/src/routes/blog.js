import { Router } from 'express'
import mongoose from 'mongoose'
import { currentEngine } from '../db/index.js'
import { BlogPost } from '../db/mongo.js'

const router = Router()

// GET /api/blog - list posts (id, title, excerpt, meta)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      return res.json({ posts: [] })
    }
    const now = new Date()
    const docs = await BlogPost.find({ status: 'published', publishAt: { $lte: now } }, { title: 1, excerpt: 1, date: 1, readTime: 1, tags: 1, category: 1 })
      .sort({ publishAt: -1 })
      .lean()
    const posts = docs.map(d => ({ id: d._id.toString(), ...d }))
    res.json({ posts })
  } catch (err) {
    // Fail-soft: return empty list to avoid client error banners in prod
    res.json({ posts: [] })
  }
})

// GET /api/blog/:id - post detail
router.get('/:id', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      return res.status(404).json({ error: 'Not found' })
    }
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
    const now = new Date()
    const doc = await BlogPost.findOne({ _id: id, status: 'published', publishAt: { $lte: now } }).lean()
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json({ post: { id: doc._id.toString(), ...doc } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


