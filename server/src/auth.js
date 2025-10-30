import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // Provide a deterministic fallback to avoid crashing in dev, but warn.
    return 'dev-insecure-secret-change-me'
  }
  return secret
}

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const payload = jwt.verify(token, getJwtSecret())
    req.user = { username: payload.username }
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

// POST /api/auth/login { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || '1234'
  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ username }, getJwtSecret(), { expiresIn: '7d' })
    return res.json({ token, user: { username } })
  }
  return res.status(401).json({ error: 'Invalid credentials' })
})

// POST /api/auth/logout (no-op for JWT)
router.post('/logout', requireAuth, (req, res) => {
  return res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user })
})

export default router


