import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ParjadImage from './Images/Parjad.jpg';
import GitHubStats from './components/GitHubStats.tsx';
import LeetCodeStats from './components/LeetCodeStats.tsx';
import ParjadM from './Images/ParjadM.png';
import Logo from './Images/Logo.png';
import CodeQuestImage from './Images/CodeQuest.jpg';
import BinaryGeneratorImage from './Images/Binary 1010 Generator.jpg';
import SpaceShooterImage from './Images/SpaceShooter.jpg';
import { Reveal } from './components/Reveal.jsx';
import { CustomCursor } from './components/CustomCursor.jsx';

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

const Sun = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
);

const Moon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const MarkdownContent = ({ content, className = '' }) => (
  <div className={`text-gray-300 leading-7 ${className}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
        h2: ({ ...props }) => <h2 className="text-2xl font-semibold text-white mt-7 mb-3" {...props} />,
        h3: ({ ...props }) => <h3 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />,
        p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
        ul: ({ ...props }) => <ul className="mb-4 list-disc pl-6 space-y-2" {...props} />,
        ol: ({ ...props }) => <ol className="mb-4 list-decimal pl-6 space-y-2" {...props} />,
        li: ({ ...props }) => <li className="text-gray-300" {...props} />,
        blockquote: ({ ...props }) => <blockquote className="mb-4 border-l-4 border-white/20 pl-4 italic text-gray-300/90" {...props} />,
        a: ({ ...props }) => <a className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
        pre: ({ ...props }) => <pre className="mb-4 overflow-x-auto rounded-lg bg-black/30 border border-white/10 p-4 text-sm" {...props} />,
        code: ({ className: codeClassName, children, ...props }) =>
          codeClassName ? (
            <code className={`${codeClassName} text-gray-100`} {...props}>{children}</code>
          ) : (
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-gray-100" {...props}>{children}</code>
          ),
      }}
    >
      {content || ''}
    </ReactMarkdown>
  </div>
);


// --- Enhanced Glass Card Component ---
const GlassCard = ({ children, className = '', theme = 'green', onMouseEnter, onMouseLeave, onClick }) => {
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
      className={`relative bg-white/[0.08] backdrop-blur-lg rounded-2xl border border-white/10 shadow-md transition-all duration-300 hover:border-white/20 hover:shadow-xl group overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { setIsHovered(true); onMouseEnter && onMouseEnter(e); }}
      onMouseLeave={(e) => { setIsHovered(false); onMouseLeave && onMouseLeave(e); }}
      onClick={onClick}
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.05), transparent 40%)`,
      }}
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} style={{ padding: '1px' }}>
        <div className="w-full h-full bg-transparent rounded-2xl"></div>
      </div>
      
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
      
      {/* Subtle Neon Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-[0.08] blur-lg transition-all duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10 group-hover:drop-shadow-sm">
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
  const inlineImageInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

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

  const uploadToCloudinary = async (file) => {
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
    return data.secure_url
  }

  const uploadBlogImage = async (file) => {
    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file)
      setForm(prev => ({ ...prev, image: imageUrl }))
    } catch (e) {
      setError(`Image upload failed: ${e.message || e}`)
    } finally {
      setUploading(false)
    }
  }

  const insertInlineImage = (imageUrl) => {
    const textarea = contentTextareaRef.current
    const markdownImage = `\n![Image](${imageUrl})\n`
    const currentText = form.content || ''
    const start = textarea ? textarea.selectionStart : currentText.length
    const end = textarea ? textarea.selectionEnd : currentText.length
    const nextText = `${currentText.slice(0, start)}${markdownImage}${currentText.slice(end)}`
    const nextCursorPos = start + markdownImage.length

    setForm(prev => ({ ...prev, content: nextText }))

    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(nextCursorPos, nextCursorPos)
      })
    }
  }

  const uploadInlineImage = async (file) => {
    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file)
      insertInlineImage(imageUrl)
    } catch (e) {
      setError(`Inline image upload failed: ${e.message || e}`)
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
          <textarea ref={contentTextareaRef} name="content" value={form.content} onChange={onChange} rows={8} placeholder="Content (Markdown supported)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded" />
          <div className="flex items-center gap-3">
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) uploadInlineImage(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => inlineImageInputRef.current && inlineImageInputRef.current.click()}
              className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Insert Inline Image'}
            </button>
            <span className="text-xs text-gray-400">Image markdown will be inserted at cursor.</span>
          </div>
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
            <div className="p-4 bg-white/5 rounded border border-white/10">
              <MarkdownContent content={form.content} />
            </div>
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
                <div className="text-xs text-gray-400">{p.featured ? 'Featured • ' : ''}{p.status || 'draft'} • {p.date}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={async ()=>{ await fetch(`/api/admin/blog/${p.id}/feature`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ featured: !p.featured }) }); load(); }} className="px-2 py-1 rounded bg-white/10">{p.featured ? 'Unfeature' : 'Feature'}</button>
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
      className={`relative overflow-hidden transform transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-95 ${gradientClass} ${className}`}
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

// --- News Feed (rotating blog titles + dropdown) ---
const NewsFeed = ({ posts, theme, onNavigate, compact, darkMode = true }) => {
    const [index, setIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!posts?.length) return;
        const id = setInterval(() => setIndex(i => (i + 1) % posts.length), 10000);
        return () => clearInterval(id);
    }, [posts?.length]);

    useEffect(() => {
        if (isOpen && triggerRef.current && typeof window !== 'undefined') {
            const rect = triggerRef.current.getBoundingClientRect();
            const w = 220;
            const left = compact ? Math.max(8, rect.right - w) : Math.max(8, Math.min(rect.left + (rect.width / 2) - (w / 2), window.innerWidth - w - 8));
            setDropdownRect({ top: rect.bottom + 8, left, width: w });
        } else {
            setDropdownRect(null);
        }
    }, [isOpen, compact]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!posts?.length) return null;
    const title = posts[index]?.title ?? '';
    const latest5 = posts.slice(0, 5);

    const dropdownClasses = darkMode
        ? 'bg-emerald-900/90 backdrop-blur-lg border border-emerald-700/40 shadow-2xl'
        : 'bg-emerald-50/98 backdrop-blur-lg border border-emerald-200/80 shadow-2xl';
    const headerClasses = darkMode ? 'text-emerald-200/90' : 'text-gray-500';
    const linkClasses = darkMode
        ? 'text-emerald-100 hover:bg-emerald-700/30'
        : 'text-gray-800 hover:bg-emerald-100/80';
    const dividerClasses = darkMode ? 'border-emerald-700/30' : 'border-emerald-200/60';
    const viewAllClasses = darkMode
        ? `${theme === 'pink' ? 'text-pink-400 hover:bg-emerald-700/30' : 'text-emerald-300 hover:bg-emerald-700/30'}`
        : `${theme === 'pink' ? 'text-pink-600 hover:bg-emerald-100/80' : 'text-emerald-600 hover:bg-emerald-100/80'}`;

    const dropdownEl = isOpen && dropdownRect && typeof document !== 'undefined' && createPortal(
        <div
            ref={dropdownRef}
            className={`fixed z-[9999] min-w-[220px] max-w-[320px] rounded-xl overflow-hidden ${dropdownClasses}`}
            style={{ top: dropdownRect.top, left: dropdownRect.left }}
        >
            <div className="py-2 max-h-[280px] overflow-y-auto">
                <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${headerClasses}`}>Latest posts</div>
                {latest5.map((p) => (
                    <Link
                        key={p.id}
                        to={`/blog/${p.id}`}
                        onClick={() => { setIsOpen(false); onNavigate?.(); }}
                        className={`block px-3 py-2 text-sm truncate ${linkClasses}`}
                    >
                        {p.title}
                    </Link>
                ))}
                <div className={`my-1 border-t ${dividerClasses}`} />
                <Link
                    to="/blog"
                    onClick={() => { setIsOpen(false); onNavigate?.(); }}
                    className={`block px-3 py-2.5 text-sm font-medium truncate ${viewAllClasses}`}
                >
                    View all posts →
                </Link>
            </div>
        </div>,
        document.body
    );

    return (
        <div className={`relative inline-block ${compact ? '' : 'w-full flex justify-center'}`}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className={`px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm font-medium hover:text-white hover:bg-white/15 transition-colors duration-300 block truncate text-left w-full ${compact ? 'ml-2 max-w-[180px]' : 'w-full max-w-[260px] mx-auto'}`}
                title={title}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className={`text-xs font-semibold mr-1.5 ${theme === 'pink' ? 'text-pink-400/90' : 'text-emerald-400/90'}`}>Latest:</span>
                {title}
            </button>
            {dropdownEl}
        </div>
    );
};

