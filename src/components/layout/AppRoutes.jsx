import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '../../utils/auth.jsx';

const HomeSection = React.lazy(() => import('../../pages/HomeSection.jsx').then(m => ({ default: m.HomeSection })));
const AboutSection = React.lazy(() => import('../../pages/AboutSection.jsx').then(m => ({ default: m.AboutSection })));
const ProjectsSection = React.lazy(() => import('../../pages/ProjectsSection.jsx').then(m => ({ default: m.ProjectsSection })));
const LQFTBenchmarkPage = React.lazy(() => import('../../pages/LQFTBenchmarkPage.jsx').then(m => ({ default: m.LQFTBenchmarkPage })));
const StatsPage = React.lazy(() => import('../../pages/StatsPage.jsx').then(m => ({ default: m.StatsPage })));
const BlogSection = React.lazy(() => import('../../pages/BlogSection.jsx').then(m => ({ default: m.BlogSection })));
const BlogPostPage = React.lazy(() => import('../../pages/BlogPostPage.jsx').then(m => ({ default: m.BlogPostPage })));
const ContactSection = React.lazy(() => import('../../pages/ContactSection.jsx').then(m => ({ default: m.ContactSection })));
const AdminLoginPage = React.lazy(() => import('../../pages/admin/AdminLoginPage.jsx').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = React.lazy(() => import('../../pages/admin/AdminDashboard.jsx').then(m => ({ default: m.AdminDashboard })));
const NotFoundPage = React.lazy(() => import('../../pages/NotFoundPage.jsx').then(m => ({ default: m.NotFoundPage })));
const IntroCinematic = React.lazy(() => import('../../pages/IntroCinematic.jsx').then(m => ({ default: m.IntroCinematic })));
const CliMode = React.lazy(() => import('../../pages/CliMode.jsx').then(m => ({ default: m.CliMode })));
const MockInterviewPage = React.lazy(() => import('../../pages/MockInterviewPage.jsx').then(m => ({ default: m.MockInterviewPage })));
const TechNews = React.lazy(() => import('../../pages/TechNews.jsx').then(m => ({ default: m.TechNews })));
const DesktopOS = React.lazy(() => import('../../pages/DesktopOS.jsx').then(m => ({ default: m.DesktopOS })));
const ExplorePage = React.lazy(() => import('../../pages/ExplorePage.jsx').then(m => ({ default: m.ExplorePage })));

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

export function AppRoutes({ theme }) {
  const themed = (Component) => <Component theme={theme} />;

  return (
    <>
      {PUBLIC_ROUTES.flatMap(({ path, Component }) => [
        <Route key={`en-${path}`} path={routePath('', path)} element={themed(Component)} />,
        <Route key={`fr-${path}`} path={routePath('/fr', path)} element={themed(Component)} />,
      ])}
      <Route path="/admin/login" element={themed(AdminLoginPage)} />
      <Route path="/admin" element={<RequireAuth>{themed(AdminDashboard)}</RequireAuth>} />
      <Route path="/fr/admin/login" element={themed(AdminLoginPage)} />
      <Route path="/fr/admin" element={<RequireAuth>{themed(AdminDashboard)}</RequireAuth>} />
      <Route path="*" element={themed(NotFoundPage)} />
    </>
  );
}
