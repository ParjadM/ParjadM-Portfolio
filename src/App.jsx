import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ParjadImage from './Images/Parjad.jpg';
import ParjadM from './Images/ParjadM.png';
import Logo from './Images/Logo.png';
import CodeQuestImage from './Images/CodeQuest.jpg';
import BinaryGeneratorImage from './Images/Binary 1010 Generator.jpg';
import SpaceShooterImage from './Images/SpaceShooter.jpg';

// ICONS - Using lucide-react for modern and clean icons
// In a real project, you would `npm install lucide-react`
// For this single-file setup, we'll create simple SVG icon components
const Mail = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Github = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Code = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const BrainCircuit = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.08-.6.08-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.28.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.36.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.73c0 .27.16.58.67.5A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z"/>
    </svg>
);

const Palette = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.667 0-.424-.16-.83-.437-1.145-.395-.453-.283-1.148.23-1.464.515-.317 1.178-.215 1.59.24.413.455.99.71 1.625.71C21.04 18.333 22 17.373 22 16c0-1.04-.96-2-2.333-2-1.43 0-2.5 1-2.5 2.5 0 .278.04.547.114.816-.12.08-.244.155-.37.23-.4.24-.8.36-1.24.36-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2h.5a2.5 2.5 0 0 0 2.5-2.5c0-1.4-1.1-2.5-2.5-2.5-1.1 0-2.06.8-2.39 1.84-.23.7-.82 1.16-1.51 1.16-.9 0-1.6-.7-1.6-1.6 0-.2.03-.4.1-.6-.3-.2-.7-.3-1.1-.3-1.1 0-2 .9-2 2s.9 2 2 2c.7 0 1.4-.4 1.7-.9.4-.6.3-1.3-.2-1.7-.5-.4-1.2-.5-1.7-.2-.5.3-1 .2-1.3-.3-.3-.5-.2-1.1.2-1.5.4-.4.9-.6 1.4-.6.6 0 1.2.2 1.6.6.3.3.7.5 1.1.5.4 0 .8-.2 1.1-.5.3-.3.7-.5 1.1-.5.4 0 .8.2 1.1.5.4.3.9.5 1.4.5.6 0 1.1-.2 1.5-.6.4-.4.8-.6 1.3-.6s.9.2 1.3.6c.2.2.5.3.8.3s.6-.1.8-.3c.4-.4.9-.6 1.3-.6.6 0 1.1.2 1.5.6.4.4.8.6 1.3.6s.9-.2 1.3-.6c.2-.2.5-.3.8-.3s.6.1.8.3Z"/>
    </svg>
);


const Menu = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);


// --- Enhanced Glass Card Component ---
const GlassCard = ({ children, className = '', theme = 'green' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const gradientClass = theme === 'green' 
    ? 'from-emerald-400 via-teal-400 to-cyan-400' 
    : 'from-pink-400 via-red-400 to-purple-400';

  return (
    <div 
      className={`relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg transition-all duration-500 hover:border-white/30 hover:shadow-2xl group overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.05), transparent 40%)`,
      }}
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} style={{ padding: '1px' }}>
        <div className="w-full h-full bg-transparent rounded-2xl"></div>
      </div>
      
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle Neon Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500`}></div>
      
      {/* Content */}
      <div className="relative z-10 group-hover:drop-shadow-lg">
        {children}
      </div>
    </div>
  );
};

// --- Admin Blog Manager ---
const AdminBlogManager = ({ theme }) => {
  const token = getAuthToken();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', tags: '', status: 'draft', publishAt: '', category: 'personal', image: '' });
  const [uploading, setUploading] = useState(false);
  const blogFileInputRef = useRef(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/blog', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing('new');
    setForm({ title: '', excerpt: '', content: '', tags: '', status: 'draft', publishAt: new Date().toISOString().slice(0,10), category: 'personal', image: '' });
  };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, excerpt: p.excerpt, content: p.content, tags: (p.tags||[]).join(','), status: p.status || 'draft', publishAt: (p.publishAt ? new Date(p.publishAt).toISOString().slice(0,10) : p.date), category: p.category || 'personal', image: p.image || '' });
  };
  const cancel = () => { setEditing(null); };
  const onChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const save = async () => {
    const body = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: form.status,
      publishAt: form.publishAt,
      category: form.category,
    };
    const opts = {
      method: editing === 'new' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    };
    const url = editing === 'new' ? '/api/admin/blog' : `/api/admin/blog/${editing}`;
    const res = await fetch(url, opts);
    if (!res.ok) { setError('Save failed'); return; }
    setEditing(null); load();
  };

  const uploadBlogImage = async (file) => {
    setUploading(true)
    try {
      const sigRes = await fetch('/api/admin/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folder: 'blog' })
      })
      if (!sigRes.ok) throw new Error('Failed to get signature')
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data && (data.error?.message || data.message)) || 'Upload failed')
      setForm(prev => ({ ...prev, image: data.secure_url }))
    } catch (e) {
      setError(`Image upload failed: ${e.message || e}`)
    } finally {
      setUploading(false)
    }
  }

  const publish = async (id) => {
    await fetch(`/api/admin/blog/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ publishAt: new Date().toISOString() }) });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div className="text-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl text-white font-bold">Blog</h3>
        <button onClick={startNew} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">New Post</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-300 mb-2">{error}</div>}

      {editing ? (
        <div className="space-y-4">
          <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <input name="excerpt" value={form.excerpt} onChange={onChange} placeholder="Excerpt" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <textarea name="content" value={form.content} onChange={onChange} rows={8} placeholder="Content" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          {/* Optional Cover Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <input name="image" value={form.image} onChange={onChange} placeholder="Cover image URL (optional)" className="md:col-span-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
            <div>
              <input ref={blogFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files&&e.target.files[0]; if (f) uploadBlogImage(f); e.target.value=''; }} />
              <button type="button" onClick={()=>blogFileInputRef.current && blogFileInputRef.current.click()} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
          {form.image && (
            <div className="mt-3 flex items-start gap-4">
              <img src={form.image} alt="Cover preview" className="w-40 h-28 object-cover rounded" />
              <div className="flex flex-col gap-2">
                <button type="button" onClick={()=>blogFileInputRef.current && blogFileInputRef.current.click()} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Change image</button>
                <button type="button" onClick={()=>setForm(prev=>({...prev, image: ''}))} className="px-3 py-2 rounded bg-red-600/70">Remove image</button>
              </div>
            </div>
          )}
          <input name="tags" value={form.tags} onChange={onChange} placeholder="tags (comma separated)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <select name="status" value={form.status} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <input type="date" name="publishAt" value={form.publishAt} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Category</label>
            <select name="category" value={form.category} onChange={onChange} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded">
              <option value="technology">Technology</option>
              <option value="tutorial">Tutorial</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 rounded bg-emerald-600/80">Save</button>
            <button onClick={cancel} className="px-4 py-2 rounded bg-white/10">Cancel</button>
          </div>
          {/* Preview */}
          <div className="mt-6">
            <h4 className="text-white font-semibold mb-2">Preview</h4>
            <div className="p-4 bg-white/5 rounded border border-white/10 whitespace-pre-wrap">{form.content}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
              <div>
                <div className="flex items-center gap-3">
                  {p.image && <img src={p.image} alt="" className="w-12 h-8 object-cover rounded" />}
                  <div className="text-white font-medium">{p.title}</div>
                </div>
                <div className="text-xs text-gray-400">{p.status || 'draft'} • {p.date}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="px-2 py-1 rounded bg-white/10">Edit</button>
                {p.status !== 'published' && <button onClick={() => publish(p.id)} className="px-2 py-1 rounded bg-emerald-600/80">Publish</button>}
                <button onClick={() => remove(p.id)} className="px-2 py-1 rounded bg-red-600/70">Delete</button>
              </div>
            </div>
          ))}
          {posts.length === 0 && !loading && <div className="text-gray-400">No posts yet.</div>}
        </div>
      )}
    </div>
  );
};

