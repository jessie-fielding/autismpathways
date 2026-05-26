/**
 * Premium-only follow-up push notifications for the Plan Ahead & Transition section.
 *
 * Each stage has one milestone item that, when checked by a premium user,
 * schedules a follow-up notification at an appropriate interval reminding
 * the family what to do next.
 *
 * All exported schedule* functions MUST only be called after confirming isPremium.
 * All exported cancel* functions are safe to call at any time.
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function scheduleFollowUp(
  storageKey: string,
  daysFromNow: number,
  title: string,
  body: string,
  route: string,
): Promise<void> {
  try {
    // Cancel any existing notification for this key
    const existingId = await AsyncStorage.getItem(storageKey);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const fireDate = new Date();
    fireDate.setDate(fireDate.getDate() + daysFromNow);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { route }, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });

    await AsyncStorage.setItem(storageKey, notificationId);
  } catch (e) {
    console.warn('[TransitionNotification] Failed to schedule:', e);
  }
}

async function cancelFollowUp(storageKey: string): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(storageKey);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await AsyncStorage.removeItem(storageKey);
    }
  } catch (e) {
    console.warn('[TransitionNotification] Failed to cancel:', e);
  }
}

// ─── Stage 0: Get on the List (Under 13) ─────────────────────────────────────
// Trigger: "Waiver approved!" checked
// Timing: 90 days — enough time to celebrate, then nudge toward adult waitlist
const STAGE0_KEY = 'ap_notif_stage0_waiver_approved';

export async function scheduleAdultWaitlistNudge(): Promise<void> {
  await scheduleFollowUp(
    STAGE0_KEY,
    90,
    '🗺️ Time to Get on the Adult Waitlist',
    "Your child's current waiver was approved a few months ago. Now is the time to apply for adult DD services — waitlists in many states are 10+ years. Tap to see your state's adult waiver info.",
    '/transition/state-waivers',
  );
}
export async function cancelAdultWaitlistNudge(): Promise<void> {
  await cancelFollowUp(STAGE0_KEY);
}

// ─── Stage 1: Start the Conversation (Ages 14-15) ────────────────────────────
// Trigger: "Connect with your state's DD agency" checked
// Timing: 60 days — follow up to confirm Pre-ETS referral happened
const STAGE1_KEY = 'ap_notif_stage1_dd_agency';

export async function scheduleStage1FollowUp(): Promise<void> {
  await scheduleFollowUp(
    STAGE1_KEY,
    60,
    '📋 Check In on Your DD Agency Connection',
    "It's been about 2 months since you connected with your state's DD agency. Did you get a Pre-ETS referral? Now is a good time to follow up and confirm next steps.",
    '/transition/stage-1-start-conversation',
  );
}
export async function cancelStage1FollowUp(): Promise<void> {
  await cancelFollowUp(STAGE1_KEY);
}

// ─── Stage 2: Build the Plan (Ages 16-17) ────────────────────────────────────
// Trigger: "Apply to Vocational Rehabilitation (VR)" checked
// Timing: 45 days — VR intake typically takes 30-60 days; nudge to follow up
const STAGE2_KEY = 'ap_notif_stage2_vr_application';

export async function scheduleStage2FollowUp(): Promise<void> {
  await scheduleFollowUp(
    STAGE2_KEY,
    45,
    '💼 Follow Up on Your VR Application',
    "It's been about 6 weeks since you applied to Vocational Rehabilitation. VR must determine eligibility within 60 days. If you haven't heard back, call your VR counselor now.",
    '/transition/stage-2-build-plan',
  );
}
export async function cancelStage2FollowUp(): Promise<void> {
  await cancelFollowUp(STAGE2_KEY);
}

// ─── Stage 3: Senior Year Countdown (Age 18) ─────────────────────────────────
// Trigger: "Apply for SSI at 17y 9m" checked
// Timing: 90 days — SSI decisions take 3-6 months; nudge to check status
const STAGE3_KEY = 'ap_notif_stage3_ssi_apply';

export async function scheduleStage3FollowUp(): Promise<void> {
  await scheduleFollowUp(
    STAGE3_KEY,
    90,
    '💰 Check Your SSI Application Status',
    "It's been about 3 months since you applied for SSI. SSA decisions can take 3-6 months. Log into SSA.gov or call 1-800-772-1213 to check your application status.",
    '/transition/stage-3-senior-year',
  );
}
export async function cancelStage3FollowUp(): Promise<void> {
  await cancelFollowUp(STAGE3_KEY);
}

// ─── Stage 4: Navigating the Gap (Ages 18-22) ────────────────────────────────
// Trigger: "Check waiver waitlist status again" checked
// Timing: 365 days — annual check-in reminder to call the DD agency
const STAGE4_KEY = 'ap_notif_stage4_waiver_status';

export async function scheduleStage4FollowUp(): Promise<void> {
  await scheduleFollowUp(
    STAGE4_KEY,
    365,
    '📋 Annual Waiver Waitlist Check-In',
    "It's been about a year since your last waiver waitlist check-in. Call your state's DD agency to confirm your child is still on the list and ask about your current position.",
    '/transition/stage-4-navigating-gap',
  );
}
export async function cancelStage4FollowUp(): Promise<void> {
  await cancelFollowUp(STAGE4_KEY);
}

// ─── Stage 5: Adult Life (Age 22+) ───────────────────────────────────────────
// Trigger: "Set up a Special Needs Trust" checked
// Timing: 180 days — 6 months to follow up on trust funding and beneficiary updates
const STAGE5_KEY = 'ap_notif_stage5_special_needs_trust';

export async function scheduleStage5FollowUp(): Promise<void> {
  await scheduleFollowUp(
    STAGE5_KEY,
    180,
    '📜 Review Your Special Needs Trust',
    "It's been about 6 months since you set up your Special Needs Trust. Make sure it's funded, beneficiaries are current, and your letter of intent is attached. A quick review now protects your child later.",
    '/transition/stage-5-adult-life',
  );
}
export async function cancelStage5FollowUp(): Promise<void> {
  await cancelFollowUp(STAGE5_KEY);
}
