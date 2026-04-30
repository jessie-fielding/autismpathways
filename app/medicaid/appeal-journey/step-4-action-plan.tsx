import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const ACTION_STEPS = [
  {
    id: 'a1',
    number: '1',
    title: 'Write a cover letter',
    detail:
      'Address the specific denial reason. Explain what was missing and confirm it is now included. Keep it brief — 1 page max.',
    time: '30 min',
  },
  {
    id: 'a2',
    number: '2',
    title: 'Organize your documents',
    detail:
      'Put everything in a clear order: cover letter first, then application, then supporting documents. Label each section.',
    time: '20 min',
  },
  {
    id: 'a3',
    number: '3',
    title: 'Make copies of everything',
    detail:
      'Keep a complete copy for yourself before submitting. You will need this if there are follow-up questions.',
    time: '10 min',
  },
  {
    id: 'a4',
    number: '4',
    title: 'Submit via certified mail or in person',
    detail:
      'Certified mail gives you a delivery confirmation. In person allows you to get a date-stamped receipt. Both are better than regular mail.',
    time: '1 hour',
  },
  {
    id: 'a5',
    number: '5',
    title: 'Note your submission date',
    detail:
      'Write down the exact date you submitted. Follow up in 2 weeks if you have not heard back.',
    time: '5 min',
  },
];

export default function Step4ActionPlan() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeal Journey</Text>
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
          <Text style={styles.sectionLabel}>ACTION PLAN</Text>
          <Text style={styles.mainTitle}>Your next steps to reapply</Text>
          <Text style={styles.mainSubtitle}>
            Work through these in order. Check each one off as you complete it.
          </Text>
        </View>

        <View style={styles.content}>
          {ACTION_STEPS.map((step, idx) => (
            <TouchableOpacity
              key={step.id}
              style={[styles.actionCard, completed.has(step.id) && styles.actionCardDone]}
              onPress={() => toggle(step.id)}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionDot, completed.has(step.id) && styles.actionDotDone]}>
                  <Text style={styles.actionDotText}>
                    {completed.has(step.id) ? '✓' : step.number}
                  </Text>
                </View>
                {idx < ACTION_STEPS.length - 1 && <View style={styles.actionLine} />}
              </View>
              <View style={styles.actionRight}>
                <View style={styles.actionTitleRow}>
                  <Text style={[styles.actionTitle, completed.has(step.id) && styles.actionTitleDone]}>
                    {step.title}
                  </Text>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeText}>⏱ {step.time}</Text>
                  </View>
                </View>
                <Text style={styles.actionDetail}>{step.detail}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>📞 TALKING SCRIPT</Text>
            <Text style={styles.tipText}>
              When calling the agency, say:{'\n\n'}
              <Text style={styles.script}>
                "Hi, I'm calling about a Medicaid application denial for my child. The denial letter
                referenced [reason]. I'm calling to confirm the appeal process and the deadline for
                resubmission."
              </Text>
            </Text>
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
          onPress={() => router.push('/medicaid/appeal-journey/step-5-resubmit')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Ready to submit →</Text>
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
  actionCard: {
    flexDirection: 'row', marginBottom: SPACING.sm,
  },
  actionCardDone: {},
  actionLeft: { alignItems: 'center', width: 40, marginRight: SPACING.md },
  actionDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  actionDotDone: { backgroundColor: COLORS.purple },
  actionDotText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.xs },
  actionLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4, minHeight: 16 },
  actionRight: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  actionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  actionTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginRight: SPACING.sm },
  actionTitleDone: { color: COLORS.purple },
  timeBadge: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  timeText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  actionDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  tipBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  script: { fontStyle: 'italic' },
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
