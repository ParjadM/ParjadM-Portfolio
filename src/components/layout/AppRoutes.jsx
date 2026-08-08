import React, { Suspense } from 'react';
import { Route, useRoutes } from 'react-router-dom';
import { RequireAuth } from '../../utils/auth.jsx';
import { lazyWithRetry } from '../../utils/lazyWithRetry.js';

/** Resolve default or named export from a lazy route module (Vite shared chunks vary). */
function pickExport(mod, name) {
  if (!mod) return undefined;
  if (mod.default) return mod.default;
  if (name && mod[name]) return mod[name];
  // Shared admin chunk may expose a module namespace under `.f`
  if (mod.f) {
    if (mod.f.default) return mod.f.default;
    if (name && mod.f[name]) return mod.f[name];
  }
  return undefined;
}

function lazyNamed(factory, name) {
  return lazyWithRetry(() =>
    factory().then((mod) => {
      const Comp = pickExport(mod, name);
      if (!Comp) {
        throw new Error(`Failed to load route module export: ${name || 'default'}`);
      }
      return { default: Comp };
    }),
  );
}

const HomeSection = lazyNamed(() => import('../../pages/HomeSection.jsx'), 'HomeSection');
const AboutSection = lazyNamed(() => import('../../pages/AboutSection.jsx'), 'AboutSection');
const ProjectsSection = lazyNamed(() => import('../../pages/ProjectsSection.jsx'), 'ProjectsSection');
const LQFTBenchmarkPage = lazyNamed(() => import('../../pages/LQFTBenchmarkPage.jsx'), 'LQFTBenchmarkPage');
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

const PUBLIC_ROUTES = [
  { path: '/', Component: HomeSection },
  { path: '/about', Component: AboutSection },
  { path: '/projects', Component: ProjectsSection },
  { path: '/projects/lqftBenchmark', Component: LQFTBenchmarkPage },
  { path: '/stats', Component: StatsPage },
  { path: '/blog', Component: BlogSection },
  { path: '/blog/:id', Component: BlogPostPage },
  { path: '/contact', Component: ContactSection },
  { path: '/explore', Component: ExplorePage },
  { path: '/algorithm-memorizer', Component: AlgorithmMemorizerPage },
  { path: '/tech-news', Component: TechNews },
  { path: '/os', Component: DesktopOS },
  { path: '/intro', Component: IntroCinematic },
  { path: '/cli', Component: CliMode },
  { path: '/interview', Component: MockInterviewPage },
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

/** Hook-based routing for use outside a <Routes> wrapper. */
export function AppRoutes({ theme }) {
  const themed = (Component) => lazyThemed(Component, theme);

  return useRoutes([
    ...PUBLIC_ROUTES.flatMap(({ path, Component }) => [
      { path: routePath('', path), element: themed(Component) },
      { path: routePath('/fr', path), element: themed(Component) },
    ]),
    { path: '/admin/login', element: themed(AdminLoginPage) },
    { path: '/admin', element: <RequireAuth>{themed(AdminDashboard)}</RequireAuth> },
    { path: '/fr/admin/login', element: themed(AdminLoginPage) },
    { path: '/fr/admin', element: <RequireAuth>{themed(AdminDashboard)}</RequireAuth> },
    { path: '*', element: themed(NotFoundPage) },
  ]);
}
