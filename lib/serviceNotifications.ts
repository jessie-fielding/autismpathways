/**
 * Services Tracker — push notification scheduling
 *
 * Handles:
 *   - Standard reminders: 1 day before, 1 hour before, 30 min before
 *   - "Leave reminder": calculates drive time from a starting address to the
 *     service address using the Google Maps Directions API, then schedules a
 *     departure notification = appointment time − travel time − 5 min buffer.
 *
 * All notification IDs are persisted in AsyncStorage under a per-service key
 * so they can be cancelled when the service is edited or deleted.
 *
 * NOTE: The travel-time calculation is done at schedule time (not real-time).
 *       The notification body includes the estimated drive time so the user
 *       knows what assumption was made.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReminderOption = '1day' | '1hour' | '30min' | 'leave';

export interface ScheduleRemindersParams {
  serviceId: string;
  serviceName: string;         // e.g. "ABA Therapy at Bright Futures"
  serviceAddress?: string;     // destination address
  startingAddress?: string;    // user's home / starting address (for leave reminder)
  /** Next upcoming appointment as a JS Date */
  appointmentDate: Date;
  reminders: ReminderOption[];
}

// ─── Storage key ─────────────────────────────────────────────────────────────

const storageKey = (serviceId: string) => `ap_svc_notif_ids_${serviceId}`;

// ─── Permission helper ────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Travel time via Google Maps Directions ───────────────────────────────────
// Uses the Manus Maps proxy — no API key needed on the client.

async function fetchDriveMinutes(
  origin: string,
  destination: string,
): Promise<number | null> {
  try {
    const encoded = (s: string) => encodeURIComponent(s);
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${encoded(origin)}&destination=${encoded(destination)}&mode=driving`;

    // Use the Manus Maps proxy
    const proxyUrl = `/api/maps-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const leg = data?.routes?.[0]?.legs?.[0];
    if (!leg) return null;
    return Math.ceil(leg.duration.value / 60); // seconds → minutes, rounded up
  } catch {
    return null;
  }
}

// ─── Schedule all reminders for a service ────────────────────────────────────

export async function scheduleServiceReminders(
  params: ScheduleRemindersParams,
): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Cancel any existing notifications for this service first
  await cancelServiceReminders(params.serviceId);

  const ids: string[] = [];
  const { appointmentDate, serviceName, reminders } = params;

  for (const reminder of reminders) {
    let fireDate: Date | null = null;
    let title = '';
    let body = '';

    if (reminder === '1day') {
      fireDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
      title = `📅 Tomorrow: ${serviceName}`;
      body = `Your appointment is tomorrow at ${formatTime(appointmentDate)}.${params.serviceAddress ? ` 📍 ${params.serviceAddress}` : ''}`;
    } else if (reminder === '1hour') {
      fireDate = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
      title = `⏰ 1 hour: ${serviceName}`;
      body = `Your appointment starts in 1 hour at ${formatTime(appointmentDate)}.${params.serviceAddress ? ` 📍 ${params.serviceAddress}` : ''}`;
    } else if (reminder === '30min') {
      fireDate = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
      title = `⏰ 30 minutes: ${serviceName}`;
      body = `Your appointment starts in 30 minutes at ${formatTime(appointmentDate)}.${params.serviceAddress ? ` 📍 ${params.serviceAddress}` : ''}`;
    } else if (reminder === 'leave') {
      // Calculate drive time if both addresses provided
      let driveMinutes = 20; // default fallback
      let driveNote = '(estimated 20 min drive)';

      if (params.startingAddress && params.serviceAddress) {
        const fetched = await fetchDriveMinutes(
          params.startingAddress,
          params.serviceAddress,
        );
        if (fetched !== null) {
          driveMinutes = fetched;
          driveNote = `(~${fetched} min drive)`;
        }
      }

      // Leave time = appointment − drive time − 5 min buffer
      const leaveMs = appointmentDate.getTime() - (driveMinutes + 5) * 60 * 1000;
      fireDate = new Date(leaveMs);
      title = `🚗 Time to leave for ${serviceName}`;
      body = `Leave now to arrive on time at ${formatTime(appointmentDate)} ${driveNote}.${params.serviceAddress ? ` 📍 ${params.serviceAddress}` : ''}`;
    }

    if (!fireDate || fireDate.getTime() <= Date.now()) continue;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { serviceId: params.serviceId, route: '/services-tracker' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
        },
      });
      ids.push(id);
    } catch (e) {
      console.warn('[ServiceNotifications] Failed to schedule:', reminder, e);
    }
  }

  // Persist IDs for later cancellation
  await AsyncStorage.setItem(storageKey(params.serviceId), JSON.stringify(ids));
}

// ─── Cancel all reminders for a service ──────────────────────────────────────

export async function cancelServiceReminders(serviceId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(serviceId));
    if (!raw) return;
    const ids: string[] = JSON.parse(raw);
    await Promise.all(
      ids.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );
    await AsyncStorage.removeItem(storageKey(serviceId));
  } catch (e) {
    console.warn('[ServiceNotifications] Failed to cancel:', e);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Given a service's schedule, compute the next upcoming appointment Date.
 * Returns null if no upcoming appointment can be determined.
 */
export function nextAppointmentDate(
  scheduleMode: 'weekly' | 'biweekly' | 'occasional',
  scheduleDays: number[],   // 0=Sun … 6=Sat for weekly/biweekly
  scheduleTime: string,     // "HH:MM" 24h
  occasionalDate?: string,  // "YYYY-MM-DD" for occasional
): Date | null {
  if (scheduleMode === 'occasional') {
    if (!occasionalDate) return null;
    const [y, m, d] = occasionalDate.split('-').map(Number);
    const [hStr, minStr] = scheduleTime.split(':');
    const date = new Date(y, m - 1, d, Number(hStr), Number(minStr));
    return date > new Date() ? date : null;
  }

  if (!scheduleDays.length || !scheduleTime) return null;

  const [hStr, minStr] = scheduleTime.split(':');
  const h = Number(hStr);
  const min = Number(minStr);
  const now = new Date();

  // Find the next occurrence among the scheduled days
  for (let offset = 0; offset <= 14; offset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(h, min, 0, 0);
    if (
      scheduleDays.includes(candidate.getDay()) &&
      candidate.getTime() > now.getTime()
    ) {
      return candidate;
    }
  }
  return null;
}
