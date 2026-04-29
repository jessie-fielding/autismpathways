import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../../lib/theme';

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

  hero: {
    backgroundColor: 'rgba(139, 114, 231, 0.10)',
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
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 24,
  },

  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  infoCardPurple: {
    borderTopWidth: 4,
    borderTopColor: '#8B72E7',
  },
  infoCardMint: {
    borderTopWidth: 4,
    borderTopColor: '#3BBFA3',
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 22,
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
    backgroundColor: '#8B72E7',
    borderColor: '#8B72E7',
  },
  navButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
});

export default function PMIPProviderJourneyIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Prep Tool</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.mainTitle}>Prepare for your next provider appointment</Text>
          <Text style={styles.subtitle}>
            This tool helps you organize symptoms, support needs, and functional concerns so you can
            have a clearer conversation with your child’s provider about PMIP or LTD-related documentation.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.infoCard, styles.infoCardPurple]}>
            <Text style={styles.infoTitle}>What this tool does</Text>
            <Text style={styles.infoText}>
              It helps you gather your thoughts, identify patterns, and prepare talking points before
              an appointment. It is not a diagnosis or eligibility determination.
            </Text>
          </View>

          <View style={[styles.infoCard, styles.infoCardMint]}>
            <Text style={styles.infoTitle}>Helpful to have nearby</Text>
            <Text style={styles.infoText}>
              Bring recent evaluations, school notes, therapy reports, behavior patterns, daily living
              concerns, and any questions you want to ask your provider.
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
          onPress={() => router.push('/medicaid/ltd-journey/pmip-provider-journey/step-2-quiz')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Start →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
