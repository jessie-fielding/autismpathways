import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isImpersonatingUser } from '../services/impersonation';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

/**
 * useIsPremium
 *
 * Returns whether the current user has an active premium subscription.
 *
 * ─── BETA MODE ────────────────────────────────────────────────────────────────
 * During beta, BETA_MODE is set to true so ALL users get premium access.
 * To enable real premium gating for production:
 *   1. Set BETA_MODE = false
 *   2. Users purchase via the Paywall screen (app/paywall/index.tsx)
 *   3. The purchase receipt is stored in AsyncStorage under 'ap_iap_purchased'
 *   4. Optionally, also verify server-side via /api/me
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * ─── FREE ACCESS LIST ─────────────────────────────────────────────────────────
 * Accounts in FREE_ACCESS_EMAILS always get premium access regardless of
 * subscription status. Add/remove emails here as needed.
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * ─── VIEW AS USER (ADMIN DEBUG) ───────────────────────────────────────────────
 * When isImpersonatingUser() is true, this hook always returns isPremium=false
 * so the admin can preview the free-tier experience. This is a client-only
 * override — no backend entitlements are changed.
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const BETA_MODE = false; // production — real IAP required

// Accounts that always get free premium access (case-insensitive match)
const FREE_ACCESS_EMAILS: string[] = [
  'jessienrabe@gmail.com',
  'bbriphil99@gmail.com',
  'emilymeilstrup@gmail.com',
];

// AsyncStorage key where IAP purchase confirmation is stored
export const IAP_PURCHASED_KEY = 'ap_iap_purchased';

/** Returns true if the currently signed-in email is on the free access list */
async function isOnFreeList(): Promise<boolean> {
  try {
    const email = await AsyncStorage.getItem('authUserEmail');
    if (!email) return false;
    return FREE_ACCESS_EMAILS.includes(email.toLowerCase().trim());
  } catch {
    return false;
  }
}

export function useIsPremium(): { isPremium: boolean; loading: boolean } {
  const [isPremium, setIsPremium] = useState(BETA_MODE);
  const [loading, setLoading] = useState(!BETA_MODE);

  useEffect(() => {
    if (BETA_MODE) {
      setIsPremium(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // 0a. Impersonation override — admin "View as user" debug mode
        if (await isImpersonatingUser()) {
          if (!cancelled) { setIsPremium(false); setLoading(false); }
          return;
        }

        // 0b. Check free access list
        if (await isOnFreeList()) {
          if (!cancelled) { setIsPremium(true); setLoading(false); }
          return;
        }

        // 1. Check local IAP purchase flag (set by Paywall screen after successful purchase)
        const localPurchase = await AsyncStorage.getItem(IAP_PURCHASED_KEY);
        if (localPurchase === 'true') {
          if (!cancelled) { setIsPremium(true); setLoading(false); }
          return;
        }

        // 2. Check server-side (for users who purchased on another device)
        const token = await AsyncStorage.getItem('ap_access_token');
        if (!token) { setIsPremium(false); setLoading(false); return; }

        const res = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) { setIsPremium(false); setLoading(false); return; }

        const data = await res.json();
        if (!cancelled) setIsPremium(!!data?.isPremium);
      } catch {
        if (!cancelled) setIsPremium(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { isPremium, loading };
}

/**
 * Standalone helper for non-hook contexts (e.g. inside an async function).
 * Also returns true in BETA_MODE and for free-access emails.
 */
export async function checkIsPremium(): Promise<boolean> {
  // Impersonation override — always free in debug mode
  if (await isImpersonatingUser()) return false;

  if (BETA_MODE) return true;
  try {
    // Check free access list first
    if (await isOnFreeList()) return true;

    const localPurchase = await AsyncStorage.getItem(IAP_PURCHASED_KEY);
    if (localPurchase === 'true') return true;

    const token = await AsyncStorage.getItem('ap_access_token');
    if (!token) return false;
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.isPremium;
  } catch {
    return false;
  }
}
