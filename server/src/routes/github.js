import { Router } from 'express'

const router = Router()

// GET /api/github-stats
router.get('/', async (_req, res) => {
  try {
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
    return res.json({ login, followers, following, public_repos, public_gists, html_url, avatar_url, name, bio })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GitHub stats' })
  }
})

export default router


