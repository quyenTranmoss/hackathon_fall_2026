import { db, publicUser } from '../db.js';

export function ensureDemoSession(req, _res, next) {
  if (!req.session.userId) {
    const demo = db.prepare('SELECT * FROM users WHERE is_current_user=1 LIMIT 1').get();
    if (demo) req.session.userId = demo.id;
  }
  next();
}

export function requireAuth(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.user = user;
  return next();
}

export const currentUserResponse = (user) => publicUser(user);
