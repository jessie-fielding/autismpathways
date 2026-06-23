/**
 * analytics.ts — Autism Pathways Mixpanel Analytics helper
 *
 * Full instrumentation: session replay, screen time, paywall funnel,
 * pathway opens, tool interactions, community events, and cold start.
 *
 * Usage:
 *   import { logEvent, logScreenView, useScreenTime } from '../lib/analytics';
 *   logEvent('pathway_opened', { pathway: 'waiver' });
 *
 * Project: Autism Pathways
 * Mixpanel Project Token: b2d115fd886e590ff58399184e38f918
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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

      // ── Session Replay ──────────────────────────────────────────────────────
      // Initialize session replay after Mixpanel is ready
      try {
        const { MixpanelSessionReplay } = require('@mixpanel/react-native-session-replay');
        MixpanelSessionReplay.init(MIXPANEL_TOKEN, {
          wifiOnly: false,       // record on cellular too
          recordSessionsPercent: 100, // record all sessions
        });
      } catch (_) {
        // Session replay not available in Expo Go — safe to ignore
      }

      return _mixpanel;
    } catch (e) {
      _initPromise = null;
      return null;
    }
  })();
  return _initPromise;
}

/** Eagerly initialize Mixpanel + session replay on app cold start */
export function initAnalytics(): void {
  getMixpanel().catch(() => {});
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

// ─── useScreenTime hook ───────────────────────────────────────────────────────
/**
 * Tracks how long a user spends on a screen.
 * Fires `screen_time` event when the user leaves (unmount or app background).
 *
 * Usage:
 *   useScreenTime('waiver_hub');
 */
export function useScreenTime(screenName: string): void {
  const startRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    startRef.current = Date.now();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (
        appStateRef.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        const seconds = Math.round((Date.now() - startRef.current) / 1000);
        logEvent('screen_time', { screen: screenName, seconds });
      }
      if (nextState === 'active') {
        startRef.current = Date.now();
      }
      appStateRef.current = nextState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      sub.remove();
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds > 1) {
        logEvent('screen_time', { screen: screenName, seconds });
      }
    };
  }, [screenName]);
}

// ─── Pre-defined AP events ────────────────────────────────────────────────────

/** App opened from cold start or background */
export const trackAppOpened = (source: 'cold_start' | 'background') =>
  logEvent('app_opened', { source });

/** User opens a pathway hub */
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

// ── Paywall funnel ────────────────────────────────────────────────────────────

/** User views the paywall — source identifies which feature triggered it */
export const trackPaywallViewed = (source: string) =>
  logEvent('paywall_viewed', { source });

/** User dismisses the paywall without subscribing */
export const trackPaywallDismissed = (source: string) =>
  logEvent('paywall_dismissed', { source });

/** User taps subscribe on the paywall */
export const trackPaywallSubscribeTapped = (plan: 'monthly' | 'annual') =>
  logEvent('paywall_subscribe_tapped', { plan });

/** User completes a purchase */
export const trackPurchaseCompleted = (plan: 'monthly' | 'annual', price?: number) =>
  logEvent('purchase_completed', { plan, price });

/** Purchase failed */
export const trackPurchaseFailed = (plan: 'monthly' | 'annual', reason: string) =>
  logEvent('purchase_failed', { plan, reason });

/** User taps the hardship application link on the paywall */
export const trackHardshipApplicationStarted = () =>
  logEvent('hardship_application_started');

// ── Auth ──────────────────────────────────────────────────────────────────────

/** User signs in */
export const trackSignIn = (method: 'apple' | 'email' | 'google' | 'phone') =>
  logEvent('sign_in', { method });

/** User signs up (first account creation) */
export const trackSignUp = (method: 'apple' | 'email' | 'google' | 'phone') =>
  logEvent('sign_up_completed', { sign_up_method: method, platform: 'mobile' });

/** User adds a child profile */
export const trackChildProfileAdded = () =>
  logEvent('child_profile_added');

/** User switches language */
export const trackLanguageSwitched = (language: 'en' | 'es') =>
  logEvent('language_switched', { language });

// ── AI Chat ───────────────────────────────────────────────────────────────────

/** User opens the AI chat */
export const trackAIChatOpened = (source: string) =>
  logEvent('ai_chat_opened', { source });

/** User sends a message in AI chat */
export const trackAIChatMessageSent = () =>
  logEvent('ai_chat_message_sent');

// ── Pathways ──────────────────────────────────────────────────────────────────

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

/** User creates a post in Safe Space */
export const trackSafeSpacePostCreated = () =>
  logEvent('safe_space_post_created');

/** User views a post in Safe Space */
export const trackSafeSpacePostViewed = (postId: string) =>
  logEvent('safe_space_post_viewed', { post_id: postId });

/** User adds a comment in Safe Space */
export const trackSafeSpaceCommentAdded = () =>
  logEvent('safe_space_comment_added');

/** User opens Provider Translator */
export const trackProviderTranslatorOpened = () =>
  logEvent('provider_translator_opened');

