import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '../../utils/auth.jsx';
import { lazyWithRetry } from '../../utils/lazyWithRetry.js';

/** Resolve default or named export from a lazy route module (Vite shared chunks vary). */
function pickExport(mod, name) {
  if (!mod) return undefined;

  const candidates = [mod];
  // Shared/admin chunks sometimes nest the real module under `.f` / `.module`.
  if (mod.f && typeof mod.f === 'object') candidates.push(mod.f);
  if (mod.module && typeof mod.module === 'object') candidates.push(mod.module);

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.default) return candidate.default;
    if (name && candidate[name]) return candidate[name];
  }

  // Last resort: first function-like export (covers odd interop shapes).
  if (name) {
    for (const candidate of candidates) {
      for (const [key, value] of Object.entries(candidate || {})) {
        if (key === name && value) return value;
      }
    }
  }
  return undefined;
}

function lazyNamed(factory, name) {
  return lazyWithRetry(() =>
    factory().then((mod) => {
      const Comp = pickExport(mod, name);
      if (!Comp) {
        const err = new Error(`Failed to load route module export: ${name || 'default'}`);
        // Treat as a stale-chunk style failure so recovery can refresh the shell.
        err.name = 'ChunkLoadError';
        throw err;
      }
      return { default: Comp };
    }),
  );
}

// Eager-load the homepage so the LCP portrait is discoverable without a route-chunk waterfall.
import { HomeSection } from '../../pages/HomeSection.jsx';
import { PUBLIC_STATIC_ROUTES } from '../../config/publicRoutes.js';
const AboutSection = lazyNamed(() => import('../../pages/AboutSection.jsx'), 'AboutSection');
const ProjectsSection = lazyNamed(() => import('../../pages/ProjectsSection.jsx'), 'ProjectsSection');
const LQFTBenchmarkPage = lazyNamed(() => import('../../pages/LQFTBenchmarkPage.jsx'), 'LQFTBenchmarkPage');
const CameraFxPage = lazyNamed(() => import('../../pages/CameraFxPage.jsx'), 'CameraFxPage');
const QaLabPage = lazyNamed(() => import('../../pages/QaLabPage.jsx'), 'QaLabPage');
const StatsPage = lazyNamed(() => import('../../pages/StatsPage.jsx'), 'StatsPage');
const BlogSection = lazyNamed(() => import('../../pages/BlogSection.jsx'), 'BlogSection');
const BlogPostPage = lazyNamed(() => import('../../pages/BlogPostPage.jsx'), 'BlogPostPage');
const ContactSection = lazyNamed(() => import('../../pages/ContactSection.jsx'), 'ContactSection');
const AdminLoginPage = lazyNamed(() => import('../../pages/admin/AdminLoginPage.jsx'), 'AdminLoginPage');
const AdminDashboard = lazyNamed(() => import('../../pages/admin/AdminDashboard.jsx'), 'AdminDashboard');
const NotFoundPage = lazyNamed(() => import('../../pages/NotFoundPage.jsx'), 'NotFoundPage');
const IntroCinematic = lazyNamed(() => import('../../pages/IntroCinematic.jsx'), 'IntroCinematic');
const CliMode = lazyNamed(() => import('../../pages/CliMode.jsx'), 'CliMode');
const MockInterviewPage = lazyNamed(() => import('../../pages/MockInterviewPage.jsx'), 'MockInterviewPage');
const TechNews = lazyNamed(() => import('../../pages/TechNews.jsx'), 'TechNews');
const DesktopOS = lazyNamed(() => import('../../pages/DesktopOS.jsx'), 'DesktopOS');
const ExplorePage = lazyNamed(() => import('../../pages/ExplorePage.jsx'), 'ExplorePage');
const AlgorithmMemorizerPage = lazyNamed(() => import('../../pages/AlgorithmMemorizerPage.jsx'), 'AlgorithmMemorizerPage');

const ROUTE_COMPONENTS = {
  home: HomeSection,
  about: AboutSection,
  projects: ProjectsSection,
  lqft: LQFTBenchmarkPage,
  cameraFx: CameraFxPage,
  qaLab: QaLabPage,
  blog: BlogSection,
  contact: ContactSection,
  stats: StatsPage,
  explore: ExplorePage,
  algoMem: AlgorithmMemorizerPage,
  techNews: TechNews,
  interview: MockInterviewPage,
  os: DesktopOS,
  cli: CliMode,
  intro: IntroCinematic,
};

const PUBLIC_ROUTES = [
  ...PUBLIC_STATIC_ROUTES.map((route) => ({
    path: route.path,
    Component: ROUTE_COMPONENTS[route.id],
  })).filter((route) => route.Component),
  // Dynamic article pages are not part of the static SEO manifest.
  { path: '/blog/:id', Component: BlogPostPage },
];

function routePath(prefix, path) {
  if (prefix === '/fr') {
    return path === '/' ? '/fr' : `/fr${path}`;
  }
  return path;
}

function lazyThemed(Component, theme) {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center py-20 px-4 text-gray-300">
        Loading...
      </div>
    }>
      <Component theme={theme} />
    </Suspense>
  );
}

export function buildAppRouteElements(theme) {
  const themed = (Component) => lazyThemed(Component, theme);

  return PUBLIC_ROUTES.flatMap(({ path, Component }) => [
    <Route key={`en-${path}`} path={routePath('', path)} element={themed(Component)} />,
    <Route key={`fr-${path}`} path={routePath('/fr', path)} element={themed(Component)} />,
  ]).concat([
    <Route key="admin-login" path="/admin/login" element={themed(AdminLoginPage)} />,
    <Route key="admin" path="/admin" element={<RequireAuth>{themed(AdminDashboard)}</RequireAuth>} />,
    <Route key="fr-admin-login" path="/fr/admin/login" element={themed(AdminLoginPage)} />,
    <Route key="fr-admin" path="/fr/admin" element={<RequireAuth>{themed(AdminDashboard)}</RequireAuth>} />,
    <Route key="not-found" path="*" element={themed(NotFoundPage)} />,
  ]);
}
