import { Router } from 'express'
import mongoose from 'mongoose'
import { currentEngine } from '../db/index.js'
import { BlogPost } from '../db/mongo.js'
import { SITE_URL, SITE_NAME } from '../config/site.js'
import { cacheGet, cacheSet } from '../utils/microCache.js'

const router = Router()

// Admin mutations call cacheInvalidate('blog'), so edits show up immediately.
const LIST_TTL_MS = Number(process.env.BLOG_CACHE_TTL_MS || 60 * 1000)
const POST_TTL_MS = LIST_TTL_MS
const RSS_TTL_MS = 5 * 60 * 1000

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function buildRssFeed() {
  const cached = cacheGet('blog:rss')
  if (cached) return cached

  const now = new Date()
  let docs = []
  try {
    if (currentEngine === 'mongo') {
      docs = await BlogPost.find(
        { status: 'published', publishAt: { $lte: now } },
        { title: 1, excerpt: 1, date: 1, publishAt: 1, updatedAt: 1 }
      ).sort({ publishAt: -1 }).limit(50).lean()
    }
  } catch {
    docs = []
  }

  const items = docs.map(d => {
    const id = d._id.toString()
    const pubDate = new Date(d.publishAt || d.updatedAt || Date.now()).toUTCString()
    return `
    <item>
      <title>${escapeXml(d.title)}</title>
      <link>${SITE_URL}/blog/${id}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${id}</guid>
      <description>${escapeXml(d.excerpt || '')}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Articles on web development, projects, and learning.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`
  cacheSet('blog:rss', xml, RSS_TTL_MS)
  return xml
}

// GET /api/blog/rss
router.get('/rss', async (_req, res) => {
  try {
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
    res.send(await buildRssFeed())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/blog - list posts (id, title, excerpt, meta)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'no-store')
      return res.json({ posts: [] })
    }

    const cached = cacheGet('blog:list')
    if (cached) {
      res.setHeader('Cache-Control', 'no-store')
      return res.json(cached)
    }

    const now = new Date()
    const docs = await BlogPost.find(
      { status: 'published', publishAt: { $lte: now } },
      { title: 1, excerpt: 1, date: 1, readTime: 1, tags: 1, category: 1, image: 1, featured: 1, updatedAt: 1 }
    )
      .sort({ featured: -1, publishAt: -1 })
      .lean()
    // Browser cache stays no-store so admin edits (which invalidate the
    // server cache) appear immediately.
    res.setHeader('Cache-Control', 'no-store')
    const posts = docs.map(d => ({ id: d._id.toString(), ...d, publishAt: d.publishAt?.toISOString?.() ?? d.publishAt }))
    const payload = { posts }
    cacheSet('blog:list', payload, LIST_TTL_MS)
    res.json(payload)
  } catch (err) {
    // Fail-soft: return empty list to avoid client error banners in prod
    res.setHeader('Cache-Control', 'no-store')
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

    const cacheKey = `blog:post:${id}`
    const cached = cacheGet(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 'no-store')
      return res.json(cached)
    }

    const now = new Date()
    const doc = await BlogPost.findOne({ _id: id, status: 'published', publishAt: { $lte: now } }).lean()
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.setHeader('Cache-Control', 'no-store')
    const payload = { post: { id: doc._id.toString(), ...doc } }
    cacheSet(cacheKey, payload, POST_TTL_MS)
    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
export { buildRssFeed }


