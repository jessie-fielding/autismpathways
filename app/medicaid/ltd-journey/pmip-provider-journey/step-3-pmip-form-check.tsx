import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PMIP_COLORS, PMIP_SPACING, PMIP_SIZES } from '../../../../lib/pmip/pmipStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PMIP_COLORS.screenBg,
  },
  scrollContent: {
    paddingHorizontal: PMIP_SPACING.xl,
    paddingTop: PMIP_SPACING.lg,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: PMIP_COLORS.heroBg,
    borderRadius: PMIP_SIZES.hugeRadius,
    padding: PMIP_SPACING.xxl,
    alignItems: 'center',
    marginBottom: PMIP_SPACING.lg,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PMIP_COLORS.heroTitle,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: PMIP_COLORS.mutedText,
    textAlign: 'center',
    marginTop: PMIP_SPACING.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: PMIP_COLORS.cardBg,
    borderRadius: PMIP_SIZES.largeRadius,
    padding: PMIP_SPACING.lg,
    marginBottom: PMIP_SPACING.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PMIP_COLORS.heroTitle,
    marginBottom: PMIP_SPACING.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: PMIP_COLORS.mutedText,
    lineHeight: 20,
  },
  choiceBox: {
    padding: PMIP_SPACING.lg,
    marginBottom: PMIP_SPACING.md,
    borderRadius: PMIP_SIZES.largeRadius,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: PMIP_COLORS.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceBoxActive: {
    borderColor: PMIP_COLORS.primaryPurple,
    backgroundColor: '#F1EBFB',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: PMIP_SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: PMIP_COLORS.primaryPurple,
    borderColor: PMIP_COLORS.primaryPurple,
  },
  choiceText: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PMIP_COLORS.bodyText,
    marginBottom: PMIP_SPACING.xs,
  },
  choiceDesc: {
    fontSize: 12,
    color: PMIP_COLORS.mutedText,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: PMIP_SPACING.md,
    marginTop: PMIP_SPACING.xl,
  },
  button: {
    flex: 1,
    paddingVertical: PMIP_SPACING.lg,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: PMIP_COLORS.primaryPurple,
  },
  secondaryButton: {
    backgroundColor: PMIP_COLORS.cardBg,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: PMIP_COLORS.bodyText,
  },
});

export default function PMIPFormCheck() {
  const router = useRouter();
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null);

  const handleContinue = () => {
    if (!selected) return;

    if (selected === 'yes') {
      // YES - Go to Apply for LTD journey
      router.push('/medicaid/ltd-journey/apply-for-ltd/step-1-what-is-ltd');
    } else if (selected === 'no') {
      // NO - Loop back to intro to try again
      router.push('/medicaid/ltd-journey/pmip-provider-journey/step-1-intro');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Did your provider give you the PMIP form?</Text>
          <Text style={styles.heroSubtitle}>
            The PMIP (Provider-led Medicaid Intake Process) form documents your child's support needs for your records.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardDescription}>
            After your visit, your provider should have completed a PMIP form or similar documentation showing your child's support needs and functional limitations.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.choiceBox, selected === 'yes' && styles.choiceBoxActive]}
          onPress={() => setSelected('yes')}
        >
          <View style={[styles.checkbox, selected === 'yes' && styles.checkboxActive]}>
            {selected === 'yes' && <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>✓</Text>}
          </View>
          <View style={styles.choiceText}>
            <Text style={styles.choiceTitle}>✅ Yes, I have the form</Text>
            <Text style={styles.choiceDesc}>
              My provider completed the PMIP or similar assessment form
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.choiceBox, selected === 'no' && styles.choiceBoxActive]}
          onPress={() => setSelected('no')}
        >
          <View style={[styles.checkbox, selected === 'no' && styles.checkboxActive]}>
            {selected === 'no' && <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>✓</Text>}
          </View>
          <View style={styles.choiceText}>
            <Text style={styles.choiceTitle}>❌ No, we need to try again</Text>
            <Text style={styles.choiceDesc}>
              Let's go back and prepare better talking points for the provider
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selected}
            style={[styles.button, styles.primaryButton, !selected && { opacity: 0.5 }]}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
