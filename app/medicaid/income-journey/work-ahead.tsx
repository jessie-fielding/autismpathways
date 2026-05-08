import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const STEPS = [
  {
    id: 'request_app',
    icon: '📋',
    title: 'Request the waiver application now',
    detail: 'Contact your local Community Centered Board (CCB) intake department and ask for a copy of the specific waiver application before you officially need it. This gives you time to review the criteria and gather the right documentation.',
    tip: 'Ask specifically for the CES Waiver application if your child has autism or a developmental disability.',
  },
  {
    id: 'review_criteria',
    icon: '🔍',
    title: 'Study the eligibility criteria carefully',
    detail: 'Read every question on the application. Your job is to prove your child meets the criteria. Take notes, track incidents, and collect data that directly supports each requirement. Give yourself several weeks for this.',
    tip: null,
  },
  {
    id: 'identify_services',
    icon: '📝',
    title: 'Make a list of the services you need',
    detail: 'Visit the Colorado HCPF website and review the full list of services available under the waiver. Write down exactly which ones your child needs — don\'t wait until you\'re approved to figure this out.',
    tip: 'Common services: respite care, behavioral therapy, community connector, supported employment, personal care.',
  },
  {
    id: 'find_providers',
    icon: '🏥',
    title: 'Find providers yourself — don\'t rely on the RFP',
    detail: 'Case management agencies often send out a Request for Proposals (RFP) to find providers for you. The problem: only large agencies respond. Smaller, higher-quality "boutique" providers are too busy and often have waitlists — they don\'t respond to RFPs. Call providers directly.',
    tip: 'Search the Colorado HCPF provider directory and call 3-5 providers for each service you need.',
  },
  {
    id: 'cdass_option',
    icon: '👤',
    title: 'Consider the CDASS option',
    detail: 'Consumer Directed Attendant Support Services (CDASS) lets you hire and manage your own caregivers instead of using an agency. It requires more work on your end, but gives you much more control over who provides care.',
    tip: 'If you choose CDASS, contact Financial Management Services (FMS) agencies to understand the process.',
  },
];

export default function WorkAhead() {
  const router = useRouter();
  const { stateData } = useMedicaidState();
  const stateName = stateData?.stateName ?? null;
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['request_app']));

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
          <Text style={styles.progressLabel}>Work Ahead</Text>
          <Text style={styles.progressPercent}>{Math.round((checked.size / STEPS.length) * 100)}% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(checked.size / STEPS.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Content header */}
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>🚀</Text>
          </View>
          <Text style={styles.sectionLabel}>WHILE YOU WAIT</Text>
          <Text style={styles.mainTitle}>Get one step ahead</Text>
          <Text style={styles.mainSubtitle}>
            While your disability determination is being reviewed, you have time to prepare for
            what comes next. Families who do this work now move through the waiver process
            significantly faster.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Warning box */}
          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>⚠️ IMPORTANT</Text>
            <Text style={styles.warningText}>
              The waiver application process starts <Text style={styles.bold}>after</Text> your
              disability determination is approved — but you can request the application and
              identify providers right now. Don't wait.
            </Text>
          </View>

          {/* Steps */}
          <Text style={styles.stepsLabel}>PREPARATION STEPS</Text>
          {STEPS.map((step, index) => (
            <View key={step.id} style={[styles.stepCard, checked.has(step.id) && styles.stepCardDone]}>
              <TouchableOpacity
                style={styles.stepHeader}
                onPress={() => toggleExpand(step.id)}
                activeOpacity={0.7}
              >
                <View style={styles.stepLeft}>
                  <TouchableOpacity
                    style={[styles.checkbox, checked.has(step.id) && styles.checkboxDone]}
                    onPress={() => toggleCheck(step.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {checked.has(step.id) && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>
                <View style={styles.stepTitleRow}>
                  <Text style={[styles.stepTitle, checked.has(step.id) && styles.stepTitleDone]}>
                    {step.title}
                  </Text>
                  <Text style={styles.expandIcon}>{expanded.has(step.id) ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>
              {expanded.has(step.id) && (
                <View style={styles.stepBody}>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                  {step.tip && (
                    <View style={styles.tipBox}>
                      <Text style={styles.tipText}>💡 {step.tip}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}

          {/* If things stall */}
          <View style={styles.nextBox}>
            <Text style={styles.nextLabel}>🐌 IF THINGS STALL</Text>
            <Text style={styles.nextText}>
              If your case management agency stops responding or things feel stuck, there are
              specific escalation steps you can take to get things moving again.
            </Text>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => router.push('/medicaid/income-journey/escalation')}
            >
              <Text style={styles.nextButtonText}>See Escalation Guide →</Text>
            </TouchableOpacity>
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
          onPress={() => router.push('/medicaid/income-journey/escalation')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>If Things Stall →</Text>
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
  bold: { fontWeight: '800' },
  stepsLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  stepCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  stepCardDone: { borderColor: COLORS.purple },
  stepHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg },
  stepLeft: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm, flexShrink: 0,
  },
  checkboxDone: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  stepIcon: { fontSize: 22 },
  stepTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, flex: 1, lineHeight: 20 },
  stepTitleDone: { color: COLORS.purple },
  expandIcon: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginLeft: SPACING.sm },
  stepBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, paddingTop: 0 },
  stepDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, marginBottom: SPACING.sm },
  tipBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, padding: SPACING.md, marginTop: SPACING.sm,
  },
  tipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, lineHeight: 18 },
  nextBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.lg,
  },
  nextLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.sm },
  nextText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.lg },
  nextButton: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg, alignSelf: 'flex-start',
  },
  nextButtonText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
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
