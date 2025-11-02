import { Router } from 'express'

const router = Router()

// In-memory cache
let cache = null
let cacheAt = 0
const CACHE_TTL_MS = Number(process.env.LC_CACHE_TTL_MS || 10 * 60 * 1000) // default 10m

router.get('/', async (req, res) => {
  try {
    const now = Date.now()
    const forceRefresh = String(req.query.refresh || '') === '1'
    if (!forceRefresh && cache && (now - cacheAt) < CACHE_TTL_MS && !allZero(cache)) {
      return res.json(cache)
    }

    const username = 'evergreat'
    const url = `https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}`
    const r = await fetch(url)
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'LeetCode API error' })

    // Normalize important fields
    const normalized = {
      username,
      totalSolved: toNum(data.totalSolved ?? data.total_solved ?? 0),
      easySolved: toNum(data.easySolved ?? data.easy_solved ?? 0),
      mediumSolved: toNum(data.mediumSolved ?? data.medium_solved ?? 0),
      hardSolved: toNum(data.hardSolved ?? data.hard_solved ?? 0),
      ranking: data.ranking ?? data.rank ?? null,
    }

    cache = normalized
    cacheAt = now
    return res.json(normalized)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch LeetCode stats' })
  }
})

function toNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function allZero(obj) {
  return (
    (obj?.totalSolved ?? 0) === 0 &&
    (obj?.easySolved ?? 0) === 0 &&
    (obj?.mediumSolved ?? 0) === 0 &&
    (obj?.hardSolved ?? 0) === 0
  )
}

export default router


