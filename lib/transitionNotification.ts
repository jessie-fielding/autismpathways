/**
 * Schedules a push notification 3 months after onboarding completion
 * reminding the family to apply for adult waiver services now.
 *
 * Called once when onboarding completes. Safe to call multiple times —
 * it checks if the notification has already been scheduled.
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCHEDULED_KEY = 'ap_transition_reminder_scheduled';
const SCHEDULED_DATE_KEY = 'ap_transition_reminder_date';

export async function scheduleTransitionWaiverReminder(): Promise<void> {
  try {
    // Only schedule once
    const alreadyScheduled = await AsyncStorage.getItem(SCHEDULED_KEY);
    if (alreadyScheduled === 'true') return;

    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Schedule 3 months (90 days) from now
    const fireDate = new Date();
    fireDate.setDate(fireDate.getDate() + 90);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🗺️ Time to Get on the Waitlist',
        body: "In many states, adult disability services have 10+ year waitlists. The sooner you apply, the better your child's chances. Tap to see your state's waiver info.",
        data: { route: '/transition/state-waivers' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });

    await AsyncStorage.setItem(SCHEDULED_KEY, 'true');
    await AsyncStorage.setItem(SCHEDULED_DATE_KEY, fireDate.toISOString());
  } catch (e) {
    // Silently fail — notification is helpful but not critical
    console.warn('[TransitionNotification] Failed to schedule:', e);
  }
}

export async function getTransitionReminderDate(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(SCHEDULED_DATE_KEY);
  return raw ? new Date(raw) : null;
}
