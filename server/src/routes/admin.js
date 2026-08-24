import { Router } from 'express'
import mongoose from 'mongoose'
import { BlogPost, Project, Analytics, Visitor, AnalyticsDaily, AiKnowledge, DeviceStats, HourlyStats, AccessLog, CommunityApp, ClientError, WebVital, ContactMessage, AuditLog, MediaAsset } from '../db/mongo.js'
import {
  listAlgorithms,
  getAlgorithmById,
  createAlgorithm,
  updateAlgorithm,
  deleteAlgorithm,
  reorderAlgorithms,
  ensureAlgorithmSeed,
} from '../services/algorithmMemorizerStore.js'
import { ALGORITHM_CATEGORIES_LIST } from '../data/algorithms.seed.js'
import { getAdminAiStats } from '../ai/analytics.js'
import { clearKnowledgeMemoryCache } from '../ai/knowledge.js'
import { logAdminAction } from '../utils/auditLog.js'
import crypto from 'crypto'
import { currentEngine } from '../db/index.js'
import { redisClient } from '../db/redis.js'
import { cacheInvalidate } from '../utils/microCache.js'

const router = Router()

// Clear the public read caches so admin edits are visible immediately.
const invalidateBlogCaches = () => cacheInvalidate('blog')
const invalidateProjectCaches = () => cacheInvalidate('projects')

async function ensureLqftBenchmarkProject() {
  await Project.updateOne(
    { liveUrl: '/projects/lqftBenchmark' },
    {
      $setOnInsert: {
        title: 'LQFT Benchmark',
        description: 'Interactive browser benchmark and LQFT demo app inspired by app.py workflows (CRUD, comparison, memory density, and complexity views).',
        tags: ['Python', 'Benchmark', 'Data Structures', 'Browser Demo'],
        liveUrl: '/projects/lqftBenchmark',
        githubUrl: '',
        image: '',
        featured: true,
        order: Date.now(),
      },
    },
    { upsert: true }
  )
}

async function ensureAlgorithmMemorizerProject() {
  await Project.updateOne(
    { liveUrl: '/algorithm-memorizer' },
    {
      $setOnInsert: {
        title: 'Algorithm Memorizer',
        description: 'Practice typing classic Python algorithms from memory. Easy/Hard modes, timed attempts, personal bests, and client-side Pyodide test validation in a Web Worker sandbox.',
        tags: ['Python', 'Algorithms', 'Education', 'Pyodide'],
        liveUrl: '/algorithm-memorizer',
        githubUrl: '',
        image: '',
        featured: true,
        order: Date.now() + 1,
      },
    },
    { upsert: true }
  )
}

async function ensureCameraFxProject() {
  await Project.updateOne(
    { liveUrl: '/projects/cameraFx' },
    {
      $setOnInsert: {
        title: 'Camera FX',
        description: 'Dual-hand gesture tracking with neon finger lighting across both hands — plus aurora, constellation, prism, and ember webcam effects. Everything runs locally in the browser.',
        tags: ['WebRTC', 'MediaPipe', 'Hand Tracking', 'Canvas'],
        liveUrl: '/projects/cameraFx',
        githubUrl: '',
        image: '',
        featured: true,
        order: Date.now() + 2,
      },
    },
    { upsert: true }
  )
}

async function ensureQaLabProject() {
  await Project.updateOne(
    { liveUrl: '/projects/qaLab' },
    {
      $setOnInsert: {
        title: 'QA Engineering Lab',
        description: 'IT quality assurance engineering showcase: risk-based test strategy, test pyramid, CI quality gates, Playwright critical-path E2E, and API contract tests — runnable evidence, not just a write-up.',
        tags: ['QA', 'Playwright', 'Vitest', 'CI', 'API Contracts'],
        liveUrl: '/projects/qaLab',
        githubUrl: '',
        image: '',
        featured: true,
        order: Date.now() + 3,
      },
    },
    { upsert: true }
  )
}

router.get('/db-status', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.json({ engine: currentEngine, connected: false, info: 'Using in-memory store' })
  }
  const state = mongoose.connection.readyState
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({ engine: 'mongo', connected: state === 1, state: states[state] || state })
})

