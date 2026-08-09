import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Project } from '../db/mongo.js'
import { cacheGet, cacheSet } from '../utils/microCache.js'
import {
  parsePaginationQuery,
  buildPaginationMeta,
  cacheKeyFromQuery,
} from '../utils/pagination.js'

const router = Router()

const LIST_CACHE_TTL_MS = Number(process.env.PROJECTS_CACHE_TTL_MS || 60 * 1000)
const LIST_PROJECTION = {
  title: 1,
  description: 1,
  tags: 1,
  liveUrl: 1,
  githubUrl: 1,
  image: 1,
  featured: 1,
  order: 1,
  updatedAt: 1,
  createdAt: 1,
}

// Seed only needs to run once per process, not on every request.
let seedPromise = null
function ensureBuiltInProjects() {
  if (!seedPromise) {
    seedPromise = Promise.all([
      Project.updateOne(
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
        { upsert: true },
      ),
      Project.updateOne(
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
        { upsert: true },
      ),
      Project.updateOne(
        { liveUrl: '/projects/cameraFx' },
        {
          $setOnInsert: {
            title: 'Camera FX',
            description: 'Point your webcam at yourself and paint the frame with motion-tracked neon effects — aurora trails, constellations, prism ghosts, and ember ash. Everything runs locally in the browser.',
            tags: ['WebRTC', 'Canvas', 'Creative Coding', 'Motion Tracking'],
            liveUrl: '/projects/cameraFx',
            githubUrl: '',
            image: '',
            featured: true,
            order: Date.now() + 2,
          },
        },
        { upsert: true },
      ),
    ]).catch(() => { seedPromise = null })
  }
  return seedPromise
}

function mapProject(d) {
  return {
    id: d._id.toString(),
    title: d.title,
    description: d.description || '',
    tags: d.tags || [],
    liveUrl: d.liveUrl || '',
    githubUrl: d.githubUrl || '',
    image: d.image || '',
    featured: !!d.featured,
    order: d.order,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
  }
}

// GET /api/projects - public list of projects (ordered; optional pagination)
router.get('/', async (req, res) => {
  try {
    const paging = parsePaginationQuery(req.query)

    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'no-store')
      const empty = { projects: [] }
      if (paging.paginate) {
        empty.pagination = buildPaginationMeta({
          page: paging.page,
          limit: paging.limit,
          totalItems: 0,
        })
      }
      return res.json(empty)
    }

    const featuredOnly = String(req.query.featured || '')

    const filter = {}
    if (featuredOnly === 'true') filter.featured = true
    if (featuredOnly === 'false') filter.featured = false

    const cacheParams = {
      page: paging.paginate ? paging.page : 'all',
      limit: paging.paginate ? paging.limit : 'all',
      featured: featuredOnly || 'any',
    }
    const cacheKey = cacheKeyFromQuery('projects:list', cacheParams)
    const cached = cacheGet(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
      return res.json(cached)
    }

    await ensureBuiltInProjects()

    // Featured first, then admin order, then newest — matches reorder UX.
    const sort = { featured: -1, order: 1, _id: 1 }
    let docs
    let totalItems
    if (!paging.paginate) {
      docs = await Project.find(filter, LIST_PROJECTION).sort(sort).lean()
      totalItems = docs.length
    } else {
      totalItems = await Project.countDocuments(filter)
      docs = await Project.find(filter, LIST_PROJECTION)
        .sort(sort)
        .skip(paging.skip)
        .limit(paging.limit)
        .lean()
    }

    const projects = docs.map(mapProject)
    const payload = { projects }
    if (paging.paginate) {
      payload.pagination = buildPaginationMeta({
        page: paging.page,
        limit: paging.limit,
        totalItems,
      })
    }

    cacheSet(cacheKey, payload, LIST_CACHE_TTL_MS)
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
    res.json(payload)
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ projects: [] })
  }
})

export default router
