import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../../lib/theme';

export default function IncomeJourneyIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Denial</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Text style={styles.mainTitle}>This may not be the end of the road.</Text>
          <Text style={styles.mainSubtitle}>
            Being denied because of income does not always mean your child is out of options.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>IMPORTANT</Text>
            <Text style={styles.infoText}>
              Some children who do not qualify under household income rules may still qualify through
              disability-related Medicaid pathways and waiver programs.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>NEXT QUESTION</Text>
            <Text style={styles.infoText}>
              Next, we’ll figure out whether your child has already been approved for long-term
              disability so we can guide you to the right path.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Text style={styles.navButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/income-journey/quiz-ltd')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  contentHeader: {
    backgroundColor: 'rgba(255, 152, 0, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  mainSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#C66900',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 21,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  navButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
});
