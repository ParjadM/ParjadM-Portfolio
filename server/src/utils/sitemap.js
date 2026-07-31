import { currentEngine } from '../db/index.js';
import { BlogPost } from '../db/mongo.js';
import { SITE_URL } from '../config/site.js';
import { cacheGet, cacheSet } from './microCache.js';

const SITEMAP_TTL_MS = 5 * 60 * 1000;

const STATIC_PATHS = [
  '/',
  '/about',
  '/projects',
  '/blog',
  '/contact',
  '/stats',
  '/explore',
  '/garden',
  '/algorithm-memorizer',
  '/tech-news',
  '/cli',
  '/os',
  '/intro',
  '/interview',
];

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, enPath) {
  const en = `${SITE_URL}${enPath === '/' ? '' : enPath}`;
  const fr = `${SITE_URL}${enPath === '/' ? '/fr' : `/fr${enPath}`}`;
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${escapeXml(fr)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(en)}"/>
  </url>`;
}

export async function buildSitemap() {
  const cached = cacheGet('blog:sitemap');
  if (cached) return cached;

  const entries = [];

  for (const path of STATIC_PATHS) {
    entries.push(urlEntry(`${SITE_URL}${path === '/' ? '/' : path}`, path));
    entries.push(urlEntry(`${SITE_URL}${path === '/' ? '/fr' : `/fr${path}`}`, path));
  }

  if (currentEngine === 'mongo') {
    try {
      const now = new Date();
      const posts = await BlogPost.find(
        { status: 'published', publishAt: { $lte: now } },
        { updatedAt: 1, publishAt: 1 }
      ).sort({ publishAt: -1 }).lean();

      for (const post of posts) {
        const id = post._id.toString();
        const lastmod = (post.updatedAt || post.publishAt || new Date()).toISOString().slice(0, 10);
        entries.push(`
  <url>
    <loc>${escapeXml(`${SITE_URL}/blog/${id}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    } catch {
      // Static entries still useful if DB is unavailable
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}
</urlset>`;
  cacheSet('blog:sitemap', xml, SITEMAP_TTL_MS);
  return xml;
}
