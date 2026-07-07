import React, { useEffect, useState } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { AdminListSkeleton } from './components/AdminSkeleton.jsx';

export const AdminMediaLibrary = ({ onSelectUrl }) => {
  const { showToast } = useAdmin();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminJson('/api/admin/media')
      .then((d) => setAssets(d.assets || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url);
    showToast('URL copied');
  };

  const remove = async (id) => {
    await adminJson(`/api/admin/media/${id}`, { method: 'DELETE' });
    load();
    showToast('Removed from library');
  };

  return (
    <div className="text-gray-300">
      <h3 className="text-xl text-white font-bold mb-2">Media library</h3>
      <p className="text-sm text-gray-400 mb-4">Images uploaded via blog/projects are saved here for reuse.</p>
      {loading ? <AdminListSkeleton rows={4} /> : assets.length === 0 ? (
        <p className="text-gray-500 text-sm">No media yet. Upload an image in Blog or Projects.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {assets.map((a) => (
            <div key={a.id} className="rounded-lg border border-white/10 overflow-hidden bg-white/5 group">
              <img src={a.url} alt="" className="w-full h-24 object-cover" />
              <div className="p-2 flex gap-1">
                <button type="button" onClick={() => copyUrl(a.url)} className="flex-1 text-xs py-1 rounded bg-white/10 hover:bg-white/20">Copy</button>
                {onSelectUrl && (
                  <button type="button" onClick={() => onSelectUrl(a.url)} className="flex-1 text-xs py-1 rounded bg-emerald-600/70">Use</button>
                )}
                <button type="button" onClick={() => remove(a.id)} className="text-xs px-2 py-1 rounded bg-red-600/50">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
