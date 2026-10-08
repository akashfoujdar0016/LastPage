'use client';

import { useSync } from '../lib/useSync';

/**
 * SyncProvider — A zero-render client component that activates the SSE
 * real-time sync hook for the entire application.
 *
 * Placed inside the Server Component root layout so it persists across all
 * page navigations without remounting. It renders nothing visible.
 */
export default function SyncProvider() {
  useSync();
  return null;
}
