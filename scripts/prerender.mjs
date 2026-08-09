/**
 * Post-build prerender: writes a per-route index.html into dist/ with the
 * correct title, description, canonical, hreflang, and Open Graph tags.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITE_URL = 'https://parjadm.ca'

const { prerenderRoutes } = await import(pathToFileURL(path.join(ROOT, 'src/config/publicRoutes.js')).href)
const en = JSON.parse(readFileSync(path.join(ROOT, 'src/locales/en/translation.json'), 'utf8'))
const fr = JSON.parse(readFileSync(path.join(ROOT, 'src/locales/fr/translation.json'), 'utf8'))

function t(bundle, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : null), bundle) || key
}

const ROUTES = prerenderRoutes().map((route) => ({
  path: route.path,
  en: { title: t(en, route.titleKey), desc: t(en, route.descriptionKey) },
  fr: { title: t(fr, route.titleKey), desc: t(fr, route.descriptionKey) },
}))

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderRoute(template, { title, desc, canonical, lang, enUrl, frUrl }) {
  const ttl = escapeHtml(title)
  const d = escapeHtml(desc)

  let html = template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${ttl}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${ttl}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${ttl}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`)

  const alternates = [
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="fr-CA" href="${frUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
  ].join('\n    ')
  html = html.replace(/(<link rel="canonical"[^>]*\/>)/, `$1\n    ${alternates}`)

  return html
}

function outFileFor(routePath) {
  if (routePath === '/') return path.join(DIST, 'index.html')
  return path.join(DIST, routePath.replace(/^\//, ''), 'index.html')
}

const template = readFileSync(path.join(DIST, 'index.html'), 'utf8')
let count = 0

for (const route of ROUTES) {
  const enUrl = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
  const frUrl = `${SITE_URL}${route.path === '/' ? '/fr' : `/fr${route.path}`}`

  const enHtml = renderRoute(template, {
    title: route.en.title,
    desc: route.en.desc,
    canonical: enUrl,
    lang: 'en',
    enUrl,
    frUrl,
  })
  const enOut = outFileFor(route.path)
  mkdirSync(path.dirname(enOut), { recursive: true })
  writeFileSync(enOut, enHtml)
  count += 1

  const frHtml = renderRoute(template, {
    title: route.fr.title,
    desc: route.fr.desc,
    canonical: frUrl,
    lang: 'fr-CA',
    enUrl,
    frUrl,
  })
  const frOut = outFileFor(route.path === '/' ? '/fr' : `/fr${route.path}`)
  mkdirSync(path.dirname(frOut), { recursive: true })
  writeFileSync(frOut, frHtml)
  count += 1
}

console.log(`Prerendered ${count} route HTML files into dist/`)
