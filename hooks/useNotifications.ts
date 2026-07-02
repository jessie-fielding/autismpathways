/**
 * useNotifications
 *
 * Handles:
 * - Requesting push notification permissions on first launch
 * - Storing the Expo push token in AsyncStorage
 * - Scheduling / cancelling local notifications for each of the 4 toggle types
 * - Providing a `scheduleAll` helper called by Settings when a toggle changes
 *
 * Usage:
 *   const { requestPermission, scheduleAll, cancelAll } = useNotifications();
 *
 * NOTE: Expo Notifications requires the `expo-notifications` package.
 * Install: npx expo install expo-notifications
 * Also add to app.json plugins:
 *   ["expo-notifications", { "icon": "./assets/images/notification-icon.png", "color": "#7C5CBF" }]
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Conditional import so the app doesn't crash if expo-notifications isn't installed yet ──
let Notifications: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications');
} catch {
  // expo-notifications not installed — notifications will be silently disabled
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEY_PUSH_TOKEN        = 'ap_push_token';
const KEY_PERM_ASKED        = 'ap_notif_permission_asked';
const KEY_LAST_OPEN_DATE    = 'ap_last_open_date';

// ── Notification identifiers (must be stable so we can cancel by id) ────────────
export const NOTIF_IDS = {
  APPEAL:        'ap-notif-appeal',
  APPOINTMENT:   'ap-notif-appointment',
  WEEKLY:        'ap-notif-weekly',
  WAIVER:        'ap-notif-waiver',
  DAILY_OBS:     'ap-notif-daily-obs',
} as const;

// ── Daily observation prompt messages (rotate by day of week) ────────────────
const DAILY_OBS_MESSAGES = [
  { title: '📓 How was today?', body: "Jot down something you noticed about your child today — even one line helps track progress over time." },
  { title: '✏️ Quick observation?', body: "Did anything stand out today? Log it in Autism Pathways — it only takes 30 seconds." },
  { title: '🧠 What did you notice today?', body: "Small observations add up. Tap to log a note about your child's day." },
  { title: '📋 Daily log reminder', body: "Tracking patterns helps at IEP meetings and evaluations. Add today's observation now." },
  { title: '💜 You’re doing great', body: "Take 30 seconds to log something you noticed today — future you will thank you." },
  { title: '🌟 One thing from today?', body: "Log a quick observation — a win, a challenge, or anything worth remembering." },
  { title: '📓 End-of-day check-in', body: "Before the day slips away — tap to log an observation about your child." },
];

/**
 * Called on every app open (cold start + foreground resume).
 * Records today's date and cancels the daily observation notification
 * for today — so users who already opened the app don't get nudged.
 */
export async function markAppOpenedAndSuppressTodayNotif(): Promise<void> {
  let Notifs: typeof import('expo-notifications') | null = null;
  try { Notifs = require('expo-notifications'); } catch { return; }
  if (!Notifs || Platform.OS === 'web') return;

  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  const lastOpen = await AsyncStorage.getItem(KEY_LAST_OPEN_DATE);

  // Always update the last-open date
  await AsyncStorage.setItem(KEY_LAST_OPEN_DATE, today);

  // If this is the first open today, cancel today's daily obs notification.
  // We do NOT reschedule it — the weekly repeating trigger means it will
  // automatically fire again next week on the same weekday at 7pm.
  // The next call to scheduleAll() (e.g. when user visits Settings) will
  // restore it if it was removed.
  if (lastOpen !== today) {
    const todayWeekday = new Date().getDay() + 1; // JS getDay(): 0=Sun → +1 = 1…7
    const identifier = `${NOTIF_IDS.DAILY_OBS}-${todayWeekday}`;
    try {
      await Notifs.cancelScheduledNotificationAsync(identifier);
    } catch {
      // Silently ignore — notification may not exist yet
    }
  }
}

// ── Notification identifiers (must be stable so we can cancel by id) ──────────

// ── Daily observation prompt messages (rotate by day of week) ────────────────

