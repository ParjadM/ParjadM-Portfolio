import { Router } from 'express'
import { createHash } from 'crypto'
import { checkRateLimit } from '../utils/rateLimit.js'
import { currentEngine } from '../db/index.js'
import {
  listAlgorithms,
  getAlgorithmById,
  getAlgorithmBySlug,
  saveAttempt,
  getProgress,
  ensureAlgorithmSeed,
} from '../services/algorithmMemorizerStore.js'

const router = Router()
const memoryRate = new Map()

const MAX_CODE_LENGTH = 20_000
const MAX_OUTPUT_LENGTH = 8_000

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
}

async function allowRate(key, limit, windowMs) {
  if (currentEngine === 'mongo') {
    try {
      return await checkRateLimit(key, limit, windowMs)
    } catch {
      // fall through
    }
  }
  const now = Date.now()
  const entry = memoryRate.get(key)
  if (!entry || now - entry.start > windowMs) {
    memoryRate.set(key, { start: now, count: 1 })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}

function hashVisitor(raw) {
  const s = String(raw || '').slice(0, 128)
  if (!s) return ''
  return createHash('sha256').update(`algo:${s}`).digest('hex').slice(0, 32)
}

router.get('/', async (_req, res) => {
  try {
    await ensureAlgorithmSeed()
    const algorithms = await listAlgorithms({ admin: false })
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    res.json({
      algorithms: algorithms.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        category: a.category,
        difficulty: a.difficulty,
        description: a.description,
        image: a.image,
        timeComplexity: a.timeComplexity,
        spaceComplexity: a.spaceComplexity,
        order: a.order,
        visibleTestCount: (a.testCases || []).filter((t) => t.visible).length,
      })),
      limits: { maxCodeLength: MAX_CODE_LENGTH, maxOutputLength: MAX_OUTPUT_LENGTH },
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to list algorithms' })
  }
})

router.get('/progress', async (req, res) => {
  try {
    const rawVisitor = String(req.query.visitorId || '').slice(0, 128)
    if (!rawVisitor) return res.status(400).json({ error: 'visitorId query required' })
    const visitorId = hashVisitor(rawVisitor)
    const algorithmId = req.query.algorithmId ? String(req.query.algorithmId) : ''
    const progress = await getProgress(visitorId, algorithmId || undefined)
    res.setHeader('Cache-Control', 'private, no-store')
    res.json({
      ...progress,
      notice: 'Progress is tied to this browser visitor ID and may be lost if site data is cleared.',
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load progress' })
  }
})

router.get('/:idOrSlug', async (req, res) => {
  try {
    const key = req.params.idOrSlug
    const forRunner = req.query.runner === '1'
    let algo = await getAlgorithmById(key, { forRunner })
    if (!algo) algo = await getAlgorithmBySlug(key, { forRunner })
    if (!algo) return res.status(404).json({ error: 'Algorithm not found' })

    // Never expose reference on public API
    const { reference: _ref, ...safe } = algo
    res.setHeader('Cache-Control', forRunner ? 'private, no-store' : 'public, max-age=30')
    res.json({
      algorithm: safe,
      limits: { maxCodeLength: MAX_CODE_LENGTH, maxOutputLength: MAX_OUTPUT_LENGTH },
      notice: 'Hidden tests are evaluated in your browser worker and are not cryptographically secret.',
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load algorithm' })
  }
})

/**
 * Persist an attempt result after client-side (Pyodide) evaluation.
 * Server does not execute Python.
 */
router.post('/attempts', async (req, res) => {
  try {
    const ip = clientIp(req)
    const allowed = await allowRate(`algo:attempt:${ip}`, 40, 60 * 60 * 1000)
    if (!allowed) return res.status(429).json({ error: 'Too many attempts. Try again later.' })

    const body = req.body || {}
    const rawVisitor = String(body.visitorId || '').slice(0, 128)
    if (!rawVisitor) return res.status(400).json({ error: 'visitorId is required' })

    const visitorId = hashVisitor(rawVisitor)
    const passed = !!body.passed
    const elapsedMilliseconds = Number(body.elapsedMilliseconds)

    if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0) {
      return res.status(400).json({ error: 'Invalid elapsedMilliseconds' })
    }
    if (String(body.code || '').length > MAX_CODE_LENGTH) {
      return res.status(400).json({ error: 'Code exceeds maximum length' })
    }

    // Do not persist submitted source code — only results metadata
    const saved = await saveAttempt({
      visitorId,
      algorithmId: body.algorithmId,
      difficultyMode: body.difficultyMode,
      elapsedMilliseconds,
      passed,
      testResults: sanitizeTestResults(body.testResults),
      attemptedAt: body.attemptedAt,
    })

    const progress = await getProgress(visitorId, saved.algorithmId)
    const isPersonalBest =
      passed &&
      progress.personalBest &&
      Number(progress.personalBest.elapsedMilliseconds) === Number(saved.elapsedMilliseconds)

    res.status(201).json({
      ok: true,
      attempt: saved,
      personalBest: progress.personalBest,
      isPersonalBest,
      attemptCount: progress.attemptCount,
      notice: 'Progress is tied to this browser and may be lost if storage is cleared.',
    })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to save attempt' })
  }
})

function sanitizeTestResults(raw) {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 50).map((t) => ({
    id: String(t?.id || '').slice(0, 64),
    name: String(t?.name || '').slice(0, 120),
    visible: !!t?.visible,
    passed: !!t?.passed,
    error: String(t?.error || '').slice(0, 500),
    output: String(t?.output || '').slice(0, 200),
  }))
}

export default router
export { MAX_CODE_LENGTH, MAX_OUTPUT_LENGTH }
