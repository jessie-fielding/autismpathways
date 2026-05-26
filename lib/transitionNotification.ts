/**
 * Schedules a push notification 90 days after the family marks their
 * current waiver as "approved" in the Stage 0 checklist.
 *
 * The notification nudges them to apply for the adult DD/ID waiver waitlist
 * now, while the momentum is there — since adult waitlists can be 10+ years.
 *
 * PREMIUM ONLY — callers must check isPremium before calling this.
 *
 * Safe to call multiple times — re-scheduling cancels the previous one
 * and sets a fresh 90-day window.
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_ID_KEY = 'ap_adult_waitlist_nudge_id';
const APPROVED_DATE_KEY = 'ap_waiver_approved_date';

/**
 * Call this (only for premium users) when the user checks
 * "Waiver approved!" in Stage 0. Schedules a nudge 90 days out
 * reminding them to get on the adult services waitlist.
 */
export async function scheduleAdultWaitlistNudge(): Promise<void> {
  try {
    // Cancel any existing nudge first
    const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
    }

    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Schedule 90 days from today
    const fireDate = new Date();
    fireDate.setDate(fireDate.getDate() + 90);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🗺️ Time to Get on the Adult Waitlist",
        body: "Your child's current waiver was approved a few months ago. Now is the time to apply for adult DD services — waitlists in many states are 10+ years. Tap to see your state's adult waiver info.",
        data: { route: '/transition/state-waivers' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });

    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);
    await AsyncStorage.setItem(APPROVED_DATE_KEY, new Date().toISOString());
  } catch (e) {
    console.warn('[TransitionNotification] Failed to schedule adult waitlist nudge:', e);
  }
}

/**
 * Returns the date the family marked their waiver as approved,
 * or null if they haven't done so yet.
 */
export async function getWaiverApprovedDate(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(APPROVED_DATE_KEY);
  return raw ? new Date(raw) : null;
}

/**
 * Cancels the scheduled nudge (e.g. if the user un-checks "Waiver approved").
 */
export async function cancelAdultWaitlistNudge(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
    }
  } catch (e) {
    console.warn('[TransitionNotification] Failed to cancel adult waitlist nudge:', e);
  }
}
