/**
 * connections.ts
 *
 * Manages "Request a Connection" data locally via AsyncStorage.
 * No PHI is stored — only name, contact preference, optional message,
 * and the provider's listing ID.
 *
 * Connection request lifecycle:
 *   pending  → provider has not yet responded
 *   accepted → provider accepted; contact info shared
 *   declined → provider declined; no contact info shared
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface ConnectionRequest {
  id: string;
  providerId: string;       // evaluator or provider-directory ID
  providerName: string;
  providerSpecialty: string;
  providerCounty: string;
  requesterName: string;
  shareEmail: boolean;
  sharePhone: boolean;
  message: string;
  status: ConnectionStatus;
  createdAt: string;
  respondedAt?: string;
}

const KEY_SENT     = 'ap_connections_sent';     // requests this user sent (parent view)
const KEY_RECEIVED = 'ap_connections_received'; // requests this provider received (provider view)

// ── Sent requests (parent side) ──────────────────────────────────────────────

export async function getSentRequests(): Promise<ConnectionRequest[]> {
  const raw = await AsyncStorage.getItem(KEY_SENT);
  return raw ? JSON.parse(raw) : [];
}

export async function addSentRequest(req: Omit<ConnectionRequest, 'id' | 'status' | 'createdAt'>): Promise<ConnectionRequest> {
  const existing = await getSentRequests();
  const newReq: ConnectionRequest = {
    ...req,
    id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY_SENT, JSON.stringify([newReq, ...existing]));
  return newReq;
}

// ── Received requests (provider side) ────────────────────────────────────────

export async function getReceivedRequests(): Promise<ConnectionRequest[]> {
  const raw = await AsyncStorage.getItem(KEY_RECEIVED);
  return raw ? JSON.parse(raw) : [];
}

export async function addReceivedRequest(req: ConnectionRequest): Promise<void> {
  const existing = await getReceivedRequests();
  // Avoid duplicates
  if (existing.some((r) => r.id === req.id)) return;
  await AsyncStorage.setItem(KEY_RECEIVED, JSON.stringify([req, ...existing]));
}

export async function respondToRequest(
  requestId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const requests = await getReceivedRequests();
  const updated = requests.map((r) =>
    r.id === requestId
      ? { ...r, status, respondedAt: new Date().toISOString() }
      : r
  );
  await AsyncStorage.setItem(KEY_RECEIVED, JSON.stringify(updated));
}

export async function getPendingCount(): Promise<number> {
  const requests = await getReceivedRequests();
  return requests.filter((r) => r.status === 'pending').length;
}
