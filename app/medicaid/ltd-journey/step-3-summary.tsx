import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const NEED_LABELS: Record<string, string> = {
  communication: 'Communication',
  social: 'Social interaction',
  selfcare: 'Self-care / ADLs',
  behavior: 'Behavioral challenges',
  sensory: 'Sensory processing',
  mobility: 'Mobility / motor skills',
  safety: 'Safety awareness',
  learning: 'Learning / academics',
};

const DIAGNOSIS_LABELS: Record<string, string> = {
  asd: 'Autism Spectrum Disorder',
  adhd: 'ADHD',
  id: 'Intellectual Disability',
  anxiety: 'Anxiety Disorder',
  spd: 'Sensory Processing Disorder',
  other: 'Other',
};

export default function Step3Summary() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    childName: string;
    childAge: string;
    diagnoses: string;
    needs: string;
    notes: string;
  }>();

  const diagnoses: string[] = params.diagnoses ? JSON.parse(params.diagnoses) : [];
  const needs: string[] = params.needs ? JSON.parse(params.needs) : [];

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
          <Text style={styles.progressLabel}>Step 3 of 4</Text>
          <Text style={styles.progressPercent}>75% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionLabel}>PROVIDER SUMMARY</Text>
          <Text style={styles.mainTitle}>Here's what to share with your provider</Text>
          <Text style={styles.mainSubtitle}>
            Show this screen to your provider or print it before your appointment. It gives them
            everything they need to complete the PMIP form accurately.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>PROVIDER BRIEFING</Text>
              <Text style={styles.summarySubtitle}>For LTD / PMIP Determination</Text>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>CHILD INFORMATION</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{params.childName || '—'}</Text>
              </View>
              {params.childAge ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Age:</Text>
                  <Text style={styles.summaryValue}>{params.childAge} years old</Text>
                </View>
              ) : null}
            </View>

            {diagnoses.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>DIAGNOSES</Text>
                {diagnoses.map((d) => (
                  <Text key={d} style={styles.summaryBullet}>
                    • {DIAGNOSIS_LABELS[d] || d}
                  </Text>
                ))}
              </View>
            )}

            {needs.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>AREAS REQUIRING SUPPORT</Text>
                {needs.map((n) => (
                  <Text key={n} style={styles.summaryBullet}>
                    • {NEED_LABELS[n] || n}
                  </Text>
                ))}
              </View>
            )}

            {params.notes ? (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>ADDITIONAL NOTES</Text>
                <Text style={styles.summaryNotes}>{params.notes}</Text>
              </View>
            ) : null}

            <View style={styles.summaryFooter}>
              <Text style={styles.summaryFooterText}>
                Please complete the PMIP form based on the above information. This child is seeking
                Long-Term Disability determination for Medicaid eligibility.
              </Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>📋 AT YOUR APPOINTMENT</Text>
            <Text style={styles.tipText}>
              Show this to your provider and say:{'\n\n'}
              <Text style={styles.script}>
                "We're here to get the PMIP form completed for my child's LTD determination. I've
                put together a summary of their needs to help you fill it out accurately."
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
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/ltd-journey/step-3b-pmip-check')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>After the visit →</Text>
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
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: SPACING.lg, overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
  },
  summaryTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  summarySubtitle: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summarySection: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summarySectionTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: 'row', marginBottom: SPACING.xs },
  summaryLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid, width: 60 },
  summaryValue: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '700' },
  summaryBullet: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
  summaryNotes: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  summaryFooter: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.bg },
  summaryFooterText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, fontStyle: 'italic' },
  tipBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.infoBorder,
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
