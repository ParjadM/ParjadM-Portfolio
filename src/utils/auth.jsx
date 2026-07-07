import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminLoginPath } from './i18nRouting.js';

export const getAuthToken = () => {
  try { return localStorage.getItem('authToken'); } catch { return null; }
};

export const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const loginPath = getAdminLoginPath(window.location.pathname);
    if (!token) {
      navigate(loginPath, { replace: true });
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('unauthorized');
      })
      .then(() => setChecking(false))
      .catch(() => {
        try { localStorage.removeItem('authToken'); } catch {}
        navigate(loginPath, { replace: true });
      });
  }, [navigate]);

  if (checking) {
    return (
      <section className="min-h-screen flex items-center justify-center py-20 px-4 bg-gray-950">
        <div className="text-gray-300">Checking authentication…</div>
      </section>
    );
  }
  return children;
};
