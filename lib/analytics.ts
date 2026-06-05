/**
 * analytics.ts — Autism Pathways Mixpanel Analytics helper
 *
 * Replaces Firebase Analytics with Mixpanel for cleaner event dashboards.
 *
 * Usage:
 *   import { logEvent, logScreenView, identifyUser } from '../lib/analytics';
 *   logEvent('pathway_opened', { pathway: 'waiver' });
 *
 * All calls are safe to call in Expo Go — Mixpanel uses JS mode automatically
 * when native modules are unavailable.
 *
 * Project: Autism Pathways
 * Mixpanel Project Token: b2d115fd886e590ff58399184e38f918
 */

import { Mixpanel } from 'mixpanel-react-native';

const MIXPANEL_TOKEN = 'b2d115fd886e590ff58399184e38f918';

// Singleton instance — initialized once, reused everywhere
let _mixpanel: Mixpanel | null = null;
let _initPromise: Promise<Mixpanel | null> | null = null;

async function getMixpanel(): Promise<Mixpanel | null> {
  if (_mixpanel) return _mixpanel;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    try {
      // trackAutomaticEvents = false: we control all events manually
      // useNative = false: JS mode works in Expo Go + Expo managed workflow
      const mp = new Mixpanel(MIXPANEL_TOKEN, false, false);
      await mp.init();
      // Super properties sent with every event
      mp.registerSuperProperties({
        app: 'autism_pathways',
        platform: 'mobile',
      });
      _mixpanel = mp;
      return _mixpanel;
    } catch (e) {
      _initPromise = null;
      return null;
    }
  })();
  return _initPromise;
}

/** Log a custom event with optional properties */
export function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  getMixpanel().then((mp) => {
    if (!mp) return;
    try { mp.track(eventName, params ?? {}); } catch (_) {}
  }).catch(() => {});
}

/** Log a screen view — call on every major screen mount */
export function logScreenView(screenName: string): void {
  getMixpanel().then((mp) => {
    if (!mp) return;
    try { mp.track('screen_view', { screen_name: screenName }); } catch (_) {}
  }).catch(() => {});
}

/** Set a user property (e.g. language, premium status) */
export function setUserProperty(name: string, value: string): void {
  getMixpanel().then((mp) => {
    if (!mp) return;
    try { mp.getPeople().set({ [name]: value }); } catch (_) {}
  }).catch(() => {});
}

/**
 * Identify the user — call after login/signup with their user ID.
 * This links all future events to this user in Mixpanel.
 */
export function identifyUser(userId: string, email?: string): void {
  getMixpanel().then((mp) => {
    if (!mp) return;
    try {
      mp.identify(userId);
      if (email) { mp.getPeople().set({ $email: email }); }
    } catch (_) {}
  }).catch(() => {});
}

/**
 * Reset the Mixpanel identity — call on logout.
 * Clears local storage and generates a new anonymous distinct_id.
 */
export function resetUser(): void {
  getMixpanel().then((mp) => {
    if (!mp) return;
    try { mp.reset(); } catch (_) {}
  }).catch(() => {});
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
export const trackSignIn = (method: 'apple' | 'email' | 'google' | 'phone') =>
  logEvent('sign_in', { method });

/** User signs up (first account creation) */
export const trackSignUp = (method: 'apple' | 'email' | 'google' | 'phone') =>
  logEvent('sign_up_completed', { sign_up_method: method, platform: 'mobile' });

/** User opens Provider Translator */
export const trackProviderTranslatorOpened = () =>
  logEvent('provider_translator_opened');

/** User runs a translation in Provider Translator */
export const trackProviderTranslatorUsed = (mode: 'translate' | 'decode') =>
  logEvent('provider_translator_used', { mode });