/** User runs a translation in Provider Translator */
export const trackProviderTranslatorUsed = (mode: 'translate' | 'decode') =>
  logEvent('provider_translator_used', { mode });

/** User opens the provider directory */
export const trackProviderDirectoryOpened = () =>
  logEvent('provider_directory_opened');

/** User searches the provider directory */
export const trackProviderDirectorySearched = (query: string) =>
  logEvent('provider_directory_searched', { query });

/** User views a provider profile */
export const trackProviderProfileViewed = (providerName: string) =>
  logEvent('provider_profile_viewed', { provider_name: providerName });

/** User submits a provider to the directory */
export const trackProviderSubmitted = () =>
  logEvent('provider_submitted');

/** User opens the document vault */
export const trackDocumentVaultOpened = () =>
  logEvent('document_vault_opened');

/** User uploads a document */
export const trackDocumentUploaded = (docType: string) =>
  logEvent('document_uploaded', { doc_type: docType });

/** User opens the services tracker */
export const trackServicesTrackerOpened = () =>
  logEvent('services_tracker_opened');

/** User adds a service entry */
export const trackServiceAdded = (serviceType: string) =>
  logEvent('service_added', { service_type: serviceType });

/** User opens the IEP pathway */
export const trackIEPOpened = () =>
  logEvent('iep_pathway_opened');

/** User uses the IEP meeting recorder */
export const trackIEPMeetingRecorderOpened = () =>
  logEvent('iep_meeting_recorder_opened');

/** User looks up an IEP evaluator */
export const trackIEPEvaluatorSearched = () =>
  logEvent('iep_evaluator_searched');

/** User opens the Diagnosis pathway */
export const trackDiagnosisPathwayOpened = () =>
  logEvent('diagnosis_pathway_opened');

/** User opens the Waiver pathway */
export const trackWaiverPathwayOpened = () =>
  logEvent('waiver_pathway_opened');

/** User opens the Medicaid pathway */
export const trackMedicaidPathwayOpened = () =>
  logEvent('medicaid_pathway_opened');

/** User opens the Transition pathway */
export const trackTransitionPathwayOpened = () =>
  logEvent('transition_pathway_opened');

/** User opens a stage in the Transition pathway */
export const trackTransitionStageOpened = (stage: number) =>
  logEvent('transition_stage_opened', { stage });

/** User opens the Long-Term Disability pathway */
export const trackLTDPathwayOpened = () =>
  logEvent('ltd_pathway_opened');

/** User opens the Waiver Journey flow */
export const trackWaiverJourneyOpened = () =>
  logEvent('waiver_journey_opened');

/** User opens the Disability Quiz */
export const trackDisabilityQuizOpened = () =>
  logEvent('disability_quiz_opened');

/** User opens the Appeal Tracker */
export const trackAppealTrackerOpened = () =>
  logEvent('appeal_tracker_opened');

/** User opens the Contacts screen */
export const trackContactsOpened = () =>
  logEvent('contacts_opened');

/** User adds a contact */
export const trackContactAdded = () =>
  logEvent('contact_added');

/** User opens the Talking Points tool */
export const trackTalkingPointsOpened = () =>
  logEvent('talking_points_opened');

/** User opens the Support screen */
export const trackSupportOpened = () =>
  logEvent('support_opened');

/** User opens Settings */
export const trackSettingsOpened = () =>
  logEvent('settings_opened');

/** User opens the Tools tab */
export const trackToolsTabOpened = () =>
  logEvent('tools_tab_opened');

/** User taps a tool card on the Tools tab */
export const trackToolTapped = (toolName: string) =>
  logEvent('tool_tapped', { tool_name: toolName });

// ── Profound Autism Pathway events ───────────────────────────────────────────

/** User opens the Profound Autism Pathway dashboard */
export const trackProfoundAutismOpened = () =>
  logEvent('profound_autism_pathway_opened');

/** User opens a tool within the Profound Autism Pathway */
export const trackProfoundToolOpened = (tool: string) =>
  logEvent('profound_tool_opened', { tool });

/** User completes the Poop Smearing Quiz */
export const trackPoopSmearingQuizCompleted = (primaryCause: string) =>
  logEvent('poop_smearing_quiz_completed', { primary_cause: primaryCause });

/** User completes the SOS+ quiz */
export const trackSOSPlusCompleted = (strategy: string) =>
  logEvent('sos_plus_completed', { strategy });

/** User completes the Is It Pain? checklist */
export const trackIsItPainCompleted = (flaggedCount: number) =>
  logEvent('is_it_pain_completed', { flagged_count: flaggedCount });

/** User searches the Program Finder */
export const trackProgramFinderSearched = (state: string) =>
  logEvent('program_finder_searched', { state });

/** Provider toggles Ready to Connect status */
export const trackProviderAvailabilityToggled = (readyToConnect: boolean) =>
  logEvent('provider_availability_toggled', { ready_to_connect: readyToConnect });
