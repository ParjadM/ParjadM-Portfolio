import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminJson } from '../../utils/adminApi.js';
import { SEO } from '../../components/SEO.jsx';
import { AdminProvider } from './AdminContext.jsx';
import { AdminLayout } from './AdminLayout.jsx';
import { AdminPanelSkeleton } from './components/AdminSkeleton.jsx';

function lazyAdmin(factory, name) {
  return React.lazy(() =>
    factory().then((mod) => {
      const Comp = mod?.default || (name ? mod?.[name] : undefined) || mod?.f?.[name] || mod?.f?.default;
      if (!Comp) throw new Error(`Admin panel missing export: ${name || 'default'}`);
      return { default: Comp };
    }),
  );
}

const AdminOverview = lazyAdmin(() => import('./AdminOverview.jsx'), 'AdminOverview');
const AdminBlogManager = lazyAdmin(() => import('./AdminBlogManager.jsx'), 'AdminBlogManager');
const AdminProjectsManager = lazyAdmin(() => import('./AdminProjectsManager.jsx'), 'AdminProjectsManager');
const AdminAIManager = lazyAdmin(() => import('./AdminAIManager.jsx'), 'AdminAIManager');
const AdminAICostDashboard = lazyAdmin(() => import('./AdminAICostDashboard.jsx'), 'AdminAICostDashboard');
const AdminInterviewManager = lazyAdmin(() => import('./AdminInterviewManager.jsx'), 'AdminInterviewManager');
const AdminAppStoreManager = lazyAdmin(() => import('./AdminAppStoreManager.jsx'), 'AdminAppStoreManager');
const AdminContactInbox = lazyAdmin(() => import('./AdminContactInbox.jsx'), 'AdminContactInbox');
const AdminMediaLibrary = lazyAdmin(() => import('./AdminMediaLibrary.jsx'), 'AdminMediaLibrary');
const AdminAuditLog = lazyAdmin(() => import('./AdminAuditLog.jsx'), 'AdminAuditLog');
const PremiumAnalytics = lazyAdmin(() => import('./PremiumAnalytics.jsx'), 'PremiumAnalytics');
const AdminAlgorithmMemorizer = lazyAdmin(() => import('./AdminAlgorithmMemorizer.jsx'), 'AdminAlgorithmMemorizer');

function AdminDashboardContent({ theme }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  const [dbStatus, setDbStatus] = useState(null);

  const setTab = (tab) => setSearchParams({ tab }, { replace: true });

  useEffect(() => {
    adminJson('/api/admin/db-status').then(setDbStatus).catch(() => {});
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <AdminOverview onNavigate={setTab} />;
      case 'blog': return <AdminBlogManager />;
      case 'projects': return <AdminProjectsManager theme={theme} />;
      case 'analytics': return <PremiumAnalytics theme={theme} dbStatus={dbStatus} />;
      case 'contact': return <AdminContactInbox />;
      case 'app_store': return <AdminAppStoreManager />;
      case 'ai': return <AdminAIManager theme={theme} />;
      case 'ai_cost': return <AdminAICostDashboard theme={theme} />;
      case 'interview_ai': return <AdminInterviewManager theme={theme} />;
      case 'media': return <AdminMediaLibrary />;
      case 'algorithms': return <AdminAlgorithmMemorizer />;
      case 'audit': return <AdminAuditLog />;
      default: return <AdminOverview onNavigate={setTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setTab={setTab}>
      <SEO title="Admin — Parjad Minooei" description="Private admin area." noindex canonicalPath="/admin" englishOnly />
      <Suspense fallback={<AdminPanelSkeleton />}>
        {renderTab()}
      </Suspense>
    </AdminLayout>
  );
}

export const AdminDashboard = ({ theme }) => (
  <AdminProvider>
    <AdminDashboardContent theme={theme} />
  </AdminProvider>
);

export default AdminDashboard;
