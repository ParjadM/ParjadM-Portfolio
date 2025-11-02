import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Project } from '../db/mongo.js'

const router = Router()

// GET /api/projects - public list of projects (ordered)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
      return res.json({ projects: [] })
    }
    const docs = await Project.find({}, { title: 1, description: 1, tags: 1, liveUrl: 1, githubUrl: 1, image: 1, featured: 1, updatedAt: 1 })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    const latest = docs.reduce((acc, d) => Math.max(acc, new Date(d.updatedAt || 0).getTime()), 0)
    const etag = `W/"projects-${docs.length}-${latest}"`
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    if (latest) res.setHeader('Last-Modified', new Date(latest).toUTCString())
    res.setHeader('ETag', etag)
    if (req.headers['if-none-match'] === etag) return res.status(304).end()
    const projects = docs.map(d => ({ id: d._id.toString(), ...d }))
    res.json({ projects })
  } catch (err) {
    // Fail-soft: return empty list to avoid client crash in production
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
    res.json({ projects: [] })
  }
})

export default router


