import React, { useEffect, useRef, useState } from 'react';
import { MarkdownContent } from '../../components/ui/MarkdownContent.jsx';
import { readingTimeMinutes } from '../../utils/readingTime.js';
import { uploadToCloudinary } from '../../utils/adminApi.js';
import { SITE_URL } from '../../config/site.js';
import { Bold, Italic, Heading2, Link, List, Code, Image } from 'lucide-react';

const AUTOSAVE_KEY = 'admin-blog-draft';

export const BlogEditor = ({ editing, form, onChange, onSave, onCancel, showToast }) => {
  const contentRef = useRef(null);
  const coverInputRef = useRef(null);
  const inlineInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const restoredRef = useRef(false);

  const readMins = readingTimeMinutes(form.content);
  const liveUrl = editing && editing !== 'new' ? `${SITE_URL}/blog/${editing}` : null;
  const ogUrl = editing && editing !== 'new' ? `${SITE_URL}/api/og/${editing}` : form.image || null;

  useEffect(() => {
    restoredRef.current = false;
  }, [editing]);

  useEffect(() => {
    if (restoredRef.current) return;
    const key = `${AUTOSAVE_KEY}-${editing || 'new'}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw && !form.title && !form.content) {
        restoredRef.current = true;
        const saved = JSON.parse(raw);
        Object.entries(saved).forEach(([k, v]) => onChange({ target: { name: k, value: v } }));
        showToast?.('Restored autosaved draft');
      }
    } catch {}
  }, [editing, form.title, form.content, onChange, showToast]);

  useEffect(() => {
    const key = `${AUTOSAVE_KEY}-${editing || 'new'}`;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(form));
        setLastSaved(new Date());
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [form, editing]);

  const clearAutosave = () => {
    try { localStorage.removeItem(`${AUTOSAVE_KEY}-${editing || 'new'}`); } catch {}
  };

  const wrapSelection = (before, after = before) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = form.content.slice(start, end) || 'text';
    const next = `${form.content.slice(0, start)}${before}${sel}${after}${form.content.slice(end)}`;
    onChange({ target: { name: 'content', value: next } });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const insertAtCursor = (text) => {
    const ta = contentRef.current;
    const start = ta ? ta.selectionStart : form.content.length;
    const end = ta ? ta.selectionEnd : form.content.length;
    const next = `${form.content.slice(0, start)}${text}${form.content.slice(end)}`;
    onChange({ target: { name: 'content', value: next } });
  };

  const handleUpload = async (file, inline = false) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'blog');
      if (inline) insertAtCursor(`\n![Image](${url})\n`);
      else onChange({ target: { name: 'image', value: url } });
      showToast?.('Image uploaded');
    } catch (e) {
      showToast?.(e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    clearAutosave();
    onSave();
  };

  const toolbar = [
    { icon: Bold, action: () => wrapSelection('**'), title: 'Bold' },
    { icon: Italic, action: () => wrapSelection('*'), title: 'Italic' },
    { icon: Heading2, action: () => wrapSelection('## ', ''), title: 'Heading' },
    { icon: Link, action: () => wrapSelection('[', '](url)'), title: 'Link' },
    { icon: List, action: () => insertAtCursor('\n- '), title: 'List' },
    { icon: Code, action: () => wrapSelection('`'), title: 'Code' },
    { icon: Image, action: () => inlineInputRef.current?.click(), title: 'Image' },
  ];

  return (
    <div className="space-y-4">
      <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
      <input name="excerpt" value={form.excerpt} onChange={onChange} placeholder="Excerpt" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />

      <div className="flex flex-wrap gap-2 items-center">
        {toolbar.map(({ icon: Icon, action, title }) => (
          <button key={title} type="button" title={title} onClick={action} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300">
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-auto">{readMins} min read</span>
        {lastSaved && <span className="text-xs text-gray-600">Autosaved {lastSaved.toLocaleTimeString()}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[360px]">
        <textarea
          ref={contentRef}
          name="content"
          value={form.content}
          onChange={onChange}
          rows={16}
          placeholder="Content (Markdown)"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg font-mono text-sm resize-y min-h-[320px]"
        />
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg overflow-y-auto max-h-[480px]">
          <h4 className="text-xs text-gray-500 uppercase mb-2">Preview</h4>
          <MarkdownContent content={form.content || '_Start writing…_'} />
        </div>
      </div>

      <input ref={inlineInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, true); e.target.value = ''; }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <input name="image" value={form.image} onChange={onChange} placeholder="Cover image URL" className="md:col-span-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
        <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploading} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload cover'}
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
      </div>

      {form.image && (
        <div className="w-40 h-24 rounded-lg bg-black/30 overflow-hidden flex items-center justify-center">
          <img src={form.image} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input name="tags" value={form.tags} onChange={onChange} placeholder="Tags (comma separated)" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
        <select name="status" value={form.status} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <input type="date" name="publishAt" value={form.publishAt} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
        <select name="category" value={form.category} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
          <option value="technology">Technology</option>
          <option value="tutorial">Tutorial</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {(liveUrl || ogUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
          {liveUrl && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Live link</div>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:underline break-all">{liveUrl}</a>
            </div>
          )}
          {ogUrl && (
            <div>
              <div className="text-xs text-gray-500 mb-2">OG preview</div>
              <img src={ogUrl} alt="OG preview" className="w-full max-w-xs rounded-lg border border-white/10" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/10">Cancel</button>
      </div>
    </div>
  );
};
