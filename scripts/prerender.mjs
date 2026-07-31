/**
 * Post-build prerender: writes a per-route index.html into dist/ with the
 * correct title, description, canonical, hreflang, and Open Graph tags.
 *
 * Vercel serves files from the filesystem before applying the SPA rewrite,
 * so crawlers and social bots get route-specific meta as plain HTML without
 * executing JavaScript. The React app still hydrates and renders normally.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const SITE_URL = 'https://parjadm.ca';

// Keep these in sync with the <SEO> props on each page component.
const ROUTES = [
  {
    path: '/',
    en: { title: 'Parjad Minooei — Software Engineer Portfolio', desc: 'Software Engineer building beautiful, fast, user-centric apps.' },
    fr: { title: 'Parjad Minooei — Portfolio d\u2019ing\u00e9nieur logiciel', desc: 'Ing\u00e9nieur logiciel cr\u00e9ant des applications belles, rapides et centr\u00e9es sur l\u2019utilisateur.' },
  },
  {
    path: '/about',
    en: { title: 'About — Parjad Minooei', desc: "Learn about Parjad's background and skills." },
    fr: { title: '\u00c0 propos — Parjad Minooei', desc: 'D\u00e9couvrez le parcours et les comp\u00e9tences de Parjad.' },
  },
  {
    path: '/projects',
    en: { title: 'Projects — Parjad Minooei', desc: 'Selected projects with code and live demos.' },
    fr: { title: 'Projets — Parjad Minooei', desc: 'Projets s\u00e9lectionn\u00e9s avec code source et d\u00e9mos en ligne.' },
  },
  {
    path: '/blog',
    en: { title: 'Blog — Parjad Minooei', desc: 'Articles on web development and learning.' },
    fr: { title: 'Blogue — Parjad Minooei', desc: 'Articles sur le d\u00e9veloppement web et l\u2019apprentissage.' },
  },
  {
    path: '/contact',
    en: { title: 'Contact — Parjad Minooei', desc: 'Get in touch for opportunities and collaborations.' },
    fr: { title: 'Contact — Parjad Minooei', desc: 'Contactez-moi pour des opportunit\u00e9s et des collaborations.' },
  },
  {
    path: '/stats',
    en: { title: 'Stats — Parjad Minooei', desc: 'A quick look at my open-source presence and coding practice.' },
    fr: { title: 'Statistiques — Parjad Minooei', desc: 'Un aper\u00e7u de ma pr\u00e9sence open source et de ma pratique du code.' },
  },
  {
    path: '/explore',
    en: { title: 'Explore — Parjad Minooei', desc: 'Experimental features: desktop OS, CLI mode, AI interview, and more.' },
    fr: { title: 'Explorer — Parjad Minooei', desc: 'Fonctionnalit\u00e9s exp\u00e9rimentales : OS de bureau, mode CLI, entrevue IA et plus.' },
  },
  {
    path: '/garden',
    en: { title: 'Collaborative Garden — Parjad Minooei', desc: 'A shared morphogenesis canvas that grows with every visitor bloom.' },
    fr: { title: 'Jardin collaboratif — Parjad Minooei', desc: 'Une toile de morphogen\u00e8se partag\u00e9e qui grandit avec chaque fleur de visiteur.' },
  },
  {
    path: '/algorithm-memorizer',
    en: { title: 'Algorithm Memorizer — Parjad Minooei', desc: 'Practice typing classic Python algorithms from memory with timed attempts.' },
    fr: { title: 'M\u00e9moriseur d\u2019algorithmes — Parjad Minooei', desc: 'Entra\u00eenez-vous \u00e0 taper des algorithmes Python de m\u00e9moire avec chronom\u00e8tre.' },
  },
  {
    path: '/tech-news',
    en: { title: 'Tech Hub — Parjad Minooei', desc: 'Top software engineering articles of the day from the global developer community.' },
    fr: { title: 'Actualit\u00e9s tech — Parjad Minooei', desc: 'Les meilleurs articles du jour en g\u00e9nie logiciel de la communaut\u00e9 mondiale.' },
  },
  {
    path: '/interview',
    en: { title: 'Mock Interview — Parjad Minooei', desc: "Chat with an AI trained on Parjad's resume and experience." },
    fr: { title: 'Entrevue simul\u00e9e — Parjad Minooei', desc: 'Discutez avec une IA entra\u00een\u00e9e sur le CV et l\u2019exp\u00e9rience de Parjad.' },
  },
  {
    path: '/os',
    en: { title: 'Desktop OS — Parjad Minooei', desc: 'A playful desktop environment on parjadm.ca.' },
    fr: { title: 'OS de bureau — Parjad Minooei', desc: 'Un environnement de bureau ludique sur parjadm.ca.' },
  },
  {
    path: '/cli',
    en: { title: 'CLI Mode — Parjad Minooei', desc: 'Navigate parjadm.ca from the terminal.' },
    fr: { title: 'Mode CLI — Parjad Minooei', desc: 'Naviguez sur parjadm.ca depuis le terminal.' },
  },
  {
    path: '/intro',
    en: { title: 'Intro — Parjad Minooei', desc: 'An animated welcome to parjadm.ca.' },
    fr: { title: 'Intro — Parjad Minooei', desc: 'Une bienvenue anim\u00e9e sur parjadm.ca.' },
  },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRoute(template, { title, desc, canonical, lang, enUrl, frUrl }) {
  const t = escapeHtml(title);
  const d = escapeHtml(desc);

  let html = template
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`);

  // hreflang alternates right after the canonical tag
  const alternates = [
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="fr-CA" href="${frUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
  ].join('\n    ');
  html = html.replace(/(<link rel="canonical"[^>]*\/>)/, `$1\n    ${alternates}`);

  return html;
}

function outFileFor(routePath) {
  if (routePath === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, routePath.replace(/^\//, ''), 'index.html');
}

const template = readFileSync(path.join(DIST, 'index.html'), 'utf8');
let count = 0;

for (const route of ROUTES) {
  const enUrl = `${SITE_URL}${route.path === '/' ? '' : route.path}`;
  const frUrl = `${SITE_URL}${route.path === '/' ? '/fr' : `/fr${route.path}`}`;

  // English variant
  const enHtml = renderRoute(template, {
    title: route.en.title,
    desc: route.en.desc,
    canonical: route.path === '/' ? `${SITE_URL}/` : enUrl,
    lang: 'en',
    enUrl,
    frUrl,
  });
  const enOut = outFileFor(route.path);
  mkdirSync(path.dirname(enOut), { recursive: true });
  writeFileSync(enOut, enHtml);
  count += 1;

  // French variant
  const frHtml = renderRoute(template, {
    title: route.fr.title,
    desc: route.fr.desc,
    canonical: frUrl,
    lang: 'fr-CA',
    enUrl,
    frUrl,
  });
  const frOut = outFileFor(route.path === '/' ? '/fr' : `/fr${route.path}`);
  mkdirSync(path.dirname(frOut), { recursive: true });
  writeFileSync(frOut, frHtml);
  count += 1;
}

console.log(`Prerendered ${count} route HTML files into dist/`);
