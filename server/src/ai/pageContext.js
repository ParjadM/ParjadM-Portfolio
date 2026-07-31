import { slugContext } from './normalize.js'

const PAGE_HINTS = {
  '/': 'The user is on the portfolio home page.',
  '/about': 'The user is reading the About page (background, experience, education).',
  '/projects': 'The user is browsing the Projects gallery.',
  '/projects/lqftBenchmark': 'The user is on the LQFT Benchmark interactive demo page.',
  '/algorithm-memorizer': 'The user is on the Algorithm Memorizer — timed Python algorithm practice with Pyodide tests.',
  '/stats': 'The user is on the Stats page (GitHub, LeetCode, complexity analyzer).',
  '/blog': 'The user is browsing the blog index.',
  '/contact': 'The user is on the Contact page.',
  '/interview': 'The user is on the Mock Interview page.',
  '/cli': 'The user is in fullscreen CLI terminal mode.',
  '/os': 'The user is in the ParjadOS desktop environment.',
  '/tech-news': 'The user is reading curated tech news.',
  '/explore': 'The user is on the Explore page.',
  '/garden': 'The user is in the Collaborative Garden — a shared morphogenesis canvas where visitors plant blooms.',
}

function formatProjectContext(project) {
  if (!project) return ''
  const lines = [`Focused project: ${project.title || 'Unknown'}`]
  if (project.description) lines.push(`Description: ${project.description}`)
  if (project.tags?.length) lines.push(`Tech stack: ${project.tags.join(', ')}`)
  if (project.githubUrl) lines.push(`GitHub: ${project.githubUrl}`)
  if (project.liveUrl) lines.push(`Live/demo: ${project.liveUrl}`)
  return lines.join('\n')
}

function formatBlogContext(blog) {
  if (!blog) return ''
  const lines = [`Focused blog post: ${blog.title || 'Unknown'}`]
  if (blog.category) lines.push(`Category: ${blog.category}`)
  if (blog.excerpt) lines.push(`Excerpt: ${blog.excerpt}`)
  return lines.join('\n')
}

export function normalizePageContext(pageContext) {
  if (!pageContext || typeof pageContext !== 'object') return null
  return {
    pathname: pageContext.pathname || '',
    type: pageContext.type || 'page',
    title: pageContext.title || '',
    id: pageContext.id || '',
    description: pageContext.description || '',
    tags: Array.isArray(pageContext.tags) ? pageContext.tags : [],
    excerpt: pageContext.excerpt || '',
    category: pageContext.category || '',
    githubUrl: pageContext.githubUrl || '',
    liveUrl: pageContext.liveUrl || '',
  }
}

export function buildContextSlug(pageContext, legacyContext) {
  const ctx = normalizePageContext(pageContext)
  if (ctx) {
    const slug = [ctx.type, ctx.pathname, ctx.title, ctx.id].filter(Boolean).join('|')
    if (slug) return slugContext(slug)
  }
  return slugContext(legacyContext)
}

export function resolveChatContext({ context, pageContext }) {
  const ctx = normalizePageContext(pageContext)
  const parts = []

  if (ctx?.pathname) {
    parts.push(PAGE_HINTS[ctx.pathname] || `The user is browsing: ${ctx.pathname}`)
  }

  if (ctx?.type === 'project') {
    parts.push(formatProjectContext(ctx))
  } else if (ctx?.type === 'blog') {
    parts.push(formatBlogContext(ctx))
  } else if (ctx?.title && ctx?.description) {
    parts.push(`${ctx.title}: ${ctx.description}`)
  }

  if (typeof context === 'string' && context.trim()) {
    parts.push(context.trim())
  }

  return parts.join('\n\n') || 'The user is browsing the portfolio site.'
}

export function getPageGreeting(pathname, pageContext) {
  const ctx = normalizePageContext(pageContext)
  if (ctx?.type === 'project' && ctx.title) {
    return `Hi! Ask me anything about **${ctx.title}** — tech stack, design choices, or how it was built.`
  }
  if (ctx?.type === 'blog' && ctx.title) {
    return `Hi! I can help explain **${ctx.title}** or answer questions about this article.`
  }

  const path = pathname || ctx?.pathname || '/'
  if (path.includes('lqftBenchmark')) {
    return "Hi! You're on the LQFT Benchmark page. Ask about persistent trees, complexity, or how the demo works."
  }
  if (path.startsWith('/blog/')) {
    return 'Hi! Reading a blog post? I can summarize or explain it in plain language.'
  }
  if (path === '/stats') {
    return 'Hi! On the Stats page — ask about GitHub/LeetCode metrics or how the complexity analyzer works.'
  }
  if (path === '/interview') {
    return 'Hi! Ready to practice? I can explain how Mock Interview works or answer questions about Parjad.'
  }
  if (path === '/projects') {
    return 'Hi! Exploring projects? Ask about any build, tech stack, or use the Ask AI button on a card.'
  }
  if (path === '/about') {
    return 'Hi! On the About page — ask about experience, education, or background.'
  }
  if (path === '/contact') {
    return 'Hi! Need to reach Parjad? I can point you to the best way to get in touch.'
  }
  if (path === '/os' || path === '/cli') {
    return 'Hi! In terminal/OS mode — I know the commands, apps, and portfolio content. What do you need?'
  }
  if (path.startsWith('/admin')) {
    return 'Welcome to the Admin Dashboard. I can help with site content and AI knowledge management questions.'
  }
  return "Hi! I'm Parjad's AI assistant. How can I help you today?"
}
