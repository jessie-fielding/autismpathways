import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const OPTIONS = [
  {
    id: 'yes',
    icon: '📄',
    title: 'Yes, I have the form',
    description: 'The provider completed the PMIP form and gave it to me',
  },
  {
    id: 'no',
    icon: '🔄',
    title: 'No, need to try again',
    description: 'The provider didn\'t complete it or I need to go back',
  },
];

export default function Step3bPmipCheck() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    if (selected === 'yes') {
      router.push('/medicaid/ltd-journey/apply-for-ltd');
    } else {
      // Back to step 1 to try again
      router.push('/medicaid/ltd-journey');
    }
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
          <Text style={styles.progressLabel}>Step 3B of 4</Text>
          <Text style={styles.progressPercent}>80% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3B</Text>
          </View>
          <Text style={styles.sectionLabel}>AFTER THE VISIT</Text>
          <Text style={styles.mainTitle}>Did your provider give you the PMIP form?</Text>
          <Text style={styles.mainSubtitle}>
            The PMIP form is the key document for your LTD application. It must be completed by your
            provider at or after the visit.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.choiceLabel}>Choose one</Text>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.choiceBox, selected === option.id && styles.choiceBoxActive]}
              onPress={() => setSelected(option.id)}
            >
              <Text style={styles.choiceIcon}>{option.icon}</Text>
              <View style={styles.choiceContent}>
                <Text style={styles.choiceTitle}>{option.title}</Text>
                <Text style={styles.choiceDescription}>{option.description}</Text>
              </View>
              {selected === option.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}

          {selected === 'no' && (
            <View style={styles.warningBox}>
              <Text style={styles.warningLabel}>💡 TIPS FOR YOUR NEXT VISIT</Text>
              <Text style={styles.warningText}>
                When you go back, be direct:{'\n\n'}
                <Text style={styles.script}>
                  "We need the PMIP form completed today for my child's LTD determination. Can you
                  complete it before we leave?"
                </Text>
                {'\n\n'}
                If the provider is unfamiliar with the form, ask them to contact the Medicaid office
                directly. Some offices will fax the form to the provider.
              </Text>
            </View>
          )}

          {selected === 'yes' && (
            <View style={styles.successBox}>
              <Text style={styles.successLabel}>✅ YOU'RE READY</Text>
              <Text style={styles.successText}>
                Excellent! With the PMIP form in hand, you're ready to apply for LTD. This is a
                major milestone — you're very close to unlocking the disability-based Medicaid
                pathway.
              </Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>ℹ️ WHAT IS THE PMIP FORM?</Text>
            <Text style={styles.infoText}>
              The PMIP (Physician's Medical Information Profile) is a standardized form your
              provider completes to document your child's functional limitations. It is required for
              the LTD determination process and is submitted with your LTD application.
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
          style={[styles.navButton, styles.navButtonPrimary, !selected && { opacity: 0.5 }]}
          disabled={!selected}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {selected === 'yes' ? 'Apply for LTD →' : selected === 'no' ? 'Try again →' : 'Continue →'}
          </Text>
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
  sectionNumberText: { color: COLORS.white, fontWeight: '700', fontSize: 11 },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 28 },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  choiceLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  choiceBox: {
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  choiceBoxActive: { borderColor: COLORS.purple, backgroundColor: 'rgba(124, 92, 191, 0.08)' },
  choiceIcon: { fontSize: 28, marginRight: SPACING.lg, marginTop: 2 },
  choiceContent: { flex: 1, marginRight: SPACING.md },
  choiceTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#4D96FF', marginBottom: 4 },
  choiceDescription: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  checkmark: { fontSize: 16, color: COLORS.purple, fontWeight: '700' },
  warningBox: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  script: { fontStyle: 'italic' },
  successBox: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  successLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText, letterSpacing: 1, marginBottom: SPACING.sm },
  successText: { fontSize: FONT_SIZES.sm, color: COLORS.successText, lineHeight: 20 },
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.infoBorder,
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
