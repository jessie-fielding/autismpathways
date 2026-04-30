/**
 * childEvents.ts
 *
 * A tiny global event bus for child-switching.
 * Any screen can call `emitChildChanged(id)` after switching the active child,
 * and any screen can subscribe with `useChildChanged(callback)` to re-load data.
 *
 * This avoids prop-drilling `onSwitch` callbacks through every navigator and
 * ensures every screen reacts to child changes regardless of how the switch
 * was triggered (dashboard chip, settings, /children screen, etc.).
 */

type Listener = (childId: string) => void;

const listeners = new Set<Listener>();

/** Fire this after writing a new active child ID to AsyncStorage */
export function emitChildChanged(childId: string): void {
  listeners.forEach((fn) => fn(childId));
}

/** Subscribe to child-change events. Returns an unsubscribe function. */
export function onChildChanged(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
