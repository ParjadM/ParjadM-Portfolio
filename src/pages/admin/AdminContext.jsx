import React, { createContext, useContext, useState, useCallback } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { Toast } from '../../components/ui/Toast.jsx';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [badges, setBadges] = useState({ pendingApps: 0, unreadContacts: 0, openErrors: 0 });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  }, []);

  const refreshBadges = useCallback(async () => {
    try {
      const data = await adminJson('/api/admin/overview');
      setBadges({
        pendingApps: data.pendingApps || 0,
        unreadContacts: data.unreadContacts || 0,
        openErrors: data.openErrors || 0,
      });
    } catch {}
  }, []);

  return (
    <AdminContext.Provider value={{ showToast, badges, refreshBadges, setBadges }}>
      {children}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
