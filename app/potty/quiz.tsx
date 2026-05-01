import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

type ScoreKey = 'encopresis' | 'bodySignals' | 'sensory' | 'regression' | 'fearAnxiety' | 'developmental';

interface Option {
  emoji: string;
  text: string;
  sub: string;
  score: Partial<Record<ScoreKey, number>>;
}

interface Question {
  id: string;
  text: string;
  sub: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'How does your child react when they need to go?',
    sub: 'Think about what you typically observe.',
    options: [
      { emoji: '😶', text: "Doesn't seem to notice at all", sub: 'No apparent awareness before or during', score: { encopresis: 2, bodySignals: 3 } },
      { emoji: '😟', text: 'Notices but seems to panic or freeze', sub: 'Aware, but anxious or overwhelmed', score: { sensory: 3 } },
      { emoji: '😤', text: 'Notices and refuses to go', sub: 'Aware but actively avoids the bathroom', score: { sensory: 2, regression: 1 } },
      { emoji: '😣', text: 'Notices, tries, but still has accidents', sub: 'Aware and trying but losing control', score: { encopresis: 2, bodySignals: 1 } },
    ],
  },
  {
    id: 'q2',
    text: 'How often does your child have a bowel movement?',
    sub: 'Think about the last few weeks. This question is more important than it might seem.',
    options: [
      { emoji: '✅', text: 'Once a day or more', sub: 'Regular, predictable pattern', score: { regression: 1 } },
      { emoji: '🤔', text: 'Every 2–3 days', sub: 'Less frequent but seems okay', score: { encopresis: 1 } },
      { emoji: '⚠️', text: 'Every 3–5 days or less often', sub: 'Often seems to strain or have hard stools', score: { encopresis: 3 } },
      { emoji: '❓', text: "I'm honestly not sure", sub: 'Hard to track or inconsistent', score: { encopresis: 2, bodySignals: 1 } },
    ],
  },
  {
    id: 'q3',
    text: 'When your child has an accident, do they seem to know it happened?',
    sub: "We're looking at body awareness here.",
    options: [
      { emoji: '😶', text: 'No — they seem completely unaware', sub: 'Discover it only when you notice', score: { encopresis: 3, bodySignals: 2 } },
      { emoji: '😟', text: 'Sometimes — they notice after', sub: 'Occasional awareness, inconsistent', score: { bodySignals: 2, encopresis: 1 } },
      { emoji: '😣', text: "Yes — they notice but can't stop it", sub: 'Aware but loses control anyway', score: { encopresis: 2 } },
      { emoji: '😌', text: 'They usually notice and tell me', sub: 'Awareness is generally present', score: { sensory: 1, regression: 2 } },
    ],
  },
  {
    id: 'q4',
    text: 'Where do accidents happen most?',
    sub: 'This helps us understand if environment is a factor.',
    options: [
      { emoji: '🏠', text: 'Mostly at home', sub: 'School bathroom seems okay', score: { sensory: 1, regression: 1 } },
      { emoji: '🏫', text: 'Mostly at school', sub: 'Home is usually fine', score: { sensory: 2, regression: 2 } },
      { emoji: '🌍', text: 'Everywhere — home and school', sub: 'No clear environmental pattern', score: { encopresis: 2, bodySignals: 2 } },
      { emoji: '🚗', text: "Usually when we're out or transitioning", sub: 'Happens during changes or travel', score: { sensory: 2, regression: 1 } },
    ],
  },
  {
    id: 'q5',
    text: 'Did your child ever make progress and then regress?',
    sub: 'Sometimes a step backward tells us a lot.',
    options: [
      { emoji: '📉', text: 'Yes — was doing well, now struggling again', sub: 'Clear regression after progress', score: { regression: 4 } },
      { emoji: '📊', text: 'Progress has always been slow and uneven', sub: 'Never fully consistent', score: { bodySignals: 2, encopresis: 1 } },
      { emoji: '🔄', text: "We've had small setbacks but mostly forward", sub: 'Generally progressing with bumps', score: { sensory: 1 } },
      { emoji: '🚫', text: "We haven't made much progress at all yet", sub: 'Still in the early stages', score: { encopresis: 1, bodySignals: 1 } },
    ],
  },
  {
    id: 'q6',
    text: 'Does your child have strong reactions to the bathroom itself?',
    sub: 'Sound, seat, smell, flushing, echoing — any of these.',
    options: [
      { emoji: '😨', text: 'Yes — they refuse to go in or panic', sub: 'Strong negative reaction to the bathroom', score: { sensory: 4 } },
      { emoji: '😬', text: 'Sometimes — specific things bother them', sub: 'Flushing, sound, or cold seat', score: { sensory: 2 } },
      { emoji: '🤷', text: 'Not really — they seem fine in bathrooms', sub: 'No obvious sensory issues there', score: { encopresis: 1, bodySignals: 1 } },
      { emoji: '🏠', text: 'Only in unfamiliar bathrooms', sub: 'Home is fine, public places are hard', score: { sensory: 2, regression: 1 } },
    ],
  },
  {
    id: 'q7',
    text: 'Are their stools ever very hard, pellet-like, or does straining happen?',
    sub: 'This question is about the physical experience, not behavior.',
    options: [
      { emoji: '😖', text: 'Yes, frequently — often seems painful', sub: 'Obvious discomfort or straining', score: { encopresis: 4 } },
      { emoji: '😕', text: 'Sometimes — not every time', sub: 'Occasional hardness or straining', score: { encopresis: 2 } },
      { emoji: '✅', text: 'No — stools seem normal when they go', sub: 'No obvious constipation signs', score: { bodySignals: 1, sensory: 1 } },
      { emoji: '❓', text: "I can't really tell — accidents make it hard to assess", sub: 'Limited visibility into what\'s happening', score: { encopresis: 2, bodySignals: 1 } },
    ],
  },
  {
    id: 'q8',
    text: 'How would you describe the overall situation right now?',
    sub: 'Be honest — there are no wrong answers here.',
    options: [
      { emoji: '🆘', text: "We're in crisis — daily accidents, everyone is exhausted", sub: 'Urgent, affecting the whole family', score: { encopresis: 2, bodySignals: 1 } },
      { emoji: '😢', text: "It's hard but we're managing", sub: 'Ongoing struggle, some good days', score: { sensory: 1, regression: 1 } },
      { emoji: '🔍', text: "I'm trying to understand what's going on", sub: 'More confused than overwhelmed', score: { bodySignals: 2 } },
      { emoji: '📈', text: "We've had progress but hit a wall", sub: 'Moving forward but stuck now', score: { regression: 2, sensory: 1 } },
    ],
  },
];

