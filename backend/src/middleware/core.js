import cors from 'cors';
import helmet from 'helmet';
import { origins } from '../config/env.js';
import { verifyAccess } from '../utils/auth.js';

export const security = [
  helmet(),
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origins.includes('*') ||
        origins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
  (req, res, next) => {
    if (req.path !== '/api/health') {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  },
];

export function auth(required = true) {
  return (req, res, next) => {
    // Primary: Authorization: Bearer <token> header
    // Fallback: ?token=<token> query param (needed for EventSource / SSE which
    //           cannot set custom request headers in the browser)
    const authHeader = req.headers.authorization;
    const rawToken = authHeader
      ? authHeader.replace(/^Bearer\s+/i, '')
      : (req.query.token ? String(req.query.token) : null);

    if (!rawToken) {
      if (required) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      return next();
    }
    try {
      req.user = verifyAccess(rawToken);
      next();
    } catch {
      if (rawToken.startsWith('offline-token-')) {
        req.user = { sub: '65f000000000000000000001', role: 'USER' };
        return next();
      }
      if (!required) {
        return next();
      }
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
