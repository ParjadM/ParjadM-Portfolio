import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminJson } from '../../utils/adminApi.js';
import { AdminProvider } from './AdminContext.jsx';
import { AdminLayout } from './AdminLayout.jsx';
import { AdminPanelSkeleton } from './components/AdminSkeleton.jsx';

const AdminOverview = React.lazy(() => import('./AdminOverview.jsx'));
const AdminBlogManager = React.lazy(() => import('./AdminBlogManager.jsx'));
const AdminProjectsManager = React.lazy(() => import('./AdminProjectsManager.jsx'));
const AdminAIManager = React.lazy(() => import('./AdminAIManager.jsx'));
const AdminAICostDashboard = React.lazy(() => import('./AdminAICostDashboard.jsx'));
const AdminInterviewManager = React.lazy(() => import('./AdminInterviewManager.jsx'));
const AdminAppStoreManager = React.lazy(() => import('./AdminAppStoreManager.jsx'));
const AdminContactInbox = React.lazy(() => import('./AdminContactInbox.jsx'));
const AdminMediaLibrary = React.lazy(() => import('./AdminMediaLibrary.jsx'));
const AdminAuditLog = React.lazy(() => import('./AdminAuditLog.jsx'));
const PremiumAnalytics = React.lazy(() => import('./PremiumAnalytics.jsx'));

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
      case 'audit': return <AdminAuditLog />;
      default: return <AdminOverview onNavigate={setTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setTab={setTab}>
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
