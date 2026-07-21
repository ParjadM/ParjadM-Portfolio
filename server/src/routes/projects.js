import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Project } from '../db/mongo.js'
import { cacheGet, cacheSet } from '../utils/microCache.js'

const router = Router()

const LIST_CACHE_KEY = 'projects:list'
const LIST_CACHE_TTL_MS = Number(process.env.PROJECTS_CACHE_TTL_MS || 60 * 1000)

// Seed only needs to run once per process, not on every request.
let seedPromise = null
function ensureLqftBenchmarkProject() {
  if (!seedPromise) {
    seedPromise = Project.updateOne(
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
    ).catch(() => { seedPromise = null })
  }
  return seedPromise
}

// GET /api/projects - public list of projects (ordered)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'no-store')
      return res.json({ projects: [] })
    }

    const cached = cacheGet(LIST_CACHE_KEY)
    if (cached) {
      res.setHeader('Cache-Control', 'no-store')
      return res.json(cached)
    }

    await ensureLqftBenchmarkProject()
    const docs = await Project.find({}, { title: 1, description: 1, tags: 1, liveUrl: 1, githubUrl: 1, image: 1, featured: 1, updatedAt: 1 })
      .sort({ featured: -1, createdAt: -1 })
      .lean()
    const payload = { projects: docs.map(d => ({ id: d._id.toString(), ...d })) }
    cacheSet(LIST_CACHE_KEY, payload, LIST_CACHE_TTL_MS)

    res.setHeader('Cache-Control', 'no-store')
    res.json(payload)
  } catch (err) {
    // Fail-soft: return empty list to avoid client crash in production
    res.setHeader('Cache-Control', 'no-store')
    res.json({ projects: [] })
  }
})

export default router