// --- Header Component ---
const Header = ({ toggleTheme, toggleDarkMode, theme, darkMode = true }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [blogPosts, setBlogPosts] = useState([]);
    const [visitors, setVisitors] = useState(() => {
        try {
            const cached = localStorage.getItem('cachedVisitors');
            if (!cached) return null;
            const parsed = Number(cached);
            return Number.isFinite(parsed) ? parsed : null;
        } catch {
            return null;
        }
    });
    const location = useLocation();
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Projects', path: '/projects' },
        { name: 'Stats', path: '/stats' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' }
    ];

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/metrics', { signal: controller.signal })
          .then(res => res.ok ? res.json() : null)
          .then(d => {
            if (!d || typeof d.uniqueVisitors !== 'number') return;
            setVisitors(d.uniqueVisitors);
            try { localStorage.setItem('cachedVisitors', String(d.uniqueVisitors)); } catch {}
          })
          .catch(() => {
            // Keep cached value on network/server errors to avoid flashing/reset.
          });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/blog', { signal: controller.signal })
          .then(res => res.ok ? res.json() : null)
          .then(d => {
            const posts = Array.isArray(d?.posts) ? d.posts : [];
            setBlogPosts(posts.filter(p => p.id && p.title).map(p => ({ id: p.id, title: p.title })));
          })
          .catch(() => {});
        return () => controller.abort();
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
                                <React.Fragment key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
                                        aria-current={isActive(item.path) ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.name === 'Contact' && <NewsFeed posts={blogPosts} theme={theme} darkMode={darkMode} compact />}
                                </React.Fragment>
                            ))}
                            {visitors !== null && (
                              <div className="ml-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200 text-sm font-semibold whitespace-nowrap">
                                {visitors} Visitors
                              </div>
                            )}
                            <button
                                onClick={toggleDarkMode}
                                className="ml-2 p-2 rounded-full bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/15 transition-colors duration-300"
                                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
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
                                <React.Fragment key={item.name}>
                                    <Link
                                        to={item.path}
                                        onClick={handleNavClick}
                                        className={`block w-full text-center px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-300 ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
                                        aria-current={isActive(item.path) ? 'page' : undefined}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.name === 'Contact' && (
                                        <div className="w-full flex justify-center">
                                            <NewsFeed posts={blogPosts} theme={theme} darkMode={darkMode} onNavigate={handleNavClick} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                            {visitors !== null && (
                              <div className="mt-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm w-full text-center">
                                {visitors} Visitors
                              </div>
                            )}
                            <button
                                onClick={toggleDarkMode}
                                className="mt-2 w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 flex items-center justify-center gap-2"
                                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </header>
    );
};


// --- Background Blobs ---
const BackgroundBlobs = ({ theme, darkMode = true }) => {
    const pinkThemeClasses = darkMode
        ? { blob1: "bg-pink-500/30", blob2: "bg-red-500/30", blob3: "bg-purple-500/20" }
        : { blob1: "bg-pink-400/20", blob2: "bg-red-400/20", blob3: "bg-purple-400/15" };
    const greenThemeClasses = darkMode
        ? { blob1: "bg-emerald-500/30", blob2: "bg-teal-500/30", blob3: "bg-cyan-500/20" }
        : { blob1: "bg-emerald-400/25", blob2: "bg-teal-400/25", blob3: "bg-cyan-400/20" };
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
        <Reveal>
        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight bg-gradient-to-r ${theme === 'green' ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-pink-400 via-red-400 to-purple-400'} bg-clip-text text-transparent`}>
          Parjad Minooei
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-2xl">
          A creative <span className={theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}>Software Engineer</span> with a passion for building beautiful, functional, and user-centric web applications.
        </p>
        <div className="mt-8 flex justify-start space-x-6">
          <a href="https://github.com/ParjadM" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"><Github size={32} /></a>
          <a href="https://www.linkedin.com/in/parjadminooei" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"><Linkedin size={32} /></a>
        </div>
        <RippleButton 
          onClick={() => navigate('/contact')} 
          className="mt-10 px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
          theme={theme}
        >
          Get in Touch
        </RippleButton>
        </Reveal>
        
      </div>

      {/* Right: Portrait image */}
      <div className="flex justify-center md:justify-end p-6 md:p-0">
        <Reveal>
        <img 
          src={ParjadM} 
          alt="Parjad Minooei"
          className="w-64 md:w-80 lg:w-[28rem]"
        />
        </Reveal>
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
                        I am a Software Engineering student at McMaster University based in Scarborough, ON, with a background that uniquely blends an Advanced Diploma in Computer Programming with a degree in Psychology. This combination allows me to approach complex system architecture with a deep understanding of both logical problem-solving and user-centric design.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        My path in tech has evolved from building responsive web applications to engineering scalable, high-performance software. I am currently executing a rigorous 6-week 'Visual Mastery' plan focused on Trees, Graphs, and advanced algorithms (BFS/DFS) to achieve interview-level fluency in data structures and algorithms.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        When I’m not architecting software, I’m usually at the gym, diving into complex math problems, or tackling LeetCode challenges to keep my analytical skills sharp. I thrive on continuous learning and applying my skills to create elegant and efficient software solutions.
                    </p>
                </div>
            )
        },
        education: {
            title: "Education & Learning",
            content: (
                <div className="space-y-6">
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">B.Tech in Software Engineering</h4>
                        <p className="text-gray-400 mb-1">McMaster University | Current</p>
                        <p className="text-gray-300">Focused on advanced software engineering principles, systems architecture, and large-scale application development. Building a deep foundation in engineering mathematics and professional software standards.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Graduate Certificate in Web Development</h4>
                        <p className="text-gray-400 mb-1">Previous Technical Training</p>
                        <p className="text-gray-300">Mastered modern frameworks (React, Node.js), responsive design, and full-stack architecture. Focused on industry best practices and deploying production-ready applications.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Computer Programming & Analysis</h4>
                        <p className="text-gray-400 mb-1">Advanced Diploma</p>
                        <p className="text-gray-300">Comprehensive programming education covering software development, data structures, and analytical problem-solving across multiple languages and platforms.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Psychology</h4>
                        <p className="text-gray-400 mb-1">Bachelor's Degree</p>
                        <p className="text-gray-300">Focused on human behavior and cognition. This background provides a unique edge in User Experience (UX) design, understanding how users interact with technology and complex interfaces.</p>
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
                    <Reveal>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">About Me</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Get to know the person behind the code
                    </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <Reveal>
                        <GlassCard className="p-8 text-center" theme={theme}>
                            <div className={`w-48 h-48 mx-auto mb-6 rounded-full p-2 shadow-lg ${theme === 'pink' ? 'bg-gradient-to-br from-pink-500/50 to-red-500/50' : 'bg-gradient-to-br from-emerald-500/50 to-teal-500/50'}`}>
                                <img 
                                    src={ParjadImage}
                                    alt="Parjad Minooei" 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Parjad Minooei</h3>
                            <p className="text-gray-400 mb-4">Software Engineer</p>
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
                        </Reveal>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-2">
                        <Reveal>
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
                        </Reveal>
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
            <Reveal>
            <h2 className="text-4xl font-bold text-white mb-12 text-center">My Projects</h2>
            </Reveal>
            {error && <div className="text-red-300 mb-4">{error}</div>}
            {loading && <div className="text-gray-300">Loading...</div>}
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <Reveal key={project.id || project.title}>
                    <GlassCard className="p-0 flex flex-col overflow-hidden">
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
                    </Reveal>
                ))}
                {!loading && projects.length === 0 && (
                    <div className="col-span-full text-center text-gray-400">No projects yet.</div>
                )}
                </div>
            </div>
        </section>
    );
};

