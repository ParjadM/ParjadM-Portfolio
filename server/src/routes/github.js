import { Router } from 'express'
import { cacheGet, cacheSet } from '../utils/microCache.js'

const router = Router()
const CACHE_KEY = 'github:stats'
const CACHE_TTL_MS = Number(process.env.GH_CACHE_TTL_MS || 10 * 60 * 1000) // default 10m

// GET /api/github-stats
router.get('/', async (_req, res) => {
  try {
    const cached = cacheGet(CACHE_KEY)
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=600')
      return res.json(cached)
    }

    const token = process.env.GITHUB_PAT
    const username = 'ParjadM'
    const headers = {
      'User-Agent': 'parjadm-portfolio',
      'Accept': 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const resp = await fetch(`https://api.github.com/users/${username}`, { headers })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.message || 'GitHub API error' })
    }

    const { login, followers, following, public_repos, public_gists, html_url, avatar_url, name, bio } = data
    const payload = { login, followers, following, public_repos, public_gists, html_url, avatar_url, name, bio }
    cacheSet(CACHE_KEY, payload, CACHE_TTL_MS)

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=600')
    return res.json(payload)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GitHub stats' })
  }
})

export default router