// GET /api/admin/metrics - aggregated metrics
router.get('/metrics', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ pageviews: 0, uniqueVisitors: 0 })
    const analytics = await Analytics.findOne({ key: 'global' }).lean()
    const uniqueCount = await Visitor.estimatedDocumentCount()
    res.json({ pageviews: analytics?.pageviews || 0, uniqueVisitors: analytics?.uniqueVisitors || uniqueCount || 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/metrics-series?range=7|30
router.get('/metrics-series', async (req, res) => {
  try {
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

router.post('/create-collection/:name', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.status(400).json({ error: 'Not using MongoDB. Set MONGODB_URI to enable.' })
  }
  try {
    const name = req.params.name
    await mongoose.connection.createCollection(name)
    res.status(201).json({ ok: true, collection: name })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/seed-blog', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.status(400).json({ error: 'Not using MongoDB' })
  }
  try {
    const count = await BlogPost.countDocuments()
    if (count > 0) return res.json({ ok: true, seeded: false })
    const doc = await BlogPost.create({
      title: 'Hello, ParjadM.ca: The Journey From a Single Page',
      excerpt: "Join me as I trace the journey of this website from a single 'Hello, World!' post into the full-stack, dynamic portfolio you see today.",
      content: `Hello and welcome to my new portfolio website, ParjadM.ca! This site represents a significant milestone in my journey as a web developer, a journey that I'm excited to share with you through this new blog series. We'll be taking a deep dive into the projects, technologies, and experiences that have shaped my path. To truly appreciate how far this website has come, it's important to look back at where it all started: a simple, single-page blog post. This inaugural post marks the beginning of a series where I'll document my evolution from that humble beginning to the full-stack portfolio you see today.

The seed for this website was planted with a basic HTML page titled "Web Development Journal," hosted on GitHub Pages. This initial post was a "Hello, World!" to the web development community, a declaration of my intentions and a first step into a larger world. It was a simple, static page that introduced me as a web developer and discussed the significance of the "Hello, World!" program as a rite of passage for every programmer. The post was a testament to the foundational knowledge I had acquired and a promise of more to come. It was a starting point, a blank canvas with endless possibilities.

The transformation from that single blog post to this full-fledged website was a journey of immense learning and growth. I delved into the MERN stack, mastering MongoDB, Express.js, React, and Node.js. This allowed me to build a dynamic, interactive experience, a far cry from the static HTML of my first post. I designed and implemented a RESTful API to handle data, created a responsive front-end with React for a seamless user experience across all devices, and managed the database with MongoDB. Each line of code was a step forward, a new skill learned, and a challenge overcome.

Of course, building the application was only half the battle; the next challenge was deploying it to the world. This involved setting up a domain, configuring servers, and ensuring the application was secure, scalable, and performant. The process of taking a project from a local development environment to a live, publicly accessible website was a rewarding experience. It was the final piece of the puzzle, the moment when all the hard work and late nights of coding finally came to fruition. Seeing ParjadM.ca live on the web was a proud moment, a tangible representation of my dedication and passion for web development.

This website is more than just a portfolio; it's a living document of my journey as a developer. It's a platform where I can share my knowledge, showcase my work, and connect with other like-minded individuals. I invite you to explore the site, check out my projects, and follow along with this blog series as I continue to grow and evolve as a developer. The journey from a simple "Hello, World!" to a full-stack application has been an incredible one, and I'm excited to see where it takes me next. Thank you for joining me, and I look forward to sharing more with you in the posts to come.`,
      category: 'personal',
      date: '2024-01-05',
      readTime: '6 min read',
      tags: ['Career', 'Learning', 'Personal'],
    })
    invalidateBlogCaches()
    res.json({ ok: true, seeded: true, id: doc._id.toString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/seed-projects', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const existing = await Project.countDocuments()
    if (existing > 0) return res.json({ ok: true, seeded: false })
    const demo = [
      {
        title: 'CodeQuest',
        description: 'A game to test your JavaScript knowledge.',
        tags: ['JavaScript', 'Game', 'Education'],
        liveUrl: 'https://parjadm.github.io/CodeQuest/',
        githubUrl: 'https://github.com/ParjadM/CodeQuest',
        image: '',
        featured: true,
        order: 1,
      },
      {
        title: 'Binary 1010 Generator',
        description: '1 True & 0 False generator.',
        tags: ['JavaScript', 'Random Generator', 'Binary'],
        liveUrl: 'http://binary1010generator.somee.com/',
        githubUrl: 'https://github.com/ParjadM/Binary1010Generator',
        image: '',
        featured: false,
        order: 2,
      },
      {
        title: 'SpaceShooter',
        description: 'SpaceShooter',
        tags: ['JavaScript', 'Game', 'Canvas'],
        liveUrl: 'https://parjadm.github.io/SpaceShooter/',
        githubUrl: 'https://github.com/ParjadM/SpaceShooter',
        image: '',
        featured: false,
        order: 3,
      },
    ]
    await Project.insertMany(demo)
    invalidateProjectCaches()
    res.json({ ok: true, seeded: true, count: demo.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Cloudinary signed upload - returns signature, timestamp, api key, and cloud name
router.post('/cloudinary-sign', async (req, res) => {
  try {
    let apiKey = process.env.CLOUDINARY_API_KEY
    let apiSecret = process.env.CLOUDINARY_API_SECRET
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME

    // Fallback: parse CLOUDINARY_URL if provided (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
    if ((!apiKey || !apiSecret || !cloudName) && process.env.CLOUDINARY_URL) {
      try {
        const url = process.env.CLOUDINARY_URL.trim()
        const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)$/i)
        if (match) {
          apiKey = apiKey || match[1]
          apiSecret = apiSecret || match[2]
          cloudName = cloudName || match[3]
        }
      } catch (_) {
        // ignore
      }
    }

    if (!apiKey || !apiSecret || !cloudName) {
      return res.status(400).json({ error: 'Cloudinary environment not configured' })
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = (req.body && req.body.folder) || 'uploads'
    const publicId = req.body && req.body.public_id

    const params = { folder, timestamp }
    if (publicId) params.public_id = publicId

    const toSign = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&') + apiSecret

    const signature = crypto.createHash('sha1').update(toSign).digest('hex')
    res.json({ signature, timestamp, apiKey, cloudName, folder })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/set-latest-blog-date', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.status(400).json({ error: 'Not using MongoDB' })
  }
  try {
    const desiredDate = (req.body && req.body.date) || req.query.date || new Date().toISOString().slice(0, 10)
    const doc = await BlogPost.findOne({}, null, { sort: { createdAt: -1 } })
    if (!doc) return res.status(404).json({ error: 'No blog posts found' })
    doc.date = desiredDate
    await doc.save()
    invalidateBlogCaches()
    res.json({ ok: true, id: doc._id.toString(), date: doc.date })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Blog Management (Admin) ---
router.get('/blog', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ posts: [] })
  const docs = await BlogPost.find({}).sort({ createdAt: -1 }).lean()
  const posts = docs.map(d => ({ id: d._id.toString(), ...d }))
  res.json({ posts })
})

router.post('/blog', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  const body = req.body || {}
  try {
    const publishAt = body.publishAt ? new Date(body.publishAt) : new Date()
    const doc = await BlogPost.create({
      title: body.title,
      excerpt: body.excerpt || (body.content || '').slice(0, 160),
      content: body.content || '',
      image: body.image || '',
      category: body.category || 'personal',
      date: (body.date || publishAt.toISOString().slice(0, 10)),
      readTime: body.readTime || '5 min read',
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: body.status || 'draft',
      featured: !!body.featured,
      publishAt,
    })
    await logAdminAction(req, 'blog.create', { id: doc._id.toString(), title: body.title })
    invalidateBlogCaches()
    res.status(201).json({ id: doc._id.toString() })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/blog/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    const update = { ...req.body }
    if (update.publishAt) update.publishAt = new Date(update.publishAt)
    if (update.date === undefined && update.publishAt) update.date = update.publishAt.toISOString().slice(0, 10)
    await BlogPost.updateOne(
      { _id: id },
      { $set: update, $currentDate: { updatedAt: true } }
    )
    await logAdminAction(req, 'blog.update', { id })
    invalidateBlogCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/blog/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    await BlogPost.deleteOne({ _id: id })
    await logAdminAction(req, 'blog.delete', { id })
    invalidateBlogCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/blog/:id/publish', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    const publishAt = req.body?.publishAt ? new Date(req.body.publishAt) : new Date()
    await BlogPost.updateOne(
      { _id: id },
      {
        $set: { status: 'published', publishAt, date: publishAt.toISOString().slice(0, 10) },
        $currentDate: { updatedAt: true },
      }
    )
    await logAdminAction(req, 'blog.publish', { id })
    invalidateBlogCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/blog/:id/feature', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    const featured = !!(req.body && req.body.featured)
    await BlogPost.updateOne({ _id: id }, { featured })
    await logAdminAction(req, 'blog.feature', { id, featured })
    invalidateBlogCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Projects Management (Admin) ---
router.get('/projects', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ projects: [] })
  await ensureLqftBenchmarkProject()
  await ensureAlgorithmMemorizerProject()
  await ensureCameraFxProject()
  await ensureQaLabProject()
  const docs = await Project.find({}).sort({ featured: -1, createdAt: -1 }).lean()
  const projects = docs.map(d => ({ id: d._id.toString(), ...d }))
  res.json({ projects })
})

router.post('/projects', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const body = req.body || {}
    const doc = await Project.create({
      title: body.title,
      description: body.description || '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      liveUrl: body.liveUrl || '',
      githubUrl: body.githubUrl || '',
      image: body.image || '',
      featured: !!body.featured,
      order: typeof body.order === 'number' ? body.order : Date.now(),
    })
    await logAdminAction(req, 'project.create', { id: doc._id.toString(), title: body.title })
    invalidateProjectCaches()
    res.status(201).json({ id: doc._id.toString() })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/projects/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    await Project.updateOne({ _id: id }, req.body || {})
    await logAdminAction(req, 'project.update', { id })
    invalidateProjectCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/projects/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    await Project.deleteOne({ _id: id })
    await logAdminAction(req, 'project.delete', { id })
    invalidateProjectCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/projects/reorder', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    if (ids.length > 0) {
      // Single round trip instead of N sequential updates
      await Project.bulkWrite(
        ids.map((id, index) => ({
          updateOne: { filter: { _id: id }, update: { order: index + 1 } },
        }))
      )
    }
    invalidateProjectCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/projects/:id/feature', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    const featured = !!(req.body && req.body.featured)
    await Project.updateOne({ _id: id }, { featured })
    invalidateProjectCaches()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- AI Knowledge Management (Admin) ---
router.get('/ai/stats', async (req, res) => {
  try {
    const range = Number(req.query.range || 7)
    const stats = await getAdminAiStats(range)
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/ai-knowledge', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ content: '' })
  try {
    const key = req.query.key || 'global'
    const doc = await AiKnowledge.findOne({ key }).lean()
    res.json({ content: doc ? doc.content : '' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/ai-knowledge', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const key = req.query.key || 'global'
    const { content } = req.body || {}
    await AiKnowledge.updateOne(
      { key },
      { $set: { content: content || '' } },
      { upsert: true }
    )
    if (redisClient) {
      try {
        await redisClient.flushall()
      } catch (err) {
        console.error('Failed to flush Redis cache:', err)
      }
    }
    clearKnowledgeMemoryCache()
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Premium Analytics (Admin) ---
router.get('/metrics/devices', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ browsers: [], os: [] })
  try {
    const browsers = await DeviceStats.find({ type: 'browser' }).sort({ count: -1 }).lean()
    const osList = await DeviceStats.find({ type: 'os' }).sort({ count: -1 }).lean()
    res.json({ browsers, os: osList })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/metrics/hourly', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ heatmap: [] })
  try {
    // Get last 7 days of hourly stats
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().slice(0, 10)
    })
    const docs = await HourlyStats.find({ date: { $in: dates } }).sort({ date: 1, hour: 1 }).lean()
    res.json({ heatmap: docs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/client-errors - recent browser error reports
router.get('/client-errors', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ errors: [] })
  try {
    const filter = req.query.resolved === 'true' ? { resolved: true }
      : req.query.resolved === 'all' ? {}
      : { resolved: false }
    const docs = await ClientError.find(filter).sort({ createdAt: -1 }).limit(100).lean()
    res.json({ errors: docs.map(d => ({ id: d._id.toString(), ...d })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/metrics/vitals - Core Web Vitals p75 summary (last 7 days)
router.get('/metrics/vitals', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ vitals: [] })
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const docs = await WebVital.find({ createdAt: { $gte: since } }).lean()
    const byName = {}
    for (const d of docs) {
      if (!byName[d.name]) byName[d.name] = []
      byName[d.name].push(d.value)
    }
    const p75 = (arr) => {
      if (!arr.length) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      return sorted[Math.floor(sorted.length * 0.75)] ?? sorted[sorted.length - 1]
    }
    const vitals = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].map((name) => ({
      name,
      p75: p75(byName[name] || []),
      samples: (byName[name] || []).length,
    }))
    res.json({ vitals })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- App Store Moderation (Admin) ---
// GET /api/admin/apps?status=pending|approved|rejected (default: all)
router.get('/apps', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ apps: [] })
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const docs = await CommunityApp.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ apps: docs.map(d => ({ id: d._id.toString(), ...d })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/apps/:id/approve', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    await CommunityApp.updateOne(
      { _id: req.params.id },
      { $set: { status: 'approved', approvedAt: new Date(), rejectionReason: '' } }
    )
    await logAdminAction(req, 'app.approve', { id: req.params.id })
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/apps/:id/reject', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    await CommunityApp.updateOne(
      { _id: req.params.id },
      { $set: { status: 'rejected', rejectionReason: (req.body?.reason || '').slice(0, 300) } }
    )
    await logAdminAction(req, 'app.reject', { id: req.params.id })
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/apps/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    await CommunityApp.deleteOne({ _id: req.params.id })
    await logAdminAction(req, 'app.delete', { id: req.params.id })
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/metrics/logs', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ logs: [] })
  try {
    // Get last 100 access logs
    const logs = await AccessLog.find({}).sort({ timestamp: -1 }).limit(100).lean()
    res.json({ logs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/overview — dashboard home KPIs
router.get('/overview', async (req, res) => {
  if (currentEngine !== 'mongo') {
    return res.json({ pageviews: 0, uniqueVisitors: 0, pendingApps: 0, unreadContacts: 0, openErrors: 0, todayPageviews: 0 })
  }
  try {
    const today = new Date().toISOString().slice(0, 10)
    const [analytics, todayStats, pendingApps, unreadContacts, openErrors] = await Promise.all([
      Analytics.findOne({ key: 'global' }).lean(),
      AnalyticsDaily.findOne({ key: 'global', date: today }).lean(),
      CommunityApp.countDocuments({ status: 'pending' }),
      ContactMessage.countDocuments({ read: false }),
      ClientError.countDocuments({ resolved: false }),
    ])
    res.json({
      pageviews: analytics?.pageviews || 0,
      uniqueVisitors: analytics?.uniqueVisitors || 0,
      todayPageviews: todayStats?.pageviews || 0,
      pendingApps,
      unreadContacts,
      openErrors,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Contact inbox ---
router.get('/contact', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ messages: [] })
  const docs = await ContactMessage.find({}).sort({ createdAt: -1 }).limit(200).lean()
  res.json({ messages: docs.map(d => ({ id: d._id.toString(), ...d })) })
})

router.patch('/contact/:id/read', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ ok: true })
  await ContactMessage.updateOne({ _id: req.params.id }, { read: !!req.body?.read })
  await logAdminAction(req, 'contact.read', { id: req.params.id })
  res.json({ ok: true })
})

router.delete('/contact/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ ok: true })
  await ContactMessage.deleteOne({ _id: req.params.id })
  await logAdminAction(req, 'contact.delete', { id: req.params.id })
  res.json({ ok: true })
})

// --- Audit log ---
router.get('/audit-log', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ entries: [] })
  const docs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ entries: docs.map(d => ({ id: d._id.toString(), ...d })) })
})

// --- Media library ---
router.get('/media', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ assets: [] })
  const docs = await MediaAsset.find({}).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ assets: docs.map(d => ({ id: d._id.toString(), ...d })) })
})

router.post('/media', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  const { url, folder, publicId, filename, bytes } = req.body || {}
  if (!url) return res.status(400).json({ error: 'Missing url' })
  const doc = await MediaAsset.create({ url, folder: folder || 'uploads', publicId: publicId || '', filename: filename || '', bytes: bytes || 0 })
  await logAdminAction(req, 'media.upload', { url })
  res.status(201).json({ id: doc._id.toString() })
})

router.delete('/media/:id', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ ok: true })
  await MediaAsset.deleteOne({ _id: req.params.id })
  await logAdminAction(req, 'media.delete', { id: req.params.id })
  res.json({ ok: true })
})

// --- Client error resolve ---
router.post('/client-errors/:id/resolve', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ ok: true })
  await ClientError.updateOne({ _id: req.params.id }, { resolved: true })
  await logAdminAction(req, 'error.resolve', { id: req.params.id })
  res.json({ ok: true })
})

