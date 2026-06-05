/**
 * Hardship Application Screen
 * - Household income range, state, waiver status, brief explanation, email
 * - Waiver tip: if user has a waiver, show "unmet needs" tip
 * - Submits to owner via Lambda notification + AsyncStorage local record
 * - Owner issues RevenueCat promo code by email
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Linking, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

const LAMBDA_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

const INCOME_OPTIONS = [
  { value: 'under_25k', label: 'Under $25,000' },
  { value: '25k_40k', label: '$25,000 – $40,000' },
  { value: '40k_60k', label: '$40,000 – $60,000' },
  { value: 'over_60k', label: 'Over $60,000' },
];

const STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

type WaiverStatus = 'yes_active' | 'yes_waitlist' | 'no' | null;

export default function HardshipApplicationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [income, setIncome] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [waiverStatus, setWaiverStatus] = useState<WaiverStatus>(null);
  const [explanation, setExplanation] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showWaiverTip = waiverStatus === 'yes_active' || waiverStatus === 'yes_waitlist';

  const canSubmit = income !== null && state !== null && waiverStatus !== null && email.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!email.includes('@')) {
      Alert.alert('Email required', 'Please enter a valid email address so we can send your promo code.');
      return;
    }

    setSubmitting(true);
    try {
      // Save locally
      const application = {
        income,
        state,
        waiverStatus,
        explanation,
        email,
        submittedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('ap_hardship_application', JSON.stringify(application));

      // Notify owner via Lambda
      try {
        await fetch(`${LAMBDA_BASE}/api/notify/owner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: '💜 New Hardship Application',
            body: [
              `New hardship application received:`,
              ``,
              `Income Range: ${INCOME_OPTIONS.find(o => o.value === income)?.label || income}`,
              `State: ${state}`,
              `Waiver Status: ${waiverStatus}`,
              `Email: ${email}`,
              ``,
              explanation ? `Explanation: ${explanation}` : 'No explanation provided.',
              ``,
              `Submitted: ${new Date().toLocaleString()}`,
            ].join('\n'),
          }),
        });
      } catch (_) {
        // Notification failure is non-blocking — application is saved locally
      }

      setSubmitted(true);
    } catch (e) {
      Alert.alert('Submission Error', 'Something went wrong. Please try again or email jessie@autismpathways.app directly.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Sent</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>💜</Text>
          <Text style={styles.successTitle}>We received your application!</Text>
          <Text style={styles.successSub}>
            We review applications within 3–5 business days. If approved, you'll receive a RevenueCat promo code at{' '}
            <Text style={styles.successEmail}>{email}</Text>
            {' '}that gives you access at $4.99/mo.
          </Text>
          <View style={styles.successNote}>
            <Text style={styles.successNoteText}>
              While you wait, the free version of Autism Pathways is still fully available to you. Thank you for trusting us with your story.
            </Text>
          </View>
          <TouchableOpacity style={styles.successBtn} onPress={() => router.push('/(tabs)/dashboard')} activeOpacity={0.85}>
            <Text style={styles.successBtnText}>Back to App →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successEmailLink} onPress={() => Linking.openURL('mailto:jessie@autismpathways.app')}>
            <Text style={styles.successEmailLinkText}>Questions? Email jessie@autismpathways.app</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Premium</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hardship Application</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>💜</Text>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>We believe every family deserves access.</Text>
              <Text style={styles.heroSub}>
                If the standard price is a barrier, we want to help. Approved applicants receive a special rate of{' '}
                <Text style={styles.heroHighlight}>$4.99/mo</Text>
                {' '}— share only what you’re comfortable with. We don’t judge.
              </Text>
              <Text style={styles.heroStandard}>Standard price: $14.99/mo</Text>
            </View>
          </View>

          <View style={styles.form}>
            {/* Income range */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Household Income Range <Text style={styles.required}>*</Text></Text>
              <View style={styles.optionList}>
                {INCOME_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionRow, income === opt.value && styles.optionRowSelected]}
                    onPress={() => setIncome(opt.value)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioCircle, income === opt.value && styles.radioCircleSelected]}>
                      {income === opt.value && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.optionLabel, income === opt.value && styles.optionLabelSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* State */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>State <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.pickerBtn, state && styles.pickerBtnFilled]}
                onPress={() => setShowStatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickerBtnText, !state && styles.pickerBtnPlaceholder]}>
                  {state || 'Select your state...'}
                </Text>
                <Text style={styles.pickerChevron}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Waiver status */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Medicaid Waiver Status <Text style={styles.required}>*</Text></Text>
              <Text style={styles.fieldHint}>Do you or your child currently have a Medicaid waiver?</Text>
              <View style={styles.waiverOptions}>
                {[
                  { value: 'yes_active', label: 'Yes — active waiver' },
                  { value: 'yes_waitlist', label: 'Yes — on the waitlist' },
                  { value: 'no', label: 'No / Not sure' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.waiverPill, waiverStatus === opt.value && styles.waiverPillSelected]}
                    onPress={() => setWaiverStatus(opt.value as WaiverStatus)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.waiverPillText, waiverStatus === opt.value && styles.waiverPillTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Waiver tip — shown when user has active or waitlist waiver */}
              {showWaiverTip && (
                <View style={styles.waiverTip}>
                  <Text style={styles.waiverTipEmoji}>💡</Text>
                  <View style={styles.waiverTipText}>
                    <Text style={styles.waiverTipBody}>
                      You may be able to get this covered by{' '}
                      <Text style={styles.waiverTipBold}>unmet needs on your waiver.</Text>
                      {' '}Some states allow waiver funds to cover app subscriptions and digital tools as an unmet need.
                    </Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL('https://autismpathways.app/waiver-unmet-needs')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.waiverTipLink}>Learn more about waiver unmet needs →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Brief explanation */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Brief Explanation <Text style={styles.optional}>(optional)</Text></Text>
              <Text style={styles.fieldHint}>Tell us a little about your situation. This is completely optional and helps us process your application.</Text>
              <TextInput
                style={styles.textArea}
                value={explanation}
                onChangeText={setExplanation}
                placeholder="Share as much or as little as you'd like..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address <Text style={styles.required}>*</Text></Text>
              <Text style={styles.fieldHint}>Where should we send your promo code?</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={canSubmit ? 0.85 : 1}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {canSubmit ? 'Submit Application →' : 'Complete all required fields'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.reviewNote}>
              Applications are reviewed within 3–5 business days. You will receive a RevenueCat promo code by email.
            </Text>

            <TouchableOpacity
              style={styles.emailDirectLink}
              onPress={() => Linking.openURL('mailto:jessie@autismpathways.app?subject=Hardship%20Application')}
            >
              <Text style={styles.emailDirectText}>Prefer to email directly? jessie@autismpathways.app</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>

        {/* State Picker Modal */}
        {showStatePicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity style={styles.pickerBackdrop} onPress={() => setShowStatePicker(false)} />
            <View style={styles.pickerSheet}>
              <View style={styles.pickerSheetHeader}>
                <Text style={styles.pickerSheetTitle}>Select State</Text>
                <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                  <Text style={styles.pickerSheetClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                {STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.pickerItem, state === s && styles.pickerItemSelected]}
                    onPress={() => { setState(s); setShowStatePicker(false); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickerItemText, state === s && styles.pickerItemTextSelected]}>{s}</Text>
                    {state === s && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: 4, minWidth: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },

  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.purple, margin: SPACING.lg, borderRadius: RADIUS.lg,
    padding: SPACING.lg, ...SHADOWS.md,
  },
  heroEmoji: { fontSize: 40, marginTop: 2 },
  heroText: { flex: 1 },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.sm, lineHeight: 26 },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: SPACING.sm },
  heroHighlight: { fontWeight: '800', color: COLORS.yellowAccent },
  heroStandard: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.65)' },

  // Form
  form: { paddingHorizontal: SPACING.lg },
  fieldGroup: { marginBottom: SPACING.xl },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  fieldHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.sm, lineHeight: 17 },
  required: { color: COLORS.purple },
  optional: { color: COLORS.textLight, fontWeight: '400' },

  // Income options
  optionList: { gap: SPACING.xs },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  optionRowSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleSelected: { borderColor: COLORS.purple },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.purple },
  optionLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '500' },
  optionLabelSelected: { color: COLORS.purpleDark, fontWeight: '700' },

  // State picker
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  pickerBtnFilled: { borderColor: COLORS.purple },
  pickerBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  pickerBtnPlaceholder: { color: COLORS.textLight, fontWeight: '400' },
  pickerChevron: { color: COLORS.textLight, fontSize: 12 },

  // Waiver pills
  waiverOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  waiverPill: {
    borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border,
  },
  waiverPillSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  waiverPillText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  waiverPillTextSelected: { color: COLORS.white },

  // Waiver tip
  waiverTip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: '#EEF9F0', borderRadius: RADIUS.sm, padding: SPACING.md,
    borderWidth: 1, borderColor: '#A8DFB0', marginTop: SPACING.sm,
  },
  waiverTipEmoji: { fontSize: 18, marginTop: 1 },
  waiverTipText: { flex: 1 },
  waiverTipBody: { fontSize: FONT_SIZES.sm, color: '#1A5C28', lineHeight: 19, marginBottom: SPACING.xs },
  waiverTipBold: { fontWeight: '700' },
  waiverTipLink: { fontSize: FONT_SIZES.sm, color: '#1A7A35', fontWeight: '700', textDecorationLine: 'underline' },

  // Text inputs
  textArea: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.sm,
    color: COLORS.text, height: 110,
  },
  textInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text,
  },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    alignItems: 'center', ...SHADOWS.lg, marginBottom: SPACING.md,
  },
  submitBtnDisabled: { backgroundColor: COLORS.border },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  reviewNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', lineHeight: 17, marginBottom: SPACING.sm },
  emailDirectLink: { alignItems: 'center', paddingVertical: SPACING.sm, marginBottom: SPACING.lg },
  emailDirectText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },

  // State picker modal
  pickerOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  pickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
    maxHeight: '70%', ...SHADOWS.lg,
  },
  pickerSheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pickerSheetTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  pickerSheetClose: { fontSize: 18, color: COLORS.textLight, padding: 4 },
  pickerList: { paddingHorizontal: SPACING.md },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pickerItemSelected: { backgroundColor: COLORS.lavender },
  pickerItemText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  pickerItemTextSelected: { color: COLORS.purpleDark, fontWeight: '700' },
  pickerItemCheck: { color: COLORS.purple, fontWeight: '800', fontSize: FONT_SIZES.sm },

  // Success screen
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxxl },
  successEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  successTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  successSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 21, marginBottom: SPACING.xl },
  successEmail: { color: COLORS.purple, fontWeight: '700' },
  successNote: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, padding: SPACING.lg,
    marginBottom: SPACING.xl, width: '100%',
  },
  successNoteText: { fontSize: FONT_SIZES.sm, color: COLORS.purpleDark, lineHeight: 20, textAlign: 'center' },
  successBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl, ...SHADOWS.lg, marginBottom: SPACING.lg,
  },
  successBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  successEmailLink: { paddingVertical: SPACING.sm },
  successEmailLinkText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
});
