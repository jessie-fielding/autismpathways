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
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 24,
  },

  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },

  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  stepNumber: {
    backgroundColor: '#4CAF50',
    color: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  highlight: {
    backgroundColor: '#FFFACD',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  highlightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },

  cta: {
    backgroundColor: '#4CAF50',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
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
  buttonPrimary: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  buttonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  buttonTextWhite: { color: COLORS.white },
});

const steps = [
  {
    title: 'Gather Your Corrected Documents',
    desc: 'Collect all missing or corrected paperwork. Make sure everything is clean, legible, and complete.',
  },
  {
    title: 'Contact Your Medicaid Office',
    desc: 'Call and ask: "I received a denial letter and I have the corrected documents. What is the best way to submit them?"',
  },
  {
    title: 'Submit Promptly',
    desc: 'Submit your corrected documents as soon as possible. Keep a copy for your records and note the date you submitted.',
  },
  {
    title: 'Follow Up',
    desc: 'Call back in 2-3 weeks to confirm they received your documents and ask when to expect a decision.',
  },
];

export default function CorrectedStep() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/medicaid-pathway')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Correct & Resubmit</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Resubmit Your Corrected Documents</Text>
          <Text style={styles.heroSubtitle}>
            Many people get approved after resubmitting missing or corrected information.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Here's What to Do:</Text>

          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepCard}>
              <Text style={styles.stepNumber}>{idx + 1}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.desc}</Text>
            </View>
          ))}

          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              💡 Pro Tip: Ask the Medicaid office to put a note in your file that you're resubmitting due to missing documents. This can help expedite the process.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.cta}
            onPress={() => router.push('/(tabs)/medicaid-pathway')}
          >
            <Text style={styles.ctaText}>Back to Medicaid Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/medicaid-pathway')}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
