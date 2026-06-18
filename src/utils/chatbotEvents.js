export const CHATBOT_OPEN_EVENT = 'portfolio:chatbot-open'
export const PAGE_CONTEXT_EVENT = 'portfolio:page-context'

let activePageContext = null

export function getActivePageContext() {
  return activePageContext
}

export function setActivePageContext(pageContext) {
  activePageContext = pageContext || null
  window.dispatchEvent(new CustomEvent(PAGE_CONTEXT_EVENT, { detail: activePageContext }))
}

export function clearActivePageContext() {
  activePageContext = null
  window.dispatchEvent(new CustomEvent(PAGE_CONTEXT_EVENT, { detail: null }))
}

export function openChatbot({ message, pageContext, autoSend = false } = {}) {
  window.dispatchEvent(new CustomEvent(CHATBOT_OPEN_EVENT, {
    detail: { message, pageContext, autoSend },
  }))
}

export function buildProjectPageContext(project) {
  if (!project) return null
  return {
    type: 'project',
    pathname: '/projects',
    id: project.id || '',
    title: project.title || '',
    description: project.description || '',
    tags: project.tags || [],
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
  }
}

export function buildBlogPageContext(post, pathname) {
  if (!post) return null
  const excerpt = (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 400)
  return {
    type: 'blog',
    pathname: pathname || `/blog/${post.id || ''}`,
    id: post.id || '',
    title: post.title || '',
    excerpt,
    category: post.category || '',
  }
}

export function buildRoutePageContext(pathname) {
  return {
    type: 'page',
    pathname: pathname || '/',
  }
}

export function getChatGreeting(pathname, pageContext) {
  if (pageContext?.type === 'project' && pageContext.title) {
    return `Hi! Ask me anything about ${pageContext.title} — tech stack, design choices, or how it was built.`
  }
  if (pageContext?.type === 'blog' && pageContext.title) {
    return `Hi! I can help explain "${pageContext.title}" or answer questions about this article.`
  }

  const path = pathname || pageContext?.pathname || '/'
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

export function buildChatPayloadContext(location, pageContextOverride) {
  const active = pageContextOverride || getActivePageContext()
  const routeContext = buildRoutePageContext(location.pathname)
  const pageContext = active
    ? { ...routeContext, ...active, pathname: active.pathname || location.pathname }
    : routeContext
  return pageContext
}
