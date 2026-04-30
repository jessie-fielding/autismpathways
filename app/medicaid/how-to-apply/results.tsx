import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const OPTIONS = [
  {
    id: 'approved',
    icon: '✅',
    title: 'Medicaid approved!',
    description: 'We received approval and have Medicaid coverage',
  },
  {
    id: 'denied',
    icon: '📄',
    title: 'We were denied',
    description: 'We received a denial letter',
  },
  {
    id: 'waiting',
    icon: '⏳',
    title: 'Still waiting',
    description: 'We haven\'t received a decision yet',
  },
];

export default function Results() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    if (selected === 'approved') {
      router.push('/waiver-journey/step-1-intro');
    } else if (selected === 'denied') {
      router.push('/medicaid/denial-reason');
    } else {
      router.push('/medicaid/how-to-apply/follow-up');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Apply</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Text style={styles.sectionLabel}>RESULTS</Text>
          <Text style={styles.mainTitle}>What happened with your application?</Text>
          <Text style={styles.mainSubtitle}>
            Pick the one that fits. We'll take you to the right next step from here.
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
              <Text style={styles.successLabel}>🎉 CONGRATULATIONS!</Text>
              <Text style={styles.successText}>
                Getting Medicaid approved is a huge milestone. Now let's explore what comes next —
                including waivers and disability-based services for your child.
              </Text>
            </View>
          )}

          {selected === 'denied' && (
            <View style={styles.warningBox}>
              <Text style={styles.warningLabel}>💙 THIS IS NOT THE END</Text>
              <Text style={styles.warningText}>
                A denial is frustrating, but it's not final. We'll walk you through exactly what
                your denial means and what your options are. Many families get approved on appeal.
              </Text>
            </View>
          )}

          {selected === 'waiting' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>⏳ STILL WAITING</Text>
              <Text style={styles.infoText}>
                No problem — let's go back to the follow-up guide so you know exactly when and how
                to check in on your application status.
              </Text>
            </View>
          )}

          <View style={styles.howWorksBox}>
            <Text style={styles.howWorksLabel}>💡 HOW THIS WORKS</Text>
            <Text style={styles.howWorksText}>
              Each outcome leads to a different set of next steps. The app will only show you what's
              actually relevant to where you are right now.
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
            {selected === 'approved'
              ? 'Go to Waiver Journey →'
              : selected === 'denied'
              ? 'Start denial pathway →'
              : selected === 'waiting'
              ? 'Back to follow-up →'
              : 'Continue →'}
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
  contentHeader: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
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
  warningBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  howWorksBox: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.xl, borderWidth: 1, borderColor: COLORS.border,
  },
  howWorksLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, letterSpacing: 1, marginBottom: SPACING.sm },
  howWorksText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
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
