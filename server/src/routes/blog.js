import { Router } from 'express'
import mongoose from 'mongoose'
import { currentEngine } from '../db/index.js'
import { BlogPost } from '../db/mongo.js'
import { SITE_URL, SITE_NAME } from '../config/site.js'
import { cacheGet, cacheSet } from '../utils/microCache.js'
import {
  parsePaginationQuery,
  buildPaginationMeta,
  cacheKeyFromQuery,
  MAX_LIMIT,
} from '../utils/pagination.js'

const router = Router()

// Admin mutations call cacheInvalidate('blog'), so edits show up immediately.
const LIST_TTL_MS = Number(process.env.BLOG_CACHE_TTL_MS || 60 * 1000)
const POST_TTL_MS = LIST_TTL_MS
const RSS_TTL_MS = 5 * 60 * 1000

const LIST_PROJECTION = {
  title: 1,
  excerpt: 1,
  date: 1,
  readTime: 1,
  tags: 1,
  category: 1,
  image: 1,
  featured: 1,
  updatedAt: 1,
  publishAt: 1,
}

const BLOG_CATEGORIES = new Set(['technology', 'tutorial', 'personal'])

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function mapPost(d) {
  return {
    id: d._id.toString(),
    title: d.title,
    excerpt: d.excerpt,
    date: d.date,
    readTime: d.readTime,
    tags: d.tags || [],
    category: d.category,
    image: d.image || '',
    featured: !!d.featured,
    updatedAt: d.updatedAt,
    publishAt: d.publishAt?.toISOString?.() ?? d.publishAt,
  }
}

function publishedFilter(now = new Date()) {
  return { status: 'published', publishAt: { $lte: now } }
}

async function buildRssFeed() {
  const cached = cacheGet('blog:rss')
  if (cached) return cached

  const now = new Date()
  let docs = []
  try {
    if (currentEngine === 'mongo') {
      docs = await BlogPost.find(
        publishedFilter(now),
        { title: 1, excerpt: 1, date: 1, publishAt: 1, updatedAt: 1 },
      ).sort({ publishAt: -1 }).limit(50).lean()
    }
  } catch {
    docs = []
  }

  const items = docs.map((d) => {
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

// GET /api/blog - list posts (supports optional pagination)
router.get('/', async (req, res) => {
  try {
    const paging = parsePaginationQuery(req.query)

    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'no-store')
      const empty = { posts: [] }
      if (paging.paginate) {
        empty.pagination = buildPaginationMeta({
          page: paging.page,
          limit: paging.limit,
          totalItems: 0,
        })
      }
      if (String(req.query.includeFeatured || '') === 'true') empty.featuredPost = null
      return res.json(empty)
    }

    const categoryRaw = String(req.query.category || '').trim().toLowerCase()
    const category = BLOG_CATEGORIES.has(categoryRaw) ? categoryRaw : ''
    const search = String(req.query.search || '').trim().slice(0, 80)
    const includeFeatured = String(req.query.includeFeatured || '') === 'true'
    const featuredOnly = String(req.query.featured || '')

    const now = new Date()
    const filter = publishedFilter(now)
    if (category) filter.category = category
    if (featuredOnly === 'true') filter.featured = true
    if (featuredOnly === 'false') filter.featured = false
    if (search) {
      filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    }

    const cacheParams = {
      page: paging.paginate ? paging.page : 'all',
      limit: paging.paginate ? paging.limit : 'all',
      category: category || 'all',
      search: search || '',
      featured: featuredOnly || 'any',
      includeFeatured: includeFeatured ? '1' : '0',
    }
    const cacheKey = cacheKeyFromQuery('blog:list', cacheParams)
    const cached = cacheGet(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
      return res.json(cached)
    }

    let featuredPost = null
    if (includeFeatured && !category) {
      const featuredDoc = await BlogPost.findOne(
        { ...publishedFilter(now), featured: true },
        LIST_PROJECTION,
      )
        .sort({ publishAt: -1, _id: -1 })
        .lean()
      if (featuredDoc) featuredPost = mapPost(featuredDoc)
    }

    let docs
    let totalItems
    if (!paging.paginate) {
      docs = await BlogPost.find(filter, LIST_PROJECTION)
        .sort({ featured: -1, publishAt: -1, _id: -1 })
        .lean()
      totalItems = docs.length
    } else {
      totalItems = await BlogPost.countDocuments(filter)
      docs = await BlogPost.find(filter, LIST_PROJECTION)
        .sort({ featured: -1, publishAt: -1, _id: -1 })
        .skip(paging.skip)
        .limit(paging.limit)
        .lean()
    }

    const posts = docs.map(mapPost)
    const payload = { posts }
    if (paging.paginate) {
      payload.pagination = buildPaginationMeta({
        page: paging.page,
        limit: paging.limit,
        totalItems,
      })
    }
    if (includeFeatured) payload.featuredPost = featuredPost

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
    cacheSet(cacheKey, payload, LIST_TTL_MS)
    res.json(payload)
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ posts: [] })
  }
})

// GET /api/blog/:id/related — related posts without downloading the full corpus
router.get('/:id/related', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      return res.json({ posts: [] })
    }
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })

    let limit = Number.parseInt(String(req.query.limit || 3), 10)
    if (!Number.isFinite(limit) || limit < 1) limit = 3
    if (limit > MAX_LIMIT) limit = MAX_LIMIT

    const cacheKey = cacheKeyFromQuery('blog:related', { id, limit })
    const cached = cacheGet(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
      return res.json(cached)
    }

    const now = new Date()
    const current = await BlogPost.findOne(
      { _id: id, ...publishedFilter(now) },
      { tags: 1, category: 1 },
    ).lean()
    if (!current) return res.status(404).json({ error: 'Not found' })

    const candidates = await BlogPost.find(
      { ...publishedFilter(now), _id: { $ne: current._id } },
      LIST_PROJECTION,
    )
      .sort({ featured: -1, publishAt: -1, _id: -1 })
      .limit(40)
      .lean()

    const myTags = new Set(current.tags || [])
    const scored = candidates
      .map((p) => {
        const sharedTags = (p.tags || []).filter((tag) => myTags.has(tag)).length
        const sameCategory = p.category && p.category === current.category ? 1 : 0
        return { post: p, score: sharedTags * 2 + sameCategory }
      })
      .sort((a, b) => b.score - a.score || 0)
      .slice(0, limit)
      .map((s) => mapPost(s.post))

    const payload = { posts: scored }
    cacheSet(cacheKey, payload, LIST_TTL_MS)
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: err.message })
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
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
      return res.json(cached)
    }

    const now = new Date()
    const doc = await BlogPost.findOne({ _id: id, ...publishedFilter(now) }).lean()
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
    const payload = { post: { id: doc._id.toString(), ...doc } }
    cacheSet(cacheKey, payload, POST_TTL_MS)
    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
export { buildRssFeed }
