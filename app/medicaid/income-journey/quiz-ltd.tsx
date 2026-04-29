import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

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
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mainTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mainSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    flex: 1,
  },
  choiceBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceBoxActive: {
    borderColor: '#FF9800',
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  choiceTextWrap: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  choiceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
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

export default function IncomeJourneyLTDQuizScreen() {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<'yes' | 'no' | null>(null);

  const handleContinue = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer === 'yes') {
      router.push('/waiver-journey/step-1-intro');
    } else {
      router.push('/medicaid/ltd-journey/action-plan');
    }
  };

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
          <Text style={styles.mainTitle}>Has your child already been approved for LTD?</Text>
          <Text style={styles.mainSubtitle}>
            This helps us decide whether to send you directly to waiver options or through the disability pathway first.
          </Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.choiceBox, selectedAnswer === 'yes' && styles.choiceBoxActive]}
            onPress={() => setSelectedAnswer('yes')}
          >
            <View style={[styles.checkbox, selectedAnswer === 'yes' && styles.checkboxActive]}>
              {selectedAnswer === 'yes' && <Text style={{ color: COLORS.white, fontSize: 16 }}>✓</Text>}
            </View>
            <View style={styles.choiceTextWrap}>
              <Text style={styles.choiceTitle}>Yes, they already have LTD</Text>
              <Text style={styles.choiceDescription}>
                We’ll take you straight to the waiver pathway.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, selectedAnswer === 'no' && styles.choiceBoxActive]}
            onPress={() => setSelectedAnswer('no')}
          >
            <View style={[styles.checkbox, selectedAnswer === 'no' && styles.checkboxActive]}>
              {selectedAnswer === 'no' && <Text style={{ color: COLORS.white, fontSize: 16 }}>✓</Text>}
            </View>
            <View style={styles.choiceTextWrap}>
              <Text style={styles.choiceTitle}>No, not yet</Text>
              <Text style={styles.choiceDescription}>
                We’ll guide you through the disability and ICD pathway first, then send you to waivers.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Text style={styles.navButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, !selectedAnswer && { opacity: 0.5 }]}
          disabled={!selectedAnswer}
          onPress={handleContinue}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}