import { Router } from 'express'
import mongoose from 'mongoose'
import { BlogPost, Project, Analytics, Visitor, AnalyticsDaily } from '../db/mongo.js'
import crypto from 'crypto'
import { currentEngine } from '../db/index.js'

const router = Router()

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
        const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^\/?#]+)$/i)
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
    res.json({ ok: true, id: doc._id.toString(), date: doc.date })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router

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
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Feature/unfeature a blog post
router.post('/blog/:id/feature', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    const featured = !!(req.body && req.body.featured)
    await BlogPost.updateOne({ _id: id }, { featured })
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
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/admin/blog/:id/feature { featured: boolean }
router.post('/blog/:id/feature', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const { id } = req.params
    const featured = !!(req.body && req.body.featured)
    await BlogPost.updateOne({ _id: id }, { featured })
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Projects Management (Admin) ---
router.get('/projects', async (req, res) => {
  if (currentEngine !== 'mongo') return res.json({ projects: [] })
  const docs = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean()
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
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/projects/reorder', async (req, res) => {
  if (currentEngine !== 'mongo') return res.status(400).json({ error: 'Not using MongoDB' })
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    let order = 1
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await Project.updateOne({ _id: id }, { order })
      order += 1
    }
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
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})



