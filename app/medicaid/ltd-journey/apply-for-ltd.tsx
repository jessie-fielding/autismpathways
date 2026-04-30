import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const APPLY_STEPS = [
  { id: 's1', title: 'Gather your PMIP form', desc: 'Make sure it\'s signed and dated by your provider' },
  { id: 's2', title: 'Attach your child\'s diagnosis documentation', desc: 'Evaluation reports, diagnosis letters from providers' },
  { id: 's3', title: 'Complete the LTD application', desc: 'Available through your state\'s Medicaid office or online portal' },
  { id: 's4', title: 'Submit the application', desc: 'In person, by mail, or online depending on your state' },
  { id: 's5', title: 'Note your submission date', desc: 'Follow up in 2–3 weeks if you haven\'t heard back' },
];

export default function ApplyForLtd() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCompleted(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LTD Provider Journey</Text>
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
          <Text style={styles.sectionLabel}>APPLY FOR LTD</Text>
          <Text style={styles.mainTitle}>You're ready to apply for LTD</Text>
          <Text style={styles.mainSubtitle}>
            With your PMIP form in hand, you have everything you need. Follow these steps to submit
            your LTD application.
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

          {APPLY_STEPS.map((step, idx) => (
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

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>📞 IF YOU NEED HELP</Text>
            <Text style={styles.infoText}>
              Call your state's Medicaid office and say:{'\n\n'}
              <Text style={styles.script}>
                "I'd like to submit an LTD application for my child. They have a completed PMIP
                form. Can you tell me the process and where to submit?"
              </Text>
            </Text>
          </View>

          <View style={styles.nextBox}>
            <Text style={styles.nextTitle}>AFTER APPROVAL</Text>
            <Text style={styles.nextText}>
              Once your child is approved for LTD, they become eligible for Medicaid waivers. These
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
});
