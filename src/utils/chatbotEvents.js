import i18n from '../i18n.js';
import { stripLocalePrefix } from './i18nRouting.js';

export const CHATBOT_OPEN_EVENT = 'portfolio:chatbot-open';
export const PAGE_CONTEXT_EVENT = 'portfolio:page-context';

let activePageContext = null;

export function getActivePageContext() {
  return activePageContext;
}

export function setActivePageContext(pageContext) {
  activePageContext = pageContext || null;
  window.dispatchEvent(new CustomEvent(PAGE_CONTEXT_EVENT, { detail: activePageContext }));
}

export function clearActivePageContext() {
  activePageContext = null;
  window.dispatchEvent(new CustomEvent(PAGE_CONTEXT_EVENT, { detail: null }));
}

export function openChatbot({ message, pageContext, autoSend = false } = {}) {
  window.dispatchEvent(new CustomEvent(CHATBOT_OPEN_EVENT, {
    detail: { message, pageContext, autoSend },
  }));
}

export function buildProjectPageContext(project) {
  if (!project) return null;
  return {
    type: 'project',
    pathname: '/projects',
    id: project.id || '',
    title: project.title || '',
    description: project.description || '',
    tags: project.tags || [],
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
  };
}

export function buildBlogPageContext(post, pathname) {
  if (!post) return null;
  const excerpt = (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 400);
  return {
    type: 'blog',
    pathname: pathname || `/blog/${post.id || ''}`,
    id: post.id || '',
    title: post.title || '',
    excerpt,
    category: post.category || '',
  };
}

export function buildRoutePageContext(pathname) {
  return {
    type: 'page',
    pathname: pathname || '/',
  };
}

export function getChatGreeting(pathname, pageContext) {
  const t = i18n.t.bind(i18n);

  if (pageContext?.type === 'project' && pageContext.title) {
    return t('chatbot.greetingProject', { title: pageContext.title });
  }
  if (pageContext?.type === 'blog' && pageContext.title) {
    return t('chatbot.greetingBlog', { title: pageContext.title });
  }

  const path = stripLocalePrefix(pathname || pageContext?.pathname || '/');
  if (path.includes('lqftBenchmark')) return t('chatbot.greetingLqft');
  if (path.includes('cameraFx')) return t('chatbot.greetingCameraFx');
  if (path.startsWith('/blog/')) return t('chatbot.greetingBlogPost');
  if (path === '/stats') return t('chatbot.greetingStats');
  if (path === '/interview') return t('chatbot.greetingInterview');
  if (path === '/projects') return t('chatbot.greetingProjects');
  if (path === '/about') return t('chatbot.greetingAbout');
  if (path === '/contact') return t('chatbot.greetingContact');
  if (path === '/os' || path === '/cli') return t('chatbot.greetingOsCli');
  if (path.startsWith('/admin')) return t('chatbot.greetingAdmin');
  return t('chatbot.greetingDefault');
}

export function buildChatPayloadContext(location, pageContextOverride) {
  const active = pageContextOverride || getActivePageContext();
  const routeContext = buildRoutePageContext(stripLocalePrefix(location.pathname));
  const pageContext = active
    ? { ...routeContext, ...active, pathname: stripLocalePrefix(active.pathname || location.pathname) }
    : routeContext;
  return pageContext;
}

export function getCurrentLocale() {
  return i18n.language?.startsWith('fr') ? 'fr' : 'en';
}
