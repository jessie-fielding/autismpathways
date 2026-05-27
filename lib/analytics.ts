/**
 * analytics.ts — Autism Pathways Firebase Analytics helper
 *
 * Usage:
 *   import { logEvent, logScreenView } from '../lib/analytics';
 *   logEvent('pathway_opened', { pathway: 'waiver' });
 *
 * All calls are no-ops in Expo Go (Firebase native module not available).
 * They activate automatically once the dev build / production build is used.
 */

let analytics: any = null;

// Lazy-load Firebase Analytics — gracefully fails in Expo Go
function getAnalytics() {
  if (analytics) return analytics;
  try {
    analytics = require('@react-native-firebase/analytics').default;
  } catch (_) {
    analytics = null;
  }
  return analytics;
}

/** Log a custom event with optional params */
export async function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const fa = getAnalytics();
    if (!fa) return;
    await fa().logEvent(eventName, params);
  } catch (_) {}
}

/** Log a screen view (call on every major screen mount) */
export async function logScreenView(screenName: string): Promise<void> {
  try {
    const fa = getAnalytics();
    if (!fa) return;
    await fa().logScreenView({ screen_name: screenName, screen_class: screenName });
  } catch (_) {}
}

/** Set a user property (e.g. language, premium status) */
export async function setUserProperty(name: string, value: string): Promise<void> {
  try {
    const fa = getAnalytics();
    if (!fa) return;
    await fa().setUserProperty(name, value);
  } catch (_) {}
}

/** Identify the user (call after login) */
export async function identifyUser(userId: string): Promise<void> {
  try {
    const fa = getAnalytics();
    if (!fa) return;
    await fa().setUserId(userId);
  } catch (_) {}
}

// ─── Pre-defined AP events ────────────────────────────────────────────────────

/** User opens a pathway hub (waiver, medicaid, iep, diagnosis, potty, transition) */
export const trackPathwayOpened = (pathway: string) =>
  logEvent('pathway_opened', { pathway });

/** User completes a step in a pathway */
export const trackPathwayStepCompleted = (pathway: string, step: number) =>
  logEvent('pathway_step_completed', { pathway, step });

/** User opens the waiver utilization hub */
export const trackWaiverUtilizationOpened = () =>
  logEvent('waiver_utilization_opened');

/** User hits the "We got in!" celebration screen */
export const trackWaiverGotIn = () =>
  logEvent('waiver_got_in');

/** User views the paywall */
export const trackPaywallViewed = (source: string) =>
  logEvent('paywall_viewed', { source });

/** User taps subscribe on the paywall */
export const trackPaywallSubscribeTapped = (plan: 'monthly' | 'annual') =>
  logEvent('paywall_subscribe_tapped', { plan });

/** User completes a purchase */
export const trackPurchaseCompleted = (plan: 'monthly' | 'annual', price: number) =>
  logEvent('purchase_completed', { plan, price });

/** User switches language */
export const trackLanguageSwitched = (language: 'en' | 'es') =>
  logEvent('language_switched', { language });

/** User opens the AI chat */
export const trackAIChatOpened = (source: string) =>
  logEvent('ai_chat_opened', { source });

/** User sends a message in AI chat */
export const trackAIChatMessageSent = () =>
  logEvent('ai_chat_message_sent');

/** User opens the parenting pathways (in-the-moment) tool */
export const trackParentingPathwayOpened = () =>
  logEvent('parenting_pathway_opened');

/** User completes the ICD quiz */
export const trackICDQuizCompleted = (codesCount: number) =>
  logEvent('icd_quiz_completed', { codes_count: codesCount });

/** User opens the CCB tool */
export const trackCCBToolOpened = () =>
  logEvent('ccb_tool_opened');

/** User opens provider prep */
export const trackProviderPrepOpened = () =>
  logEvent('provider_prep_opened');

/** User logs an observation */
export const trackObservationLogged = () =>
  logEvent('observation_logged');

/** User opens the safe space / community */
export const trackSafeSpaceOpened = () =>
  logEvent('safe_space_opened');

/** User adds a child profile */
export const trackChildProfileAdded = () =>
  logEvent('child_profile_added');

/** User signs in */
export const trackSignIn = (method: 'apple' | 'email' | 'google') =>
  logEvent('sign_in', { method });

/** User signs up (first open after install) */
export const trackSignUp = (method: 'apple' | 'email' | 'google') =>
  logEvent('sign_up', { method });
