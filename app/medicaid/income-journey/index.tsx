import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

export default function IncomeJourneyIntro() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Journey</Text>
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
              Being denied for household Medicaid based on income is frustrating — but it does not
              close the door for your child. There is a separate disability-based pathway that many
              families don't know about.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>⚡ IMPORTANT TO KNOW</Text>
            <Text style={styles.warningText}>
              Household income limits do <Text style={styles.bold}>not</Text> apply to
              disability-based Medicaid pathways for children. Your child may qualify based on their
              disability status alone — regardless of your family's income.
            </Text>
          </View>

          <Text style={styles.pathwayTitle}>THE DISABILITY PATHWAY</Text>

          {[
            {
              step: '1',
              color: COLORS.purple,
              title: 'Long-Term Disability (LTD) Determination',
              desc: 'A formal process where a provider documents your child\'s disability and support needs.',
            },
            {
              step: '2',
              color: '#4D96FF',
              title: 'PMIP Form Completion',
              desc: 'Your provider completes a specific form that establishes your child\'s level of care needs.',
            },
            {
              step: '3',
              color: '#4CAF50',
              title: 'Medicaid Waiver Eligibility',
              desc: 'With LTD approval, your child may qualify for Medicaid waivers that cover therapies, respite, and more.',
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
            <Text style={styles.infoLabel}>💡 WHAT IS LTD?</Text>
            <Text style={styles.infoText}>
              Long-Term Disability determination is a clinical assessment of your child's functional
              limitations. It's completed by a qualified provider and used to establish eligibility
              for disability-based programs — separate from household income.
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
          onPress={() => router.push('/medicaid/income-journey/ltd-check')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Check LTD status →</Text>
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
