import React, { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '../../utils/auth.jsx';
import { MarkdownContent } from '../../components/ui/MarkdownContent.jsx';

export const AdminBlogManager = ({ theme }) => {
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

