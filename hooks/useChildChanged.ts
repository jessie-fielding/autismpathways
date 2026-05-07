/**
 * useChildChanged.ts
 *
 * Drop this into any screen that needs to reload when the active child changes.
 *
 * Usage:
 *   import { useChildChanged } from '../../hooks/useChildChanged';
 *   useChildChanged(() => loadData());
 *
 * The callback fires:
 *   1. Immediately on mount (so initial load is handled here too)
 *   2. Whenever emitChildChanged() is called anywhere in the app
 *
 * Uses a ref to hold the latest callback so the subscription is set up only
 * once on mount and never becomes stale — this fixes the bug where the second
 * and subsequent child switches did not trigger a reload.
 */

import { useEffect, useRef } from 'react';
import { onChildChanged } from '../services/childEvents';
import { getActiveChildId } from '../services/childManager';

export function useChildChanged(callback: (childId: string | null) => void): void {
  // Always keep a ref to the latest callback so the subscription never goes stale.
  // This is the standard pattern for event-listener hooks in React — the listener
  // is registered once on mount, but it reads from the ref so it always calls the
  // most recent version of the callback without needing to re-subscribe.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    // Fire once on mount with the current active child
    getActiveChildId().then((id) => callbackRef.current(id));

    // Subscribe to future changes — this runs only once (no deps), so there is
    // no risk of double-subscribing or missing events between re-renders.
    const unsub = onChildChanged((id) => callbackRef.current(id));
    return unsub;
  }, []); // intentionally empty — subscribe once, use ref for freshness
}
