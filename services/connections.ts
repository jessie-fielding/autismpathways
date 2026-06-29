/**
 * connections.ts
 *
 * Manages "Request a Connection" data via Lambda/DynamoDB so requests are
 * visible cross-device (parent on one device, provider on another).
 *
 * Connection request lifecycle:
 *   pending  → provider has not yet responded
 *   accepted → provider accepted; contact info shared
 *   declined → provider declined; no contact info shared
 *
 * Falls back gracefully if the user is not signed in or network is unavailable.
 */
import { AP_API_BASE } from './api';
import { getValidToken, lambdaFetch } from './useAuth';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface ConnectionRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerCounty: string;
  senderSub?: string;
  senderEmail?: string;       // email from Cognito — revealed when shareEmail=true
  requesterPhone?: string;    // phone entered by parent — revealed when sharePhone=true
  insurance?: string;         // insurance provider name (free text)
  hasMedicaid?: boolean;      // does the family have Medicaid?
  okOutOfPocket?: boolean | null; // open to private pay?
  requesterName: string;
  shareEmail: boolean;
  sharePhone: boolean;
  message: string;
  status: ConnectionStatus;
  createdAt: string;
  respondedAt?: string;
  denialReason?: string;  // reason provided when declining
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getValidToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Send a connection request (parent → provider) ─────────────────────────────

export async function addSentRequest(
  req: Omit<ConnectionRequest, 'id' | 'status' | 'createdAt' | 'senderSub' | 'senderEmail'>
): Promise<ConnectionRequest> {
  const res = await lambdaFetch(`${AP_API_BASE}/api/connections/send`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to send request (${res.status})`);
  }
  const data = await res.json();
  return data.request as ConnectionRequest;
}

// ── Get sent requests (parent side) ──────────────────────────────────────────

export async function getSentRequests(): Promise<ConnectionRequest[]> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${AP_API_BASE}/api/connections/sent`, { headers });
    if (!res.ok) return [];
    return (await res.json()) as ConnectionRequest[];
  } catch {
    return [];
  }
}

// ── Get received requests (provider side) ────────────────────────────────────

export async function getReceivedRequests(providerId?: string): Promise<ConnectionRequest[]> {
  try {
    const headers = await authHeaders();
    // providerId is the provider's deviceId or listing id
    const pid = providerId || (await import('./api').then(m => m.getDeviceId()));
    const res = await fetch(
      `${AP_API_BASE}/api/connections/received?providerId=${encodeURIComponent(pid)}`,
      { headers }
    );
    if (!res.ok) return [];
    return (await res.json()) as ConnectionRequest[];
  } catch {
    return [];
  }
}

// ── Respond to a request (provider side) ─────────────────────────────────────

export async function respondToRequest(
  requestId: string,
  status: 'accepted' | 'declined',
  providerId?: string,
  denialReason?: string
): Promise<void> {
  const headers = await authHeaders();
  const pid = providerId || (await import('./api').then(m => m.getDeviceId()));
  const res = await fetch(`${AP_API_BASE}/api/connections/respond`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ requestId, providerId: pid, status, denialReason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to respond (${res.status})`);
  }
}

// ── Pending count (provider dashboard badge) ─────────────────────────────────

export async function getPendingCount(providerId?: string): Promise<number> {
  const requests = await getReceivedRequests(providerId);
  return requests.filter((r) => r.status === 'pending').length;
}

// ── Legacy no-op kept for backward compat (no longer needed) ─────────────────
// addReceivedRequest was used when both sides wrote to the same device.
// With the backend approach, the server stores it — nothing to do client-side.
export async function addReceivedRequest(_req: ConnectionRequest): Promise<void> {
  // no-op: server handles storage
}
