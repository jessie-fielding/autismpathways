import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../../lib/theme';

const PROGRESS_KEY = 'ap_potty_desensitization';

const STAGES = [
  {
    id: 'stage1',
    number: 1,
    title: 'Near the Bathroom',
    goal: 'Child can walk past the bathroom door without distress',
    color: '#e8f5e9',
    border: '#4CAF50',
    steps: [
      { id: 's1a', label: 'Walk past the closed bathroom door without stopping — no expectation to enter' },
      { id: 's1b', label: 'Stand near the closed bathroom door for 30 seconds' },
      { id: 's1c', label: 'Touch the bathroom door handle without opening it' },
      { id: 's1d', label: 'Open the bathroom door and look inside without entering' },
    ],
    tip: 'Keep sessions to 2–3 minutes. End on success every time. Never push past the point of distress.',
  },
  {
    id: 'stage2',
    number: 2,
    title: 'Inside the Bathroom',
    goal: 'Child can enter and spend time in the bathroom fully clothed',
    color: '#e3f2fd',
    border: '#1565C0',
    steps: [
      { id: 's2a', label: 'Enter the bathroom and immediately leave — just a quick in-and-out' },
      { id: 's2b', label: 'Enter and stand in the bathroom for 30 seconds' },
      { id: 's2c', label: 'Enter and do a preferred activity (play, read) for 2–3 minutes' },
      { id: 's2d', label: 'Enter, do preferred activity, and flush the toilet (from a distance)' },
    ],
    tip: 'Bring preferred items into the bathroom — a favorite toy, book, or tablet. The goal is to make the space feel safe and neutral.',
  },
  {
    id: 'stage3',
    number: 3,
    title: 'Near the Toilet',
    goal: 'Child can approach and touch the toilet without distress',
    color: '#fff3e0',
    border: '#E65100',
    steps: [
      { id: 's3a', label: 'Stand next to the toilet (lid closed) for 30 seconds' },
      { id: 's3b', label: 'Touch the toilet lid (closed) with one finger' },
      { id: 's3c', label: 'Open the toilet lid and look inside' },
      { id: 's3d', label: 'Flush the toilet while standing next to it (not sitting)' },
    ],
    tip: 'If the flushing sound is a trigger, use a visual timer and let the child control when to flush. Noise-canceling headphones can help.',
  },
  {
    id: 'stage4',
    number: 4,
    title: 'Sitting on the Toilet — Clothed',
    goal: 'Child can sit on the toilet fully clothed for 1–2 minutes',
    color: '#fce4ec',
    border: '#C62828',
    steps: [
      { id: 's4a', label: 'Sit on the closed toilet lid (fully clothed) for 10 seconds' },
      { id: 's4b', label: 'Sit on the closed toilet lid (fully clothed) for 1 minute' },
      { id: 's4c', label: 'Sit on the open toilet seat (fully clothed) for 30 seconds' },
      { id: 's4d', label: 'Sit on the open toilet seat (fully clothed) for 2 minutes with a preferred activity' },
    ],
    tip: 'Add a step stool now so feet are supported. The physical comfort of correct positioning makes a big difference.',
  },
  {
    id: 'stage5',
    number: 5,
    title: 'Sitting on the Toilet — Pants Down',
    goal: 'Child can sit on the toilet with pants down for 2–5 minutes',
    color: '#f3e5f5',
    border: '#7B1FA2',
    steps: [
      { id: 's5a', label: 'Sit on toilet with pants down for 30 seconds (no expectation to go)' },
      { id: 's5b', label: 'Sit on toilet with pants down for 2 minutes' },
      { id: 's5c', label: 'Sit on toilet with pants down for 5 minutes with preferred activity' },
      { id: 's5d', label: 'Practice the "bear down" breathing while sitting (see PFPT Exercises)' },
    ],
    tip: 'This is often the hardest stage. Go slowly. Celebrate every second of sitting. Never react negatively to accidents during this stage.',
  },
  {
    id: 'stage6',
    number: 6,
    title: 'Successful BM on Toilet',
    goal: 'Child has at least one successful BM on the toilet',
    color: '#f8f4ff',
    border: '#5a3e8c',
    steps: [
      { id: 's6a', label: 'Continue timed sits 3x/day with correct positioning and breathing' },
      { id: 's6b', label: 'First successful BM on toilet — celebrate significantly!' },
      { id: 's6c', label: 'Second and third successful BM — establish as the new normal' },
      { id: 's6d', label: 'Child begins to self-initiate bathroom trips' },
    ],
    tip: 'The first successful BM is a milestone worth celebrating in a big way — whatever motivates your child most. This is the turning point.',
  },
];

