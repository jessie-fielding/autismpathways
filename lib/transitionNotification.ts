/**
 * Schedules a push notification 90 days after the family marks
 * "waiver application submitted" in the Stage 0 checklist.
 *
 * The notification reminds them to follow up on the application status,
 * since most states have no automatic confirmation and families forget.
 *
 * Safe to call multiple times — re-scheduling cancels the previous one
 * and sets a fresh 90-day window from the new submission date.
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_ID_KEY = 'ap_waiver_followup_notification_id';
const SUBMITTED_DATE_KEY = 'ap_waiver_submitted_date';

/**
 * Call this when the user checks off "Waiver application submitted" in Stage 0.
 * Cancels any previously scheduled follow-up and schedules a new one 90 days out.
 */
export async function scheduleWaiverFollowUpReminder(): Promise<void> {
  try {
    // Cancel any existing follow-up notification
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
        title: '🗺️ Time to Follow Up on Your Waiver Application',
        body: "It's been about 3 months since you submitted your waiver application. Call your state's DD office to confirm it's on file and ask for your place on the waitlist.",
        data: { route: '/transition/state-waivers' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });

    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);
    await AsyncStorage.setItem(SUBMITTED_DATE_KEY, new Date().toISOString());
  } catch (e) {
    // Silently fail — notification is helpful but not critical
    console.warn('[TransitionNotification] Failed to schedule waiver follow-up:', e);
  }
}

/**
 * Returns the date the family marked their waiver application as submitted,
 * or null if they haven't done so yet.
 */
export async function getWaiverSubmittedDate(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(SUBMITTED_DATE_KEY);
  return raw ? new Date(raw) : null;
}

/**
 * Cancels the scheduled follow-up notification (e.g. if the user un-checks
 * the "submitted" item or marks the waiver as approved).
 */
export async function cancelWaiverFollowUpReminder(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
    }
  } catch (e) {
    console.warn('[TransitionNotification] Failed to cancel waiver follow-up:', e);
  }
}