// ── Types ─────────────────────────────────────────────────────────────────────
export type NotifSettings = {
  ap_notification_appeal:      boolean;
  ap_notification_appointment: boolean;
  ap_notification_weekly:      boolean;
  ap_notification_waiver:      boolean;
  ap_notification_daily_obs:   boolean;
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useNotifications() {

  // Request permission on first launch (non-blocking)
  useEffect(() => {
    requestPermission();
  }, []);

  /**
   * Request notification permission.
   * Only prompts once — subsequent calls are no-ops if already asked.
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!Notifications || Platform.OS === 'web') return false;

    const alreadyAsked = await AsyncStorage.getItem(KEY_PERM_ASKED);

    // Set the notification handler (how to display foreground notifications)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      await registerToken();
      return true;
    }

    if (alreadyAsked) return false; // Don't prompt again

    await AsyncStorage.setItem(KEY_PERM_ASKED, 'true');
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      await registerToken();
      return true;
    }

    return false;
  };

  /**
   * Register and store the Expo push token.
   */
  const registerToken = async () => {
    if (!Notifications) return;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '429f799b-1ef4-410c-a473-2eba40f30df4',
      });
      await AsyncStorage.setItem(KEY_PUSH_TOKEN, tokenData.data);
      // Send token to Lambda so admin push notifications work
      await sendTokenToLambda(tokenData.data);
    } catch {
      // Token registration can fail in simulators — that's fine
    }
  };

  const sendTokenToLambda = async (token: string) => {
    try {
      const { getValidToken } = require('./useAuth');
      const authToken = await getValidToken();
      if (!authToken) return;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      };
      const body = JSON.stringify({ pushToken: token });
      const BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';
      // Register for admin push (owner notifications)
      await fetch(`${BASE}/api/admin/register-push-token`, { method: 'POST', headers, body });
      // Register per-user push token (provider connection request notifications)
      await fetch(`${BASE}/api/push/register`, { method: 'POST', headers, body });
    } catch {
      // Non-critical — silently ignore
    }
  };

  /**
   * Schedule (or cancel) all local notifications based on current settings.
   * Call this whenever a notification toggle changes in Settings.
   */
  const scheduleAll = async (settings: NotifSettings) => {
    if (!Notifications) return;

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    // Cancel all first, then reschedule enabled ones
    await cancelAll();

    if (settings.ap_notification_weekly) {
      // Every Sunday at 9am
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIF_IDS.WEEKLY,
        content: {
          title: '📋 Weekly Check-in',
          body: "Time to update your autism journey notes. A few minutes now saves hours later.",
          data: { route: '/observations' },
        },
        trigger: {
          weekday: 1, // Sunday = 1 in Expo (1=Sunday, 2=Monday, …)
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    }

    if (settings.ap_notification_waiver) {
      // Once a year (365 days from now, repeating)
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIF_IDS.WAIVER,
        content: {
          title: '🗺️ Waiver Waitlist Reminder',
          body: "It's been a year — check in on your waiver waitlist status and update your position.",
          data: { route: '/waiver' },
        },
        trigger: {
          seconds: 365 * 24 * 60 * 60,
          repeats: true,
        },
      });
    }

    if (settings.ap_notification_daily_obs) {
      // Schedule 7 daily notifications (one per day of week) at 7pm, each with a different message
      // Expo local notifications can't truly rotate, so we schedule repeating weekly triggers
      // for each day of the week with a different message — effectively rotating every day
      for (let weekday = 1; weekday <= 7; weekday++) {
        const msg = DAILY_OBS_MESSAGES[weekday - 1];
        await Notifications.scheduleNotificationAsync({
          identifier: `${NOTIF_IDS.DAILY_OBS}-${weekday}`,
          content: {
            title: msg.title,
            body: msg.body,
            data: { route: '/observations/new-entry' },
            sound: true,
          },
          trigger: {
            weekday,   // 1=Sunday, 2=Monday, …, 7=Saturday
            hour: 19,  // 7pm local time
            minute: 0,
            repeats: true,
          },
        });
      }
    } else {
      // Cancel all daily obs notifications if toggled off
      for (let weekday = 1; weekday <= 7; weekday++) {
        await Notifications.cancelScheduledNotificationAsync(`${NOTIF_IDS.DAILY_OBS}-${weekday}`);
      }
    }

    // Appeal and appointment notifications are event-driven (set when user saves a date).
    // The toggles just control whether to send them when a date is saved.
    // Store the preference so other screens can read it.
    await AsyncStorage.setItem('ap_notification_appeal', String(settings.ap_notification_appeal));
    await AsyncStorage.setItem('ap_notification_appointment', String(settings.ap_notification_appointment));
    await AsyncStorage.setItem('ap_notification_daily_obs', String(settings.ap_notification_daily_obs));
  };

  /**
   * Schedule an appointment reminder for a specific date.
   * Called from the diagnosis appointment-date screen and provider-prep.
   * Only fires if the user has the appointment toggle enabled.
   */
  const scheduleAppointmentReminder = async (appointmentDate: Date, title: string, body: string) => {
    if (!Notifications) return;

    const enabled = await AsyncStorage.getItem('ap_notification_appointment');
    if (enabled === 'false') return;

    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // 24 hours before
    reminderDate.setHours(9, 0, 0, 0);

    if (reminderDate <= new Date()) return; // Already past

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_IDS.APPOINTMENT,
      content: {
        title: `📅 ${title}`,
        body,
        data: { route: '/diagnosis' },
      },
      trigger: { date: reminderDate },
    });
  };

  /**
   * Schedule an appeal deadline reminder.
   * Called from the appeal tracker when a hearing date is saved.
   */
  const scheduleAppealReminder = async (hearingDate: Date, appealName: string) => {
    if (!Notifications) return;

    const enabled = await AsyncStorage.getItem('ap_notification_appeal');
    if (enabled === 'false') return;

    // Remind 7 days before
    const reminderDate = new Date(hearingDate);
    reminderDate.setDate(reminderDate.getDate() - 7);
    reminderDate.setHours(9, 0, 0, 0);

    if (reminderDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      identifier: `${NOTIF_IDS.APPEAL}-${hearingDate.getTime()}`,
      content: {
        title: '⚖️ Appeal Hearing in 7 Days',
        body: `Your hearing for "${appealName}" is coming up. Make sure your documents are ready.`,
        data: { route: '/medicaid' },
      },
      trigger: { date: reminderDate },
    });
  };

  /**
   * Cancel all scheduled notifications.
   */
  const cancelAll = async () => {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  /**
   * Cancel a specific notification by identifier.
   */
  const cancelNotification = async (identifier: string) => {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  };

  return {
    requestPermission,
    scheduleAll,
    scheduleAppointmentReminder,
    scheduleAppealReminder,
    cancelAll,
    cancelNotification,
  };
}
