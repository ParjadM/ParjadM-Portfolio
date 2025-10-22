import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import adminRouter from './routes/admin.js'
import itemsRouter from './routes/items.js'
import blogRouter from './routes/blog.js'
import { currentEngine, initDatabase } from './db/index.js'

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
  app.use('/api/items', itemsRouter)
  app.use('/api/blog', blogRouter)
  app.use('/api/admin', adminRouter)

  return app
}


