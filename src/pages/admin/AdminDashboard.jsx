import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminJson } from '../../utils/adminApi.js';
import { AdminProvider } from './AdminContext.jsx';
import { AdminLayout } from './AdminLayout.jsx';
import { AdminOverview } from './AdminOverview.jsx';
import { AdminBlogManager } from './AdminBlogManager.jsx';
import { AdminProjectsManager } from './AdminProjectsManager.jsx';
import { AdminAIManager } from './AdminAIManager.jsx';
import { AdminAICostDashboard } from './AdminAICostDashboard.jsx';
import { AdminInterviewManager } from './AdminInterviewManager.jsx';
import { AdminAppStoreManager } from './AdminAppStoreManager.jsx';
import { AdminContactInbox } from './AdminContactInbox.jsx';
import { AdminMediaLibrary } from './AdminMediaLibrary.jsx';
import { AdminAuditLog } from './AdminAuditLog.jsx';
import { PremiumAnalytics } from './PremiumAnalytics.jsx';

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
      {renderTab()}
    </AdminLayout>
  );
}

export const AdminDashboard = ({ theme }) => (
  <AdminProvider>
    <AdminDashboardContent theme={theme} />
  </AdminProvider>
);
