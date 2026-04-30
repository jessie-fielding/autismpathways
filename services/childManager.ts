/**
 * childManager.ts
 * Multi-child support service for Autism Pathways.
 *
 * Architecture:
 * - `ap_children`        → JSON array of ChildProfile objects
 * - `ap_active_child_id` → ID string of the currently active child
 * - All child-specific data keys are namespaced: `ap_iep_goals_{childId}`, etc.
 *
 * Usage:
 *   import { useActiveChild } from '../services/childManager';
 *   const { child, childId, switchChild } = useActiveChild();
 *   const key = childKey('ap_iep_goals'); // → 'ap_iep_goals_abc123'
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string;
  name: string;
  dob?: string;
  diagnosis?: string;
  diagnosisLevel?: '1' | '2' | '3' | '';
  gender?: string;
  avatar?: string; // emoji or initials
  color?: string;  // accent color for this child's cards
  createdAt: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const CHILDREN_KEY = 'ap_children';
export const ACTIVE_CHILD_KEY = 'ap_active_child_id';

// Keys that are child-specific and should be namespaced
export const CHILD_SCOPED_KEYS = [
  'ap_diagnosis_step',
  'ap_diagnosis_complete',
  'ap_medicaid_progress',
  'ap_medicaid_status',
  'ap_waiver_progress',
  'ap_iep_progress',
  'ap_iep_goals',
  'ap_iep_flagged_obs',
  'ap_observations',
  'ap_provider_prep_saved',
  'ap_services_tracker',
  'ap_appeal_tracker',
  'ap_disability_quiz_results',
  'ap_icd_quiz_codes',
  'ap_document_vault_status',
  'ap_potty_progress',
  'ap_potty_complete',
  'ap_contacts',
  'ap_medicaid_not_applied_steps',
  'ap_medicaid_approved_steps',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a simple unique ID */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Get a namespaced storage key for the active child */
export function childKey(baseKey: string, childId: string): string {
  return `${baseKey}_${childId}`;
}

/** Default avatar colors for child cards */
const CHILD_COLORS = ['#7C5CBF', '#3BBFA3', '#E67E22', '#E74C3C', '#3498DB', '#9B59B6'];

// ─── Core functions ───────────────────────────────────────────────────────────

/** Load all children from storage */
export async function loadChildren(): Promise<ChildProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(CHILDREN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save children array to storage */
export async function saveChildren(children: ChildProfile[]): Promise<void> {
  await AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

/** Get the active child ID */
export async function getActiveChildId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_CHILD_KEY);
}

/** Set the active child ID */
export async function setActiveChildId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_CHILD_KEY, id);
}

/** Add a new child, returns the new child */
export async function addChild(data: Omit<ChildProfile, 'id' | 'createdAt' | 'color'>): Promise<ChildProfile> {
  const children = await loadChildren();
  const newChild: ChildProfile = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    color: CHILD_COLORS[children.length % CHILD_COLORS.length],
    avatar: data.name ? data.name.slice(0, 2).toUpperCase() : '??',
  };
  await saveChildren([...children, newChild]);
  return newChild;
}

/** Update an existing child */
export async function updateChild(id: string, updates: Partial<ChildProfile>): Promise<void> {
  const children = await loadChildren();
  const updated = children.map((c) => c.id === id ? { ...c, ...updates } : c);
  await saveChildren(updated);
}

/** Delete a child and all their scoped data */
export async function deleteChild(id: string): Promise<void> {
  const children = await loadChildren();
  const remaining = children.filter((c) => c.id !== id);
  await saveChildren(remaining);

  // Remove all scoped keys for this child
  const keysToRemove = CHILD_SCOPED_KEYS.map((k) => childKey(k, id));
  await AsyncStorage.multiRemove(keysToRemove);

  // If this was the active child, switch to the first remaining child
  const activeId = await getActiveChildId();
  if (activeId === id && remaining.length > 0) {
    await setActiveChildId(remaining[0].id);
  }
}

/**
 * Migrate legacy (single-child) data to the first child's namespace.
 * Call this once on first app launch after updating to multi-child.
 */
export async function migrateLegacyData(childId: string): Promise<void> {
  const migrated = await AsyncStorage.getItem('ap_multi_child_migrated');
  if (migrated) return;

  const pairs: [string, string][] = [];
  for (const key of CHILD_SCOPED_KEYS) {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) {
      pairs.push([childKey(key, childId), val]);
    }
  }
  if (pairs.length > 0) {
    await AsyncStorage.multiSet(pairs);
  }
  await AsyncStorage.setItem('ap_multi_child_migrated', 'true');
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface ActiveChildState {
  child: ChildProfile | null;
  childId: string | null;
  children: ChildProfile[];
  loading: boolean;
  switchChild: (id: string) => Promise<void>;
  refreshChildren: () => Promise<void>;
  /** Returns a namespaced key for the active child */
  key: (baseKey: string) => string;
}

export function useActiveChild(): ActiveChildState {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [kids, id] = await Promise.all([loadChildren(), getActiveChildId()]);
    setChildren(kids);

    if (kids.length > 0) {
      const resolvedId = id && kids.find((c) => c.id === id) ? id : kids[0].id;
      setActiveId(resolvedId);
      if (resolvedId !== id) await setActiveChildId(resolvedId);
    } else {
      setActiveId(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const switchChild = useCallback(async (id: string) => {
    await setActiveChildId(id);
    setActiveId(id);
  }, []);

  const activeChild = children.find((c) => c.id === activeId) ?? null;

  const key = useCallback((baseKey: string) => {
    return activeId ? childKey(baseKey, activeId) : baseKey;
  }, [activeId]);

  return {
    child: activeChild,
    childId: activeId,
    children,
    loading,
    switchChild,
    refreshChildren: load,
    key,
  };
}
