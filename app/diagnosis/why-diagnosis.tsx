import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { useActiveChild } from '../../services/childManager';

const TOTAL_STEPS = 6;
const CURRENT_STEP = 2;

const REASONS = [
  { id: 'speech', emoji: '💬', label: 'Speech or communication delays' },
  { id: 'social', emoji: '🤝', label: 'Social interaction differences' },
  { id: 'sensory', emoji: '✋', label: 'Sensory sensitivities' },
  { id: 'meltdowns', emoji: '🌊', label: 'Meltdowns or emotional regulation' },
  { id: 'school', emoji: '🏫', label: 'School or learning concerns' },
  { id: 'provider', emoji: '🩺', label: 'A provider suggested evaluation' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family member already diagnosed' },
  { id: 'sleep', emoji: '🌙', label: 'Sleep difficulties' },
  { id: 'feeding', emoji: '🍽️', label: 'Feeding or picky eating' },
  { id: 'motor', emoji: '🤸', label: 'Motor skill concerns' },
  { id: 'gut', emoji: '🔮', label: 'A gut feeling something is different' },
];

export default function WhyDiagnosisScreen() {
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('diagnosis_reasons', JSON.stringify(selected));
    await AsyncStorage.setItem(childKey('ap_diagnosis_step'), '2');
    router.push('/diagnosis/eval-type');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism Pathways</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.dashBtn}>
          <Text style={styles.dashText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < CURRENT_STEP ? styles.progressSegmentActive : styles.progressSegmentInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>Step {CURRENT_STEP} of {TOTAL_STEPS}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 1 OF 5</Text>
          </View>
          <Text style={styles.title}>Why are you looking into a diagnosis?</Text>
          <Text style={styles.subtitle}>Select everything that feels true. There's no wrong answer here.</Text>

          <View style={styles.chipsContainer}>
            {REASONS.map((reason) => {
              const isSelected = selected.includes(reason.id);
              return (
                <TouchableOpacity
                  key={reason.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggle(reason.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipEmoji}>{reason.emoji}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info note */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💬</Text>
            <Text style={styles.infoText}>
              Your answer helps us point you to the most relevant evaluators and give you better talking points for your first call.
            </Text>
          </View>

          {/* Medical Citations */}
          <View style={styles.citationsBox}>
            <Text style={styles.citationsLabel}>SOURCES</Text>
            <Text style={styles.citationItem}>• American Psychiatric Association — DSM-5-TR: Autism Spectrum Disorder Diagnostic Criteria</Text>
            <Text style={styles.citationItem}>• CDC — Autism Spectrum Disorder: Data & Statistics (ADDM Network)</Text>
            <Text style={styles.citationItem}>• American Academy of Pediatrics — Identification, Evaluation, and Management of Children with ASD</Text>
            <Text style={styles.citationItem}>• IDEA (Individuals with Disabilities Education Act) — Early Intervention and Special Education Eligibility</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, selected.length === 0 && styles.primaryBtnDisabled]}
            onPress={handleContinue}
            disabled={selected.length === 0}
          >
            <Text style={styles.primaryBtnText}>This is us →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  dashBtn: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dashText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBarRow: { flexDirection: 'row', gap: 4, marginBottom: SPACING.xs },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressSegmentActive: { backgroundColor: COLORS.purple },
  progressSegmentInactive: { backgroundColor: COLORS.border },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  stepBadge: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textMid, marginBottom: SPACING.xl, lineHeight: 22 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  chipSelected: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.purple,
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '500' },
  chipTextSelected: { color: COLORS.purple, fontWeight: '700' },
  infoBox: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 18 },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, flex: 1, lineHeight: 20 },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerRow: { flexDirection: 'row', gap: SPACING.md },
  secondaryBtn: {
    flex: 1,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.base },
  primaryBtn: {
    flex: 2,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.base },
  // Citations
  citationsBox: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  citationsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  citationItem: {
    fontSize: 11,
    color: COLORS.textLight,
    lineHeight: 17,
    marginBottom: 4,
  },
});
