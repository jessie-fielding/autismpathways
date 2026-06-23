/**
 * cloudSync.ts
 *
 * Backs up and restores all user AsyncStorage data to/from the Autism Pathways
 * backend so data survives app reinstalls, device switches, and TestFlight
 * full-uninstall scenarios.
 *
 * Architecture:
 *  - Backup:  reads ALL keys from AsyncStorage, filters out sensitive/ephemeral
 *             keys (auth tokens, device IDs), and POSTs a JSON snapshot to the
 *             backend keyed by the user's Cognito user ID.
 *  - Restore: on sign-in to a fresh install (no local data), fetches the
 *             snapshot from the backend and writes all keys back to AsyncStorage.
 *  - Debounce: backup is debounced (30 s) so rapid writes don't hammer the API.
 *
 * Usage:
 *   import { scheduleBackup, restoreFromCloud } from './cloudSync';
 *
 *   // After any data change:
 *   scheduleBackup(cognitoUserId);
 *
 *   // After sign-in on a fresh install:
 *   const restored = await restoreFromCloud(cognitoUserId);
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

// Keys that should NEVER be backed up — sensitive, ephemeral, or device-specific
const EXCLUDED_KEYS = new Set([
  'authToken',
  'authRefreshToken',
  'authDisplayName',
  'ap_device_id',
  // expo-secure-store keys are in the Keychain, not AsyncStorage — not needed here
]);

// Prefix for child-scoped keys — always include these
const INCLUDE_PREFIXES = [
  'ap_',
  'profile',
  'tasks',
  'diagnosis_',
  'eval_type',
  'selected_evaluator',
  'tried_evaluators',
  'waitlist_applications',
  'off_waitlist_date',
  'potty_result',
  'provider_ready_to_connect',
];

let backupTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule a debounced backup (fires 30 s after the last call).
 * Safe to call frequently — only one network request will be made.
 */
export function scheduleBackup(cognitoUserId: string | null): void {
  if (!cognitoUserId) return;
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    performBackup(cognitoUserId).catch((err) =>
      console.warn('[CloudSync] Backup failed silently:', err)
    );
  }, 30_000);
}

/**
 * Immediately perform a backup (no debounce).
 * Returns { success, sizeBytes } or throws on error.
 */
export async function performBackup(
  cognitoUserId: string
): Promise<{ success: boolean; sizeBytes: number }> {
  // Read all keys from AsyncStorage
  const allKeys = await AsyncStorage.getAllKeys();

  // Filter: only include keys that match our known prefixes and aren't excluded
  const keysToBackup = allKeys.filter((key) => {
    if (EXCLUDED_KEYS.has(key)) return false;
    return INCLUDE_PREFIXES.some((prefix) => key.startsWith(prefix));
  });

  if (keysToBackup.length === 0) {
    return { success: true, sizeBytes: 0 };
  }

  // Read all values in one batch call
  const pairs = await AsyncStorage.multiGet(keysToBackup);
  const data: Record<string, string> = {};
  for (const [key, value] of pairs) {
    if (value !== null) data[key] = value;
  }

  const res = await fetch(`${API_BASE}/api/sync/backup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cognitoUserId, data }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Backup HTTP ${res.status}`);
  }

  const result = await res.json();
  return { success: true, sizeBytes: result.sizeBytes ?? 0 };
}

/**
 * Restore data from the cloud for the given user.
 *
 * Returns:
 *  - { restored: true, keyCount }  — data was found and written to AsyncStorage
 *  - { restored: false }           — no backup exists (new user or first-time backup)
 *
 * This should be called AFTER sign-in, but ONLY when the device has no existing
 * local data (i.e., fresh install). If local data already exists, skip restore
 * to avoid overwriting newer data with an older backup.
 */
export async function restoreFromCloud(
  cognitoUserId: string
): Promise<{ restored: boolean; keyCount?: number; backedUpAt?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/api/sync/restore?cognitoUserId=${encodeURIComponent(cognitoUserId)}`
    );
    if (!res.ok) return { restored: false };

    const { data, backedUpAt } = await res.json();
    if (!data || typeof data !== 'object') return { restored: false };

    const entries = Object.entries(data) as [string, string][];
    if (entries.length === 0) return { restored: false };

    // Write all keys back to AsyncStorage in one batch
    await AsyncStorage.multiSet(entries);

    return { restored: true, keyCount: entries.length, backedUpAt };
  } catch (err) {
    console.warn('[CloudSync] Restore failed silently:', err);
    return { restored: false };
  }
}

/**
 * Check whether this device has any meaningful local data already.
 * Used to decide whether to attempt a restore after sign-in.
 */
export async function hasLocalData(): Promise<boolean> {
  try {
    // Check for the most fundamental piece of data — child profiles
    const children = await AsyncStorage.getItem('ap_children');
    if (children) {
      const parsed = JSON.parse(children);
      return Array.isArray(parsed) && parsed.length > 0;
    }
    // Fallback: check for legacy single-profile data
    const profile = await AsyncStorage.getItem('ap_profile');
    return !!profile;
  } catch {
    return false;
  }
}
