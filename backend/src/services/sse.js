/**
 * Lightweight in-process SSE broker.
 *
 * Each authenticated user can have multiple concurrent connections (tabs /
 * devices).  When a mutation occurs the route handler calls `broadcast(userId,
 * event, payload)` and every active response stream for that user receives the
 * event immediately — no polling, no hard refresh required.
 *
 * Design notes
 * ─────────────
 * • Pure in-process Map: zero extra infrastructure for a single-instance
 *   deployment on Vercel / Railway.  For multi-instance deployments swap the
 *   Map for a Redis pub/sub channel (drop-in replacement for `broadcast`).
 * • Each connection is represented by a plain object { id, res } so we can
 *   remove stale connections without leaking memory when clients disconnect.
 * • SSE heartbeat: every 25 s we write a `: ping\n\n` comment to keep the
 *   connection alive through proxies and load-balancers that close idle HTTP/1.1
 *   connections after 30 s.
 */

/** @type {Map<string, Set<{id: string, res: import('express').Response}>>} */
const channels = new Map();

let _nextId = 1;

/**
 * Register a new SSE client for the given userId.
 * Returns a cleanup function that removes the client when the connection closes.
 *
 * @param {string} userId
 * @param {import('express').Response} res
 * @returns {{ cleanup: () => void, clientId: string }}
 */
export function subscribe(userId, res) {
  const clientId = String(_nextId++);

  if (!channels.has(userId)) {
    channels.set(userId, new Set());
  }
  const clients = channels.get(userId);
  const client = { id: clientId, res };
  clients.add(client);

  // SSE headers — must be set before any write
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
  res.flushHeaders();

  // Send an initial "connected" event so the client knows the stream is live
  sendEvent(res, 'connected', { clientId });

  // Heartbeat to keep proxies / load-balancers from closing the idle connection
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      // connection already closed
    }
  }, 25_000);

  const cleanup = () => {
    clearInterval(heartbeat);
    clients.delete(client);
    if (clients.size === 0) {
      channels.delete(userId);
    }
  };

  return { cleanup, clientId };
}

/**
 * Broadcast an SSE event to all active connections for `userId`.
 *
 * @param {string} userId
 * @param {string} event  - event name, e.g. 'rating_updated'
 * @param {object} payload - JSON-serialisable payload
 */
export function broadcast(userId, event, payload) {
  const clients = channels.get(String(userId));
  if (!clients || clients.size === 0) return;

  for (const client of clients) {
    try {
      sendEvent(client.res, event, payload);
    } catch {
      // stale connection — will be cleaned up on the 'close' event
    }
  }
}

/**
 * Write a single SSE frame to `res`.
 *
 * @param {import('express').Response} res
 * @param {string} event
 * @param {object} data
 */
function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Return the number of active SSE connections across all users.
 * Useful for monitoring / health checks.
 */
export function connectionCount() {
  let total = 0;
  for (const clients of channels.values()) {
    total += clients.size;
  }
  return total;
}
