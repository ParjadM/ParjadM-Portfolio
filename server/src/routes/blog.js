import { Router } from 'express'
import mongoose from 'mongoose'
import { currentEngine } from '../db/index.js'
import { BlogPost } from '../db/mongo.js'

const router = Router()

// GET /api/blog - list posts (id, title, excerpt, meta)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
      return res.json({ posts: [] })
    }
    const now = new Date()
    const docs = await BlogPost.find(
      { status: 'published', publishAt: { $lte: now } },
      { title: 1, excerpt: 1, date: 1, readTime: 1, tags: 1, category: 1, image: 1, featured: 1, updatedAt: 1 }
    )
      .sort({ featured: -1, publishAt: -1 })
      .lean()
    // ETag / Last-Modified
    const latest = docs.reduce((acc, d) => Math.max(acc, new Date(d.updatedAt || 0).getTime()), 0)
    const etag = `W/"blog-${docs.length}-${latest}"`
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    if (latest) res.setHeader('Last-Modified', new Date(latest).toUTCString())
    res.setHeader('ETag', etag)
    if (req.headers['if-none-match'] === etag) return res.status(304).end()
    const posts = docs.map(d => ({ id: d._id.toString(), ...d }))
    res.json({ posts })
  } catch (err) {
    // Fail-soft: return empty list to avoid client error banners in prod
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
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
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    res.json({ post: { id: doc._id.toString(), ...doc } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


