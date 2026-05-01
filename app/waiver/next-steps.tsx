import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useActiveChild } from '../../services/childManager';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const STEPS = [
  {
    num: 1,
    emoji: '📞',
    title: 'Call the agency and request to be added to the waitlist',
    detail: 'Ask specifically: "I would like to apply for the waiver waitlist for my child." Get a confirmation number or name of who you spoke with.',
  },
  {
    num: 2,
    emoji: '📋',
    title: 'Complete the initial intake paperwork',
    detail: 'The agency will send or give you intake forms. Fill them out completely — incomplete forms can delay your spot on the list.',
  },
  {
    num: 3,
    emoji: '🏥',
    title: 'Gather supporting documentation',
    detail: 'You will typically need: autism diagnosis letter, most recent evaluation, insurance card, birth certificate, and proof of income/residency.',
  },
  {
    num: 4,
    emoji: '📅',
    title: 'Attend the intake meeting or assessment',
    detail: 'Many agencies require an in-person or phone assessment to determine your child\'s level of need. This helps determine priority on the waitlist.',
  },
  {
    num: 5,
    emoji: '✉️',
    title: 'Receive written confirmation of your waitlist position',
    detail: 'Always get written confirmation. Keep this document — it is your proof of your waitlist date, which determines when services begin.',
  },
  {
    num: 6,
    emoji: '🔁',
    title: 'Check in annually to maintain your spot',
    detail: 'Most states require annual check-ins to stay on the waitlist. Missing a check-in can remove you from the list entirely.',
  },
];

const STORAGE_KEY = 'ap_waiver_next_steps';

export default function WaiverNextStepsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key: childKey } = useActiveChild();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val) setCompletedSteps(JSON.parse(val));
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const toggleStep = async (num: number) => {
    const updated = completedSteps.includes(num)
      ? completedSteps.filter((s) => s !== num)
      : [...completedSteps, num];
    setCompletedSteps(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Update waiver progress (steps 4-6 = progress 4-6 out of 7)
    const progressStep = 3 + Math.min(updated.length, 3);
    const cur = parseInt(await AsyncStorage.getItem(childKey('ap_waiver_progress')) || '0', 10);
    if (progressStep > cur) {
      await AsyncStorage.setItem(childKey('ap_waiver_progress'), String(progressStep));
    }
  };

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiver Next Steps</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Your checklist progress</Text>
            <Text style={styles.progressPercent}>{progress}% complete</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎯</Text>
          <Text style={styles.heroTitle}>You found your agency — now act fast</Text>
          <Text style={styles.heroBody}>
            Waiver waitlists in most states are 2–10+ years long. The date you apply is the date that determines when services begin. Every day you wait is a day added to the wait.
          </Text>
        </View>

        {/* Steps checklist */}
        <Text style={styles.sectionLabel}>WHAT TO DO NOW</Text>
        {STEPS.map((step) => {
          const done = completedSteps.includes(step.num);
          return (
            <TouchableOpacity
              key={step.num}
              style={[styles.stepCard, done && styles.stepCardDone]}
              onPress={() => toggleStep(step.num)}
              activeOpacity={0.8}
            >
              <View style={styles.stepLeft}>
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepEmoji}>{step.emoji}</Text>
                  <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.title}</Text>
                </View>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Waitlist tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>⏰</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro tip: Apply even if you're not ready</Text>
            <Text style={styles.tipText}>
              You can always decline services when your number comes up. But you cannot go back in time to apply earlier. Apply now, decide later.
            </Text>
          </View>
        </View>

        {/* What to expect */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push('/waiver/what-to-expect')}
        >
          <Text style={styles.nextBtnText}>What to Expect While Waiting →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.purple,
  },
  backBtn: { padding: SPACING.xs },
  backText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  scroll: { paddingBottom: SPACING.xl },
  progressContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text },
  progressPercent: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.pill },
  heroCard: {
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  heroBody: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  stepCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  stepCardDone: { borderColor: '#2e7d5e', backgroundColor: '#f0fff4' },
  stepLeft: { paddingTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#2e7d5e', borderColor: '#2e7d5e' },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  stepContent: { flex: 1, gap: 4 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  stepEmoji: { fontSize: 16 },
  stepTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  stepTitleDone: { color: '#2e7d5e' },
  stepDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginLeft: 22 },
  tipCard: {
    flexDirection: 'row',
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#fff8e1',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#f0c040',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 20 },
  tipContent: { flex: 1, gap: 4 },
  tipTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#7a5c00' },
  tipText: { fontSize: FONT_SIZES.xs, color: '#7a5c00', lineHeight: 18 },
  nextBtn: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
