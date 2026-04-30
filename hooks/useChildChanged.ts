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
 */

import { useEffect, useCallback } from 'react';
import { onChildChanged } from '../services/childEvents';
import { getActiveChildId } from '../services/childManager';

export function useChildChanged(callback: (childId: string | null) => void): void {
  // Stable reference so we don't re-subscribe on every render
  const stableCallback = useCallback(callback, []);

  useEffect(() => {
    // Fire once on mount with the current active child
    getActiveChildId().then((id) => stableCallback(id));

    // Subscribe to future changes
    const unsub = onChildChanged((id) => stableCallback(id));
    return unsub;
  }, [stableCallback]);
}
