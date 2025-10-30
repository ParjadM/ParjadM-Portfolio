import { Router } from 'express'
import { randomUUID } from 'crypto'

// In-memory session store. For production, replace with JWT or a DB-backed session.
const sessions = new Map()
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isExpired(session) {
  return Date.now() - session.createdAt > SESSION_TTL_MS
}

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const session = sessions.get(token)
    if (!session || isExpired(session)) {
      if (session && isExpired(session)) sessions.delete(token)
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = { username: session.username }
    req.authToken = token
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

function createSession(username) {
  const token = randomUUID()
  sessions.set(token, { username, createdAt: Date.now() })
  return token
}

const router = Router()

// POST /api/auth/login { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || '1234'
  if (username === adminUser && password === adminPass) {
    const token = createSession(username)
    return res.json({ token, user: { username } })
  }
  return res.status(401).json({ error: 'Invalid credentials' })
})

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  if (req.authToken) sessions.delete(req.authToken)
  return res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user })
})

export default router


