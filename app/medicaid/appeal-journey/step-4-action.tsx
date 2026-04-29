import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../../lib/theme';

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
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },

  heroSection: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },

  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },

  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  actionCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionCardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actionCardButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  actionCardButtonCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  actionCardButtonReview: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  actionCardButtonText: {
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  actionCardButtonTextCorrect: {
    color: '#2E7D32',
  },
  actionCardButtonTextReview: {
    color: '#E65100',
  },

  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  buttonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
});

export default function ActionStep() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Next Steps</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What's Your Situation?</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Choose your path forward:</Text>

          {/* Everything is correct path */}
          <View style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>✓ My Information is Correct</Text>
            <Text style={styles.actionCardDesc}>
              I reviewed my application and all documents are in order. I want to proceed with an official appeal.
            </Text>
            <TouchableOpacity 
              style={[styles.actionCardButton, styles.actionCardButtonReview]}
              onPress={() => router.push('/medicaid/appeal-journey/step-0-situation')}
            >
              <Text style={[styles.actionCardButtonText, styles.actionCardButtonTextReview]}>
                File Appeal →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Correction path */}
          <View style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>🔧 I Found Issues to Correct</Text>
            <Text style={styles.actionCardDesc}>
              I found missing or incorrect information. I want to correct it and resubmit to the Medicaid office.
            </Text>
            <TouchableOpacity 
              style={[styles.actionCardButton, styles.actionCardButtonCorrect]}
              onPress={() => router.push('/medicaid/appeal-journey/step-5-corrected')}
            >
              <Text style={[styles.actionCardButtonText, styles.actionCardButtonTextCorrect]}>
                Get Correction Steps →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
