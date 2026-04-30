import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';
import { useIsPremium } from '../../../hooks/useIsPremium';

export default function ApplicationTracker() {
  const router = useRouter();
  const { isPremium } = useIsPremium();
  const [applicationDate, setApplicationDate] = useState('');
  const [applicationMethod, setApplicationMethod] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [agencyContact, setAgencyContact] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  const METHODS = [
    { id: 'inperson', label: '🏢 In Person' },
    { id: 'phone', label: '📞 Phone' },
    { id: 'online', label: '💻 Online' },
    { id: 'mail', label: '📬 Mail' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Apply</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 4 of 5</Text>
          <Text style={styles.progressPercent}>80% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>4</Text>
          </View>
          <Text style={styles.sectionLabel}>APPLICATION TRACKER</Text>
          <Text style={styles.mainTitle}>Log your application details</Text>
          <Text style={styles.mainSubtitle}>
            Keep a record of when and how you applied. This is important if there are questions
            later or if you need to follow up.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Application date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Application date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={COLORS.textLight}
              value={applicationDate}
              onChangeText={setApplicationDate}
            />
          </View>

          {/* Method */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>How did you apply?</Text>
            <View style={styles.methodRow}>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodChip, applicationMethod === m.id && styles.methodChipActive]}
                  onPress={() => setApplicationMethod(m.id)}
                >
                  <Text style={[styles.methodChipText, applicationMethod === m.id && styles.methodChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Confirmation number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirmation or case number (if given)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., MC-2024-123456"
              placeholderTextColor={COLORS.textLight}
              value={confirmationNumber}
              onChangeText={setConfirmationNumber}
            />
          </View>

          {/* Agency contact */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Agency phone number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., (555) 123-4567"
              placeholderTextColor={COLORS.textLight}
              value={agencyContact}
              onChangeText={setAgencyContact}
              keyboardType="phone-pad"
            />
          </View>

          {/* Follow up date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Follow-up reminder date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY (2 weeks from application)"
              placeholderTextColor={COLORS.textLight}
              value={followUpDate}
              onChangeText={setFollowUpDate}
            />
            <Text style={styles.fieldHint}>
              Set a calendar reminder for this date to check on your application status.
            </Text>
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="e.g., Spoke with Maria at the downtown office. She said processing takes 30 days."
              placeholderTextColor={COLORS.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {isPremium ? (
            <View style={[styles.premiumBanner, { backgroundColor: '#e8f8f0', borderColor: '#a8ddc9' }]}>
              <Text style={styles.premiumIcon}>✓</Text>
              <View style={styles.premiumInfo}>
                <Text style={[styles.premiumTitle, { color: '#2e7d5e' }]}>Beta — Fully Unlocked</Text>
                <Text style={[styles.premiumText, { color: '#2e7d5e' }]}>
                  Follow-up reminders, status tracking, and document storage are all active for beta users.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.premiumBanner}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>Premium Feature</Text>
                <Text style={styles.premiumText}>
                  Upgrade to get automatic follow-up reminders, status tracking, and document storage
                  for your application.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/how-to-apply/follow-up')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Follow-up guide →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingTop: 56,
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  backButton: { fontSize: 22, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressContainer: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text },
  progressPercent: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.pill },
  contentHeader: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sectionNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionNumberText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 28 },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  fieldGroup: { marginBottom: SPACING.xl },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  fieldHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.xs },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.text,
  },
  inputMulti: { minHeight: 100, paddingTop: SPACING.md },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  methodChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  methodChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  methodChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  methodChipTextActive: { color: COLORS.white },
  premiumBanner: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  premiumIcon: { fontSize: 24 },
  premiumInfo: { flex: 1 },
  premiumTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: 4 },
  premiumText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, lineHeight: 18 },
  navigationButtons: {
    flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  navButton: { flex: 1, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  navButtonPrimary: { backgroundColor: COLORS.purple },
  navButtonSecondary: { backgroundColor: COLORS.lavender },
  navButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  navButtonTextPrimary: { color: COLORS.white },
  navButtonTextSecondary: { color: COLORS.purple },
});
