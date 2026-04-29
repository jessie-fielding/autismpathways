import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  contentHeader: {
    backgroundColor: 'rgba(76, 175, 80, 0.10)',
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
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  infoBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  navButtons: {
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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

export default function DisabilityIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disability</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Text style={styles.mainTitle}>Income Denial May Not Be the End</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>✅ DIFFERENT PATHWAY</Text>
            <Text style={styles.infoText}>
              A child denied because of household income may still qualify through a disability-based Medicaid pathway with different eligibility rules.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 NEXT STEP</Text>
            <Text style={styles.infoText}>
              Choose the primary disability category that best fits your child so we can guide you to the most relevant waiver or Medicaid option.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Text style={styles.navButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/disability-journey/quiz-1')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Start →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
