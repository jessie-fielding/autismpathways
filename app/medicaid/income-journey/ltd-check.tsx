import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const OPTIONS = [
  {
    id: 'not_started',
    icon: '🌱',
    title: "We haven't started yet",
    description: "We're just beginning to explore the disability-based pathway",
  },
  {
    id: 'talked_provider',
    icon: '🩺',
    title: "We've talked to a provider",
    description: "We've had a conversation but haven't gathered paperwork yet",
  },
  {
    id: 'gathering',
    icon: '📋',
    title: "We're gathering paperwork",
    description: "We're collecting documentation and forms needed for the process",
  },
  {
    id: 'submitted',
    icon: '📬',
    title: "We've submitted an application",
    description: "We've submitted and are waiting to hear back",
  },
  {
    id: 'approved',
    icon: '✅',
    title: "We've been approved",
    description: "Our child has been approved for disability-based Medicaid eligibility",
  },
  {
    id: 'denied',
    icon: '⚠️',
    title: 'We were denied',
    description: "Our application was denied and we're figuring out next steps",
  },
];

export default function LtdCheck() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    if (selected === 'approved') {
      router.push('/waiver-journey/step-1-intro');
    } else {
      router.push('/medicaid/ltd-journey');
    }
  };

  const getButtonLabel = () => {
    if (selected === 'approved') return 'Go to Waiver Journey →';
    if (selected) return 'Prepare for provider →';
    return 'Continue →';
  };

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
          <Text style={styles.progressLabel}>Step 2 of 2</Text>
          <Text style={styles.progressPercent}>100% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={styles.sectionLabel}>YOUR STATUS</Text>
          <Text style={styles.mainTitle}>Where are you in the process?</Text>
          <Text style={styles.mainSubtitle}>
            Let us know where you are so we can point you in the right direction.
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

          {selected === 'approved' && (
            <View style={styles.successBox}>
              <Text style={styles.successLabel}>🎉 GREAT NEWS</Text>
              <Text style={styles.successText}>
                With your approval, you're ready to explore Medicaid waivers. These can cover
                therapies, respite care, assistive technology, and more for your child.
              </Text>
            </View>
          )}

          {selected && selected !== 'approved' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>📋 WHAT'S NEXT</Text>
              <Text style={styles.infoText}>
                No problem — we'll walk you through how to prepare for the provider visit. This
                includes what to bring, what to say, and how to make sure the provider has everything
                they need to complete the documentation.
              </Text>
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
          style={[styles.navButton, styles.navButtonPrimary, !selected && { opacity: 0.5 }]}
          disabled={!selected}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {getButtonLabel()}
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
  sectionNumberText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
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
  successBox: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  successLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText, letterSpacing: 1, marginBottom: SPACING.sm },
  successText: { fontSize: FONT_SIZES.sm, color: COLORS.successText, lineHeight: 20 },
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