const LQFTBenchmarkPage = ({ theme }) => {
    const [mode, setMode] = useState('adaptive_light');
    const [compareN, setCompareN] = useState(3000);
    const [memoryN, setMemoryN] = useState(3000);
    const [keyInput, setKeyInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [status, setStatus] = useState('Ready');
    const [activeTab, setActiveTab] = useState('snapshot');
    const [runningCompare, setRunningCompare] = useState(false);
    const [runningMemory, setRunningMemory] = useState(false);
    const [graphMetric, setGraphMetric] = useState('complexityRank');
    const [taskLabel, setTaskLabel] = useState('');
    const [taskState, setTaskState] = useState('Idle');
    const [countdownSec, setCountdownSec] = useState(0);
    const [logLines, setLogLines] = useState([]);
    const [compareRows, setCompareRows] = useState([]);
    const [memoryRows, setMemoryRows] = useState([]);
    const engineRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const TREE_STRUCTURES = new Set([
      'adaptive_lqft_light',
      'adaptive_lqft_native',
      'lqft_persistent_tree',
      'bst_unbalanced',
      'avl_tree',
      'treap_tree',
      'trie_map',
      'sqlite_in_memory',
      'sorted_dict',
    ]);

    const STRUCTURE_CATALOG = [
      { name: 'dict', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 1.0, memoryRank: 3.5, complexityRank: 3.0, supportsDelete: true },
      { name: 'set_index', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 1.7, memoryRank: 3.2, complexityRank: 2.5, supportsDelete: true },
      { name: 'defaultdict_map', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 2.3, memoryRank: 3.8, complexityRank: 3.0, supportsDelete: true },
      { name: 'ordered_dict', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 2.0, memoryRank: 7.0, complexityRank: 3.0, supportsDelete: true },
      { name: 'adaptive_lqft_light', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(1)', space: 'O(Σ)', perfRank: 3.25, memoryRank: 3.5, complexityRank: 3.0, supportsDelete: true },
      { name: 'adaptive_lqft_native', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(1)', space: 'O(Σ)', perfRank: 9.25, memoryRank: 12.0, complexityRank: 4.0, supportsDelete: true },
      { name: 'lqft_persistent_tree', insert: 'O(1)', search: 'O(1)', delete: 'N/A', worstCase: 'O(1)', space: 'O(Σ + V)', perfRank: 10.33, memoryRank: 11.0, complexityRank: 6.0, supportsDelete: false },
      { name: 'sorted_dict', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(log N)', space: 'O(N)', perfRank: 5.2, memoryRank: 6.5, complexityRank: 2.2, supportsDelete: true },
      { name: 'sorted_list_bisect', insert: 'O(N)', search: 'O(log N)', delete: 'O(N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 5.75, memoryRank: 2.0, complexityRank: 8.0, supportsDelete: true },
      { name: 'trie_map', insert: 'O(L)', search: 'O(L)', delete: 'O(L)', worstCase: 'O(L)', space: 'O(total chars)', perfRank: 3.75, memoryRank: 9.0, complexityRank: 2.5, supportsDelete: true },
      { name: 'bst_unbalanced', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 6.0, memoryRank: 5.0, complexityRank: 9.0, supportsDelete: true },
      { name: 'avl_tree', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(log N)', space: 'O(N)', perfRank: 8.75, memoryRank: 6.0, complexityRank: 1.5, supportsDelete: true },
      { name: 'treap_tree', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 7.75, memoryRank: 10.0, complexityRank: 5.0, supportsDelete: true },
      { name: 'sqlite_in_memory', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(log N)', space: 'O(N)', perfRank: 9.5, memoryRank: 1.0, complexityRank: 2.0, supportsDelete: true },
      { name: 'shelve_map', insert: 'O(1)*', search: 'O(1)*', delete: 'O(1)*', worstCase: 'I/O bound', space: 'Disk-backed', perfRank: 11.5, memoryRank: 11.5, complexityRank: 4.5, supportsDelete: true },
      { name: 'list_linear_map', insert: 'O(1)', search: 'O(N)', delete: 'O(N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 10.25, memoryRank: 8.0, complexityRank: 10.0, supportsDelete: true },
    ];

    const tagClasses = theme === 'pink'
        ? "bg-pink-500/20 text-pink-300"
        : "bg-emerald-500/20 text-emerald-300";

    const fnv1a32 = (input) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < input.length; i += 1) {
            h ^= input.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return h >>> 0;
    };

    const addLog = (line) => {
      setLogLines(prev => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 300));
    };

    const formatCountdown = (seconds) => {
      const s = Math.max(0, Math.floor(seconds));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    };

    const beginCountdown = (label, seconds) => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setTaskLabel(label);
      setTaskState(`Running ${label.toLowerCase()}...`);
      setCountdownSec(seconds);
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSec(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const endCountdown = (nextState = 'Idle') => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownSec(0);
      setTaskState(nextState);
      setTaskLabel('');
    };

    const accentRowClass = (name) => {
      if (name === 'adaptive_lqft_light') return 'bg-amber-400/15';
      if (name === 'adaptive_lqft_native' || name === 'lqft_persistent_tree') return 'bg-blue-500/15';
      return '';
    };

    const accentTextClass = (name) => {
      if (name === 'adaptive_lqft_light') return 'text-amber-300';
      if (name === 'adaptive_lqft_native' || name === 'lqft_persistent_tree') return 'text-blue-300';
      return 'text-white';
    };

    const makeEngine = (engineMode) => {
      const keySet = new Set();

      if (engineMode === 'persistent') {
        const LEVELS = 6;
        const root = new Array(32);
        const insert = (key, value) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            if (!node[idx]) node[idx] = level === LEVELS - 1 ? Object.create(null) : new Array(32);
            node = node[idx];
          }
          node[key] = value;
          keySet.add(key);
        };
        const search = (key) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            node = node[idx];
            if (!node) return undefined;
          }
          return node[key];
        };
        return {
          insert,
          search,
          clear: () => {
            for (let i = 0; i < root.length; i += 1) root[i] = undefined;
            keySet.clear();
          },
          entriesSample: (count = 10) => Array.from(keySet).slice(0, count).map(k => [k, search(k)]),
          size: () => keySet.size,
          supportsDelete: false,
        };
      }

      if (engineMode === 'adaptive_native') {
        const LEVELS = 6;
        const root = new Array(32);
        const insert = (key, value) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            if (!node[idx]) node[idx] = level === LEVELS - 1 ? Object.create(null) : new Array(32);
            node = node[idx];
          }
          node[key] = value;
          keySet.add(key);
        };
        const search = (key) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            node = node[idx];
            if (!node) return undefined;
          }
          return node[key];
        };
        const del = (key) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            node = node[idx];
            if (!node) return false;
          }
          const existed = Object.prototype.hasOwnProperty.call(node, key);
          if (existed) {
            delete node[key];
            keySet.delete(key);
          }
          return existed;
        };
        return {
          insert,
          search,
          delete: del,
          clear: () => {
            for (let i = 0; i < root.length; i += 1) root[i] = undefined;
            keySet.clear();
          },
          entriesSample: (count = 10) => Array.from(keySet).slice(0, count).map(k => [k, search(k)]),
          size: () => keySet.size,
          supportsDelete: true,
        };
      }

      // adaptive_light
      const map = new Map();
      return {
        insert: (k, v) => map.set(k, v),
        search: (k) => map.get(k),
        delete: (k) => map.delete(k),
        clear: () => map.clear(),
        entriesSample: (count = 10) => Array.from(map.entries()).slice(0, count),
        size: () => map.size,
        supportsDelete: true,
      };
    };

    const resetEngine = (nextMode = mode) => {
      engineRef.current = makeEngine(nextMode);
      setStatus(`Mode: ${nextMode} (fresh instance)`);
      addLog(`Engine reset to mode=${nextMode}`);
    };

    useEffect(() => {
      resetEngine(mode);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const onInsert = () => {
      if (!keyInput.trim()) {
        setStatus('Missing key');
        return;
      }
      try {
        engineRef.current.insert(keyInput.trim(), valueInput);
        setStatus(`Inserted key=${keyInput.trim()}`);
        addLog(`insert(${JSON.stringify(keyInput.trim())}, ${JSON.stringify(valueInput)})`);
      } catch (err) {
        setStatus(`Insert failed: ${String(err)}`);
        addLog(`Insert error: ${String(err)}`);
      }
    };

    const onSearch = () => {
      if (!keyInput.trim()) {
        setStatus('Missing key');
        return;
      }
      try {
        const value = engineRef.current.search(keyInput.trim());
        setStatus(`search(${keyInput.trim()}) -> ${JSON.stringify(value)}`);
        addLog(`search(${JSON.stringify(keyInput.trim())}) -> ${JSON.stringify(value)}`);
      } catch (err) {
        setStatus(`Search failed: ${String(err)}`);
        addLog(`Search error: ${String(err)}`);
      }
    };

    const onDelete = () => {
      if (!keyInput.trim()) {
        setStatus('Missing key');
        return;
      }
      if (!engineRef.current.supportsDelete) {
        setStatus('Delete unsupported in persistent mode');
        addLog('Delete unsupported on persistent mode');
        return;
      }
      try {
        engineRef.current.delete(keyInput.trim());
        setStatus(`Deleted key=${keyInput.trim()}`);
        addLog(`delete(${JSON.stringify(keyInput.trim())})`);
      } catch (err) {
        setStatus(`Delete failed: ${String(err)}`);
        addLog(`Delete error: ${String(err)}`);
      }
    };

    const onPurge = () => {
      try {
        engineRef.current.clear();
        setStatus('Purged / Cleared');
        addLog('clear()');
      } catch (err) {
        setStatus(`Purge/Clear failed: ${String(err)}`);
      }
    };

    const onLoadSamples = () => {
      try {
        for (let i = 0; i < 10000; i += 1) {
          const key = `user-${i}`;
          const value = `score-${1 + Math.floor(Math.random() * 999)}`;
          engineRef.current.insert(key, value);
        }
        setStatus('Loaded 10,000 samples');
        addLog('Loaded 10,000 sample keys.');
      } catch (err) {
        setStatus(`Load sample failed: ${String(err)}`);
      }
    };

    const runComparison = () => {
      const n = Math.max(1, Number(compareN) || 3000);
      setRunningCompare(true);
      setStatus(`Running comparison (N=${n})...`);
      beginCountdown('Comparison', Math.max(6, Math.min(18, Math.ceil(n / 1000) + 3)));
      setTimeout(() => {
        const measuredStructures = [
          { name: 'dict', factory: () => makeEngine('adaptive_light') },
          { name: 'adaptive_lqft_light', factory: () => makeEngine('adaptive_light') },
          { name: 'adaptive_lqft_native', factory: () => makeEngine('adaptive_native') },
          { name: 'lqft_persistent_tree', factory: () => makeEngine('persistent') },
        ];
        const keys = Array.from({ length: n }, (_, i) => `cmp-${i}`);
        const vals = Array.from({ length: n }, (_, i) => `v-${i}`);
        const missCount = Math.min(n, 5000);
        const measuredRows = measuredStructures.map(s => {
          const eng = s.factory();
          const t0 = performance.now();
          for (let i = 0; i < n; i += 1) eng.insert(keys[i], vals[i]);
          const insertOps = n / Math.max((performance.now() - t0) / 1000, 0.0001);

          const t1 = performance.now();
          for (let i = 0; i < n; i += 1) eng.search(keys[i]);
          const hitOps = n / Math.max((performance.now() - t1) / 1000, 0.0001);

          const t2 = performance.now();
          for (let i = 0; i < missCount; i += 1) eng.search(`miss-${i}`);
          const missOps = missCount / Math.max((performance.now() - t2) / 1000, 0.0001);

          let delOps = null;
          if (eng.supportsDelete) {
            const t3 = performance.now();
            for (let i = 0; i < n / 2; i += 1) eng.delete(keys[i]);
            delOps = (n / 2) / Math.max((performance.now() - t3) / 1000, 0.0001);
          }

          const profile = STRUCTURE_CATALOG.find(p => p.name === s.name);
          const complexityRank = profile?.complexityRank ?? 5;
          const memoryRank = profile?.memoryRank ?? 5;
          const perfRank = profile?.perfRank ?? 5;
          const totalScore = perfRank + memoryRank + complexityRank;
          return { structure: s.name, insertOps, hitOps, missOps, delOps, perfRank, complexityRank, memoryRank, totalScore };
        });

        const dictBaseline = measuredRows.find(r => r.structure === 'dict') || measuredRows[0];
        const syntheticRows = STRUCTURE_CATALOG
          .filter(p => !measuredRows.some(r => r.structure === p.name))
          .map(p => ({
            structure: p.name,
            insertOps: dictBaseline.insertOps / Math.max(p.perfRank, 0.1),
            hitOps: dictBaseline.hitOps / Math.max(p.perfRank, 0.1),
            missOps: dictBaseline.missOps / Math.max(p.perfRank, 0.1),
            delOps: p.supportsDelete ? (dictBaseline.delOps ? dictBaseline.delOps / Math.max(p.perfRank, 0.1) : null) : null,
            perfRank: p.perfRank,
            memoryRank: p.memoryRank,
            complexityRank: p.complexityRank,
            totalScore: p.perfRank + p.memoryRank + p.complexityRank,
            modeled: true,
          }));

        const rows = [...measuredRows, ...syntheticRows]
          .sort((a, b) => b.insertOps + b.hitOps + b.missOps - (a.insertOps + a.hitOps + a.missOps))
          .map((r, idx) => ({ ...r, rank: idx + 1 }));
        setCompareRows(rows);
        setActiveTab('ranking');
        setStatus('Comparison completed');
        addLog(`Comparison finished with ${rows.length} structures (N=${n}).`);
        endCountdown('Comparison completed');
        setRunningCompare(false);
      }, Math.max(1400, Math.min(6000, 800 + Math.ceil(n / 12))));
    };

    const runMemoryDensity = () => {
      const n = Math.max(1, Number(memoryN) || 3000);
      setRunningMemory(true);
      setStatus(`Running memory density (N=${n})...`);
      beginCountdown('Memory Density', Math.max(5, Math.min(16, Math.ceil(n / 1200) + 2)));
      setTimeout(() => {
        const rows = STRUCTURE_CATALOG.map(p => {
          const bytesPerItem = 24 + (p.memoryRank * 14);
          const deltaMb = (bytesPerItem * n) / (1024 * 1024);
          return {
            structure: p.name,
            deltaMb,
            bytesPerItem,
            status: 'Modeled from app.py profile',
            modeled: true,
          };
        }).sort((a, b) => a.bytesPerItem - b.bytesPerItem)
          .map((r, i) => ({ ...r, rank: i + 1 }));
        setMemoryRows(rows);
        setActiveTab('memory');
        setStatus('Memory density completed');
        addLog(`Memory density finished (N=${n}).`);
        endCountdown('Memory density completed');
        setRunningMemory(false);
      }, Math.max(1200, Math.min(5000, 700 + Math.ceil(n / 14))));
    };

    const snapshot = (() => {
      const sample = engineRef.current ? engineRef.current.entriesSample(10) : [];
      return {
        mode,
        size: engineRef.current ? engineRef.current.size() : 0,
        supportsDelete: engineRef.current ? engineRef.current.supportsDelete : false,
        sample,
      };
    })();

    const complexityRows = STRUCTURE_CATALOG
      .map(p => ({
        ...p,
        totalScore: (p.perfRank + p.memoryRank + p.complexityRank).toFixed(2),
      }))
      .sort((a, b) => Number(a.totalScore) - Number(b.totalScore))
      .map((r, idx) => ({ ...r, overallRank: idx + 1 }));

    const treeCompareRows = compareRows.filter(r => TREE_STRUCTURES.has(r.structure));
    const treeMemoryRows = memoryRows.filter(r => TREE_STRUCTURES.has(r.structure));
    const graphRows = complexityRows.slice().sort((a, b) => (graphMetric === 'complexityRank' ? a.complexityRank - b.complexityRank : Number(a.totalScore) - Number(b.totalScore)));

    const tabButtonClass = (tab) => `px-3 py-2 rounded text-sm font-semibold ${activeTab === tab ? (theme === 'pink' ? 'bg-pink-500/30 text-white' : 'bg-emerald-500/30 text-white') : 'bg-white/10 text-gray-300 hover:bg-white/20'}`;

    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-6">
                    <Link to="/projects" className="text-gray-300 hover:text-white">← Back to Projects</Link>
                </div>
                <GlassCard className="p-8 md:p-10" theme={theme}>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">LQFT Demonstration App (Browser)</h1>
                    <p className="text-gray-300 mb-6 leading-relaxed">Run interactive LQFT workflows.</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {['Mode switch', 'CRUD playground', 'Comparison', 'Memory density'].map(tag => (
                            <span key={tag} className={`${tagClasses} text-xs font-semibold px-2.5 py-1 rounded-full`}>{tag}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <label className="space-y-2 md:col-span-1">
                        <span className="text-sm text-gray-300">Engine mode</span>
                        <select value={mode} onChange={(e) => setMode(e.target.value)} className="lqft-select w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white">
                          <option value="adaptive_light">adaptive_light</option>
                          <option value="adaptive_native">adaptive_native</option>
                          <option value="persistent">persistent</option>
                        </select>
                      </label>
                      <div className="md:col-span-3 flex items-end gap-2">
                        <button onClick={() => resetEngine(mode)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Reset</button>
                        <button onClick={onLoadSamples} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Load 10k</button>
                      </div>
                    </div>

                    <div className="p-3 rounded border border-white/10 bg-white/5 mb-6">
                      <p className="text-sm text-gray-300">
                        <span className="text-white font-semibold">Engine mode:</span> `adaptive_light` (JS map-focused baseline), `adaptive_native` (fixed-depth routed simulation), `persistent` (persistent-style tree semantics, delete disabled).
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Timer: {formatCountdown(countdownSec)} • State: {taskState}</p>
                      <p className="text-xs text-gray-400 mt-1">Current: {status}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      <div className="p-3 rounded border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-300">Compare N</span>
                          <input type="number" value={compareN} onChange={(e) => setCompareN(Number(e.target.value))} className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-white" />
                          <button onClick={runComparison} disabled={runningCompare} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-60">{runningCompare ? 'Running...' : 'Run Comparison'}</button>
                        </div>
                      </div>
                      <div className="p-3 rounded border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-300">Memory N</span>
                          <input type="number" value={memoryN} onChange={(e) => setMemoryN(Number(e.target.value))} className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-white" />
                          <button onClick={runMemoryDensity} disabled={runningMemory} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-60">{runningMemory ? 'Running...' : 'Memory Density'}</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="p-4 rounded border border-white/10 bg-white/5">
                        <h3 className="text-white font-semibold mb-3">CRUD Playground</h3>
                        <div className="space-y-3">
                          <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white" />
                          <input value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Value" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white" />
                          <div className="flex flex-wrap gap-2">
                            <button onClick={onInsert} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Insert</button>
                            <button onClick={onSearch} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Search</button>
                            <button onClick={onDelete} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Delete</button>
                            <button onClick={onPurge} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Purge / Clear</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <button className={tabButtonClass('snapshot')} onClick={() => setActiveTab('snapshot')}>Snapshot</button>
                      <button className={tabButtonClass('log')} onClick={() => setActiveTab('log')}>Log</button>
                      <button className={tabButtonClass('ranking')} onClick={() => setActiveTab('ranking')}>Ranking</button>
                      <button className={tabButtonClass('complexity')} onClick={() => setActiveTab('complexity')}>Complexity</button>
                      <button className={tabButtonClass('tree')} onClick={() => setActiveTab('tree')}>Tree Comparison</button>
                      <button className={tabButtonClass('graph')} onClick={() => setActiveTab('graph')}>Complexity Graph</button>
                      <button className={tabButtonClass('memory')} onClick={() => setActiveTab('memory')}>Memory Density</button>
                      <button className={tabButtonClass('treeMemory')} onClick={() => setActiveTab('treeMemory')}>Tree Memory Density</button>
                    </div>

                    {activeTab === 'snapshot' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5">
                        <h4 className="text-white font-semibold mb-2">Engine Snapshot</h4>
                        <div className="text-sm text-gray-300">Mode: <span className="text-white">{snapshot.mode}</span></div>
                        <div className="text-sm text-gray-300 mb-3">Store size: <span className="text-white">{snapshot.size.toLocaleString()}</span></div>
                        <div className="space-y-1 text-sm">
                          {snapshot.sample.length === 0 ? (
                            <div className="text-gray-400">No sample entries yet.</div>
                          ) : (
                            snapshot.sample.map(([k, v]) => (
                              <div key={k} className="text-gray-300"><span className="text-gray-400">{k}</span>: <span className="text-white">{String(v)}</span></div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'log' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 max-h-[24rem] overflow-auto">
                        <h4 className="text-white font-semibold mb-2">Log</h4>
                        <div className="space-y-1 text-sm text-gray-300">
                          {logLines.length === 0 ? <div className="text-gray-400">No log events yet.</div> : logLines.map((l, i) => <div key={`${l}-${i}`}>{l}</div>)}
                        </div>
                      </div>
                    )}

                    {activeTab === 'ranking' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Comparison Ranking</h4>
                        <p className="text-xs text-gray-400 mb-3">For Insert/Hit/Miss/Delete ops: higher is better.</p>
                        {compareRows.length === 0 ? (
                          <div className="text-gray-400 text-sm">Run comparison to populate rows.</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th>
                                <th className="py-2 pr-4">Structure</th>
                                <th className="py-2 pr-4">Insert</th>
                                <th className="py-2 pr-4">Hit</th>
                                <th className="py-2 pr-4">Miss</th>
                                <th className="py-2 pr-4">Delete</th>
                              </tr>
                            </thead>
                            <tbody>
                              {compareRows.map(r => (
                                <tr key={r.structure} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.insertOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.hitOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.missOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.delOps == null ? 'N/A' : Math.round(r.delOps).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {activeTab === 'complexity' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Complexity Table (app.py-style)</h4>
                        <p className="text-xs text-gray-400 mb-3">For rank and total score columns: lower is better.</p>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-300 border-b border-white/10">
                              <th className="py-2 pr-4">Overall</th>
                              <th className="py-2 pr-4">Structure</th>
                              <th className="py-2 pr-4">Insert</th>
                              <th className="py-2 pr-4">Search</th>
                              <th className="py-2 pr-4">Delete</th>
                              <th className="py-2 pr-4">Worst</th>
                              <th className="py-2 pr-4">Space</th>
                              <th className="py-2 pr-4">Perf</th>
                              <th className="py-2 pr-4">Memory</th>
                              <th className="py-2 pr-4">Complexity</th>
                              <th className="py-2 pr-4">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {complexityRows.map(r => (
                                <tr key={r.name} className={`border-b border-white/5 ${accentRowClass(r.name)}`}>
                                <td className="py-2 pr-4 text-gray-300">{r.overallRank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.name)}`}>{r.name}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.insert}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.search}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.delete}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.worstCase}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.space}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.perfRank}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.memoryRank}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.complexityRank}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.totalScore}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'tree' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Tree Comparison</h4>
                        <p className="text-xs text-gray-400 mb-3">For Insert/Hit/Miss/Delete ops: higher is better.</p>
                        {treeCompareRows.length === 0 ? <div className="text-gray-400 text-sm">Run comparison to populate tree rows.</div> : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th><th className="py-2 pr-4">Structure</th><th className="py-2 pr-4">Insert</th><th className="py-2 pr-4">Hit</th><th className="py-2 pr-4">Miss</th><th className="py-2 pr-4">Delete</th>
                              </tr>
                            </thead>
                            <tbody>
                              {treeCompareRows.map(r => (
                                <tr key={r.structure} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.insertOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.hitOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.missOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.delOps == null ? 'N/A' : Math.round(r.delOps).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {activeTab === 'graph' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-300">Graph Metric:</span>
                          <select value={graphMetric} onChange={(e) => setGraphMetric(e.target.value)} className="lqft-select px-3 py-2 bg-white/5 border border-white/10 rounded text-white">
                            <option value="complexityRank">complexity_rank</option>
                            <option value="totalScore">total_score</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-400">
                          <span>{graphMetric === 'complexityRank' ? 'Lower is better (better complexity rank).' : 'Lower is better (better total score).'}</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-300/90" />adaptive_lqft_light</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-300/90" />adaptive_lqft_native / lqft_persistent_tree</span>
                        </div>
                        <div className="overflow-auto border border-white/10 rounded p-3 bg-white/5">
                          {(() => {
                            const rows = graphRows.slice(0, 12);
                            const chartHeight = 320;
                            const chartWidth = Math.max(900, rows.length * 90 + 120);
                            const innerLeft = 70;
                            const innerRight = 20;
                            const innerTop = 20;
                            const innerBottom = 85;
                            const innerWidth = chartWidth - innerLeft - innerRight;
                            const innerHeight = chartHeight - innerTop - innerBottom;
                            const maxValue = graphMetric === 'complexityRank' ? 10 : 25;
                            const barStep = innerWidth / Math.max(rows.length, 1);
                            const barWidth = Math.max(16, Math.min(42, barStep * 0.55));
                            const ticks = 6;
                            return (
                              <svg width={chartWidth} height={chartHeight} className="min-w-[900px]">
                                {Array.from({ length: ticks + 1 }).map((_, i) => {
                                  const y = innerTop + (innerHeight / ticks) * i;
                                  const tickValue = (maxValue - (maxValue / ticks) * i).toFixed(0);
                                  return (
                                    <g key={`tick-${i}`}>
                                      <line x1={innerLeft} y1={y} x2={chartWidth - innerRight} y2={y} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                                      <text x={innerLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(209,213,219,0.9)">{tickValue}</text>
                                    </g>
                                  );
                                })}

                                <line x1={innerLeft} y1={innerTop} x2={innerLeft} y2={innerTop + innerHeight} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                                <line x1={innerLeft} y1={innerTop + innerHeight} x2={chartWidth - innerRight} y2={innerTop + innerHeight} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

                                {rows.map((r, idx) => {
                                  const value = graphMetric === 'complexityRank' ? r.complexityRank : Number(r.totalScore);
                                  const h = Math.max(4, (value / maxValue) * innerHeight);
                                  const xCenter = innerLeft + barStep * idx + barStep / 2;
                                  const x = xCenter - barWidth / 2;
                                  const y = innerTop + innerHeight - h;
                                  const fill = r.name === 'adaptive_lqft_light'
                                    ? 'rgba(251, 191, 36, 0.95)'
                                    : (r.name === 'adaptive_lqft_native' || r.name === 'lqft_persistent_tree'
                                      ? 'rgba(96, 165, 250, 0.95)'
                                      : (theme === 'pink' ? 'rgba(244,114,182,0.88)' : 'rgba(52,211,153,0.88)'));
                                  const labelColor = r.name === 'adaptive_lqft_light'
                                    ? 'rgba(252,211,77,0.98)'
                                    : (r.name === 'adaptive_lqft_native' || r.name === 'lqft_persistent_tree'
                                      ? 'rgba(147,197,253,0.98)'
                                      : 'rgba(209,213,219,0.95)');

                                  return (
                                    <g key={`bar-${r.name}`}>
                                      <rect x={x} y={y} width={barWidth} height={h} fill={fill} rx="3" />
                                      <text x={xCenter} y={y - 6} textAnchor="middle" fontSize="10" fill="rgba(209,213,219,0.95)">
                                        {value.toFixed(1)}
                                      </text>
                                      <text x={xCenter} y={innerTop + innerHeight + 14} textAnchor="middle" fontSize="9" fill={labelColor}>
                                        {r.name.length > 16 ? `${r.name.slice(0, 16)}...` : r.name}
                                      </text>
                                    </g>
                                  );
                                })}

                                <text x={innerLeft / 2} y={innerTop + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 ${innerLeft / 2} ${innerTop + innerHeight / 2})`} fontSize="11" fill="rgba(209,213,219,0.9)">
                                  {graphMetric}
                                </text>
                                <text x={innerLeft + innerWidth / 2} y={chartHeight - 12} textAnchor="middle" fontSize="11" fill="rgba(209,213,219,0.9)">
                                  data structures
                                </text>
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {activeTab === 'memory' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Memory Density</h4>
                        <p className="text-xs text-gray-400 mb-3">For Delta MB and Bytes/Item: lower is better.</p>
                        {memoryRows.length === 0 ? (
                          <div className="text-gray-400 text-sm">Run memory density to populate rows.</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th>
                                <th className="py-2 pr-4">Structure</th>
                                <th className="py-2 pr-4">Delta MB</th>
                                <th className="py-2 pr-4">Bytes/Item</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memoryRows.map(r => (
                                <tr key={r.structure} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.deltaMb.toFixed(3)}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.bytesPerItem.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <p className="text-xs text-gray-400 mt-3">Browser version uses estimation; desktop `app.py` uses process RSS for true memory deltas.</p>
                      </div>
                    )}

                    {activeTab === 'treeMemory' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Tree Memory Density</h4>
                        <p className="text-xs text-gray-400 mb-3">For Delta MB and Bytes/Item: lower is better.</p>
                        {treeMemoryRows.length === 0 ? <div className="text-gray-400 text-sm">Run memory density to populate tree rows.</div> : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th>
                                <th className="py-2 pr-4">Structure</th>
                                <th className="py-2 pr-4">Delta MB</th>
                                <th className="py-2 pr-4">Bytes/Item</th>
                              </tr>
                            </thead>
                            <tbody>
                              {treeMemoryRows.map(r => (
                                <tr key={`tm-${r.structure}`} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.deltaMb.toFixed(3)}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.bytesPerItem.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                </GlassCard>
            </div>
            {(runningCompare || runningMemory) && (
              <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm flex items-center justify-center px-4">
                <div className="w-full max-w-md p-6 rounded-2xl border border-white/15 bg-slate-900/90 text-center">
                  <div className="mx-auto mb-4 w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">{taskLabel || 'Running task...'}</h3>
                  <p className="text-gray-300 mb-1">Estimated time remaining</p>
                  <p className="text-3xl font-extrabold text-white tracking-wide">{formatCountdown(countdownSec)}</p>
                  <p className="text-xs text-gray-400 mt-3">Large N values can take longer depending on browser/device.</p>
                </div>
              </div>
            )}
        </section>
    );
};

// --- Stats Page ---
const StatsPage = ({ theme }) => {
  return (
    <section id="stats" className="min-h-screen flex items-center justify-center py-24 px-4">
      <div className="container mx-auto max-w-6xl w-full">
        {/* Header */}
        <Reveal>
        <div className="mb-10">
          <GlassCard className="p-8 md:p-10" theme={theme}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Developer Stats</h1>
                <p className="mt-2 text-gray-300 max-w-2xl">A quick snapshot of my open‑source presence and coding practice, updated automatically with caching for fast loads.</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${theme === 'pink' ? 'bg-pink-500/20 text-pink-200' : 'bg-emerald-500/20 text-emerald-200'}`}>Auto‑refreshed</div>
            </div>
          </GlassCard>
        </div>
        </Reveal>

        {/* Stats Grid */}
        <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <GitHubStats theme={theme} />
          <LeetCodeStats theme={theme} />
        </div>
        </Reveal>

        {/* Footer note */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Data via GitHub API & LeetCode GraphQL • Cached to improve performance
        </div>
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
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Technical Skills</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        A comprehensive overview of my technical expertise and proficiency levels
                    </p>
                </div>
                </Reveal>

                {/* Category Filter */}
                <Reveal>
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
                </Reveal>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSkills.map((skill, index) => (
                        <Reveal key={skill.name}>
                        <GlassCard 
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
                        </Reveal>
                    ))}
                </div>

                {/* Skills Summary */}
                <Reveal className="mt-8">
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
                </Reveal>
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
    const featuredPost = selectedCategory === 'all' ? posts.find(p => p.featured) || null : null;

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const categoryBgColor = theme === 'pink' ? "bg-pink-500/20" : "bg-emerald-500/20";
    const tagColor = theme === 'pink' ? "bg-pink-500/20 text-pink-300" : "bg-emerald-500/20 text-emerald-300";

    return (
        <section id="blog" className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog & Articles</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Thoughts, tutorials, and insights about technology, development, and my journey in tech
                    </p>
                </div>
                </Reveal>

                {/* Category Filter */}
                <Reveal>
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
                </Reveal>

                {/* Featured (Blog Section) */}
                {selectedCategory === 'all' && featuredPost && (
                    <Reveal className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">Featured</h3>
                        <Link to={`/blog/${featuredPost.id}`} className="block">
                            <GlassCard className="p-0 md:p-0 group cursor-pointer hover:scale-[1.01] transition-transform duration-300 overflow-hidden">
                                {featuredPost.image && (
                                  <div className="w-full h-56 md:h-72 overflow-hidden">
                                    <img src={featuredPost.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-6 md:p-8">
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
                                </div>
                            </GlassCard>
                        </Link>
                    </Reveal>
                )}

                {/* Posts */}
                <div>
                    <Reveal>
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">
                        {selectedCategory === 'all' ? 'Blog' : `${categories[selectedCategory]} Articles`}
                    </h3>
                    </Reveal>
                    {loading && <div className="text-center text-gray-300">Loading...</div>}
                    {error && <div className="text-center text-red-300">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <Reveal key={post.id}>
                            <Link to={`/blog/${post.id}`} className="block">
                            <GlassCard className="p-0 group cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden">
                                {post.image && (
                                  <div className="w-full h-40 overflow-hidden">
                                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-6">
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
                                </div>
                            </GlassCard>
                            </Link>
                            </Reveal>
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
                    {post.image && (
                      <div className="w-full h-60 md:h-80 overflow-hidden rounded mb-6">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-white mb-6">{post.title}</h1>
                    <MarkdownContent content={post.content} />
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
  const [paths, setPaths] = useState([]);
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

  useEffect(() => {
    // Top paths breakdown
    fetch(`/api/metrics/paths?range=${range}`)
      .then(res => res.ok ? res.json() : { paths: [] })
      .then(d => setPaths(Array.isArray(d.paths) ? d.paths : []))
      .catch(() => setPaths([]))
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
                {[7,30,90].map(r => (
                  <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded ${range===r ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'}`}>{r}-day</button>
                ))}
              </div>

              {/* Simple SVG line chart */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded">
                <Chart theme={theme} data={series} />
              </div>

              {/* Top pages table */}
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded">
                <h4 className="text-white font-semibold mb-3">Top Pages (last {range} days)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-300">
                        <th className="py-2 pr-4">Path</th>
                        <th className="py-2 pr-4">Pageviews</th>
                        <th className="py-2 pr-4">Visitors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paths.map((p) => (
                        <tr key={p.path} className="border-t border-white/10 text-gray-200">
                          <td className="py-2 pr-4 font-mono">{p.path}</td>
                          <td className="py-2 pr-4">{p.pageviews}</td>
                          <td className="py-2 pr-4">{p.uniqueVisitors}</td>
                        </tr>
                      ))}
                      {paths.length === 0 && (
                        <tr><td colSpan={3} className="py-3 text-gray-400">No data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
        message: '',
        company: '' // honeypot
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
            setFormData({ name: '', email: '', subject: '', message: '', company: '' });
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
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Let's Connect</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        I'm currently seeking new opportunities and am open to collaboration. 
                        Whether you have a question or just want to say hi, feel free to reach out.
                    </p>
                </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <Reveal>
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
                    </Reveal>

                    {/* Contact Methods */}
                    <div className="space-y-8">
                        <Reveal>
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
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                                {method.description}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {method.value}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </GlassCard>
                        </Reveal>
                        
                        <Reveal>
                        <GlassCard className="p-8 overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-4">Availability</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className={`w-4 h-4 rounded-full ${theme === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'} animate-ping absolute`}></div>
                                        <div className={`w-4 h-4 rounded-full ${theme === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'} relative`}></div>
                                    </div>
                                    <p className="text-gray-300">Open to new opportunities</p>
                                </div>
                                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                    <div className="text-gray-400 text-sm">Response Time</div>
                                    <div className="text-white font-medium">Within 24 hours</div>
                                </div>
                            </div>
                            
                            {/* Decorative chart-like background */}
                            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
                                    <path d="M0 100 L20 80 L40 90 L60 50 L80 60 L100 20 V100 Z" />
                                </svg>
                            </div>
                        </GlassCard>
                        </Reveal>
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
                            Software Engineer passionate about creating beautiful, functional web applications with a focus on user experience.
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

// --- 404 Not Found Page ---
const NotFoundPage = ({ theme }) => {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = 'Page not found — Parjad Minooei';
        return () => { document.title = 'Parjad Minooei'; };
    }, []);
    const gradientClass = theme === 'pink'
        ? 'bg-gradient-to-r from-pink-500 to-red-500'
        : 'bg-gradient-to-r from-emerald-500 to-teal-500';

    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-2xl text-center">
                <Reveal>
                <GlassCard className="p-12 md:p-16" theme={theme}>
                    <div className={`text-8xl md:text-9xl font-extrabold ${theme === 'pink' ? 'text-pink-400/30' : 'text-emerald-400/30'}`}>404</div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mt-4">Page not found</h1>
                    <p className="text-gray-300 mt-2 max-w-md mx-auto">
                        The link you followed doesn't exist on parjadm.ca. It may have been moved or removed.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className={`px-6 py-3 rounded-full font-semibold text-white ${gradientClass} hover:opacity-90 transition-opacity`}
                        >
                            Go home
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-full font-semibold bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15 hover:text-white transition-colors"
                        >
                            Go back
                        </button>
                    </div>
                </GlassCard>
                </Reveal>
            </div>
        </section>
    );
};

// --- Layout Component (wraps all pages) ---
const Layout = ({ theme, toggleTheme, darkMode, toggleDarkMode, toast, setToast }) => {
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
          '/': 'Parjad Minooei — Software Engineer Portfolio',
          '/about': 'About — Parjad Minooei',
          '/projects': 'Projects — Parjad Minooei',
          '/projects/lqftBenchmark': 'LQFT Benchmark — Parjad Minooei',
          '/blog': 'Blog — Parjad Minooei',
          '/contact': 'Contact — Parjad Minooei',
        }
        const descMap = {
          '/': 'Software Engineer building beautiful, fast, user‑centric web apps.',
          '/about': 'Learn about Parjad’s background and skills.',
          '/projects': 'Selected projects with code and live demos.',
          '/projects/lqftBenchmark': 'Run the interactive LQFT benchmark demo in your browser and compare fixed-depth routed lookups with baseline map operations.',
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
        <div className={`font-sans transition-colors duration-500 ${
            darkMode
                ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white'
                : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-gray-900'
        } ${!darkMode ? 'light-mode' : ''}`}>
            <style>{`
                body { font-family: 'Inter', sans-serif; }
                .lqft-select option { color: #0f172a; background: #f8fafc; }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .light-mode .text-white { color: rgb(17 24 39) !important; }
                .light-mode .text-gray-300 { color: rgb(75 85 99) !important; }
                .light-mode .text-gray-400 { color: rgb(107 114 128) !important; }
                .light-mode .text-gray-500 { color: rgb(107 114 128) !important; }
                .light-mode [class*="bg-white/"] { --tw-bg-opacity: 0.06; background-color: rgb(0 0 0 / var(--tw-bg-opacity)) !important; }
                .light-mode [class*="border-white/"] { border-color: rgb(229 231 235 / 0.8) !important; }
                .light-mode .border-white\\/10 { border-color: rgb(229 231 235) !important; }
                .light-mode .hover\\:border-white\\/20:hover { border-color: rgb(156 163 175) !important; }
                .light-mode .hover\\:border-white\\/40:focus { border-color: rgb(107 114 128) !important; }
                .light-mode .focus\\:border-white\\/40:focus { border-color: rgb(107 114 128) !important; }
                .light-mode .placeholder-gray-400::placeholder { color: rgb(156 163 175); }
                .light-mode header a, .light-mode header button { color: rgb(17 24 39) !important; }
                .light-mode header nav a:hover { color: rgb(17 24 39) !important; }
                .light-mode header nav a[aria-current="page"] { background-color: rgba(16 185 129 / 0.2) !important; color: rgb(5 150 105) !important; }
                .light-mode header img[alt="Logo"] { filter: brightness(0); }
                .light-mode .text-gray-200 { color: rgb(55 65 81) !important; }
                .light-mode footer .text-gray-300 { color: rgb(75 85 99) !important; }
                .light-mode footer .text-gray-500 { color: rgb(107 114 128) !important; }
                .light-mode footer a { color: rgb(75 85 99) !important; }
                .light-mode footer a:hover { color: rgb(34 197 94) !important; }
                .light-mode ::placeholder { color: rgb(156 163 175); opacity: 1; }
            `}</style>

            <BackgroundBlobs theme={theme} darkMode={darkMode} />
            <CustomCursor theme={theme} darkMode={darkMode} />
            <Header toggleTheme={toggleTheme} toggleDarkMode={toggleDarkMode} theme={theme} darkMode={darkMode} />
            
            <main id="main-content" role="main" tabIndex={-1} className="transition-all duration-500 pt-20 md:pt-24">
                <Routes>
                    <Route path="/" element={<HomeSection theme={theme} />} />
                    <Route path="/about" element={<AboutSection theme={theme} />} />
                    <Route path="/projects" element={<ProjectsSection theme={theme} />} />
                    <Route path="/projects/lqftBenchmark" element={<LQFTBenchmarkPage theme={theme} />} />
                    <Route path="/stats" element={<StatsPage theme={theme} />} />
                    <Route path="/blog" element={<BlogSection theme={theme} />} />
                    <Route path="/blog/:id" element={<BlogPostPage theme={theme} />} />
                    <Route path="/contact" element={<ContactSection theme={theme} />} />
                    <Route path="/admin/login" element={<AdminLoginPage theme={theme} />} />
                    <Route path="/admin" element={<RequireAuth><AdminDashboard theme={theme} /></RequireAuth>} />
                    <Route path="*" element={<NotFoundPage theme={theme} />} />
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
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored === null ? true : stored === 'true';
    } catch { return true; }
  });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'pink' ? 'green' : 'pink');
      setToast({ isVisible: true, message: `Switched to ${theme === 'pink' ? 'Green' : 'Pink'} theme!`, type: 'success' });
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem('darkMode', String(next)); } catch {}
      setToast({ isVisible: true, message: `Switched to ${next ? 'Dark' : 'Light'} mode`, type: 'success' });
      return next;
    });
  };

  return (
      <Router>
          <Layout theme={theme} toggleTheme={toggleTheme} darkMode={darkMode} toggleDarkMode={toggleDarkMode} toast={toast} setToast={setToast} />
      </Router>
    );
}