export default function DesensitizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedStage, setExpandedStage] = useState<string | null>('stage1');

  useEffect(() => {
    AsyncStorage.getItem(PROGRESS_KEY).then(val => {
      if (val) setCompletedSteps(JSON.parse(val));
    });
  }, []);

  const toggleStep = async (stepId: string) => {
    const updated = { ...completedSteps, [stepId]: !completedSteps[stepId] };
    setCompletedSteps(updated);
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  };

  const getStageProgress = (stage: typeof STAGES[0]) => {
    const done = stage.steps.filter(s => completedSteps[s.id]).length;
    return { done, total: stage.steps.length };
  };

  const getCurrentStage = () => {
    for (const stage of STAGES) {
      const { done, total } = getStageProgress(stage);
      if (done < total) return stage.number;
    }
    return STAGES.length;
  };

  const handleShare = async () => {
    const current = getCurrentStage();
    const text = `DESENSITIZATION PROGRESS\n\nCurrently on Stage ${current}: ${STAGES[current - 1]?.title || 'Complete!'}\n\n${STAGES.map(s => {
      const { done, total } = getStageProgress(s);
      return `Stage ${s.number}: ${s.title} — ${done}/${total} steps complete`;
    }).join('\n')}\n\nGenerated by Autism Pathways`;
    await Share.share({ title: 'Desensitization Progress', message: text });
  };

  const currentStage = getCurrentStage();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Desensitization</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}><Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>🏠 Dashboard</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🧩</Text>
          <Text style={styles.introTitle}>OT-Informed Desensitization Sequence</Text>
          <Text style={styles.introBody}>
            This 6-stage sequence builds tolerance to the bathroom environment one small step at a time. Check off each step as your child masters it. Progress is saved automatically.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>CURRENT STAGE</Text>
          <Text style={styles.progressStage}>Stage {Math.min(currentStage, 6)}: {STAGES[Math.min(currentStage, 6) - 1]?.title}</Text>
          <View style={styles.progressBar}>
            {STAGES.map((s, i) => {
              const { done, total } = getStageProgress(s);
              const complete = done === total;
              return (
                <View
                  key={s.id}
                  style={[styles.progressSegment, { backgroundColor: complete ? s.border : i === currentStage - 1 ? s.border + '44' : '#e0e0e0' }]}
                />
              );
            })}
          </View>
          <Text style={styles.progressSub}>
            {STAGES.reduce((acc, s) => acc + getStageProgress(s).done, 0)} of {STAGES.reduce((acc, s) => acc + s.steps.length, 0)} steps complete
          </Text>
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Golden Rules</Text>
          {[
            'Always end on success — never push past the point of distress',
            'Keep sessions short (2–5 minutes) and frequent (daily)',
            'Reward every attempt, not just completion',
            'Never use the bathroom as punishment or a source of shame',
            'Go back a stage if there\'s a regression — that\'s normal',
          ].map((rule, i) => (
            <Text key={i} style={styles.rulesItem}>• {rule}</Text>
          ))}
        </View>

        {STAGES.map(stage => {
          const { done, total } = getStageProgress(stage);
          const isComplete = done === total;
          const isCurrent = stage.number === currentStage;
          return (
            <TouchableOpacity
              key={stage.id}
              style={[styles.stageCard, { borderLeftColor: stage.border, backgroundColor: stage.color }, isComplete && styles.stageComplete]}
              onPress={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              activeOpacity={0.85}
            >
              <View style={styles.stageHeader}>
                <View style={[styles.stageNumBadge, { backgroundColor: isComplete ? stage.border : '#fff', borderColor: stage.border }]}>
                  <Text style={[styles.stageNum, { color: isComplete ? '#fff' : stage.border }]}>
                    {isComplete ? '✓' : stage.number}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stageTitle, { color: stage.border }]}>{stage.title}</Text>
                  <Text style={styles.stageGoal}>{stage.goal}</Text>
                </View>
                {isCurrent && !isComplete && (
                  <View style={[styles.currentBadge, { backgroundColor: stage.border }]}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
                <Text style={styles.chevron}>{expandedStage === stage.id ? '▲' : '▼'}</Text>
              </View>

              {expandedStage === stage.id && (
                <View style={styles.stageBody}>
                  <View style={styles.stageProgress}>
                    <Text style={[styles.stageProgressText, { color: stage.border }]}>{done}/{total} steps complete</Text>
                  </View>
                  {stage.steps.map(step => (
                    <TouchableOpacity
                      key={step.id}
                      style={styles.stepRow}
                      onPress={() => toggleStep(step.id)}
                    >
                      <View style={[styles.checkbox, completedSteps[step.id] && { backgroundColor: stage.border, borderColor: stage.border }]}>
                        {completedSteps[step.id] && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.stepLabel, completedSteps[step.id] && styles.stepLabelDone]}>
                        {step.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={[styles.tipBox, { borderLeftColor: stage.border }]}>
                    <Text style={styles.tipLabel}>💡 TIP</Text>
                    <Text style={styles.tipText}>{stage.tip}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare}>
          <Text style={styles.shareFullBtnText}>📤 Share Progress</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Autism Pathways · For personal use only · Not a substitute for OT services</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  shareBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.purple },
  shareBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: '#f8f4ff', borderRadius: RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.card,
  },
  introEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.purple, textAlign: 'center', marginBottom: SPACING.sm },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  progressCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  progressLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  progressStage: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  progressBar: { flexDirection: 'row', gap: 4, marginBottom: SPACING.xs },
  progressSegment: { flex: 1, height: 8, borderRadius: 4 },
  progressSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  rulesCard: {
    backgroundColor: '#fff8e1', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: '#FF9800', marginBottom: SPACING.lg,
  },
  rulesTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#e65100', marginBottom: SPACING.sm },
  rulesItem: { fontSize: FONT_SIZES.sm, color: '#bf360c', lineHeight: 22, marginBottom: 2 },
  stageCard: {
    borderRadius: RADIUS.lg, borderLeftWidth: 4, padding: SPACING.md,
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  stageComplete: { opacity: 0.85 },
  stageHeader: { flexDirection: 'row', alignItems: 'center' },
  stageNumBadge: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  stageNum: { fontSize: FONT_SIZES.sm, fontWeight: '800' },
  stageTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  stageGoal: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, marginRight: SPACING.xs },
  currentBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  chevron: { fontSize: 12, color: COLORS.textSecondary },
  stageBody: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: SPACING.md },
  stageProgress: { marginBottom: SPACING.sm },
  stageProgressText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm, marginTop: 1, flexShrink: 0,
  },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  stepLabelDone: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  tipBox: { borderLeftWidth: 3, padding: SPACING.sm, borderRadius: RADIUS.sm, marginTop: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.6)' },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 18, fontStyle: 'italic' },
  shareFullBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.full, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple,
  },
  shareFullBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.md },
  footer: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
});
