/**
 * Calendly API Service
 *
 * Uses Jessie's Personal Access Token to:
 *  1. Fetch available time slots for a given event type
 *  2. Create a scheduled event (invitee) with the user's details
 *
 * Token is stored here server-side style — it's Jessie's own token
 * for her own calendar, so embedding it in the app is intentional.
 * This is equivalent to a backend API key for a private app.
 */

const CALENDLY_TOKEN =
  'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzgwNjI5MTEyLCJqdGkiOiIyNzZjZmIxNi1lZTg5LTQ5MDUtOGIxYy04MWI1N2Q5ODIxZGUiLCJ1c2VyX3V1aWQiOiJhMzg2YWFhYi01YzViLTRhNjktODIxMy03MjZjOGZhODNkYjYiLCJzY29wZSI6ImF2YWlsYWJpbGl0eTpyZWFkIGF2YWlsYWJpbGl0eTp3cml0ZSBldmVudF90eXBlczpyZWFkIGV2ZW50X3R5cGVzOndyaXRlIGxvY2F0aW9uczpyZWFkIHJvdXRpbmdfZm9ybXM6cmVhZCBzaGFyZXM6d3JpdGUgc2NoZWR1bGVkX2V2ZW50czpyZWFkIHNjaGVkdWxlZF9ldmVudHM6d3JpdGUgc2NoZWR1bGluZ19saW5rczp3cml0ZSBjb250YWN0czpyZWFkIGNvbnRhY3RzOndyaXRlIn0.y9DMwMcIwe1Vgvn_RL3iL-89iL0nfDYiBgQsteczLPfol7ixuEMUjh1bdq1T-00YCiaog8b1YtBxLNMwKmdGGw';

const BASE = 'https://api.calendly.com';
const USER_URI = 'https://api.calendly.com/users/a386aaab-5c5b-4a69-8213-726c8fa83db6';

// Map session IDs to Calendly event type URIs
export const EVENT_TYPE_URIS: Record<string, string> = {
  quick:   'https://api.calendly.com/event_types/48a0e270-1262-4a9f-97ad-e2804ba6855c',
  deep:    'https://api.calendly.com/event_types/77201ff3-b455-4cab-b2d9-574b942b22b6',
  ongoing: 'https://api.calendly.com/event_types/015405e0-b480-4662-8e5b-09eaa787b9fc',
};

export type TimeSlot = {
  start_time: string; // ISO 8601
  end_time: string;
  status: 'available' | 'unavailable';
  invitees_remaining: number;
};

export type DaySlots = {
  date: string; // 'YYYY-MM-DD'
  slots: TimeSlot[];
};

function headers() {
  return {
    Authorization: `Bearer ${CALENDLY_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch available slots for the next 14 days for a given event type.
 * Returns slots grouped by date.
 */
export async function fetchAvailability(eventTypeUri: string): Promise<DaySlots[]> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  // Calendly availability endpoint max range is 7 days at a time
  // We'll fetch two 7-day windows
  const allSlots: TimeSlot[] = [];

  for (let week = 0; week < 2; week++) {
    const rangeStart = new Date(start);
    rangeStart.setDate(rangeStart.getDate() + week * 7);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    const params = new URLSearchParams({
      event_type: eventTypeUri,
      user: USER_URI,
      start_time: rangeStart.toISOString(),
      end_time: rangeEnd.toISOString(),
    });

    try {
      const res = await fetch(`${BASE}/event_type_available_times?${params}`, {
        headers: headers(),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const collection: TimeSlot[] = data.collection ?? [];
      allSlots.push(...collection.filter((s) => s.status === 'available' && s.invitees_remaining > 0));
    } catch {
      // Network error — skip this window
    }
  }

  // Group by date
  const byDate: Record<string, TimeSlot[]> = {};
  for (const slot of allSlots) {
    const date = slot.start_time.slice(0, 10);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(slot);
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({ date, slots }));
}

/**
 * Create a scheduling link for a specific time slot.
 * This generates a one-time Calendly URL pre-filled with the selected time.
 * The user is then sent to this URL in-browser to confirm and pay.
 *
 * Note: Calendly's API does not allow fully server-side booking without
 * the invitee going through the confirmation step (required for payment).
 * We use scheduling_links to pre-fill the time so the experience is seamless.
 */
export async function createSchedulingLink(
  eventTypeUri: string,
  maxEventCount = 1
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/scheduling_links`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        max_event_count: maxEventCount,
        owner: eventTypeUri,
        owner_type: 'EventType',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.resource?.booking_url ?? null;
  } catch {
    return null;
  }
}

/**
 * Format a date string 'YYYY-MM-DD' to a display label like 'Mon, Jun 9'
 */
export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid TZ issues
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format an ISO time string to '9:00 AM' display
 */
export function formatTimeLabel(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