export default function PottyQuizScreen() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const q = QUESTIONS[currentQ];
  const selectedIdx = answers[q.id];
  const hasAnswer = selectedIdx !== undefined;
  const progress = (currentQ + 1) / QUESTIONS.length;

  const selectAnswer = (idx: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  };

  const handleNext = async () => {
    if (!hasAnswer) return;
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      await calculateResult();
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ((c) => c - 1);
    } else {
      router.back();
    }
  };

  const calculateResult = async () => {
    const scores: Record<ScoreKey, number> = { encopresis: 0, bodySignals: 0, sensory: 0, regression: 0, fearAnxiety: 0, developmental: 0 };
    QUESTIONS.forEach((question) => {
      const idx = answers[question.id];
      if (idx === undefined) return;
      const s = question.options[idx].score;
      (Object.keys(s) as ScoreKey[]).forEach((key) => {
        scores[key] += s[key] ?? 0;
      });
    });

    // Encopresis guard: only route to encopresis if at least 2 of 3 specific
    // constipation indicators are present:
    //   Q2 (bowel frequency): option index 2 = every 3-5 days, or 3 = unsure
    //   Q7 (hard stools):     option index 0 = frequently painful, or 1 = sometimes
    //   Q3 (accident awareness): option index 0 = completely unaware
    const q2Idx = answers['q2'];
    const q3Idx = answers['q3'];
    const q7Idx = answers['q7'];
    const constipationIndicators = [
      q2Idx === 2 || q2Idx === 3,   // infrequent / unsure bowel movements
      q7Idx === 0 || q7Idx === 1,   // hard/painful stools
      q3Idx === 0,                   // completely unaware of accidents
    ].filter(Boolean).length;

    // If fewer than 2 constipation indicators, zero out encopresis score
    // so it can't win over other causes
    if (constipationIndicators < 2) {
      scores.encopresis = 0;
    }

    const sorted = (Object.keys(scores) as ScoreKey[]).sort((a, b) => scores[b] - scores[a]);
    const primary = sorted[0];
    const secondary = scores[sorted[1]] >= 2 ? sorted[1] : null;

    await AsyncStorage.setItem('potty_result', JSON.stringify({ primary, secondary, scores, answers }));
    // Advance potty progress to at least step 1 (quiz completed)
    const cur = parseInt(await AsyncStorage.getItem('ap_potty_progress') || '0', 10);
    if (cur < 1) await AsyncStorage.setItem('ap_potty_progress', '1');
    router.replace({ pathname: '/potty/result', params: { primary, secondary: secondary ?? '' } });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.backBtn}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{currentQ + 1} of {QUESTIONS.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{q.text}</Text>
          <Text style={styles.questionSub}>{q.sub}</Text>

          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.answerOption, selectedIdx === i && styles.answerOptionSelected]}
              onPress={() => selectAnswer(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.answerEmoji}>{opt.emoji}</Text>
              <View style={styles.answerTextBlock}>
                <Text style={[styles.answerText, selectedIdx === i && styles.answerTextSelected]}>{opt.text}</Text>
                <Text style={[styles.answerSub, selectedIdx === i && styles.answerSubSelected]}>{opt.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.btnSection}>
        <TouchableOpacity
          style={[styles.primaryBtn, !hasAnswer && styles.primaryBtnDisabled]}
          onPress={handleNext}
          disabled={!hasAnswer}
        >
          <LinearGradient
            colors={hasAnswer ? ['#74c0fc', '#7c6fd4'] : ['#c0b8e8', '#c0b8e8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtnGradient}
          >
            <Text style={styles.primaryBtnText}>
              {currentQ < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Pathway →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
          <Text style={styles.secondaryBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rainbowBar} />
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
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bg,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.purple,
    borderRadius: 3,
  },
  progressLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600', minWidth: 40, textAlign: 'right' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 20 },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  questionText: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 28 },
  questionSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginTop: -SPACING.xs },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  answerOptionSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.lavender,
  },
  answerEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  answerTextBlock: { flex: 1 },
  answerText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  answerTextSelected: { color: COLORS.purple },
  answerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  answerSubSelected: { color: COLORS.purple },
  btnSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryBtn: { borderRadius: RADIUS.pill, overflow: 'hidden' },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderRadius: RADIUS.pill,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  secondaryBtn: {
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  secondaryBtnText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.sm },
  rainbowBar: {
    height: 4,
    backgroundColor: COLORS.purple,
    opacity: 0.3,
  },
});
