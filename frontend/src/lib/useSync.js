'use client';

import { useEffect, useRef } from 'react';
import { getToken } from './api';

/**
 * useSync — Subscribe to the backend SSE event stream for the authenticated
 * user and dispatch browser CustomEvents so any component tree can react to
 * cross-device mutations without a hard refresh or manual polling.
 *
 * How it works
 * ────────────
 * 1. Opens an EventSource to GET /api/events?token=<JWT>.
 * 2. Maps each named SSE event to a window CustomEvent with the same name and
 *    the parsed JSON payload as `detail`.
 * 3. Components subscribe with window.addEventListener('rating_updated', …)
 *    exactly as they already do for 'activityUpdated' / 'socialUpdated'.
 * 4. Implements exponential back-off reconnection (max 30 s) so a momentary
 *    network blip doesn't permanently break real-time sync.
 * 5. Closes the stream on component unmount to avoid memory leaks.
 *
 * Usage (place in the root layout or a persistent top-level component):
 *   import { useSync } from '../lib/useSync';
 *   export default function Layout({ children }) {
 *     useSync();          // ← single call; no props needed
 *     return <>{children}</>;
 *   }
 *
 * Consuming an event in any child component:
 *   useEffect(() => {
 *     const handler = (e) => {
 *       const { contentId, score, averageRating } = e.detail;
 *       // update local state here
 *     };
 *     window.addEventListener('rating_updated', handler);
 *     return () => window.removeEventListener('rating_updated', handler);
 *   }, []);
 *
 * Supported server-sent events
 * ────────────────────────────
 * • connected        — stream opened (internal, no re-dispatch)
 * • rating_updated   — a rating was saved/changed on another device
 *                      detail: { contentId, contentSlug, score,
 *                                averageRating, ratingCount,
 *                                ratingBreakdown, ratingCounts }
 * • status_updated   — watch/read status changed (future use)
 * • library_changed  — generic library mutation (future use)
 */

/** Named SSE events we want to re-dispatch as CustomEvents on window. */
const WATCHED_EVENTS = [
  'rating_updated',
  'status_updated',
  'library_changed',
];

/** Maximum back-off delay in milliseconds before retrying. */
const MAX_BACKOFF_MS = 30_000;

export function useSync() {
  const esRef = useRef(null);
  const backoffRef = useRef(1_000); // start at 1 s
  const retryTimer = useRef(null);

  useEffect(() => {
    let destroyed = false;

    function connect() {
      const token = getToken();
      if (!token) {
        // Not logged in — no stream needed. Re-check after 5 s in case the
        // user logs in while the component is mounted (e.g. login modal).
        retryTimer.current = setTimeout(() => {
          if (!destroyed) connect();
        }, 5_000);
        return;
      }

      const base =
        process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined'
          ? `${window.location.origin}/api`
          : 'http://localhost:4000/api');

      // EventSource does not support custom headers in browsers, so we pass
      // the JWT as a query parameter. The server validates it identically.
      const url = `${base}/events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener('connected', () => {
        // Reset back-off on successful connection
        backoffRef.current = 1_000;
      });

      // Re-dispatch each watched server event as a window CustomEvent
      for (const name of WATCHED_EVENTS) {
        es.addEventListener(name, (e) => {
          try {
            const payload = JSON.parse(e.data);
            window.dispatchEvent(new CustomEvent(name, { detail: payload }));
          } catch {
            // Malformed JSON — ignore
          }
        });
      }

      es.onerror = () => {
        es.close();
        esRef.current = null;

        if (destroyed) return;

        // Exponential back-off with jitter
        const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
        retryTimer.current = setTimeout(() => {
          if (!destroyed) connect();
        }, delay + Math.random() * 500);
      };
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimer.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);
}
