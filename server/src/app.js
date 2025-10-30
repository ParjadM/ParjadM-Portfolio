import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import adminRouter from './routes/admin.js'
import authRouter, { requireAuth } from './auth.js'
import itemsRouter from './routes/items.js'
import blogRouter from './routes/blog.js'
import { currentEngine, initDatabase } from './db/index.js'
import projectsRouter from './routes/projects.js'
import contactRouter from './routes/contact.js'

export async function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(morgan('dev'))

  // Initialize DB (no-op for memory)
  await initDatabase()

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'parjad-portfolio-server', dbEngine: currentEngine, timestamp: new Date().toISOString() })
  })

  // API routes
  app.use('/api/auth', authRouter)
  app.use('/api/items', itemsRouter)
  app.use('/api/blog', blogRouter)
  app.use('/api/projects', projectsRouter)
  app.use('/api/admin', requireAuth, adminRouter)
  app.use('/api/contact', contactRouter)

  return app
}


