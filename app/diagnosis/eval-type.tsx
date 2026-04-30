import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { useActiveChild } from '../../services/childManager';

const TOTAL_STEPS = 6;
const CURRENT_STEP = 3;

const OPTIONS = [
  {
    id: 'telehealth',
    emoji: '💻',
    title: 'Telehealth evaluation',
    desc: 'Done over video. Often faster to schedule and more flexible for busy families.',
  },
  {
    id: 'in-person',
    emoji: '🏥',
    title: 'In-person evaluation',
    desc: "Done at a clinic or provider's office. Typically the most comprehensive option.",
  },
  {
    id: 'help-me-decide',
    emoji: '🤔',
    title: "I'm not sure — help me decide",
    desc: 'Answer a few quick questions and we\'ll give you a recommendation.',
  },
];

export default function EvalTypeScreen() {
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await AsyncStorage.setItem('eval_type_preference', selected);
    await AsyncStorage.setItem(childKey('ap_diagnosis_step'), '3');
    if (selected === 'help-me-decide') {
      router.push('/diagnosis/help-me-decide');
    } else {
      await AsyncStorage.setItem('eval_type_filter', selected);
      router.push('/diagnosis/evaluator-list');
    }
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
            <Text style={styles.stepBadgeText}>STEP 2 OF 5</Text>
          </View>
          <Text style={styles.title}>How would you like to get the evaluation done?</Text>
          <Text style={styles.subtitle}>Both paths can lead to a valid diagnosis. Pick what fits your family best.</Text>

          <View style={styles.optionsContainer}>
            {OPTIONS.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setSelected(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                      {opt.title}
                    </Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBubble}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* School tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipEmoji}>🏫</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Did you know your school may offer evaluations?</Text>
              <Text style={styles.tipBody}>
                Some districts provide free developmental evaluations — but not all.
              </Text>
              <View style={styles.tipComingSoon}>
                <Text style={styles.tipComingSoonText}>→ Check if your school offers this — coming soon!</Text>
              </View>
            </View>
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
            style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
            onPress={handleContinue}
            disabled={!selected}
          >
            <Text style={styles.primaryBtnText}>
              {selected === 'help-me-decide' ? 'Help me decide →' : 'Find evaluators →'}
            </Text>
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
  optionsContainer: { gap: SPACING.md, marginBottom: SPACING.xl },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  optionCardSelected: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.purple,
  },
  optionEmoji: { fontSize: 28, marginTop: 2 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  optionTitleSelected: { color: COLORS.purple },
  optionDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  checkBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  tipBox: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  tipEmoji: { fontSize: 22 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: 4 },
  tipBody: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20, marginBottom: SPACING.sm },
  tipComingSoon: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  tipComingSoonText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, fontWeight: '600' },
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
});
