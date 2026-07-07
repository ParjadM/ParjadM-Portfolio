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
import metricsRouter from './routes/metrics.js'
import clickupRouter from './routes/clickup.js'
import githubRouter from './routes/github.js'
import leetcodeRouter from './routes/leetcode.js'
import aiRouter from './routes/ai.js'
import appsRouter from './routes/apps.js'
import clientErrorsRouter from './routes/clientErrors.js'
import ogRouter from './routes/og.js'
import { buildRssFeed } from './routes/blog.js'
import { buildSitemap } from './utils/sitemap.js'

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

  // RSS feed (also at /api/blog/rss)
  app.get('/feed.xml', async (_req, res) => {
    try {
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
      res.send(await buildRssFeed())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // Dynamic sitemap (static routes + published blog posts)
  app.get('/sitemap.xml', async (_req, res) => {
    try {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
      res.send(await buildSitemap())
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // API routes
  app.use('/api/auth', authRouter)
  app.use('/api/items', itemsRouter)
  app.use('/api/blog', blogRouter)
  app.use('/api/projects', projectsRouter)
  app.use('/api/admin', requireAuth, adminRouter)
  app.use('/api/contact', contactRouter)
  app.use('/api/metrics', metricsRouter)
  app.use('/api/clickup', clickupRouter)
  app.use('/api/github-stats', githubRouter)
  app.use('/api/leetcode-stats', leetcodeRouter)
  app.use('/api/ai', aiRouter)
  app.use('/api/apps', appsRouter)
  app.use('/api/client-errors', clientErrorsRouter)
  app.use('/api/og', ogRouter)

  return app
}


