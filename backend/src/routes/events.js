import { Router } from 'express';
import { auth } from '../middleware/core.js';
import { subscribe, connectionCount } from '../services/sse.js';

const router = Router();

/**
 * GET /api/events
 *
 * Opens a long-lived Server-Sent Events stream for the authenticated user.
 * All of that user's active sessions (other tabs / devices) will receive
 * push events from this same stream when mutations occur (e.g. rating_updated,
 * status_updated, library_changed).
 *
 * Auth: Bearer token required (same JWT used by all other endpoints).
 *
 * Client usage (JavaScript):
 *   const token = localStorage.getItem('accessToken');
 *   const es = new EventSource(`/api/events?token=${token}`);
 *   es.addEventListener('rating_updated', (e) => {
 *     const payload = JSON.parse(e.data);
 *     // payload: { contentId, contentSlug, score, averageRating, ratingCount, ... }
 *   });
 *
 * Note: EventSource does not support custom headers, so we accept the token
 * as a ?token= query param as a well-established fallback pattern.
 * The token is never logged and is validated with the same verifyAccess utility.
 */
router.get('/', auth(true), (req, res) => {
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { cleanup } = subscribe(userId, res);

  // Clean up when the client disconnects (tab closed, network drop, etc.)
  req.on('close', cleanup);
  req.on('aborted', cleanup);
});

/**
 * GET /api/events/status
 * Returns the current number of active SSE connections (for health monitoring).
 * Does not require auth.
 */
router.get('/status', (_req, res) => {
  res.json({ activeConnections: connectionCount() });
});

export default router;
