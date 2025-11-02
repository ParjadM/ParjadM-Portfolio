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
    // First try public proxy API (may be missing solve counts)
    const url = `https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}`
    const r = await fetch(url)
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'LeetCode API error' })

    let normalized = {
      username: data.username || username,
      name: data.name || null,
      avatar: data.avatar || null,
      totalSolved: toNum(data.totalSolved ?? data.total_solved ?? 0),
      easySolved: toNum(data.easySolved ?? data.easy_solved ?? 0),
      mediumSolved: toNum(data.mediumSolved ?? data.medium_solved ?? 0),
      hardSolved: toNum(data.hardSolved ?? data.hard_solved ?? 0),
      ranking: data.ranking ?? data.rank ?? null,
    }

    // Fallback: if counts are zero, query LeetCode GraphQL directly for accurate stats
    if (allZero(normalized)) {
      try {
        const gql = `query userStats($username: String!) {\n  matchedUser(username: $username) {\n    username\n    profile { ranking userAvatar realName aboutMe }\n    submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }\n  }\n}`
        const resp = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'Origin': 'https://leetcode.com',
            'User-Agent': 'parjadm-portfolio',
          },
          body: JSON.stringify({ query: gql, variables: { username } }),
        })
        const j = await resp.json().catch(() => ({}))
        const mu = j?.data?.matchedUser
        if (mu?.submitStats?.acSubmissionNum) {
          const arr = mu.submitStats.acSubmissionNum
          const get = (d) => toNum((arr.find((x) => x.difficulty === d)?.count) ?? 0)
          const easy = get('Easy')
          const med = get('Medium')
          const hard = get('Hard')
          normalized.easySolved = easy
          normalized.mediumSolved = med
          normalized.hardSolved = hard
          normalized.totalSolved = easy + med + hard
        }
        if (mu?.profile) {
          normalized.ranking = mu.profile.ranking ?? normalized.ranking
          normalized.avatar = mu.profile.userAvatar || normalized.avatar
          normalized.name = mu.profile.realName || normalized.name
        }
      } catch (_) {
        // ignore fallback errors
      }
    }

    cache = normalized
    cacheAt = now
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=600')
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


