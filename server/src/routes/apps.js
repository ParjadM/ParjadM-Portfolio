import { Router } from 'express'
import { CommunityApp } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { checkRateLimit } from '../utils/rateLimit.js'

const router = Router()

function isValidHttpsUrl(value, { allowHttp = false } = {}) {
  try {
    const u = new URL(value)
    if (u.protocol === 'https:') return true
    return allowHttp && u.protocol === 'http:'
  } catch {
    return false
  }
}

// GET /api/apps - approved apps only (public, powers the OS App Store)
router.get('/', async (_req, res) => {
  try {
    if (currentEngine !== 'mongo') {
      res.setHeader('Cache-Control', 'no-store')
      return res.json({ apps: [] })
    }
    const docs = await CommunityApp.find(
      { status: 'approved' },
      { name: 1, description: 1, url: 1, iconUrl: 1, author: 1, approvedAt: 1 }
    ).sort({ approvedAt: -1 }).limit(200).lean()
    res.setHeader('Cache-Control', 'no-store')
    res.json({ apps: docs.map(d => ({ id: d._id.toString(), ...d })) })
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ apps: [] })
  }
})

// POST /api/apps/submit - public submission, lands in the moderation queue
router.post('/submit', async (req, res) => {
  try {
    if (currentEngine !== 'mongo') return res.status(503).json({ error: 'Store unavailable' })

    const { name, description, url, iconUrl, author, authorEmail, company } = req.body || {}

    // Honeypot: real users never fill the hidden 'company' field
    if (company) return res.json({ ok: true })

    if (!name || !description || !url || !author) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (String(name).length > 60 || String(description).length > 300 || String(author).length > 60) {
      return res.status(400).json({ error: 'Field too long' })
    }
    if (!isValidHttpsUrl(String(url))) {
      return res.status(400).json({ error: 'App URL must be a valid https:// link' })
    }
    if (iconUrl && !isValidHttpsUrl(String(iconUrl))) {
      return res.status(400).json({ error: 'Icon URL must be a valid https:// link' })
    }

    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
    const allowed = await checkRateLimit(`appsubmit:${ip}`, 3, 60 * 60 * 1000)
    if (!allowed) return res.status(429).json({ error: 'Too many submissions. Try again later.' })

    // Avoid duplicate pending/approved entries for the same URL
    const existing = await CommunityApp.findOne({ url: String(url).trim(), status: { $in: ['pending', 'approved'] } }).lean()
    if (existing) return res.status(409).json({ error: 'This app has already been submitted' })

    const doc = await CommunityApp.create({
      name: String(name).trim(),
      description: String(description).trim(),
      url: String(url).trim(),
      iconUrl: iconUrl ? String(iconUrl).trim() : '',
      author: String(author).trim(),
      authorEmail: authorEmail ? String(authorEmail).trim() : '',
      status: 'pending',
      submittedIp: ip,
    })
    res.status(201).json({ ok: true, id: doc._id.toString(), status: 'pending' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
