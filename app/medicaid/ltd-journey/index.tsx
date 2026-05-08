import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';
import { PathwayDisclaimer } from '../../../components/PathwayDisclaimer';

export default function LtdJourneyIntro() {
  const router = useRouter();
  const { stateData } = useMedicaidState();
  const stateName = stateData?.stateName ?? null;
  const formName = stateData?.requiredForm ?? 'required documentation';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Provider Journey</Text>
          {stateName && <Text style={styles.headerState}>📍 {stateName}</Text>}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 1 of 4</Text>
          <Text style={styles.progressPercent}>25% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={styles.sectionLabel}>PROVIDER VISIT PREP</Text>
          <Text style={styles.mainTitle}>Let's prepare for your provider visit</Text>
          <Text style={styles.mainSubtitle}>
            Your provider plays a key role in documenting your child's needs. Going in prepared can
            make a big difference.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.introBox}>
            <Text style={styles.introIcon}>🩺</Text>
            <Text style={styles.introText}>
              Your provider may need to complete specific paperwork or provide detailed notes about
              your child's functional limitations. The more clearly you describe your child's daily
              challenges, the more accurate that documentation will be.
            </Text>
          </View>

          <Text style={styles.stepsTitle}>WHAT WE'LL DO TOGETHER</Text>

          {[
            { step: '1', title: 'Tell us about your child', desc: 'A short quiz to capture your child\'s needs and challenges' },
            { step: '2', title: 'Get a provider summary', desc: 'We\'ll organize everything into a clear one-page summary' },
            { step: '3', title: 'Bring it to your appointment', desc: 'Hand it to your provider so they have the full picture' },
            { step: '4', title: 'Get provider documentation', desc: `Your provider completes the ${formName} — then you can move forward with your application` },
          ].map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{item.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>💡 WHY THIS MATTERS</Text>
            <Text style={styles.infoText}>
              Providers see many patients. Coming in with a clear, organized summary of your child's
              needs helps them complete the required documentation accurately and thoroughly — which
              directly affects your child's eligibility determination.
            </Text>
          </View>

          {/* Medical Citations */}
          <View style={styles.citationsBox}>
            <Text style={styles.citationsLabel}>SOURCES</Text>
            <Text style={styles.citationItem}>• Medicaid.gov — Medicaid Functional Assessments and Level of Care Determinations</Text>
            <Text style={styles.citationItem}>• Centers for Medicare & Medicaid Services (CMS) — HCBS Waiver Application and Renewal Process</Text>
            <Text style={styles.citationItem}>• American Academy of Pediatrics — Documenting Functional Limitations in Children with Developmental Disabilities</Text>
            <Text style={styles.citationItem}>• Autism Speaks — Medicaid Waiver Resource Guide for Families</Text>
          </View>
        </View>
        <PathwayDisclaimer type="legal" />
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
          onPress={() => router.push('/medicaid/ltd-journey/step-2-quiz')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Tell us about your child →</Text>
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
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 28 },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  introBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.xl, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
  },
  introIcon: { fontSize: 24 },
  introText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  stepsTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  stepBadgeText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.xs },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  stepDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.infoBorder,
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
