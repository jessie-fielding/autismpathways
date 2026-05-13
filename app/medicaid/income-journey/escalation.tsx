import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const ESCALATION_STEPS = [
  {
    level: 1,
    icon: '📧',
    title: 'Switch to email — create a paper trail',
    detail: 'Email creates documentation that phone calls don\'t. Keep each email focused on one topic (e.g., "Subject: Schedule CES Interview"). This makes it easy to reference and hard to ignore.',
    tip: 'Keep all communication in one email thread per topic. This is your evidence if you ever need to escalate further.',
  },
  {
    level: 2,
    icon: '👆',
    title: 'Follow up if you don\'t hear back',
    detail: 'If you haven\'t received a response, send a follow-up email stating that you haven\'t heard back and need a response by a specific date. Be polite but direct.',
    tip: 'Try the "hamburger method": start with something positive, state your ask clearly, end with something positive. You can be assertive and kind at the same time.',
  },
  {
    level: 3,
    icon: '🔼',
    title: 'CC their supervisor',
    detail: 'If you still don\'t hear back, find out who your contact\'s manager is (check their email signature, call the front desk, or look for an org chart on the agency website). CC the supervisor on your next email.',
    tip: 'You don\'t need to be confrontational. Simply CC them and say you wanted to make sure the right people were looped in.',
  },
  {
    level: 4,
    icon: '🔼🔼',
    title: 'Escalate up the chain',
    detail: 'If adding the supervisor doesn\'t help, find their supervisor\'s supervisor. Continue escalating up the org chart until you get a response. If necessary, go all the way to the agency\'s executive director.',
    tip: null,
  },
  {
    level: 5,
    icon: '🏛️',
    title: 'Contact the State',
    detail: 'Local case management agencies are contractors — the State of Colorado is the actual authority. If you\'re being mistreated, ignored, or have had promises broken, contact the state Medicaid agency directly. This almost always forces the local agency to act.',
    tip: 'Use the state contact form at the link below. Explain your situation clearly and include dates of unanswered communications.',
  },
];

export default function Escalation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stateData } = useMedicaidState();
  const stateName = stateData?.stateName ?? null;
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (level: number) => {
    const next = new Set(checked);
    if (next.has(level)) next.delete(level); else next.add(level);
    setChecked(next);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Income Journey</Text>
          {stateName && <Text style={styles.headerState}>📍 {stateName}</Text>}
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Escalation Guide</Text>
          <Text style={styles.progressPercent}>If things stall</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(checked.size / ESCALATION_STEPS.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Content header */}
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>📣</Text>
          </View>
          <Text style={styles.sectionLabel}>WHEN THINGS STALL</Text>
          <Text style={styles.mainTitle}>You have more power than you think</Text>
          <Text style={styles.mainSubtitle}>
            If your case management agency goes quiet or keeps missing deadlines, you don't have
            to just wait. There's a clear escalation path — and using it works.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Warning */}
          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>⚠️ REAL TALK</Text>
            <Text style={styles.warningText}>
              If you are not proactive and assertive, this process can take nine months or more.
              Families who follow up regularly and escalate when needed get through significantly faster.
            </Text>
          </View>

          {/* Escalation ladder */}
          <Text style={styles.stepsLabel}>ESCALATION LADDER — START AT LEVEL 1</Text>
          {ESCALATION_STEPS.map((step, index) => (
            <View key={step.level} style={styles.stepRow}>
              {/* Connector line */}
              <View style={styles.stepLeft}>
                <TouchableOpacity
                  style={[styles.levelBadge, checked.has(step.level) && styles.levelBadgeDone]}
                  onPress={() => toggle(step.level)}
                >
                  {checked.has(step.level)
                    ? <Text style={styles.levelBadgeCheck}>✓</Text>
                    : <Text style={styles.levelBadgeText}>{step.level}</Text>
                  }
                </TouchableOpacity>
                {index < ESCALATION_STEPS.length - 1 && <View style={styles.connector} />}
              </View>

              {/* Step content */}
              <View style={[styles.stepCard, checked.has(step.level) && styles.stepCardDone]}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={[styles.stepTitle, checked.has(step.level) && styles.stepTitleDone]}>
                  {step.title}
                </Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
                {step.tip && (
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>💡 {step.tip}</Text>
                  </View>
                )}
                {step.level === 5 && (
                  <TouchableOpacity
                    style={styles.stateButton}
                    onPress={() => Linking.openURL('https://bit.ly/3O4f0qM')}
                  >
                    <Text style={styles.stateButtonText}>Contact Colorado Medicaid →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Reminder */}
          <View style={styles.reminderBox}>
            <Text style={styles.reminderLabel}>📌 REMEMBER</Text>
            <Text style={styles.reminderText}>
              You are not being difficult. You are advocating for your child. The system is designed
              to serve families like yours — sometimes it just needs a push.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/income-journey/ltd-check')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Back to Start</Text>
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
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lavender,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionNumberText: { fontSize: 20 },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 28, marginBottom: SPACING.sm },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  warningBox: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  stepsLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  stepRow: { flexDirection: 'row', marginBottom: SPACING.md },
  stepLeft: { alignItems: 'center', width: 44, marginRight: SPACING.md },
  levelBadge: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center',
  },
  levelBadgeDone: { backgroundColor: COLORS.successText ?? '#2d7a4f' },
  levelBadgeText: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.sm },
  levelBadgeCheck: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.md },
  connector: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4, minHeight: 16 },
  stepCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 0,
  },
  stepCardDone: { borderColor: '#2d7a4f', backgroundColor: 'rgba(45,122,79,0.04)' },
  stepIcon: { fontSize: 22, marginBottom: SPACING.sm },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 6, lineHeight: 20 },
  stepTitleDone: { color: '#2d7a4f' },
  stepDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  tipBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, padding: SPACING.md, marginTop: SPACING.md,
  },
  tipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, lineHeight: 18 },
  stateButton: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg, marginTop: SPACING.md, alignSelf: 'flex-start',
  },
  stateButtonText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  reminderBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg,
  },
  reminderLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.sm },
  reminderText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
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
