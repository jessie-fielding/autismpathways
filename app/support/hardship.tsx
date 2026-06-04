/**
 * Support — Hardship Pricing Application
 * Separate from the premium hardship form — this one is specifically for 1:1 session pricing.
 * On submit, sends an email to jessie@autismpathways.app via mailto link.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

const INCOME_RANGES = [
  'Under $25,000',
  '$25,000 – $40,000',
  '$40,000 – $60,000',
  '$60,000 – $80,000',
  'Prefer not to say',
];

const SESSION_TYPES = [
  { id: 'quick', label: 'Quick Check-In (30 min)' },
  { id: 'deep', label: 'Deep Dive (60 min)' },
  { id: 'ongoing', label: 'Ongoing Support (3 sessions)' },
  { id: 'unsure', label: 'Not sure yet' },
];

export default function SupportHardshipScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [income, setIncome] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [email, setEmail] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = income && sessionType && email.includes('@');

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const subject = encodeURIComponent('Hardship Pricing Request — 1:1 Support Session');
    const body = encodeURIComponent(
      `Hardship Pricing Application\n\n` +
      `Session type: ${sessionType}\n` +
      `Income range: ${income}\n` +
      `Email: ${email}\n` +
      (explanation ? `\nAdditional context:\n${explanation}` : ''),
    );

    const mailUrl = `mailto:jessie@autismpathways.app?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(mailUrl);
      if (supported) {
        await Linking.openURL(mailUrl);
        setSubmitted(true);
      } else {
        Alert.alert(
          'No email app found',
          'Please email jessie@autismpathways.app directly with your name and the session type you are interested in.',
        );
      }
    } catch {
      Alert.alert('Error', 'Could not open email. Please email jessie@autismpathways.app directly.');
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Support</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hardship Pricing</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>💜</Text>
          <Text style={styles.successTitle}>Application Sent</Text>
          <Text style={styles.successBody}>
            Thank you for reaching out. I will review your application and get back to you within 3 to 5 business days with a custom rate.
          </Text>
          <Text style={styles.successNote}>
            No judgment, no hoops. Everyone deserves access to support.
          </Text>
          <TouchableOpacity style={styles.successBtn} onPress={() => router.push('/support' as any)} activeOpacity={0.85}>
            <Text style={styles.successBtnText}>Back to Support</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Support</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hardship Pricing</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>💜</Text>
            <Text style={styles.heroTitle}>Hardship pricing is available</Text>
            <Text style={styles.heroBody}>
              Because I know what it is like to be desperate for answers and be handed an expensive invoice instead. Sessions as low as $15. No judgment, no hoops.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Session type */}
            <Text style={styles.label}>Which session are you interested in?</Text>
            <View style={styles.optionGroup}>
              {SESSION_TYPES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.optionBtn, sessionType === s.label && styles.optionBtnActive]}
                  onPress={() => setSessionType(s.label)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, sessionType === s.label && styles.optionTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Income */}
            <Text style={styles.label}>Household income range</Text>
            <View style={styles.optionGroup}>
              {INCOME_RANGES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.optionBtn, income === r && styles.optionBtnActive]}
                  onPress={() => setIncome(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, income === r && styles.optionTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Email */}
            <Text style={styles.label}>Your email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Optional explanation */}
            <Text style={styles.label}>
              Anything you'd like to share? <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={explanation}
              onChangeText={setExplanation}
              placeholder="Anything that helps me understand your situation..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={canSubmit ? 0.85 : 1}
            >
              <Text style={styles.submitBtnText}>Submit Application →</Text>
            </TouchableOpacity>
            <Text style={styles.submitNote}>
              Applications reviewed within 3 to 5 business days. You will receive a custom rate by email.
            </Text>
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },

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
    backgroundColor: COLORS.purple, margin: SPACING.lg, borderRadius: RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center', ...SHADOWS.md,
  },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  heroBody: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20 },

  // Form
  form: { paddingHorizontal: SPACING.lg },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  optional: { color: COLORS.textLight, fontWeight: '400' },

  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  optionBtn: {
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border,
    paddingVertical: 8, paddingHorizontal: SPACING.md, backgroundColor: COLORS.white,
  },
  optionBtnActive: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  optionText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  optionTextActive: { color: COLORS.purple },

  input: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  textArea: { height: 100 },

  submitBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    alignItems: 'center', marginTop: SPACING.xl, ...SHADOWS.lg,
  },
  submitBtnDisabled: { backgroundColor: COLORS.border },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  submitNote: {
    fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center',
    lineHeight: 17, marginTop: SPACING.sm,
  },

  // Success
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  successEmoji: { fontSize: 56, marginBottom: SPACING.lg },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  successBody: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  successNote: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.xl },
  successBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl, ...SHADOWS.md,
  },
  successBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
