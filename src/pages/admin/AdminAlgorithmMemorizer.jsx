import React, { useEffect, useRef, useState } from 'react'
import { adminJson, uploadToCloudinary } from '../../utils/adminApi.js'
import { useAdmin } from './AdminContext.jsx'
import { AdminModal } from './components/AdminModal.jsx'
import { AdminListSkeleton } from './components/AdminSkeleton.jsx'

const EMPTY = {
  slug: '',
  title: '',
  category: 'arrays-strings',
  difficulty: 'medium',
  description: '',
  image: '',
  skeleton: '',
  reference: '',
  testCasesJson: '[]',
  timeComplexity: '',
  spaceComplexity: '',
  enabled: true,
  order: 0,
}

function formFromAlgo(a) {
  return {
    slug: a.slug || '',
    title: a.title || '',
    category: a.category || 'arrays-strings',
    difficulty: a.difficulty || 'medium',
    description: a.description || '',
    image: a.image || '',
    skeleton: a.skeleton || '',
    reference: a.reference || '',
    testCasesJson: JSON.stringify(a.runnerTests || a.testCases || [], null, 2),
    timeComplexity: a.timeComplexity || '',
    spaceComplexity: a.spaceComplexity || '',
    enabled: a.enabled !== false,
    order: a.order ?? 0,
  }
}

