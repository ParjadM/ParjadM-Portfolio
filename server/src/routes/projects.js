import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Project } from '../db/mongo.js'

const router = Router()

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

// GET /api/projects - public list of projects (ordered)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'no-store')
      return res.json({ projects: [] })
    }
    await ensureLqftBenchmarkProject()
    const docs = await Project.find({}, { title: 1, description: 1, tags: 1, liveUrl: 1, githubUrl: 1, image: 1, featured: 1, updatedAt: 1 })
      .sort({ featured: -1, createdAt: -1 })
      .lean()
    res.setHeader('Cache-Control', 'no-store')
    const projects = docs.map(d => ({ id: d._id.toString(), ...d }))
    res.json({ projects })
  } catch (err) {
    // Fail-soft: return empty list to avoid client crash in production
    res.setHeader('Cache-Control', 'no-store')
    res.json({ projects: [] })
  }
})

export default router


