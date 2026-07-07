import { AuditLog } from '../db/mongo.js';
import { currentEngine } from '../db/index.js';

export async function logAdminAction(req, action, details = {}) {
  if (currentEngine !== 'mongo') return;
  try {
    await AuditLog.create({
      username: req.user?.username || 'admin',
      action: String(action).slice(0, 120),
      details: typeof details === 'object' ? details : { note: String(details) },
      ip: (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || '',
    });
  } catch {
    // non-blocking
  }
}
