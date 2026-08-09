import { currentEngine } from '../db/index.js'
import { BlogPost } from '../db/mongo.js'
import { SITE_URL } from '../config/site.js'
import { cacheGet, cacheSet } from './microCache.js'

let STATIC_PATHS = [
  '/',
  '/about',
  '/projects',
  '/projects/lqftBenchmark',
  '/blog',
  '/contact',
  '/stats',
  '/explore',
  '/algorithm-memorizer',
  '/tech-news',
  '/cli',
  '/os',
  '/intro',
  '/interview',
]

try {
  // Prefer the shared manifest when available (Node can import ESM).
  const mod = await import('../../../src/config/publicRoutes.js')
  if (typeof mod.sitemapPaths === 'function') {
    STATIC_PATHS = mod.sitemapPaths()
  }
} catch {
  // Fall back to the inline list above.
}

const SITEMAP_TTL_MS = 5 * 60 * 1000

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function urlEntry(loc, { lastmod, changefreq = 'weekly', priority = '0.7' } = {}) {
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function buildSitemap() {
  const cached = cacheGet('sitemap:xml')
  if (cached) return cached

  const urls = []

  for (const p of STATIC_PATHS) {
    const en = `${SITE_URL}${p === '/' ? '/' : p}`
    const fr = `${SITE_URL}${p === '/' ? '/fr' : `/fr${p}`}`
    urls.push(urlEntry(en, { priority: p === '/' ? '1.0' : '0.8' }))
    urls.push(urlEntry(fr, { priority: p === '/' ? '0.9' : '0.7' }))
  }

  // Blog posts are English-only content — advertise English URLs only.
  try {
    if (currentEngine === 'mongo') {
      const now = new Date()
      const docs = await BlogPost.find(
        { status: 'published', publishAt: { $lte: now } },
        { _id: 1, updatedAt: 1, publishAt: 1 },
      )
        .sort({ publishAt: -1 })
        .lean()
      for (const d of docs) {
        const lastmod = new Date(d.updatedAt || d.publishAt || Date.now()).toISOString()
        urls.push(urlEntry(`${SITE_URL}/blog/${d._id.toString()}`, { lastmod, changefreq: 'monthly', priority: '0.6' }))
      }
    }
  } catch {
    // ignore DB errors — static routes still ship
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`
  cacheSet('sitemap:xml', xml, SITEMAP_TTL_MS)
  return xml
}