// --- Admin Projects Manager ---
const AdminProjectsManager = ({ theme }) => {
  const navigate = useNavigate();
  const token = getAuthToken();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // id or 'new'
  const [form, setForm] = useState({ title: '', description: '', tags: '', liveUrl: '', githubUrl: '', image: '', featured: false });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing('new'); setForm({ title: '', description: '', tags: '', liveUrl: '', githubUrl: '', image: '', featured: false }); };
  const startEdit = (p) => { setEditing(p.id); setForm({ title: p.title, description: p.description || '', tags: (p.tags||[]).join(','), liveUrl: p.liveUrl||'', githubUrl: p.githubUrl||'', image: p.image||'', featured: !!p.featured }); };
  const cancel = () => setEditing(null);
  const onChange = (e) => { const { name, value, type, checked } = e.target; setForm(prev => ({ ...prev, [name]: type==='checkbox' ? checked : value })); };

  const uploadToCloudinary = async (file) => {
    setUploading(true);
    try {
      // Ask server for signature (protected under admin)
      const sigRes = await fetch('/api/admin/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folder: 'projects' })
      })
      if (sigRes.status === 401) {
        try { localStorage.removeItem('authToken'); } catch {}
        setError('Session expired. Please sign in again.');
        setUploading(false);
        navigate('/admin/login', { replace: true });
        return;
      }
      if (!sigRes.ok) {
        const errText = await sigRes.text().catch(()=> '')
        throw new Error(errText || 'Signature failed')
      }
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (data && (data.error?.message || data.message)) || 'Upload failed'
        throw new Error(msg)
      }
      setForm(prev => ({ ...prev, image: data.secure_url }))
    } catch (e) {
      setError(`Image upload failed: ${e.message || e}`)
    } finally {
      setUploading(false)
    }
  };

  const save = async () => {
    const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const opts = { method: editing==='new' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) };
    const url = editing==='new' ? '/api/admin/projects' : `/api/admin/projects/${editing}`;
    const res = await fetch(url, opts);
    if (!res.ok) { setError('Save failed'); return; }
    setEditing(null); load();
  };

  const remove = async (id) => { if (!confirm('Delete this project?')) return; await fetch(`/api/admin/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  const feature = async (id, featured) => { await fetch(`/api/admin/projects/${id}/feature`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ featured }) }); load(); };
  const move = async (fromIdx, toIdx) => {
    const arr = [...projects];
    const [spliced] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, spliced);
    setProjects(arr);
    const ids = arr.map(p => p.id);
    await fetch('/api/admin/projects/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ids }) });
  };

  return (
    <div className="text-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl text-white font-bold">Projects</h3>
        <div className="flex gap-2">
          <button onClick={async () => { await fetch('/api/admin/seed-projects', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); load(); }} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Seed demo</button>
          <button onClick={startNew} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">New Project</button>
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-300 mb-2">{error}</div>}

      {editing ? (
        <div className="space-y-4">
          <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <textarea name="description" value={form.description} onChange={onChange} rows={5} placeholder="Description" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <input name="tags" value={form.tags} onChange={onChange} placeholder="tags (comma separated)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <input name="liveUrl" value={form.liveUrl} onChange={onChange} placeholder="Live URL" className="px-3 py-2 bg-white/5 border border-white/10 rounded" />
            <input name="githubUrl" value={form.githubUrl} onChange={onChange} placeholder="GitHub URL" className="px-3 py-2 bg-white/5 border border-white/10 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <input name="image" value={form.image} onChange={onChange} placeholder="Image URL" className="md:col-span-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{ const file=e.target.files && e.target.files[0]; if (file) uploadToCloudinary(file); e.target.value=''; }} />
              <button type="button" onClick={()=>fileInputRef.current && fileInputRef.current.click()} className="w-full px-3 py-2 rounded bg-white/10 hover:bg-white/20">
                {uploading ? 'Uploading...' : 'Upload image'}
              </button>
            </div>
          </div>
          {form.image && (
            <div className="mt-3 flex items-start gap-4">
              <img src={form.image} alt="Preview" className="w-40 h-28 object-cover rounded" />
              <div className="flex flex-col gap-2">
                <button type="button" onClick={()=>fileInputRef.current && fileInputRef.current.click()} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Change image</button>
                <button type="button" onClick={()=>setForm(prev=>({...prev, image: ''}))} className="px-3 py-2 rounded bg-red-600/70">Remove image</button>
              </div>
            </div>
          )}
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="featured" checked={form.featured} onChange={onChange} /> Featured</label>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 rounded bg-emerald-600/80">Save</button>
            <button onClick={cancel} className="px-4 py-2 rounded bg-white/10">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
              <div>
                <div className="text-white font-medium">{p.title}</div>
                <div className="text-xs text-gray-400">{p.featured ? 'Featured • ' : ''}{(p.tags||[]).join(', ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => p.featured ? feature(p.id, false) : feature(p.id, true)} className="px-2 py-1 rounded bg-white/10">{p.featured ? 'Unfeature' : 'Feature'}</button>
                <button disabled={idx===0} onClick={() => move(idx, idx-1)} className="px-2 py-1 rounded bg-white/10 disabled:opacity-40">Up</button>
                <button disabled={idx===projects.length-1} onClick={() => move(idx, idx+1)} className="px-2 py-1 rounded bg-white/10 disabled:opacity-40">Down</button>
                <button onClick={() => startEdit(p)} className="px-2 py-1 rounded bg-white/10">Edit</button>
                <button onClick={() => remove(p.id)} className="px-2 py-1 rounded bg-red-600/70">Delete</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && !loading && <div className="text-gray-400">No projects yet.</div>}
        </div>
      )}
    </div>
  );
};

// --- Enhanced Button Component with Ripple Effect ---
const RippleButton = ({ children, onClick, className = '', theme = 'green', ...props }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  const gradientClass = theme === 'green' 
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400' 
    : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400';

  return (
    <button
      className={`relative overflow-hidden transform transition-all duration-300 hover:scale-105 active:scale-95 ${gradientClass} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms',
          }}
        />
      ))}
      
      {/* Button Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// --- Notification Toast Component ---
const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    error: 'bg-red-500/20 border-red-500/30 text-red-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  };

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-20 right-4 z-50 p-4 rounded-lg border backdrop-blur-lg ${typeStyles[type]} transform transition-all duration-500 translate-x-0 opacity-100`}>
      <div className="flex items-center space-x-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close notification">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// --- Header Component ---
const Header = ({ toggleTheme, theme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [visitors, setVisitors] = useState(null);
    const location = useLocation();
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Projects', path: '/projects' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' }
    ];

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        fetch('/api/metrics')
          .then(res => res.ok ? res.json() : { uniqueVisitors: 0 })
          .then(d => setVisitors(d.uniqueVisitors || 0))
          .catch(() => setVisitors(null));
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* Skip to content for screen readers/keyboard users */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to main content</a>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center" role="navigation" aria-label="Primary">
                <Link to="/" className="text-2xl font-bold text-white tracking-wider inline-flex items-center">
                    <img src={Logo} alt="Logo" className="h-[4.5rem] w-auto" />
                </Link>
                
                {/* Desktop Menu */}
                <div className="hidden md:block">
                     <GlassCard className="!rounded-full" theme={theme}>
                        <div className="flex items-center space-x-1 px-3 py-2">
                            {navItems.map(item => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
                                    aria-current={isActive(item.path) ? 'page' : undefined}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {visitors !== null && (
                              <div className="ml-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm font-semibold whitespace-nowrap">
                                {visitors} Visitors
                              </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white" aria-controls="primary-menu" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
                        <Menu size={28} />
                    </button>
                </div>
            </nav>
            {/* Mobile Menu */}
            {isMenuOpen && (
                 <div className="md:hidden mt-2 px-6" id="primary-menu">
                    <GlassCard className="w-full" theme={theme}>
                        <div className="flex flex-col items-center space-y-2 p-4">
                            {navItems.map(item => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={`block w-full text-center px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-300 ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
                                    aria-current={isActive(item.path) ? 'page' : undefined}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {visitors !== null && (
                              <div className="mt-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm w-full text-center">
                                {visitors} Visitors
                              </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}
        </header>
    );
};


// --- Background Blobs ---
const BackgroundBlobs = ({ theme }) => {
    const pinkThemeClasses = {
        blob1: "bg-pink-500/30",
        blob2: "bg-red-500/30",
        blob3: "bg-purple-500/20",
    };
    const greenThemeClasses = {
        blob1: "bg-emerald-500/30",
        blob2: "bg-teal-500/30",
        blob3: "bg-cyan-500/20",
    };
    const themeClasses = theme === 'green' ? greenThemeClasses : pinkThemeClasses;

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full filter blur-3xl opacity-50 animate-blob ${themeClasses.blob1}`}></div>
            <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000 ${themeClasses.blob2}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000 ${themeClasses.blob3}`}></div>
        </div>
    );
};


// --- Section Components ---
const HomeSection = ({ theme }) => {
  const navigate = useNavigate();
  // Visitors shown in header now

  return (
  <section id="home" className="min-h-screen flex items-center text-white relative overflow-hidden">
    <div className="z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Left: Text content */}
      <div className="p-6 md:p-0 text-left">
        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight bg-gradient-to-r ${theme === 'green' ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-pink-400 via-red-400 to-purple-400'} bg-clip-text text-transparent animate-pulse`}>
          Parjad Minooei
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-2xl">
          A creative <span className={theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}>Web Developer</span> with a passion for building beautiful, functional, and user-centric web applications.
        </p>
        <div className="mt-8 flex justify-start space-x-6">
          <a href="https://github.com/ParjadM" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110"><Github size={32} /></a>
          <a href="https://www.linkedin.com/in/parjadminooei" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110"><Linkedin size={32} /></a>
        </div>
        <RippleButton 
          onClick={() => navigate('/contact')} 
          className="mt-10 px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
          theme={theme}
        >
          Get in Touch
        </RippleButton>

        
      </div>

      {/* Right: Portrait image */}
      <div className="flex justify-center md:justify-end p-6 md:p-0">
        <img 
          src={ParjadM} 
          alt="Parjad Minooei"
          className="w-64 md:w-80 lg:w-[28rem]"
        />
      </div>
    </div>
  </section>
);
};

const AboutSection = ({ theme }) => {
    const [activeTab, setActiveTab] = useState('story');

    const tabs = [
        { id: 'story', label: 'My Story' },
        { id: 'education', label: 'Education' },
        { id: 'interests', label: 'Interests' }
    ];

    const tabContent = {
        story: {
            title: "My Journey",
            content: (
                <div className="space-y-6">
                    <p className="text-gray-300 leading-relaxed">
                        I am a dedicated developer based in Scarborough, ON, with a unique background blending Psychology and Computer Programming & Analysis. This combination gives me a distinct perspective on user experience and logical problem-solving.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        Currently, I'm enhancing my skills with a graduate certificate in web development. My journey in tech started with curiosity about how things work, and it has evolved into a passion for creating solutions that make a difference.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        When I'm not coding, you can find me diving into video games, staying active at the gym, or sharpening my mind with math problems and LeetCode challenges. I thrive on continuous learning and applying my skills to create elegant and efficient software solutions.
                    </p>
                </div>
            )
        },
        education: {
            title: "Education & Learning",
            content: (
                <div className="space-y-6">
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Graduate Certificate in Web Development</h4>
                        <p className="text-gray-400 mb-1">Current</p>
                        <p className="text-gray-300">Advanced web development techniques, modern frameworks, and industry best practices.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Computer Programming & Analysis</h4>
                        <p className="text-gray-400 mb-1">Previous Studies</p>
                        <p className="text-gray-300">Comprehensive programming education covering software development and analytical problem-solving.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Psychology</h4>
                        <p className="text-gray-400 mb-1">Previous Studies</p>
                        <p className="text-gray-300">Understanding human behavior and cognition, providing valuable insights into user experience design.</p>
                    </div>
                </div>
            )
        },
        interests: {
            title: "Beyond Code",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Creative Pursuits</h4>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">Gaming & Game Development</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">UI/UX Design</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Learning & Growth</h4>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">LeetCode Challenges</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">Fitness & Wellness</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">Mathematics & Algorithms</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const borderColor = theme === 'pink' ? "border-pink-400" : "border-emerald-400";

    return (
        <section id="about" className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">About Me</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Get to know the person behind the code
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-8 text-center" theme={theme}>
                            <div className={`w-48 h-48 mx-auto mb-6 rounded-full p-2 shadow-lg ${theme === 'pink' ? 'bg-gradient-to-br from-pink-500/50 to-red-500/50' : 'bg-gradient-to-br from-emerald-500/50 to-teal-500/50'}`}>
                                <img 
                                    src={ParjadImage}
                                    alt="Parjad Minooei" 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Parjad Minooei</h3>
                            <p className="text-gray-400 mb-4">Web Developer</p>
                            <p className="text-gray-300 text-sm mb-6">
                                Based in Scarborough, ON • Multidisciplinary background
                            </p>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 gap-4 mb-6">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${iconColor}`}>3+</div>
                                    <div className="text-gray-400 text-sm">Years Learning</div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center space-x-4">
                                <a href="https://github.com/ParjadM" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-gray-300 hover:text-white">
                                    <Github size={20} />
                                </a>
                                <a href="https://www.linkedin.com/in/parjadminooei" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-gray-300 hover:text-white">
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-2">
                        <GlassCard className="p-8" theme={theme}>
                            {/* Tab Navigation */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? `${theme === 'pink' ? 'bg-pink-500/20' : 'bg-emerald-500/20'} text-white border-2 ${borderColor}`
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-6">
                                    {tabContent[activeTab].title}
                                </h3>
                                {tabContent[activeTab].content}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </section>
    );
};


const ProjectsSection = ({ theme }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Map known titles to local images to keep visuals after API switch
    const imageMap = {
        'CodeQuest': CodeQuestImage,
        'Binary 1010 Generator': BinaryGeneratorImage,
        'SpaceShooter': SpaceShooterImage,
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true); setError('');
            try {
                const res = await fetch('/api/projects');
                const data = await res.json();
                setProjects(Array.isArray(data.projects) ? data.projects : []);
            } catch (e) {
                setError('Failed to load projects');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const tagClasses = theme === 'pink'
        ? "bg-pink-500/20 text-pink-300"
        : "bg-emerald-500/20 text-emerald-300";

    return (
        <section id="projects" className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">My Projects</h2>
            {error && <div className="text-red-300 mb-4">{error}</div>}
            {loading && <div className="text-gray-300">Loading...</div>}
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <GlassCard key={project.id || project.title} className="p-0 flex flex-col overflow-hidden">
                        {/* Project Image */}
                        <div className="w-full h-48 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden">
                            <img 
                                src={project.image || imageMap[project.title] || `https://placehold.co/600x400/${theme === 'pink' ? 'E94560' : '10B981'}/FFFFFF?text=${encodeURIComponent(project.title)}`}
                                alt={project.title}
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300"
                            />
                        </div>
                        
                        <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(project.tags || []).map(tag => <span key={tag} className={`${tagClasses} text-xs font-semibold px-2.5 py-1 rounded-full`}>{tag}</span>)}
                        </div>
                        <p className="text-gray-300 mb-6 flex-grow">{project.description}</p>
                        <div className="flex justify-end space-x-4 mt-auto">
                           {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110"><Github size={24} /></a>}
                           {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                           </a>}
                            </div>
                        </div>
                    </GlassCard>
                ))}
                {!loading && projects.length === 0 && (
                    <div className="col-span-full text-center text-gray-400">No projects yet.</div>
                )}
            </div>
        </section>
    );
};

const SkillsSection = ({ theme }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [hoveredSkill, setHoveredSkill] = useState(null);

    const skillCategories = {
        'all': 'All Skills',
        'frontend': 'Frontend',
        'backend': 'Backend',
        'tools': 'Tools & Others'
    };

    const skills = [
        { 
            name: "JavaScript (ES6+)", 
            icon: <Code/>, 
            category: 'frontend',
            level: 90,
            description: "Modern JavaScript with ES6+ features, async programming, and DOM manipulation",
            years: "3+ years"
        },
        { 
            name: "React", 
            icon: <Code/>, 
            category: 'frontend',
            level: 85,
            description: "Building dynamic user interfaces with hooks, context, and component architecture",
            years: "2+ years"
        },
        { 
            name: "Node.js", 
            icon: <Code/>, 
            category: 'backend',
            level: 80,
            description: "Server-side JavaScript development with Express and RESTful APIs",
            years: "2+ years"
        },
        { 
            name: "Python", 
            icon: <Code/>, 
            category: 'backend',
            level: 75,
            description: "Data analysis, automation scripts, and backend development",
            years: "2+ years"
        },
        { 
            name: "HTML & CSS", 
            icon: <Code/>, 
            category: 'frontend',
            level: 95,
            description: "Semantic markup, responsive design, and modern CSS techniques",
            years: "3+ years"
        },
        { 
            name: "Tailwind CSS", 
            icon: <Code/>, 
            category: 'frontend',
            level: 90,
            description: "Utility-first CSS framework for rapid UI development",
            years: "2+ years"
        },
        { 
            name: "SQL & NoSQL", 
            icon: <Code/>, 
            category: 'backend',
            level: 70,
            description: "Database design, queries, and data modeling with MySQL and MongoDB",
            years: "1+ years"
        },
        { 
            name: "Git & GitHub", 
            icon: <Github/>, 
            category: 'tools',
            level: 85,
            description: "Version control, collaborative development, and project management",
            years: "3+ years"
        },
        { 
            name: "Problem Solving", 
            icon: <BrainCircuit/>, 
            category: 'tools',
            level: 95,
            description: "Algorithm design, debugging, and systematic approach to complex challenges",
            years: "5+ years"
        },
    ];

    const filteredSkills = selectedCategory === 'all' 
        ? skills 
        : skills.filter(skill => skill.category === selectedCategory);

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const progressColor = theme === 'pink' ? "bg-pink-500" : "bg-emerald-500";
    const categoryBgColor = theme === 'pink' ? "bg-pink-500/20" : "bg-emerald-500/20";

    return(
        <section id="skills" className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Technical Skills</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        A comprehensive overview of my technical expertise and proficiency levels
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {Object.entries(skillCategories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                selectedCategory === key
                                    ? `${categoryBgColor} text-white border-2 border-white/30`
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSkills.map((skill, index) => (
                        <GlassCard 
                            key={skill.name} 
                            className="p-6 relative overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >
                            {/* Skill Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 ${iconColor}`}>
                                        {React.cloneElement(skill.icon, { size: 24 })}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                                        <p className="text-gray-400 text-sm">{skill.years}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-300">Proficiency</span>
                                    <span className="text-sm font-medium text-white">{skill.level}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-1000 ${progressColor}`}
                                        style={{ width: `${skill.level}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {skill.description}
                            </p>

                            {/* Hover Effect Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme === 'pink' ? 'from-pink-500/10' : 'from-emerald-500/10'}`}></div>
                        </GlassCard>
                    ))}
                </div>

                {/* Skills Summary */}
                <div>
                    <GlassCard className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                            <div>
                                <div className={`text-4xl font-bold mb-2 ${iconColor}`}>
                                    {skills.length}+
                                </div>
                                <div className="text-gray-300">Technologies</div>
                            </div>
                            <div>
                                <div className={`text-4xl font-bold mb-2 ${iconColor}`}>
                                    3+
                                </div>
                                <div className="text-gray-300">Years Experience</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};

const BlogSection = ({ theme }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = {
        'all': 'All Posts',
        'technology': 'Technology',
        'tutorial': 'Tutorials',
        'personal': 'Personal'
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blog');
                const data = await res.json();
                setPosts(Array.isArray(data.posts) ? data.posts : []);
            } catch (e) {
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = selectedCategory === 'all' 
        ? posts 
        : posts.filter(post => post.category === selectedCategory);
    const featuredPost = selectedCategory === 'all' && posts.length > 0 ? posts[0] : null;

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const categoryBgColor = theme === 'pink' ? "bg-pink-500/20" : "bg-emerald-500/20";
    const tagColor = theme === 'pink' ? "bg-pink-500/20 text-pink-300" : "bg-emerald-500/20 text-emerald-300";

    return (
        <section id="blog" className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog & Articles</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Thoughts, tutorials, and insights about technology, development, and my journey in tech
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                selectedCategory === key
                                    ? `${categoryBgColor} text-white border-2 border-white/30`
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Featured (Blog Section) */}
                {selectedCategory === 'all' && featuredPost && (
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">Featured</h3>
                        <Link to={`/blog/${featuredPost.id}`} className="block">
                            <GlassCard className="p-6 md:p-8 group cursor-pointer hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                                        {categories[featuredPost.category] || 'Post'}
                                    </span>
                                    <span className="text-gray-400 text-xs">{featuredPost.readTime} • {featuredPost.date}</span>
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300">
                                    {featuredPost.title}
                                </h4>
                                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(featuredPost.tags || []).slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>
                        </Link>
                    </div>
                )}

                {/* Posts */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">
                        {selectedCategory === 'all' ? 'Blog' : `${categories[selectedCategory]} Articles`}
                    </h3>
                    {loading && <div className="text-center text-gray-300">Loading...</div>}
                    {error && <div className="text-center text-red-300">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <Link key={post.id} to={`/blog/${post.id}`} className="block">
                            <GlassCard className="p-6 group cursor-pointer hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                                        {categories[post.category]}
                                    </span>
                                    <span className="text-gray-400 text-xs">{post.readTime}</span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300">
                                    {post.title}
                                </h4>
                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {post.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">{post.date}</span>
                                    <span className={`text-xs font-medium ${iconColor} group-hover:translate-x-1 transition-transform duration-300`}>
                                        Read →
                                    </span>
                                </div>
                            </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const BlogPostPage = ({ theme }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`);
                if (!res.ok) {
                    throw new Error('Not found');
                }
                const data = await res.json();
                setPost(data.post);
            } catch (e) {
                setError('Post not found');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 px-4">
                <div className="text-gray-300">Loading...</div>
            </section>
        );
    }

    if (error || !post) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <GlassCard className="p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
                        <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-emerald-400 hover:underline">Back to Blog</button>
                    </GlassCard>
                </div>
            </section>
        );
    }

    const tagColor = theme === 'pink' ? "bg-pink-500/20 text-pink-300" : "bg-emerald-500/20 text-emerald-300";

    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <div className="mb-6">
                    <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-gray-300 hover:text-white">← Back to Blog</button>
                </div>
                <GlassCard className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tagColor}`}>{post.category || 'personal'}</span>
                        <span className="text-gray-400 text-xs">{post.readTime} • {post.date}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-6">{post.title}</h1>
                    <div className="text-gray-300 leading-7 whitespace-pre-line">
                        {post.content}
                    </div>
                </GlassCard>
            </div>
        </section>
    );
};

// --- Auth Utilities ---
const getAuthToken = () => {
  try { return localStorage.getItem('authToken'); } catch { return null; }
};

// --- RequireAuth Wrapper ---
const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    // Validate token
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('unauthorized');
      })
      .then(() => setChecking(false))
      .catch(() => {
        try { localStorage.removeItem('authToken'); } catch {}
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);
  if (checking) {
    return (
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="text-gray-300">Checking authentication...</div>
      </section>
    );
  }
  return children;
};

// --- Admin Login Page ---
const AdminLoginPage = ({ theme }) => {
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

// --- Admin Dashboard ---
const AdminDashboard = ({ theme }) => {
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [range, setRange] = useState(7);
  const [series, setSeries] = useState([]);
  const [activeTab, setActiveTab] = useState('blog'); // 'blog' | 'projects' | 'status'
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch('/api/admin/db-status', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(setDbStatus)
      .catch(() => setError('Failed to load admin data'))
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then(setMetrics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Public metrics time series
    fetch(`/api/metrics/series?range=${range}`)
      .then(res => res.ok ? res.json() : { series: [] })
      .then(d => setSeries(Array.isArray(d.series) ? d.series : []))
      .catch(() => setSeries([]))
  }, [range]);

  const handleLogout = async () => {
    const token = getAuthToken();
    if (token) {
      try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
      try { localStorage.removeItem('authToken'); } catch {}
    }
    navigate('/admin/login', { replace: true });
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <GlassCard className="p-8" theme={theme}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <button onClick={handleLogout} className="px-4 py-2 rounded bg-white/10 text-gray-200 hover:bg-white/20">Log out</button>
          </div>
          {error && <div className="text-red-300 mb-4">{error}</div>}

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {['blog','projects','status'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded ${activeTab===tab ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {tab === 'blog' ? 'Blog' : tab === 'projects' ? 'Projects' : 'System'}
              </button>
            ))}
          </div>

          {activeTab === 'status' && (
            <div className="text-gray-300">
              <div className="mb-2">DB Engine: <span className="text-white">{dbStatus?.engine || 'unknown'}</span></div>
              {dbStatus && 'connected' in dbStatus && (
                <div className="mb-4">Connected: <span className="text-white">{String(dbStatus.connected)}</span></div>
              )}
              {metrics && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded bg-white/5 border border-white/10 text-center">
                    <div className="text-2xl font-bold">{metrics.uniqueVisitors}</div>
                    <div className="text-sm text-gray-300">Visitors</div>
                  </div>
                  <div className="p-4 rounded bg-white/5 border border-white/10 text-center">
                    <div className="text-2xl font-bold">{metrics.pageviews}</div>
                    <div className="text-sm text-gray-300">Impressions</div>
                  </div>
                </div>
              )}

              {/* Range toggle */}
              <div className="mt-6 flex gap-2">
                {[7,30].map(r => (
                  <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded ${range===r ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'}`}>{r}-day</button>
                ))}
              </div>

              {/* Simple SVG line chart */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded">
                <Chart theme={theme} data={series} />
              </div>
            </div>
          )}

          {activeTab === 'blog' && <AdminBlogManager theme={theme} />}
          {activeTab === 'projects' && <AdminProjectsManager theme={theme} />}
        </GlassCard>
      </div>
    </section>
  );
};

// --- Tiny Line Chart Component ---
const Chart = ({ theme, data }) => {
  const width = 640, height = 220, padding = 32
  const xs = data.map((_, i) => i)
  const maxY = Math.max(1, ...data.map(d => Math.max(d.pageviews || 0, d.uniqueVisitors || 0)))
  const x = (i) => padding + (i * (width - 2*padding)) / Math.max(1, (data.length - 1))
  const y = (v) => height - padding - (v * (height - 2*padding)) / maxY
  const toPath = (vals) => vals.map((v, i) => `${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ')
  const pv = toPath(data.map(d => d.pageviews || 0))
  const uv = toPath(data.map(d => d.uniqueVisitors || 0))
  const gridY = Array.from({length: 4}, (_,i)=>Math.round((maxY*i)/3))
  const colorA = theme === 'pink' ? '#fb7185' : '#34d399'
  const colorB = theme === 'pink' ? '#a78bfa' : '#22d3ee'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* axes */}
      <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.2)" />
      <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="rgba(255,255,255,0.2)" />
      {gridY.map((gy,i)=> (
        <g key={i}>
          <line x1={padding} y1={y(gy)} x2={width-padding} y2={y(gy)} stroke="rgba(255,255,255,0.1)" />
          <text x={8} y={y(gy)+4} fontSize="10" fill="rgba(255,255,255,0.6)">{gy}</text>
        </g>
      ))}
      {/* lines */}
      <path d={pv} fill="none" stroke={colorA} strokeWidth="2.5" />
      <path d={uv} fill="none" stroke={colorB} strokeWidth="2.5" />
      {/* legend */}
      <g>
        <circle cx={width-200} cy={16} r={4} fill={colorA} />
        <text x={width-190} y={20} fontSize="12" fill="white">Impressions</text>
        <circle cx={width-100} cy={16} r={4} fill={colorB} />
        <text x={width-90} y={20} fontSize="12" fill="white">Visitors</text>
      </g>
    </svg>
  )
}

const ContactSection = ({ theme }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('');
        
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                throw new Error('Failed to send');
            }
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus(''), 3000);
        }
    };

    const contactMethods = [
        {
            icon: <Github size={24} />,
            title: "GitHub",
            value: "github.com/ParjadM",
            href: "https://github.com/ParjadM",
            description: "Check out my code"
        },
        {
            icon: <Linkedin size={24} />,
            title: "LinkedIn",
            value: "linkedin.com/in/parjadminooei",
            href: "https://www.linkedin.com/in/parjadminooei",
            description: "Connect professionally"
        }
    ];

    const gradientClass = theme === 'pink' 
        ? 'bg-gradient-to-r from-pink-500 to-red-500' 
        : 'bg-gradient-to-r from-emerald-500 to-teal-500';

    return (
        <section id="contact" className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Let's Connect</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        I'm currently seeking new opportunities and am open to collaboration. 
                        Whether you have a question or just want to say hi, feel free to reach out.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <GlassCard className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-6">Send me a message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Honeypot field */}
                            <div className="hidden" aria-hidden="true">
                                <label>
                                    Company
                                    <input name="company" tabIndex={-1} autoComplete="off" onChange={(e)=>setFormData(prev=>({...prev, company: e.target.value}))} />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                    placeholder="What's this about?"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 resize-none"
                                    placeholder="Tell me about your project or just say hello!"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${gradientClass}`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Sending...
                                    </div>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                            
                            {submitStatus === 'success' && (
                                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-center">
                                    ✅ Message sent successfully! I'll get back to you soon.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
                                    ❌ Failed to send message. Please try again later.
                                </div>
                            )}
                        </form>
                    </GlassCard>

                    {/* Contact Methods */}
                    <div className="space-y-8">
                        <GlassCard className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Get in touch</h3>
                            <div className="space-y-6">
                                {contactMethods.map((method, index) => (
                                    <a
                                        key={index}
                                        href={method.href}
                                        target={method.href.startsWith('http') ? '_blank' : '_self'}
                                        rel={method.href.startsWith('http') ? 'noopener noreferrer' : ''}
                                        className="flex items-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                                    >
                                        <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`}>
                                            {method.icon}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="font-semibold text-white group-hover:text-white transition-colors duration-300">
                                                {method.title}
                                            </h4>
                                            <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-300">
                                                {method.value}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {method.description}
                                            </p>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                <polyline points="15 3 21 3 21 9"/>
                                                <line x1="10" y1="14" x2="21" y2="3"/>
                                            </svg>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Quick Stats */}
                        <GlassCard className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Quick facts</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`}>
                                        &lt;24h
                                    </div>
                                    <div className="text-gray-300 text-sm">Response time</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`}>
                                        100%
                                    </div>
                                    <div className="text-gray-300 text-sm">Availability</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </section>
    );
};


// --- Footer Component ---
const Footer = ({ theme }) => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Projects', path: '/projects' },
        { name: 'Contact', path: '/contact' }
    ];

    const socialLinks = [
        { 
            name: 'GitHub', 
            url: 'https://github.com/ParjadM',
            icon: <Github size={24} />
        },
        { 
            name: 'LinkedIn', 
            url: 'https://www.linkedin.com/in/parjadminooei',
            icon: <Linkedin size={24} />
        }
    ];

    return (
        <footer className="relative mt-20">
            {/* Decorative Top Border */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            
            <div className="container mx-auto px-6 py-16">
                {/* Main Content - Centered Layout */}
                <div className="max-w-4xl mx-auto">
                    {/* Brand & Description */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Parjad Minooei
                        </h2>
                        <p className="text-gray-300 text-base max-w-2xl mx-auto leading-relaxed">
                            Web Developer passionate about creating beautiful, functional web applications with a focus on user experience.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="mb-10">
                        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                            {navLinks.map(link => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 text-sm font-medium relative group"
                                    >
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-6 mb-10">
                        {socialLinks.map(social => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative"
                                aria-label={social.name}
                            >
                                <div className="p-4 bg-white/5 rounded-xl hover:bg-emerald-500/10 transition-all duration-300 text-gray-300 hover:text-emerald-400 transform hover:scale-110 hover:-translate-y-1">
                                    {social.icon}
                                </div>
                                {/* Tooltip */}
                                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                                    {social.name}
                                </span>
                            </a>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// --- Layout Component (wraps all pages) ---
const Layout = ({ theme, toggleTheme, toast, setToast }) => {
    const location = useLocation();
    const [visitorId, setVisitorId] = useState(null);

    useEffect(() => {
        // Ensure stable visitorId
        try {
            let vid = null
            try { vid = localStorage.getItem('visitorId') } catch {}
            if (!vid && typeof window !== 'undefined' && window.crypto?.getRandomValues) {
                const arr = new Uint8Array(16)
                window.crypto.getRandomValues(arr)
                vid = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
                try { localStorage.setItem('visitorId', vid) } catch {}
            }
            setVisitorId(vid)
        } catch {}
    }, [])

    useEffect(() => {
        // Track each route view
        try {
            const path = location?.pathname || '/'
            fetch('/api/metrics/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId: visitorId || '', path })
            }).catch(() => {})
        } catch {}
    }, [location?.pathname, visitorId])

    // Basic SEO: update title/meta on route change
    useEffect(() => {
        const path = location.pathname || '/'
        const titleMap = {
          '/': 'Parjad Minooei — Web Developer Portfolio',
          '/about': 'About — Parjad Minooei',
          '/projects': 'Projects — Parjad Minooei',
          '/blog': 'Blog — Parjad Minooei',
          '/contact': 'Contact — Parjad Minooei',
        }
        const descMap = {
          '/': 'Web Developer building beautiful, fast, user‑centric web apps.',
          '/about': 'Learn about Parjad’s background and skills.',
          '/projects': 'Selected projects with code and live demos.',
          '/blog': 'Articles on web development and learning.',
          '/contact': 'Get in touch for opportunities and collaborations.',
        }
        const t = titleMap[path] || 'Parjad Minooei'
        const d = descMap[path] || descMap['/']
        document.title = t
        const ensure = (selector, attrs) => {
          let el = document.head.querySelector(selector)
          if (!el) { el = document.createElement('meta'); Object.keys(attrs).forEach(k=> el.setAttribute(k, attrs[k])); document.head.appendChild(el); return el }
          return el
        }
        const m = ensure('meta[name="description"]', { name: 'description' })
        m.setAttribute('content', d)
        const ogt = ensure('meta[property="og:title"]', { property: 'og:title' })
        ogt.setAttribute('content', t)
        const ogd = ensure('meta[property="og:description"]', { property: 'og:description' })
        ogd.setAttribute('content', d)
        const ogu = ensure('meta[property="og:url"]', { property: 'og:url' })
        ogu.setAttribute('content', `https://parjad-m-portfolio.vercel.app${path}`)
    }, [location.pathname])

    return (
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white font-sans">
            <style>{`
                body {
                    font-family: 'Inter', sans-serif;
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
            `}</style>

            <BackgroundBlobs theme={theme} />
            <Header toggleTheme={toggleTheme} theme={theme} />
            
            <main id="main-content" role="main" tabIndex={-1} className="transition-all duration-500 pt-20 md:pt-24">
                <Routes>
                    <Route path="/" element={<HomeSection theme={theme} />} />
                    <Route path="/about" element={<AboutSection theme={theme} />} />
                    <Route path="/projects" element={<ProjectsSection theme={theme} />} />
                    <Route path="/blog" element={<BlogSection theme={theme} />} />
                    <Route path="/blog/:id" element={<BlogPostPage theme={theme} />} />
                    <Route path="/contact" element={<ContactSection theme={theme} />} />
                    <Route path="/admin/login" element={<AdminLoginPage theme={theme} />} />
                    <Route path="/admin" element={<RequireAuth><AdminDashboard theme={theme} /></RequireAuth>} />
                </Routes>
            </main>

            {/* Footer */}
            <Footer theme={theme} />
            
            {/* Toast Notifications */}
            <Toast 
                isVisible={toast.isVisible} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, isVisible: false })} 
            />
        </div>
    );
};

// --- Main App Component ---
export default function App() {
  const [theme, setTheme] = useState('green'); // 'pink' or 'green'
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'pink' ? 'green' : 'pink');
      setToast({ isVisible: true, message: `Switched to ${theme === 'pink' ? 'Green' : 'Pink'} theme!`, type: 'success' });
  };


  return (
      <Router>
          <Layout theme={theme} toggleTheme={toggleTheme} toast={toast} setToast={setToast} />
      </Router>
    );
}
