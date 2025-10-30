import { Router } from 'express'
import { currentEngine } from '../db/index.js'
import { Project } from '../db/mongo.js'

const router = Router()

// GET /api/projects - public list of projects (ordered)
router.get('/', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.json({ projects: [] })
    const docs = await Project.find({}, { title: 1, description: 1, tags: 1, liveUrl: 1, githubUrl: 1, image: 1, featured: 1 })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    const projects = docs.map(d => ({ id: d._id.toString(), ...d }))
    res.json({ projects })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router


