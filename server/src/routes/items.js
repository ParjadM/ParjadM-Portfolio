import { Router } from 'express'
import { db } from '../db/index.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const items = await db.list()
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

router.post('/', async (req, res) => {
  try {
    const created = await db.add({ name: req.body?.name || 'untitled' })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' })
  }
})

export default router


