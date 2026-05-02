import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

export default function IncomeJourneyIntro() {
  const router = useRouter();
  const { stateData } = useMedicaidState();

  // State-aware content — falls back to universal language if no state selected
  const incomeHeadline = stateData?.incomeRuleHeadline ??
    "Household income limits often don't apply the same way for disability-based Medicaid pathways.";
  const incomeDetail = stateData?.incomeRuleDetail ??
    "In some cases, eligibility is based on your child's medical and functional needs rather than family income.";
  const stateName = stateData?.stateName ?? null;
  const programName = stateData?.programName ?? 'Disability Determination';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Income Journey</Text>
          {stateName && (
            <Text style={styles.headerState}>📍 {stateName}</Text>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 1 of 2</Text>
          <Text style={styles.progressPercent}>50% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={styles.sectionLabel}>INCOME DENIAL</Text>
          <Text style={styles.mainTitle}>This may not be the end of the road</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.introBox}>
            <Text style={styles.introIcon}>💙</Text>
            <Text style={styles.introText}>
              Being denied Medicaid based on income is frustrating, but it doesn't always mean your
              child won't qualify. There is a separate disability-based pathway that some children
              may qualify for, depending on their needs.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>⚡ IMPORTANT TO KNOW</Text>
            <Text style={styles.warningText}>{incomeHeadline}</Text>
            {stateData && (
              <Text style={[styles.warningText, { marginTop: SPACING.sm }]}>{incomeDetail}</Text>
            )}
          </View>

          <Text style={styles.pathwayTitle}>THE DISABILITY PATHWAY</Text>

          {[
            {
              step: '1',
              color: COLORS.purple,
              title: 'Provider Documentation',
              desc: "Your child's provider documents their diagnosis, needs, and daily challenges.",
            },
            {
              step: '2',
              color: '#4D96FF',
              title: stateData ? `${stateData.requiredForm}` : 'Required Forms or Evaluations',
              desc: stateData
                ? stateData.requiredFormNote
                : "Your state may require specific forms or assessments to understand your child's level of care needs.",
            },
            {
              step: '3',
              color: '#4CAF50',
              title: 'Eligibility Review',
              desc: stateData
                ? `${stateData.stateName} reviews the documentation and determines if your child qualifies for disability-based Medicaid or waiver services.`
                : 'The state reviews medical documentation and determines if your child qualifies for disability-based Medicaid or waiver services.',
            },
          ].map((item, idx) => (
            <View key={item.step} style={styles.pathwayStep}>
              <View style={styles.pathwayLeft}>
                <View style={[styles.stepDot, { backgroundColor: item.color }]}>
                  <Text style={styles.stepDotText}>{item.step}</Text>
                </View>
                {idx < 2 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.pathwayRight}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>💡 WHAT DOES "DISABILITY-BASED" MEAN?</Text>
            <Text style={styles.infoText}>
              This pathway focuses on how your child's condition impacts their daily life. It looks
              at things like communication, behavior, safety, and ability to complete everyday tasks.
              A provider will usually need to document these needs clearly.
            </Text>
          </View>

          {stateData && stateData.waiverPrograms.length > 0 && (
            <View style={styles.waiverBox}>
              <Text style={styles.waiverLabel}>🏆 WAIVER PROGRAMS IN {stateData.stateName.toUpperCase()}</Text>
              {stateData.waiverPrograms.map((w) => (
                <View key={w.acronym} style={styles.waiverRow}>
                  <Text style={styles.waiverName}>{w.acronym} — {w.name}</Text>
                  <Text style={styles.waiverDesc}>{w.description}</Text>
                </View>
              ))}
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
          onPress={() => router.push('/medicaid/income-journey/ltd-check')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Check your status →</Text>
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
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionNumberText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 28 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  introBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
  },
  introIcon: { fontSize: 24 },
  introText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  warningBox: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  bold: { fontWeight: '800' },
  pathwayTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  pathwayStep: { flexDirection: 'row', marginBottom: SPACING.sm },
  pathwayLeft: { alignItems: 'center', width: 40, marginRight: SPACING.md },
  stepDot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepDotText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4, minHeight: 20 },
  pathwayRight: { flex: 1, paddingBottom: SPACING.lg },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4, lineHeight: 20 },
  stepDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  waiverBox: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  waiverLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.md },
  waiverRow: { marginBottom: SPACING.md },
  waiverName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  waiverDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
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
