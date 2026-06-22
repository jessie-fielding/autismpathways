/**
 * Poop Smearing Quiz — 3-question scored quiz
 * Matches potty/quiz.tsx style: multi-step, emoji option cards, score accumulation.
 * 5 cause hypotheses: Sensory, GI, Communication, Boredom, Nighttime.
 */
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent } from '../../../lib/analytics';

export const SMEAR_RESULT_KEY = 'ap_smear_quiz_result';

type CauseKey = 'sensory' | 'gi' | 'communication' | 'boredom' | 'nighttime';

interface QuizOption {
  emoji: string;
  text: string;
  sub: string;
  score: Partial<Record<CauseKey, number>>;
}

interface Question {
  id: string;
  text: string;
  sub: string;
  multi?: boolean;
  options: QuizOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'When does the smearing usually happen?',
    sub: 'Choose the option that fits most often.',
    options: [
      { emoji: '🌙', text: 'During sleep or early morning', sub: 'Before anyone is awake', score: { nighttime: 4, sensory: 1 } },
      { emoji: '🛁', text: 'During or right after bath / diaper change', sub: 'Access during hygiene routines', score: { sensory: 2, communication: 1 } },
      { emoji: '😴', text: 'During quiet / unstructured time', sub: 'Bored, alone, not engaged', score: { boredom: 3, sensory: 1 } },
      { emoji: '🏠', text: 'Throughout the day — no clear pattern', sub: 'Happens at various times', score: { sensory: 2, gi: 1 } },
      { emoji: '🚽', text: 'After a bowel movement', sub: 'On toilet or in diaper', score: { gi: 3, sensory: 1 } },
      { emoji: '😣', text: 'When they seem distressed or upset', sub: 'Emotional or behavioral escalation', score: { communication: 4, gi: 1 } },
    ],
  },
  {
    id: 'q2',
    text: 'How would you describe what\'s happening?',
    sub: 'Choose the option that best describes the behavior.',
    options: [
      { emoji: '🖐️', text: 'Touching and rubbing on surfaces', sub: 'Walls, floor, furniture', score: { sensory: 3 } },
      { emoji: '👄', text: 'Putting it in their mouth', sub: 'Coprophagia', score: { sensory: 2, gi: 1 } },
      { emoji: '🙂', text: 'Seems calm or content while doing it', sub: 'Not distressed', score: { sensory: 2, boredom: 2 } },
      { emoji: '😰', text: 'Seems distressed or uncomfortable', sub: 'Appears to be in discomfort', score: { gi: 3, communication: 2 } },
      { emoji: '🔁', text: 'Does it repeatedly in the same spot', sub: 'Ritualistic or patterned', score: { sensory: 2, boredom: 1 } },
      { emoji: '🎨', text: 'Seems to be exploring or playing', sub: 'Curious, investigative', score: { sensory: 3, boredom: 1 } },
    ],
  },
  {
    id: 'q3',
    text: 'Does your child also…',
    sub: 'Select all that apply.',
    multi: true,
    options: [
      { emoji: '💩', text: 'Often seem constipated or have hard stools', sub: '', score: { gi: 4 } },
      { emoji: '🤢', text: 'Have loose or runny stools frequently', sub: '', score: { gi: 3 } },
      { emoji: '😬', text: 'Seem uncomfortable around bowel movements', sub: '', score: { gi: 3 } },
      { emoji: '🙅', text: 'Refuse to sit on the toilet / avoid bathroom', sub: '', score: { gi: 1, sensory: 1 } },
      { emoji: '💤', text: 'Have significant sleep disruption', sub: '', score: { nighttime: 2 } },
      { emoji: '🤔', text: 'Have very limited communication', sub: 'Nonverbal or few words', score: { communication: 3 } },
      { emoji: '🌀', text: 'Engage in a lot of other sensory-seeking behaviors', sub: 'Mouthing, rubbing, etc.', score: { sensory: 3 } },
      { emoji: '❌', text: 'None of these', sub: '', score: {} },
    ],
  },
];