router.post('/client-errors/resolve-all', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ ok: true })
  await ClientError.updateMany({ resolved: false }, { resolved: true })
  await logAdminAction(req, 'error.resolve_all')
  res.json({ ok: true })
})

// GET /api/admin/metrics/export?range=7 — CSV download
router.get('/metrics/export', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'No data' })
  try {
    const range = Math.min(30, Math.max(1, Number(req.query.range || 7)))
    const today = new Date()
    const dates = Array.from({ length: range }).map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (range - 1 - i))
      return d.toISOString().slice(0, 10)
    })
    const docs = await AnalyticsDaily.find({ key: 'global', date: { $in: dates } }).lean()
    const byDate = new Map(docs.map(d => [d.date, d]))
    const lines = ['date,pageviews,unique_visitors']
    for (const d of dates) {
      const row = byDate.get(d)
      lines.push(`${d},${row?.pageviews || 0},${row?.uniqueVisitors || 0}`)
    }
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${range}d.csv"`)
    res.send(lines.join('\n'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/actions/clear-ai-cache
router.post('/actions/clear-ai-cache', async (req, res) => {
  try {
    clearKnowledgeMemoryCache()
    if (redisClient) await redisClient.flushdb().catch(() => {})
    await logAdminAction(req, 'ai.clear_cache')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Algorithm Memorizer ---
router.get('/algorithms', async (req, res) => {
  try {
    await ensureAlgorithmSeed()
    const algorithms = await listAlgorithms({ admin: true })
    res.json({ algorithms, categories: ALGORITHM_CATEGORIES_LIST })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to list algorithms' })
  }
})

router.get('/algorithms/:id', async (req, res) => {
  try {
    const algo = await getAlgorithmById(req.params.id, { admin: true })
    if (!algo) return res.status(404).json({ error: 'Not found' })
    res.json({ algorithm: algo })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/algorithms', async (req, res) => {
  try {
    const algo = await createAlgorithm(req.body || {})
    await logAdminAction(req, 'algorithm.create', { id: algo.id, slug: algo.slug })
    res.status(201).json({ algorithm: algo })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Create failed' })
  }
})

router.put('/algorithms/:id', async (req, res) => {
  try {
    const algo = await updateAlgorithm(req.params.id, req.body || {})
    if (!algo) return res.status(404).json({ error: 'Not found' })
    await logAdminAction(req, 'algorithm.update', { id: req.params.id })
    res.json({ algorithm: algo })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Update failed' })
  }
})

router.delete('/algorithms/:id', async (req, res) => {
  try {
    const ok = await deleteAlgorithm(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Not found' })
    await logAdminAction(req, 'algorithm.delete', { id: req.params.id })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Delete failed' })
  }
})

router.post('/algorithms/reorder', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    await reorderAlgorithms(ids)
    await logAdminAction(req, 'algorithm.reorder', { count: ids.length })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Reorder failed' })
  }
})

router.post('/seed-algorithms', async (req, res) => {
  try {
    const result = await ensureAlgorithmSeed()
    await logAdminAction(req, 'algorithm.seed', result)
    const algorithms = await listAlgorithms({ admin: true })
    res.json({ ok: true, ...result, count: algorithms.length })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Seed failed' })
  }
})

export default router