export default function AdminAlgorithmMemorizer() {
  const { showToast } = useAdmin()
  const [algorithms, setAlgorithms] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminJson('/api/admin/algorithms')
      setAlgorithms(Array.isArray(data.algorithms) ? data.algorithms : [])
      setCategories(Array.isArray(data.categories) ? data.categories : [])
    } catch (e) {
      showToast(e.message || 'Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const startNew = () => { setEditing('new'); setForm(EMPTY) }
  const startEdit = (a) => { setEditing(a.id); setForm(formFromAlgo(a)) }

  const parseBody = () => {
    let testCases = []
    try {
      testCases = JSON.parse(form.testCasesJson || '[]')
      if (!Array.isArray(testCases)) throw new Error('testCases must be an array')
    } catch (e) {
      throw new Error(`Invalid test cases JSON: ${e.message}`)
    }
    return {
      slug: form.slug,
      title: form.title,
      category: form.category,
      difficulty: form.difficulty,
      description: form.description,
      image: form.image,
      skeleton: form.skeleton,
      reference: form.reference,
      testCases,
      timeComplexity: form.timeComplexity,
      spaceComplexity: form.spaceComplexity,
      enabled: form.enabled,
      order: Number(form.order) || 0,
    }
  }

  const save = async () => {
    try {
      const body = parseBody()
      if (!body.title || !body.slug) {
        showToast('Title and slug are required', 'error')
        return
      }
      if (editing === 'new') {
        await adminJson('/api/admin/algorithms', { method: 'POST', body: JSON.stringify(body) })
        showToast('Algorithm created')
      } else {
        await adminJson(`/api/admin/algorithms/${editing}`, { method: 'PUT', body: JSON.stringify(body) })
        showToast('Algorithm saved')
      }
      setEditing(null)
      load()
    } catch (e) {
      showToast(e.message || 'Save failed', 'error')
    }
  }

  const remove = async () => {
    if (!deleteId) return
    try {
      await adminJson(`/api/admin/algorithms/${deleteId}`, { method: 'DELETE' })
      showToast('Algorithm deleted')
      setDeleteId(null)
      load()
    } catch (e) {
      showToast(e.message || 'Delete failed', 'error')
    }
  }

  const seed = async () => {
    try {
      await adminJson('/api/admin/seed-algorithms', { method: 'POST' })
      showToast('Seeded algorithms')
      load()
    } catch (e) {
      showToast(e.message || 'Seed failed', 'error')
    }
  }

  const move = async (fromIdx, toIdx) => {
    const arr = [...algorithms]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    setAlgorithms(arr)
    try {
      await adminJson('/api/admin/algorithms/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids: arr.map((a) => a.id) }),
      })
    } catch (e) {
      showToast(e.message || 'Reorder failed', 'error')
      load()
    }
  }

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, 'algorithms')
      setForm((prev) => ({ ...prev, image: url }))
      showToast('Image uploaded')
    } catch (e) {
      showToast(e.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (editing) {
    return (
      <div className="text-gray-300 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xl text-white font-bold">{editing === 'new' ? 'New algorithm' : 'Edit algorithm'}</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 rounded-lg bg-white/10 text-sm">Cancel</button>
            <button type="button" onClick={save} className="px-3 py-2 rounded-lg bg-emerald-600/70 text-sm">Save</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input name="title" value={form.title} onChange={onChange} placeholder="Title" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <input name="slug" value={form.slug} onChange={onChange} placeholder="slug-kebab-case" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <select name="category" value={form.category} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
            {categories.map((c) => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
          </select>
          <select name="difficulty" value={form.difficulty} onChange={onChange} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
            <option value="easy" className="bg-gray-900">easy</option>
            <option value="medium" className="bg-gray-900">medium</option>
            <option value="hard" className="bg-gray-900">hard</option>
          </select>
          <input name="timeComplexity" value={form.timeComplexity} onChange={onChange} placeholder="Time complexity" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <input name="spaceComplexity" value={form.spaceComplexity} onChange={onChange} placeholder="Space complexity" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <input name="order" type="number" value={form.order} onChange={onChange} placeholder="Order" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <label className="flex items-center gap-2 text-sm">
            <input name="enabled" type="checkbox" checked={form.enabled} onChange={onChange} /> Enabled
          </label>
        </div>
        <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Description" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
        <div className="grid md:grid-cols-3 gap-3 items-center">
          <input name="image" value={form.image} onChange={onChange} placeholder="Image URL" className="md:col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg" />
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-lg bg-white/10 text-sm w-full">
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
          </div>
        </div>
        <label className="block text-xs text-gray-400">Python skeleton</label>
        <textarea name="skeleton" value={form.skeleton} onChange={onChange} rows={6} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg font-mono text-sm" />
        <label className="block text-xs text-gray-400">Reference implementation</label>
        <textarea name="reference" value={form.reference} onChange={onChange} rows={8} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg font-mono text-sm" />
        <label className="block text-xs text-gray-400">Test cases JSON (id, name, visible, expression, expected)</label>
        <textarea name="testCasesJson" value={form.testCasesJson} onChange={onChange} rows={10} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg font-mono text-xs" />
      </div>
    )
  }

  return (
    <div className="text-gray-300">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xl text-white font-bold">Algorithm Memorizer</h3>
        <div className="flex gap-2">
          <button type="button" onClick={seed} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Seed catalog</button>
          <button type="button" onClick={startNew} className="px-3 py-2 rounded-lg bg-emerald-600/70 text-sm">New algorithm</button>
        </div>
      </div>

      {loading ? <AdminListSkeleton /> : (
        <ul className="space-y-2">
          {algorithms.map((a, idx) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">{a.title}</div>
                <div className="text-xs text-gray-400">{a.category} · {a.difficulty} · {a.enabled ? 'on' : 'off'} · order {a.order}</div>
              </div>
              <button type="button" disabled={idx === 0} onClick={() => move(idx, idx - 1)} className="px-2 py-1 text-xs rounded bg-white/10 disabled:opacity-30">↑</button>
              <button type="button" disabled={idx === algorithms.length - 1} onClick={() => move(idx, idx + 1)} className="px-2 py-1 text-xs rounded bg-white/10 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => startEdit(a)} className="px-2 py-1 text-xs rounded bg-emerald-600/40">Edit</button>
              <button type="button" onClick={() => setDeleteId(a.id)} className="px-2 py-1 text-xs rounded bg-red-600/40">Delete</button>
            </li>
          ))}
          {!algorithms.length && <li className="text-sm text-gray-500">No algorithms yet. Seed the catalog or create one.</li>}
        </ul>
      )}

      <AdminModal
        open={!!deleteId}
        title="Delete algorithm?"
        onClose={() => setDeleteId(null)}
        footer={(
          <>
            <button type="button" onClick={() => setDeleteId(null)} className="px-3 py-2 rounded-lg bg-white/10 text-sm">Cancel</button>
            <button type="button" onClick={remove} className="px-3 py-2 rounded-lg bg-red-600/70 text-sm">Delete</button>
          </>
        )}
      >
        <p className="text-sm text-gray-300">This permanently removes the algorithm. Attempts are not deleted.</p>
      </AdminModal>
    </div>
  )
}
