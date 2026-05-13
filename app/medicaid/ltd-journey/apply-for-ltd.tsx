import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const BASE_STEPS = [
  { id: 's1', title: 'Gather provider documentation', desc: 'Collect any paperwork or notes your provider completed about your child\'s needs' },
  { id: 's2', title: 'Include diagnosis and evaluation records', desc: 'Evaluation reports, diagnosis letters, and any assessments from providers' },
  { id: 's3', title: "Complete your state's application", desc: 'Available through your state\'s Medicaid office or online portal' },
  { id: 's4', title: "Submit through your state's Medicaid or waiver system", desc: 'In person, by mail, or online depending on your state' },
  { id: 's5', title: 'Note your submission date', desc: 'Follow up in 2–3 weeks if you haven\'t heard back' },
];

export default function ApplyForLtd() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stateData } = useMedicaidState();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCompleted(next);
  };

  const phoneScript = stateData?.phoneScript ??
    "\"I'd like to submit a disability-based Medicaid application for my child. I have provider documentation of their needs. Can you tell me the process and where to submit?\"";

  const phone = stateData?.medicaidPhone ?? null;
  const appUrl = stateData?.applicationUrl ?? null;
  const appPortalName = stateData?.applicationPortalName ?? null;
  const stateTip = stateData?.stateTip ?? null;
  const stateName = stateData?.stateName ?? null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Provider Journey</Text>
          {stateName && <Text style={styles.headerState}>📍 {stateName}</Text>}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 4 of 4</Text>
          <Text style={styles.progressPercent}>100% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>4</Text>
          </View>
          <Text style={styles.sectionLabel}>SUBMIT YOUR APPLICATION</Text>
          <Text style={styles.mainTitle}>Next step: submit your application</Text>
          <Text style={styles.mainSubtitle}>
            With your documentation ready, you can move forward with your state's disability-based
            Medicaid or waiver application.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.successBanner}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successText}>
              Getting to this point is a big deal. Most families never make it this far. You're
              doing something really important for your child.
            </Text>
          </View>

          <Text style={styles.stepsTitle}>APPLICATION CHECKLIST</Text>

          {BASE_STEPS.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, completed.has(step.id) && styles.stepCardDone]}
              onPress={() => toggle(step.id)}
            >
              <View style={[styles.checkbox, completed.has(step.id) && styles.checkboxDone]}>
                {completed.has(step.id) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, completed.has(step.id) && styles.stepTitleDone]}>
                  {step.title}
                </Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* State-specific application portal link */}
          {appUrl && appPortalName && (
            <TouchableOpacity
              style={styles.portalButton}
              onPress={() => Linking.openURL(appUrl)}
            >
              <Text style={styles.portalButtonIcon}>🔗</Text>
              <View style={styles.portalButtonText}>
                <Text style={styles.portalButtonTitle}>Apply online: {appPortalName}</Text>
                <Text style={styles.portalButtonUrl}>{appUrl}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* State-specific tip */}
          {stateTip && (
            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>💡 {stateName?.toUpperCase()} TIP</Text>
              <Text style={styles.tipText}>{stateTip}</Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>📞 IF YOU NEED HELP</Text>
            <Text style={styles.infoText}>
              {phone
                ? `Call ${stateName ?? 'your state'}'s Medicaid office at ${phone} and say:`
                : "Call your state's Medicaid office and say:"}
              {'\n\n'}
              <Text style={styles.script}>{phoneScript}</Text>
            </Text>
          </View>

          <View style={styles.nextBox}>
            <Text style={styles.nextTitle}>AFTER APPROVAL</Text>
            <Text style={styles.nextText}>
              Once your child is approved, they may become eligible for Medicaid waivers. These
              waivers can fund therapies, respite care, assistive technology, and community support
              services.
            </Text>
            <TouchableOpacity
              style={styles.waiverButton}
              onPress={() => router.push('/waiver-journey/step-1-intro')}
            >
              <Text style={styles.waiverButtonText}>Learn about Waiver Journey →</Text>
            </TouchableOpacity>
          </View>

          {/* Medical Citations */}
          <View style={styles.citationsBox}>
            <Text style={styles.citationsLabel}>SOURCES</Text>
            <Text style={styles.citationItem}>• Medicaid.gov — Home & Community-Based Services (HCBS) Waivers, Section 1915(c)</Text>
            <Text style={styles.citationItem}>• Centers for Medicare & Medicaid Services (CMS) — Medicaid Eligibility for Children with Disabilities</Text>
            <Text style={styles.citationItem}>• National Council on Disability — Medicaid Managed Care for People with Disabilities</Text>
            <Text style={styles.citationItem}>• Autism Speaks — State Medicaid Waiver Programs for Autism</Text>
          </View>
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
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, 
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  backButton: { fontSize: 22, color: COLORS.purple, marginRight: SPACING.md },
  headerTextGroup: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerState: { fontSize: FONT_SIZES.xs, color: COLORS.purple, marginTop: 2 },
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
  successBanner: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.xl, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.successBorder,
  },
  successEmoji: { fontSize: 24 },
  successText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.successText, lineHeight: 20 },
  stepsTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm,
    borderWidth: 2, borderColor: COLORS.border,
  },
  stepCardDone: { borderColor: COLORS.purple, backgroundColor: 'rgba(124,92,191,0.06)' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, marginTop: 1,
  },
  checkboxDone: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  stepTitleDone: { color: COLORS.purple },
  stepDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  portalButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.purple,
  },
  portalButtonIcon: { fontSize: 20, marginRight: SPACING.md },
  portalButtonText: { flex: 1 },
  portalButtonTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  portalButtonUrl: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  tipBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  script: { fontStyle: 'italic' },
  nextBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  nextTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  nextText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.lg },
  waiverButton: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  waiverButtonText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
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
  // Citations
  citationsBox: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  citationsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  citationItem: {
    fontSize: 11,
    color: COLORS.textLight,
    lineHeight: 17,
    marginBottom: 4,
  },
});
