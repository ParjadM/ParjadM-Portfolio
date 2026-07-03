import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../utils/auth.jsx';

export const AdminProjectsManager = ({ theme }) => {
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

