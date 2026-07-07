import React, { useState, useEffect, useRef } from 'react';
import { adminJson, uploadToCloudinary } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { AdminModal } from './components/AdminModal.jsx';
import { AdminListSkeleton } from './components/AdminSkeleton.jsx';

export const AdminProjectsManager = () => {
  const { showToast } = useAdmin();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', tags: '', liveUrl: '', githubUrl: '', image: '', featured: false });
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminJson('/api/admin/projects');
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (e) {
      showToast(e.message || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing('new'); setForm({ title: '', description: '', tags: '', liveUrl: '', githubUrl: '', image: '', featured: false }); };
  const startEdit = (p) => { setEditing(p.id); setForm({ title: p.title, description: p.description || '', tags: (p.tags || []).join(','), liveUrl: p.liveUrl || '', githubUrl: p.githubUrl || '', image: p.image || '', featured: !!p.featured }); };
  const onChange = (e) => { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'projects');
      setForm((prev) => ({ ...prev, image: url }));
      showToast('Image uploaded');
    } catch (e) {
      showToast(e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const body = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editing === 'new') {
        await adminJson('/api/admin/projects', { method: 'POST', body: JSON.stringify(body) });
        showToast('Project created');
      } else {
        await adminJson(`/api/admin/projects/${editing}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Project saved');
      }
      setEditing(null);
      load();
    } catch (e) {
      showToast(e.message || 'Save failed', 'error');
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await adminJson(`/api/admin/projects/${deleteId}`, { method: 'DELETE' });
      showToast('Project deleted');
      setDeleteId(null);
      load();
    } catch (e) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  const feature = async (id, featured) => {
    try {
      await adminJson(`/api/admin/projects/${id}/feature`, { method: 'POST', body: JSON.stringify({ featured }) });
      showToast(featured ? 'Featured' : 'Unfeatured');
      load();
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const move = async (fromIdx, toIdx) => {
    const arr = [...projects];
    const [spliced] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, spliced);
    setProjects(arr);
    try {
      await adminJson('/api/admin/projects/reorder', { method: 'POST', body: JSON.stringify({ ids: arr.map((p) => p.id) }) });
    } catch (e) {
      showToast(e.message || 'Reorder failed', 'error');
      load();
    }
  };

  return (
    <div className="text-gray-300">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xl text-white font-bold">Projects</h3>
        <div className="flex gap-2">
          <button type="button" onClick={async () => { try { await adminJson('/api/admin/seed-projects', { method: 'POST' }); showToast('Demo projects seeded'); load(); } catch (e) { showToast(e.message, 'error'); } }} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Seed demo</button>
          <button type="button" onClick={startNew} className="px-3 py-2 rounded-lg bg-emerald-600/70 text-sm">New project</button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <textarea name="description" value={form.description} onChange={onChange} rows={5} placeholder="Description" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <input name="tags" value={form.tags} onChange={onChange} placeholder="Tags (comma separated)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            <input name="liveUrl" value={form.liveUrl} onChange={onChange} placeholder="Live URL" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
            <input name="githubUrl" value={form.githubUrl} onChange={onChange} placeholder="GitHub URL" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <input name="image" value={form.image} onChange={onChange} placeholder="Image URL" className="md:col-span-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50">{uploading ? 'Uploading…' : 'Upload'}</button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
          </div>
          {form.image && <img src={form.image} alt="" className="w-32 h-20 object-cover rounded-lg" />}
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="featured" checked={form.featured} onChange={onChange} /> Featured</label>
          <div className="flex gap-2">
            <button type="button" onClick={save} className="px-4 py-2 rounded-lg bg-emerald-600/80">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-white/10">Cancel</button>
          </div>
        </div>
      ) : loading ? <AdminListSkeleton /> : (
        <div className="space-y-2">
          {projects.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 gap-2 flex-wrap">
              <div>
                <div className="text-white font-medium">{p.title}</div>
                <div className="text-xs text-gray-400">{p.featured ? 'Featured · ' : ''}{(p.tags || []).join(', ')}</div>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <button type="button" onClick={() => feature(p.id, !p.featured)} className="px-2 py-1 rounded bg-white/10 text-xs">{p.featured ? 'Unfeature' : 'Feature'}</button>
                <button type="button" disabled={idx === 0} onClick={() => move(idx, idx - 1)} className="px-2 py-1 rounded bg-white/10 text-xs disabled:opacity-40">Up</button>
                <button type="button" disabled={idx === projects.length - 1} onClick={() => move(idx, idx + 1)} className="px-2 py-1 rounded bg-white/10 text-xs disabled:opacity-40">Down</button>
                <button type="button" onClick={() => startEdit(p)} className="px-2 py-1 rounded bg-white/10 text-xs">Edit</button>
                <button type="button" onClick={() => setDeleteId(p.id)} className="px-2 py-1 rounded bg-red-600/60 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="text-gray-500 text-sm">No projects yet.</div>}
        </div>
      )}

      <AdminModal open={!!deleteId} title="Delete project?" onClose={() => setDeleteId(null)} footer={<><button type="button" onClick={() => setDeleteId(null)} className="px-3 py-2 rounded-lg bg-white/10">Cancel</button><button type="button" onClick={remove} className="px-3 py-2 rounded-lg bg-red-600/80">Delete</button></>}>This cannot be undone.</AdminModal>
    </div>
  );
};
