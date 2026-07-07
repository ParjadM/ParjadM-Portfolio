import { getAuthToken } from './auth.jsx';
import { getAdminLoginPath } from './i18nRouting.js';

export async function adminFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    try { localStorage.removeItem('authToken'); } catch {}
    const loginPath = getAdminLoginPath(window.location.pathname);
    window.location.href = loginPath;
    throw new Error('Session expired');
  }
  return res;
}

export async function adminJson(url, options = {}) {
  const res = await adminFetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

/** Upload file to Cloudinary via admin signature; optionally register in media library. */
export async function uploadToCloudinary(file, folder = 'uploads', registerMedia = true) {
  const sig = await adminJson('/api/admin/cloudinary-sign', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', sig.timestamp);
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');

  if (registerMedia) {
    try {
      await adminJson('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          url: data.secure_url,
          folder,
          publicId: data.public_id,
          filename: file.name,
          bytes: data.bytes,
        }),
      });
    } catch {}
  }
  return data.secure_url;
}
