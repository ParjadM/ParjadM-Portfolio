import { Router } from 'express'
import { createHash } from 'crypto'
import { GardenMark } from '../db/mongo.js'
import { currentEngine } from '../db/index.js'
import { checkRateLimit } from '../utils/rateLimit.js'
import { cacheGet, cacheSet, cacheInvalidate } from '../utils/microCache.js'
import {
  MAX_MARKS,
  TICK_MIN_INTERVAL_MS,
  buildGenome,
  phenotypeFromGenome,
  morphTick,
  buildField,
  serializeMark,
} from '../utils/gardenMorph.js'

const router = Router()
const LIST_CACHE_KEY = 'garden:marks'
const LIST_TTL_MS = 18_000

/** In-memory fallback when Mongo is unavailable (local/dev). */
const memoryGarden = []
const memoryRate = new Map()
let lastTickAt = 0
let tickInFlight = null

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || 'unknown'
}

function hashVisitor(raw) {
  const s = String(raw || '').slice(0, 128)
  if (!s) return ''
  return createHash('sha256').update(s).digest('hex').slice(0, 16)
}

async function allowRate(key, limit, windowMs) {
  if (currentEngine === 'mongo') {
    try {
      return await checkRateLimit(key, limit, windowMs)
    } catch {
      // Fall through to memory limiter if Mongo rate collection is unavailable.
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

async function loadMarks() {
  if (currentEngine === 'mongo') {
    const docs = await GardenMark.find({})
      .sort({ createdAt: 1 })
      .limit(MAX_MARKS)
      .lean()
    return docs.map((d) => ({
      id: d._id.toString(),
      x: d.x,
      y: d.y,
      hue: d.hue,
      size: d.size,
      shape: d.shape,
      energy: d.energy,
      generation: d.generation,
      species: d.species,
      genome: d.genome,
      visitorKey: d.visitorKey || '',
      branchedFrom: d.branchedFrom || '',
      createdAt: d.createdAt,
      lastTickedAt: d.lastTickedAt,
    }))
  }
  return memoryGarden.map((m) => ({ ...m }))
}

async function persistMorphResult(before, after) {
  if (currentEngine !== 'mongo') {
    memoryGarden.length = 0
    for (const m of after) {
      memoryGarden.push({
        id: m.id && !String(m.id).startsWith('branch-')
          ? m.id
          : `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x: m.x,
        y: m.y,
        hue: m.hue,
        size: m.size,
        shape: m.shape,
        energy: m.energy,
        generation: m.generation,
        species: m.species,
        genome: m.genome,
        visitorKey: m.visitorKey || '',
        branchedFrom: m.branchedFrom || '',
        createdAt: m.createdAt || new Date(),
        lastTickedAt: m.lastTickedAt || new Date(),
      })
    }
    return
  }

  const beforeIds = new Set(before.map((m) => m.id).filter(Boolean))
  const survivingIds = new Set(
    after
      .map((m) => m.id)
      .filter((id) => id && beforeIds.has(id)),
  )
  const toDelete = [...beforeIds].filter((id) => !survivingIds.has(id))

  if (toDelete.length) {
    await GardenMark.deleteMany({ _id: { $in: toDelete } })
  }

  const ops = []
  for (const m of after) {
    if (m.id && beforeIds.has(m.id)) {
      ops.push({
        updateOne: {
          filter: { _id: m.id },
          update: {
            $set: {
              x: m.x,
              y: m.y,
              hue: m.hue,
              size: m.size,
              shape: m.shape,
              energy: m.energy,
              generation: m.generation || 0,
              species: m.species || 'spore',
              genome: m.genome || null,
              lastTickedAt: m.lastTickedAt || new Date(),
            },
          },
        },
      })
    } else {
      ops.push({
        insertOne: {
          document: {
            x: m.x,
            y: m.y,
            hue: m.hue,
            size: m.size,
            shape: m.shape,
            energy: m.energy,
            generation: m.generation || 0,
            species: m.species || 'spore',
            genome: m.genome || null,
            visitorKey: m.visitorKey || '',
            branchedFrom: m.branchedFrom || '',
            lastTickedAt: m.lastTickedAt || new Date(),
            createdAt: m.createdAt || new Date(),
          },
        },
      })
    }
  }

  if (ops.length) {
    const chunk = 200
    for (let i = 0; i < ops.length; i += chunk) {
      await GardenMark.bulkWrite(ops.slice(i, i + chunk), { ordered: false })
    }
  }
}

async function maybeMorphTick() {
  const now = Date.now()
  if (now - lastTickAt < TICK_MIN_INTERVAL_MS) {
    return { ran: false, spawned: 0, merged: 0, decayed: 0 }
  }
  if (tickInFlight) return tickInFlight

  tickInFlight = (async () => {
    try {
      const before = await loadMarks()
      if (!before.length) {
        lastTickAt = now
        return { ran: true, spawned: 0, merged: 0, decayed: 0 }
      }
      const result = morphTick(before, now)
      await persistMorphResult(before, result.marks)
      lastTickAt = now
      cacheInvalidate('garden:')
      return {
        ran: true,
        spawned: result.spawned,
        merged: result.merged,
        decayed: result.decayed,
      }
    } finally {
      tickInFlight = null
    }
  })()

  return tickInFlight
}

function buildPayload(marks, total, tick = null) {
  const field = buildField(marks)
  return {
    marks: marks.map(serializeMark),
    total,
    field,
    morph: tick
      ? { ticked: tick.ran, spawned: tick.spawned, merged: tick.merged, decayed: tick.decayed }
      : { ticked: false, spawned: 0, merged: 0, decayed: 0 },
  }
}

router.get('/', async (_req, res) => {
  try {
    const tick = await maybeMorphTick()

    const cached = cacheGet(LIST_CACHE_KEY)
    if (cached && !tick.ran) {
      res.setHeader('Cache-Control', 'public, max-age=12, stale-while-revalidate=45')
      return res.json(cached)
    }

    let marks = []
    let total = 0

    if (currentEngine === 'mongo') {
      total = await GardenMark.estimatedDocumentCount()
      const docs = await GardenMark.find({})
        .sort({ createdAt: 1 })
        .limit(MAX_MARKS)
        .lean()
      marks = docs.map((d) => ({
        id: d._id.toString(),
        x: d.x,
        y: d.y,
        hue: d.hue,
        size: d.size,
        shape: d.shape,
        energy: d.energy,
        generation: d.generation,
        species: d.species,
        genome: d.genome,
        createdAt: d.createdAt,
      }))
    } else {
      total = memoryGarden.length
      marks = memoryGarden.slice(-MAX_MARKS)
    }

    const payload = buildPayload(marks, total, tick)
    cacheSet(LIST_CACHE_KEY, payload, LIST_TTL_MS)
    res.setHeader('Cache-Control', 'public, max-age=12, stale-while-revalidate=45')
    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load garden' })
  }
})

router.post('/plant', async (req, res) => {
  try {
    const { x, y, visitorId, signals } = req.body || {}
    const nx = Number(x)
    const ny = Number(y)

    if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx < 0 || nx > 1 || ny < 0 || ny > 1) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    const ip = clientIp(req)
    const visitorKey = hashVisitor(visitorId || ip)

    const allowedIp = await allowRate(`garden:ip:${ip}`, 8, 24 * 60 * 60 * 1000)
    if (!allowedIp) return res.status(429).json({ error: 'Daily garden limit reached. Come back tomorrow to plant more.' })

    const allowedBurst = await allowRate(`garden:burst:${visitorKey || ip}`, 1, 12_000)
    if (!allowedBurst) return res.status(429).json({ error: 'Slow down — let your last bloom settle.' })

    const genome = buildGenome(signals || {}, visitorKey || String(Date.now()))
    const pheno = phenotypeFromGenome(genome, visitorKey || String(Date.now()))
    const mark = {
      x: Math.min(1, Math.max(0, nx)),
      y: Math.min(1, Math.max(0, ny)),
      hue: (pheno.hue + Math.floor(Math.random() * 18) - 9 + 360) % 360,
      size: Math.min(1.35, Math.max(0.35, pheno.size + (Math.random() - 0.5) * 0.12)),
      shape: pheno.shape,
      energy: 0.78 + Math.random() * 0.15,
      generation: 0,
      species: pheno.species,
      genome,
      visitorKey,
      lastTickedAt: new Date(),
    }

    let saved
    if (currentEngine === 'mongo') {
      const doc = await GardenMark.create(mark)
      saved = serializeMark(doc.toObject())
    } else {
      saved = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...mark,
        createdAt: new Date(),
      }
      memoryGarden.push(saved)
      if (memoryGarden.length > MAX_MARKS) {
        memoryGarden.splice(0, memoryGarden.length - MAX_MARKS)
      }
      saved = serializeMark(saved)
    }

    cacheInvalidate('garden:')
    res.status(201).json({ ok: true, mark: saved, species: mark.species })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to plant' })
  }
})

export default router
