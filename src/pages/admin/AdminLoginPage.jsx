import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../../components/ui/Icons.jsx';
import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { RippleButton } from '../../components/ui/RippleButton.jsx';
import { Toast } from '../../components/ui/Toast.jsx';
import { getAuthToken } from '../../utils/auth.jsx';

export const AdminLoginPage = ({ theme }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      try { localStorage.setItem('authToken', data.token); } catch {}
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const gradientClass = theme === 'pink' 
    ? 'bg-gradient-to-r from-pink-500 to-red-500' 
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="container mx-auto max-w-md w-full">
        <GlassCard className="p-8" theme={theme}>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Username</label>
              <input name="username" value={form.username} onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                placeholder="admin" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                placeholder="••••••••" required />
            </div>
            {error && <div className="text-red-300 text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${gradientClass} disabled:opacity-50`}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </GlassCard>
      </div>
    </section>
  );
};

