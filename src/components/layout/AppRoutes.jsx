import React, { Suspense } from 'react';
import { Route, useRoutes } from 'react-router-dom';
import { RequireAuth } from '../../utils/auth.jsx';
import { lazyWithRetry } from '../../utils/lazyWithRetry.js';

const HomeSection = lazyWithRetry(() => import('../../pages/HomeSection.jsx').then(m => ({ default: m.HomeSection })));
const AboutSection = lazyWithRetry(() => import('../../pages/AboutSection.jsx').then(m => ({ default: m.AboutSection })));
const ProjectsSection = lazyWithRetry(() => import('../../pages/ProjectsSection.jsx').then(m => ({ default: m.ProjectsSection })));
const LQFTBenchmarkPage = lazyWithRetry(() => import('../../pages/LQFTBenchmarkPage.jsx').then(m => ({ default: m.LQFTBenchmarkPage })));
const StatsPage = lazyWithRetry(() => import('../../pages/StatsPage.jsx').then(m => ({ default: m.StatsPage })));
const BlogSection = lazyWithRetry(() => import('../../pages/BlogSection.jsx').then(m => ({ default: m.BlogSection })));
const BlogPostPage = lazyWithRetry(() => import('../../pages/BlogPostPage.jsx').then(m => ({ default: m.BlogPostPage })));
const ContactSection = lazyWithRetry(() => import('../../pages/ContactSection.jsx').then(m => ({ default: m.ContactSection })));
const AdminLoginPage = lazyWithRetry(() => import('../../pages/admin/AdminLoginPage.jsx').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazyWithRetry(() => import('../../pages/admin/AdminDashboard.jsx').then(m => ({ default: m.AdminDashboard })));
const NotFoundPage = lazyWithRetry(() => import('../../pages/NotFoundPage.jsx').then(m => ({ default: m.NotFoundPage })));
const IntroCinematic = lazyWithRetry(() => import('../../pages/IntroCinematic.jsx').then(m => ({ default: m.IntroCinematic })));
const CliMode = lazyWithRetry(() => import('../../pages/CliMode.jsx').then(m => ({ default: m.CliMode })));
const MockInterviewPage = lazyWithRetry(() => import('../../pages/MockInterviewPage.jsx').then(m => ({ default: m.MockInterviewPage })));
const TechNews = lazyWithRetry(() => import('../../pages/TechNews.jsx').then(m => ({ default: m.TechNews })));
const DesktopOS = lazyWithRetry(() => import('../../pages/DesktopOS.jsx').then(m => ({ default: m.DesktopOS })));
const ExplorePage = lazyWithRetry(() => import('../../pages/ExplorePage.jsx').then(m => ({ default: m.ExplorePage })));
const CollaborativeGardenPage = lazyWithRetry(() => import('../../pages/CollaborativeGardenPage.jsx').then(m => ({ default: m.CollaborativeGardenPage })));

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
  { path: '/garden', Component: CollaborativeGardenPage },
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
