/**
 * Algorithm Memorizer store — Mongo when available, in-memory otherwise.
 */
import { currentEngine } from '../db/index.js'
import { Algorithm, AlgorithmAttempt } from '../db/mongo.js'
import { ALGORITHM_SEED } from '../data/algorithms.seed.js'

const memoryAlgorithms = []
const memoryAttempts = []
let seeded = false

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function toPublicAlgo(doc, { includeReference = false, includeHiddenTests = false } = {}) {
  const id = doc._id?.toString?.() || doc.id
  const tests = Array.isArray(doc.testCases) ? doc.testCases : []
  return {
    id,
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    difficulty: doc.difficulty,
    description: doc.description || '',
    image: doc.image || '',
    skeleton: doc.skeleton || '',
    timeComplexity: doc.timeComplexity || '',
    spaceComplexity: doc.spaceComplexity || '',
    enabled: doc.enabled !== false,
    order: doc.order ?? 0,
    testCases: tests
      .filter((t) => includeHiddenTests || t.visible)
      .map((t) => ({
        id: t.id,
        name: t.name || '',
        visible: !!t.visible,
        expression: includeHiddenTests || t.visible ? t.expression : undefined,
        expected: includeHiddenTests || t.visible ? t.expected : undefined,
        ...(includeHiddenTests || t.visible ? {} : {}),
      })),
    ...(includeReference ? { reference: doc.reference || '' } : {}),
    // Full tests for client-side runner (expression+expected) without reference solution
    ...(includeHiddenTests
      ? {
          runnerTests: tests.map((t) => ({
            id: t.id,
            name: t.name || '',
            visible: !!t.visible,
            expression: t.expression,
            expected: t.expected,
          })),
        }
      : {}),
  }
}

function toAdminAlgo(doc) {
  return toPublicAlgo(doc, { includeReference: true, includeHiddenTests: true })
}

export async function ensureAlgorithmSeed() {
  if (seeded && (currentEngine !== 'mongo' ? memoryAlgorithms.length > 0 : true)) {
    if (currentEngine !== 'mongo' && memoryAlgorithms.length > 0) return { seeded: false, count: memoryAlgorithms.length }
  }

  if (currentEngine === 'mongo') {
    const count = await Algorithm.countDocuments()
    if (count > 0) {
      seeded = true
      return { seeded: false, count }
    }
    const docs = ALGORITHM_SEED.map((a, i) => ({
      ...a,
      enabled: true,
      order: a.order ?? (i + 1) * 10,
      image: '',
    }))
    await Algorithm.insertMany(docs)
    seeded = true
    return { seeded: true, count: docs.length }
  }

  if (memoryAlgorithms.length === 0) {
    ALGORITHM_SEED.forEach((a, i) => {
      memoryAlgorithms.push({
        id: `algo-${a.slug}`,
        ...clone(a),
        enabled: true,
        order: a.order ?? (i + 1) * 10,
        image: '',
        createdAt: new Date(),
      })
    })
  }
  seeded = true
  return { seeded: true, count: memoryAlgorithms.length }
}

export async function listAlgorithms({ admin = false } = {}) {
  await ensureAlgorithmSeed()
  if (currentEngine === 'mongo') {
    const filter = admin ? {} : { enabled: true }
    const docs = await Algorithm.find(filter).sort({ order: 1, title: 1 }).lean()
    return docs.map((d) => (admin ? toAdminAlgo(d) : toPublicAlgo(d)))
  }
  const list = memoryAlgorithms
    .filter((a) => admin || a.enabled !== false)
    .sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title))
  return list.map((d) => (admin ? toAdminAlgo(d) : toPublicAlgo(d)))
}

export async function getAlgorithmById(id, { admin = false, forRunner = false } = {}) {
  await ensureAlgorithmSeed()
  if (currentEngine === 'mongo') {
    const doc = await Algorithm.findById(id).lean()
    if (!doc) return null
    if (!admin && doc.enabled === false) return null
    if (admin) return toAdminAlgo(doc)
    return toPublicAlgo(doc, { includeHiddenTests: forRunner })
  }
  const doc = memoryAlgorithms.find((a) => a.id === id)
  if (!doc) return null
  if (!admin && doc.enabled === false) return null
  if (admin) return toAdminAlgo(doc)
  return toPublicAlgo(doc, { includeHiddenTests: forRunner })
}

export async function getAlgorithmBySlug(slug, opts) {
  await ensureAlgorithmSeed()
  if (currentEngine === 'mongo') {
    const doc = await Algorithm.findOne({ slug }).lean()
    if (!doc) return null
    return getAlgorithmById(doc._id.toString(), opts)
  }
  const doc = memoryAlgorithms.find((a) => a.slug === slug)
  if (!doc) return null
  return getAlgorithmById(doc.id, opts)
}

function normalizeBody(body = {}) {
  const testCases = Array.isArray(body.testCases)
    ? body.testCases.map((t, i) => ({
        id: String(t.id || `t${i + 1}`).slice(0, 64),
        name: String(t.name || '').slice(0, 120),
        visible: t.visible !== false,
        expression: String(t.expression || '').slice(0, 4000),
        expected: String(t.expected || '').slice(0, 4000),
      }))
    : []
  return {
    slug: String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 80),
    title: String(body.title || '').trim().slice(0, 160),
    category: String(body.category || '').trim(),
    difficulty: ['easy', 'medium', 'hard'].includes(body.difficulty) ? body.difficulty : 'medium',
    description: String(body.description || '').slice(0, 4000),
    image: String(body.image || '').slice(0, 1000),
    skeleton: String(body.skeleton || '').slice(0, 20000),
    reference: String(body.reference || '').slice(0, 20000),
    testCases,
    timeComplexity: String(body.timeComplexity || '').slice(0, 80),
    spaceComplexity: String(body.spaceComplexity || '').slice(0, 80),
    enabled: body.enabled !== false,
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
  }
}