export default function PoopSmearingQuiz() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});

  const q = QUESTIONS[currentQ];
  const isMulti = q.multi === true;
  const selectedIdx = answers[q.id];
  const hasAnswer = isMulti
    ? Array.isArray(selectedIdx) && selectedIdx.length > 0
    : selectedIdx !== undefined;
  const progress = (currentQ + 1) / QUESTIONS.length;

  const selectAnswer = (idx: number) => {
    if (isMulti) {
      const prev = (answers[q.id] as number[] | undefined) ?? [];
      const noneIdx = q.options.findIndex((o) => o.text === 'None of these');
      if (idx === noneIdx) {
        setAnswers((a) => ({ ...a, [q.id]: [idx] }));
      } else {
        const filtered = prev.filter((i) => i !== noneIdx);
        const next = filtered.includes(idx)
          ? filtered.filter((i) => i !== idx)
          : [...filtered, idx];
        setAnswers((a) => ({ ...a, [q.id]: next }));
      }
    } else {
      setAnswers((a) => ({ ...a, [q.id]: idx }));
    }
  };

  const isSelected = (idx: number) => {
    if (isMulti) {
      return Array.isArray(selectedIdx) && selectedIdx.includes(idx);
    }
    return selectedIdx === idx;
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
    const scores: Record<CauseKey, number> = { sensory: 0, gi: 0, communication: 0, boredom: 0, nighttime: 0 };
    QUESTIONS.forEach((question) => {
      const ans = answers[question.id];
      if (question.multi && Array.isArray(ans)) {
        ans.forEach((idx) => {
          const opt = question.options[idx];
          if (opt) {
            Object.entries(opt.score).forEach(([k, v]) => {
              scores[k as CauseKey] += v as number;
            });
          }
        });
      } else if (!question.multi && typeof ans === 'number') {
        const opt = question.options[ans];
        if (opt) {
          Object.entries(opt.score).forEach(([k, v]) => {
            scores[k as CauseKey] += v as number;
          });
        }
      }
    });

    const topCause = (Object.keys(scores) as CauseKey[]).reduce((a, b) =>
      scores[a] >= scores[b] ? a : b
    );

    await AsyncStorage.setItem(SMEAR_RESULT_KEY, JSON.stringify({ scores, topCause }));
    logEvent('tool_completed', { tool: 'Poop Smearing Quiz', top_cause: topCause });
    router.push('/profound-autism/poop-smearing/results');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Poop Smearing Quiz</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        Question {currentQ + 1} of {QUESTIONS.length}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionText}>{q.text}</Text>
        <Text style={styles.questionSub}>{q.sub}</Text>
        {isMulti && <Text style={styles.multiNote}>Select all that apply</Text>}

        <View style={styles.optionsGrid}>
          {q.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionCard, isSelected(idx) && styles.optionCardSelected]}
              onPress={() => selectAnswer(idx)}
              activeOpacity={0.75}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <Text style={[styles.optionText, isSelected(idx) && styles.optionTextSelected]}>
                {opt.text}
              </Text>
              {opt.sub ? (
                <Text style={styles.optionSub}>{opt.sub}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, !hasAnswer && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!hasAnswer}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentQ < QUESTIONS.length - 1 ? 'Next →' : 'See Results →'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressTrack: { height: 4, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#8B5E3C', borderRadius: 2 },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  questionText: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs, lineHeight: 28 },
  questionSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.md, lineHeight: 20 },
  multiNote: {
    fontSize: FONT_SIZES.xs,
    color: '#8B5E3C',
    fontWeight: '700',
    marginBottom: SPACING.md,
    backgroundColor: '#FDF3E7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  optionsGrid: { gap: SPACING.sm, marginBottom: SPACING.xl },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  optionCardSelected: { borderColor: '#8B5E3C', backgroundColor: '#FDF3E7' },
  optionEmoji: { fontSize: 24, marginBottom: SPACING.xs },
  optionText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  optionTextSelected: { color: '#8B5E3C' },
  optionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  nextBtn: {
    backgroundColor: '#8B5E3C',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  nextBtnDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },
  nextBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },
});
