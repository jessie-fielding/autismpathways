import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View
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
const GOT_IN_KEY = 'ap_waiver_got_in';

export default function WaiverNextStepsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key: childKey } = useActiveChild();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [gotIn, setGotIn] = useState(false);

  const loadData = useCallback(async () => {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val) setCompletedSteps(JSON.parse(val));
    const gi = await AsyncStorage.getItem(GOT_IN_KEY);
    setGotIn(gi === 'true');
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const toggleStep = async (num: number) => {
    const updated = completedSteps.includes(num)
      ? completedSteps.filter((s) => s !== num)
      : [...completedSteps, num];
    setCompletedSteps(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Update waiver progress
    const progressStep = 3 + Math.min(updated.length, 3);
    const cur = parseInt(await AsyncStorage.getItem(childKey('ap_waiver_progress')) || '0', 10);
    if (progressStep > cur) {
      await AsyncStorage.setItem(childKey('ap_waiver_progress'), String(progressStep));
    }
  };

  const handleGotIn = async () => {
    await AsyncStorage.setItem(GOT_IN_KEY, 'true');
    await AsyncStorage.setItem(childKey('ap_waiver_progress'), '7');
    setGotIn(true);
  };

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);
  const allDone = completedSteps.length === STEPS.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiver Next Steps</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.dashBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── "We Got In!" celebration banner ─────────────────────── */}
        {gotIn ? (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>You got in!</Text>
            <Text style={styles.celebrationBody}>
              Congratulations — your child has been approved for waiver services. This is a huge milestone. Now let's make the most of it.
            </Text>
            <TouchableOpacity
              style={styles.celebrationBtn}
              onPress={() => router.push('/waiver/utilization-hub')}
              activeOpacity={0.85}
            >
              <Text style={styles.celebrationBtnText}>Start Using Your Waiver →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
          </>
        )}

        {/* Steps checklist */}
        {!gotIn && (
          <>
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

            {/* "We got in!" button — shown when all steps done or anytime */}
            {allDone && (
              <TouchableOpacity
                style={styles.gotInBtn}
                onPress={handleGotIn}
                activeOpacity={0.85}
              >
                <Text style={styles.gotInBtnEmoji}>🎉</Text>
                <View style={styles.gotInBtnText}>
                  <Text style={styles.gotInBtnTitle}>We got in!</Text>
                  <Text style={styles.gotInBtnSub}>Tap to celebrate and unlock waiver utilization tools</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* What to expect */}
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => router.push('/waiver/what-to-expect')}
            >
              <Text style={styles.nextBtnText}>What to Expect While Waiting →</Text>
            </TouchableOpacity>

            {/* Waiver Utilization Hub — always accessible */}
            <TouchableOpacity
              style={styles.utilizationBtn}
              onPress={() => router.push('/waiver/utilization-hub')}
            >
              <Text style={styles.utilizationBtnEmoji}>🎯</Text>
              <View style={styles.utilizationBtnText}>
                <Text style={styles.utilizationBtnTitle}>Make the Most of Your Waiver</Text>
                <Text style={styles.utilizationBtnSub}>Services list, ABA tool, caseworker email generator →</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* If got in — also show utilization tools below celebration */}
        {gotIn && (
          <>
            <Text style={styles.sectionLabel}>YOUR WAIVER TOOLS</Text>
            {[
              { emoji: '📋', title: 'Waiver Services List', sub: 'See what your waiver covers and request services', route: '/waiver/services-list' },
              { emoji: '🧠', title: 'ABA Provider Tool', sub: 'Log observations and build talking points', route: '/waiver/aba-tool' },
              { emoji: '📅', title: 'Service Scheduler', sub: 'Plan and track your service appointments', route: '/waiver/service-scheduler' },
            ].map(tool => (
              <TouchableOpacity
                key={tool.route}
                style={styles.toolCard}
                onPress={() => router.push(tool.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                <View style={styles.toolText}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolSub}>{tool.sub}</Text>
                </View>
                <Text style={styles.toolArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Citations */}
        <View style={styles.citationsBox}>
          <Text style={styles.citationsLabel}>SOURCES</Text>
          <Text style={styles.citationItem}>• Medicaid.gov — Home and Community-Based Services (HCBS) Waivers, Section 1915(c)</Text>
          <Text style={styles.citationItem}>• Centers for Medicare and Medicaid Services (CMS) — Medicaid Eligibility and Enrollment</Text>
          <Text style={styles.citationItem}>• Autism Speaks — State Medicaid Waiver Programs for Autism Resource Guide</Text>
          <Text style={styles.citationItem}>• Social Security Administration — Supplemental Security Income (SSI) for Children</Text>
        </View>
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
  backBtn: { padding: SPACING.xs, minWidth: 60 },
  backText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  dashBtn: { padding: SPACING.xs, minWidth: 60, alignItems: 'flex-end' },
  dashText: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZES.xs, fontWeight: '600' },
  scrollContainer: { flex: 1 },
  scroll: { paddingBottom: SPACING.xl },

  // Celebration card
  celebrationCard: {
    margin: SPACING.md,
    padding: SPACING.xl,
    backgroundColor: '#f0fff4',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2e7d5e',
    ...SHADOWS.md,
  },
  celebrationEmoji: { fontSize: 52, marginBottom: SPACING.md },
  celebrationTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: '#1a5c3a', marginBottom: SPACING.sm, textAlign: 'center' },
  celebrationBody: { fontSize: FONT_SIZES.md, color: '#2e5a3e', textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  celebrationBtn: {
    backgroundColor: '#2e7d5e',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.md,
  },
  celebrationBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },

  // Progress
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

  // Hero
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

  // Steps
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

  // Tip
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

  // "We got in!" button
  gotInBtn: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: '#f0fff4',
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: '#2e7d5e',
    ...SHADOWS.md,
  },
  gotInBtnEmoji: { fontSize: 32 },
  gotInBtnText: { flex: 1 },
  gotInBtnTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#1a5c3a', marginBottom: 2 },
  gotInBtnSub: { fontSize: FONT_SIZES.xs, color: '#2e5a3e' },

  // Buttons
  nextBtn: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  utilizationBtn: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    ...SHADOWS.sm,
  },
  utilizationBtnEmoji: { fontSize: 28 },
  utilizationBtnText: { flex: 1 },
  utilizationBtnTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple, marginBottom: 2 },
  utilizationBtnSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },

  // Tool cards (post-got-in)
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  toolEmoji: { fontSize: 26 },
  toolText: { flex: 1 },
  toolTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  toolSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 17 },
  toolArrow: { fontSize: 22, color: COLORS.textLight },

  // Citations
  citationsBox: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: '#f0f4ff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#c5cef0',
  },
  citationsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3a4a8a',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  citationItem: {
    fontSize: 11,
    color: '#3a4a8a',
    lineHeight: 17,
    marginBottom: 3,
  },
});
