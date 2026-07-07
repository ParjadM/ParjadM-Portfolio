import React, { useState, useEffect } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { BlogEditor } from './BlogEditor.jsx';
import { AdminModal } from './components/AdminModal.jsx';
import { AdminListSkeleton } from './components/AdminSkeleton.jsx';
import { Clock, Star } from 'lucide-react';

const EMPTY_FORM = { title: '', excerpt: '', content: '', tags: '', status: 'draft', publishAt: new Date().toISOString().slice(0, 10), category: 'personal', image: '' };

export const AdminBlogManager = () => {
  const { showToast } = useAdmin();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminJson('/api/admin/blog');
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (e) {
      showToast(e.message || 'Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing('new'); setForm({ ...EMPTY_FORM, publishAt: new Date().toISOString().slice(0, 10) }); };
  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      title: p.title,
      excerpt: p.excerpt || '',
      content: p.content || '',
      tags: (p.tags || []).join(','),
      status: p.status || 'draft',
      publishAt: p.publishAt ? new Date(p.publishAt).toISOString().slice(0, 10) : p.date,
      category: p.category || 'personal',
      image: p.image || '',
    });
  };
  const onChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };

  const save = async () => {
    const body = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: form.status,
      publishAt: form.publishAt,
      category: form.category,
    };
    try {
      if (editing === 'new') {
        await adminJson('/api/admin/blog', { method: 'POST', body: JSON.stringify(body) });
        showToast('Post created');
      } else {
        await adminJson(`/api/admin/blog/${editing}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Post saved');
      }
      setEditing(null);
      load();
    } catch (e) {
      showToast(e.message || 'Save failed', 'error');
    }
  };

  const publish = async (id) => {
    try {
      await adminJson(`/api/admin/blog/${id}/publish`, { method: 'POST', body: JSON.stringify({ publishAt: new Date().toISOString() }) });
      showToast('Published');
      load();
    } catch (e) {
      showToast(e.message || 'Publish failed', 'error');
    }
  };

  const toggleFeature = async (p) => {
    try {
      await adminJson(`/api/admin/blog/${p.id}/feature`, { method: 'POST', body: JSON.stringify({ featured: !p.featured }) });
      showToast(p.featured ? 'Unfeatured' : 'Featured');
      load();
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await adminJson(`/api/admin/blog/${deleteId}`, { method: 'DELETE' });
      showToast('Post deleted');
      setDeleteId(null);
      load();
    } catch (e) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  const isScheduled = (p) => {
    if (p.status === 'published') return false;
    if (!p.publishAt) return false;
    return new Date(p.publishAt) > new Date();
  };

  const filtered = posts.filter((p) => {
    if (statusFilter === 'draft' && p.status !== 'draft') return false;
    if (statusFilter === 'published' && p.status !== 'published') return false;
    if (statusFilter === 'featured' && !p.featured) return false;
    if (statusFilter === 'scheduled' && !isScheduled(p)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title?.toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="text-gray-300">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xl text-white font-bold">Blog</h3>
        {!editing && (
          <button type="button" onClick={startNew} className="px-3 py-2 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 text-sm">New post</button>
        )}
      </div>

      {editing ? (
        <BlogEditor editing={editing} form={form} onChange={onChange} onSave={save} onCancel={() => setEditing(null)} showToast={showToast} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="flex-1 min-w-[160px] px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
            />
            {['all', 'draft', 'published', 'featured', 'scheduled'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm capitalize ${statusFilter === f ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? <AdminListSkeleton /> : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.image && <img src={p.image} alt="" className="w-10 h-7 object-cover rounded" />}
                      <span className="text-white font-medium truncate">{p.title}</span>
                      {p.featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                      {isScheduled(p) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs">
                          <Clock className="w-3 h-3" /> Scheduled {new Date(p.publishAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{p.status || 'draft'} · {p.date}</div>
                  </div>
                  <div className="flex gap-1 shrink-0 flex-wrap">
                    <button type="button" onClick={() => toggleFeature(p)} className="px-2 py-1 rounded bg-white/10 text-xs">{p.featured ? 'Unfeature' : 'Feature'}</button>
                    <button type="button" onClick={() => startEdit(p)} className="px-2 py-1 rounded bg-white/10 text-xs">Edit</button>
                    {p.status !== 'published' && <button type="button" onClick={() => publish(p.id)} className="px-2 py-1 rounded bg-emerald-600/70 text-xs">Publish</button>}
                    <button type="button" onClick={() => setDeleteId(p.id)} className="px-2 py-1 rounded bg-red-600/60 text-xs">Delete</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-gray-500 text-sm">No posts match filters.</div>}
            </div>
          )}
        </>
      )}

      <AdminModal
        open={!!deleteId}
        title="Delete post?"
        onClose={() => setDeleteId(null)}
        footer={
          <>
            <button type="button" onClick={() => setDeleteId(null)} className="px-3 py-2 rounded-lg bg-white/10">Cancel</button>
            <button type="button" onClick={remove} className="px-3 py-2 rounded-lg bg-red-600/80">Delete</button>
          </>
        }
      >
        This cannot be undone.
      </AdminModal>
    </div>
  );
};
