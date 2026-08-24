/**
 * Single source of truth for public static routes, SEO keys, sitemap, and prerender.
 * Keep path IDs in sync with AppRoutes.jsx component mapping.
 */

export const PUBLIC_STATIC_ROUTES = [
  {
    path: '/',
    id: 'home',
    titleKey: 'seo.homeTitle',
    descriptionKey: 'seo.homeDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/about',
    id: 'about',
    titleKey: 'seo.aboutTitle',
    descriptionKey: 'seo.aboutDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/projects',
    id: 'projects',
    titleKey: 'seo.projectsTitle',
    descriptionKey: 'seo.projectsDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/projects/lqftBenchmark',
    id: 'lqft',
    titleKey: 'seo.lqftTitle',
    descriptionKey: 'seo.lqftDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/projects/cameraFx',
    id: 'cameraFx',
    titleKey: 'seo.cameraFxTitle',
    descriptionKey: 'seo.cameraFxDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/projects/qaLab',
    id: 'qaLab',
    titleKey: 'seo.qaLabTitle',
    descriptionKey: 'seo.qaLabDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/blog',
    id: 'blog',
    titleKey: 'blog.seoTitle',
    descriptionKey: 'blog.seoDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/contact',
    id: 'contact',
    titleKey: 'seo.contactTitle',
    descriptionKey: 'seo.contactDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/stats',
    id: 'stats',
    titleKey: 'seo.statsTitle',
    descriptionKey: 'seo.statsDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/explore',
    id: 'explore',
    titleKey: 'explore.seoTitle',
    descriptionKey: 'explore.seoDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/algorithm-memorizer',
    id: 'algoMem',
    titleKey: 'algoMem.seoTitle',
    descriptionKey: 'algoMem.seoDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/tech-news',
    id: 'techNews',
    titleKey: 'seo.techNewsTitle',
    descriptionKey: 'seo.techNewsDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/interview',
    id: 'interview',
    titleKey: 'seo.interviewTitle',
    descriptionKey: 'seo.interviewDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/os',
    id: 'os',
    titleKey: 'seo.osTitle',
    descriptionKey: 'seo.osDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/cli',
    id: 'cli',
    titleKey: 'seo.cliTitle',
    descriptionKey: 'seo.cliDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
  {
    path: '/intro',
    id: 'intro',
    titleKey: 'seo.introTitle',
    descriptionKey: 'seo.introDesc',
    sitemap: true,
    prerender: true,
    indexable: true,
  },
]

export function getRouteMeta(pathname) {
  const normalized = pathname === '' ? '/' : pathname
  return PUBLIC_STATIC_ROUTES.find((r) => r.path === normalized) || null
}

export function sitemapPaths() {
  return PUBLIC_STATIC_ROUTES.filter((r) => r.sitemap).map((r) => r.path)
}

export function prerenderRoutes() {
  return PUBLIC_STATIC_ROUTES.filter((r) => r.prerender)
}