export async function createAlgorithm(body) {
  const data = normalizeBody(body)
  if (!data.slug || !data.title || !data.category) {
    throw Object.assign(new Error('slug, title, and category are required'), { status: 400 })
  }
  if (currentEngine === 'mongo') {
    const doc = await Algorithm.create(data)
    return toAdminAlgo(doc.toObject())
  }
  if (memoryAlgorithms.some((a) => a.slug === data.slug)) {
    throw Object.assign(new Error('Slug already exists'), { status: 409 })
  }
  const created = { id: `algo-${data.slug}-${Date.now()}`, ...data, createdAt: new Date() }
  memoryAlgorithms.push(created)
  return toAdminAlgo(created)
}

export async function updateAlgorithm(id, body) {
  const data = normalizeBody(body)
  if (currentEngine === 'mongo') {
    const doc = await Algorithm.findByIdAndUpdate(id, { $set: data }, { new: true }).lean()
    if (!doc) return null
    return toAdminAlgo(doc)
  }
  const idx = memoryAlgorithms.findIndex((a) => a.id === id)
  if (idx < 0) return null
  memoryAlgorithms[idx] = { ...memoryAlgorithms[idx], ...data }
  return toAdminAlgo(memoryAlgorithms[idx])
}

export async function deleteAlgorithm(id) {
  if (currentEngine === 'mongo') {
    const res = await Algorithm.deleteOne({ _id: id })
    return res.deletedCount > 0
  }
  const idx = memoryAlgorithms.findIndex((a) => a.id === id)
  if (idx < 0) return false
  memoryAlgorithms.splice(idx, 1)
  return true
}

export async function reorderAlgorithms(ids = []) {
  if (!Array.isArray(ids) || !ids.length) return
  if (currentEngine === 'mongo') {
    await Promise.all(ids.map((id, i) => Algorithm.updateOne({ _id: id }, { $set: { order: (i + 1) * 10 } })))
    return
  }
  ids.forEach((id, i) => {
    const a = memoryAlgorithms.find((x) => x.id === id)
    if (a) a.order = (i + 1) * 10
  })
}

export async function saveAttempt(payload) {
  const visitorId = String(payload.visitorId || '').slice(0, 64)
  const algorithmId = String(payload.algorithmId || '').slice(0, 64)
  const difficultyMode = payload.difficultyMode === 'hard' ? 'hard' : 'easy'
  const elapsedMilliseconds = Math.max(0, Math.min(Number(payload.elapsedMilliseconds) || 0, 24 * 60 * 60 * 1000))
  const passed = !!payload.passed
  const testResults = Array.isArray(payload.testResults) ? payload.testResults.slice(0, 50) : []
  const attemptedAt = payload.attemptedAt ? new Date(payload.attemptedAt) : new Date()

  if (!visitorId || !algorithmId) {
    throw Object.assign(new Error('visitorId and algorithmId are required'), { status: 400 })
  }

  const record = {
    visitorId,
    algorithmId,
    difficultyMode,
    elapsedMilliseconds,
    passed,
    testResults,
    attemptedAt,
  }

  if (currentEngine === 'mongo') {
    const doc = await AlgorithmAttempt.create(record)
    return {
      id: doc._id.toString(),
      ...record,
      attemptedAt: doc.attemptedAt,
    }
  }

  const saved = { id: `att-${Date.now()}`, ...record }
  memoryAttempts.push(saved)
  if (memoryAttempts.length > 5000) memoryAttempts.splice(0, memoryAttempts.length - 5000)
  return saved
}

export async function getProgress(visitorId, algorithmId) {
  const vid = String(visitorId || '').slice(0, 64)
  if (!vid) return { attempts: [], personalBest: null, attemptCount: 0 }

  let attempts = []
  if (currentEngine === 'mongo') {
    const filter = { visitorId: vid }
    if (algorithmId) filter.algorithmId = algorithmId
    const docs = await AlgorithmAttempt.find(filter)
      .sort({ attemptedAt: -1 })
      .limit(algorithmId ? 40 : 100)
      .lean()
    attempts = docs.map((d) => ({
      id: d._id.toString(),
      algorithmId: d.algorithmId,
      difficultyMode: d.difficultyMode,
      elapsedMilliseconds: d.elapsedMilliseconds,
      passed: d.passed,
      testResults: d.testResults,
      attemptedAt: d.attemptedAt,
    }))
  } else {
    attempts = memoryAttempts
      .filter((a) => a.visitorId === vid && (!algorithmId || a.algorithmId === algorithmId))
      .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))
      .slice(0, algorithmId ? 40 : 100)
  }

  const passed = attempts.filter((a) => a.passed)
  const personalBest = passed.length
    ? passed.reduce((best, a) => (!best || a.elapsedMilliseconds < best.elapsedMilliseconds ? a : best), null)
    : null

  return {
    attempts,
    personalBest,
    attemptCount: attempts.length,
  }
}

/** Reset memory store (tests). */
export function __resetMemoryStore() {
  memoryAlgorithms.length = 0
  memoryAttempts.length = 0
  seeded = false
}
