/**
 * api.ts
 *
 * Shared REST client for the Autism Pathways backend.
 * All provider endpoints now point to the Lambda for reliability.
 *
 * All calls are fire-and-forget safe — errors are caught and logged,
 * never thrown to the caller, so the app never crashes on network issues.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getValidToken } from './useAuth';

export const AP_API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

// ── Device ID ─────────────────────────────────────────────────────────────────
// A stable random ID generated once and persisted to AsyncStorage.
// Used to identify this device's provider profile in the backend.
let _deviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (_deviceId) return _deviceId;
  const stored = await AsyncStorage.getItem('ap_device_id');
  if (stored) {
    _deviceId = stored;
    return stored;
  }
  // Generate a new one
  const id = `ap_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem('ap_device_id', id);
  _deviceId = id;
  return id;
}

// ── Provider registration ─────────────────────────────────────────────────────
export interface ProviderRegistrationPayload {
  providerName: string;
  practiceName?: string | null;
  specialty: string;
  state?: string | null;
  city?: string | null;
  county?: string | null;
  email?: string | null;
  phone?: string | null;
  openToConnect?: boolean;
  acceptingNew?: boolean;
  medicaidAccepted?: boolean;
  telehealth?: boolean;
  bio?: string | null;
  tags?: string[];
}

export async function registerProviderProfile(payload: ProviderRegistrationPayload): Promise<void> {
  try {
    const deviceId = await getDeviceId();
    const token = await getValidToken();
    const res = await fetch(`${AP_API_BASE}/api/providers/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...payload, deviceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[API] Provider register failed:', err);
    }
  } catch (e) {
    console.warn('[API] Provider register error:', e);
  }
}

// ── Availability toggle ───────────────────────────────────────────────────────
export async function setProviderAvailability(openToConnect: boolean): Promise<void> {
  try {
    const deviceId = await getDeviceId();
    const token = await getValidToken();
    const res = await fetch(`${AP_API_BASE}/api/providers/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ deviceId, openToConnect }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[API] Availability update failed:', err);
    }
  } catch (e) {
    console.warn('[API] Availability update error:', e);
  }
}

// ── Live provider directory ───────────────────────────────────────────────────
export interface LiveProvider {
  id: number;
  deviceId: string;
  providerName: string;
  practiceName: string | null;
  specialty: string;
  state: string | null;
  city: string | null;
  county: string | null;
  acceptingNew: boolean;
  medicaidAccepted: boolean;
  telehealth: boolean;
  bio: string | null;
  tags: string[];
  lastSeenAt: string | null;
}

export async function fetchLiveProviders(state?: string, specialty?: string): Promise<LiveProvider[]> {
  try {
    const params = new URLSearchParams();
    if (state && state !== 'ALL') params.set('state', state);
    if (specialty && specialty !== 'All') params.set('specialty', specialty);
    const url = `${AP_API_BASE}/api/providers/available${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn('[API] Fetch live providers error:', e);
    return [];
  }
}
