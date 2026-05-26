/**
 * Is ABA Right for My Child? Quiz
 *
 * A neutral, judgment-free quiz to help parents decide whether to explore ABA.
 * If the parent opts out, ABA content is hidden from the app via ABA_OPT_OUT_KEY.
 * The opt-out can be reversed from the Utilization Hub.
 */
import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { ABA_OPT_OUT_KEY } from './utilization-hub';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; weight: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'How does your child currently learn best?',
    options: [
      { label: 'Through structured, repeated practice with clear feedback', value: 'structured', weight: 2 },
      { label: 'Through play, exploration, and following their interests', value: 'play', weight: 0 },
      { label: 'A mix of both — it depends on the skill', value: 'mixed', weight: 1 },
      { label: 'I\'m not sure yet', value: 'unsure', weight: 1 },
    ],
  },
  {
    id: 'q2',
    text: 'What are your primary goals for therapy right now?',
    options: [
      { label: 'Building communication and language skills', value: 'communication', weight: 2 },
      { label: 'Reducing challenging behaviors that affect safety', value: 'behavior', weight: 2 },
      { label: 'Building daily living and self-care skills', value: 'daily', weight: 1 },
      { label: 'Social connection and emotional wellbeing', value: 'social', weight: 0 },
    ],
  },
  {
    id: 'q3',
    text: 'How do you feel about intensive, structured therapy (20–40 hours/week)?',
    options: [
      { label: 'Open to it if it helps my child', value: 'open', weight: 2 },
      { label: 'Interested, but concerned about intensity', value: 'cautious', weight: 1 },
      { label: 'I prefer a less intensive approach', value: 'prefer_less', weight: 0 },
      { label: 'I haven\'t thought about hours yet', value: 'unsure', weight: 1 },
    ],
  },
  {
    id: 'q4',
    text: 'How important is it to you that therapy is covered by your child\'s Medicaid waiver?',
    options: [
      { label: 'Very important — cost is a major factor', value: 'very', weight: 2 },
      { label: 'Somewhat important', value: 'somewhat', weight: 1 },
      { label: 'Not a deciding factor — I\'ll explore all options', value: 'not', weight: 0 },
    ],
  },
  {
    id: 'q5',
    text: 'Have you read perspectives from autistic adults about ABA?',
    options: [
      { label: 'Yes — and I feel informed and ready to decide', value: 'informed', weight: 2 },
      { label: 'Yes — and I have concerns I want to explore further', value: 'concerned', weight: 0 },
      { label: 'Not yet — I\'d like to learn more first', value: 'not_yet', weight: 1 },
      { label: 'I prefer not to explore ABA at all', value: 'opt_out', weight: -99 },
    ],
  },
  {
    id: 'q6',
    text: 'What matters most to you in a therapy approach?',
    options: [
      { label: 'Measurable data and evidence-based outcomes', value: 'data', weight: 2 },
      { label: 'Child-led, play-based, and joyful sessions', value: 'play', weight: 0 },
      { label: 'A balance of structure and child autonomy', value: 'balance', weight: 1 },
      { label: 'Respecting my child\'s neurodiversity and identity', value: 'identity', weight: 0 },
    ],
  },
];

type Result = 'explore' | 'maybe' | 'alternatives' | 'opt_out';

function getResult(answers: Record<string, number>): Result {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  if (Object.values(answers).includes(-99)) return 'opt_out';
  if (total >= 9) return 'explore';
  if (total >= 5) return 'maybe';
  return 'alternatives';
}

const RESULTS: Record<Result, { emoji: string; title: string; body: string; color: string; bg: string }> = {
  explore: {
    emoji: '✅',
    title: 'ABA May Be Worth Exploring',
    color: COLORS.successText,
    bg: COLORS.successBg,
    body: 'Based on your answers, ABA therapy aligns with several of your goals and preferences. We recommend researching providers carefully, asking about naturalistic approaches (like ESDM or PRT), and reviewing data regularly. Always trust your instincts as a parent.',
  },
  maybe: {
    emoji: '🤔',
    title: 'ABA Might Be One Option Among Several',
    color: COLORS.infoText,
    bg: COLORS.infoBg,
    body: 'Your answers suggest ABA could be helpful for some goals, but other approaches may be equally or more effective for your child. Consider exploring speech therapy, OT, and naturalistic developmental behavioral interventions (NDBIs) alongside ABA.',
  },
  alternatives: {
    emoji: '🌿',
    title: 'Other Approaches May Be a Better Fit',
    color: COLORS.warningText,
    bg: COLORS.warningBg,
    body: 'Based on your priorities, approaches like play-based therapy, DIR/Floortime, ESDM, or speech and OT may align better with your values and your child\'s learning style. ABA is not the only path — there are many effective, child-affirming options.',
  },
  opt_out: {
    emoji: '💙',
    title: 'We Respect Your Decision',
    color: COLORS.purple,
    bg: COLORS.lavender,
    body: 'You\'ve chosen not to explore ABA, and that is completely valid. ABA content will be hidden from your app. You can always restore it from the Waiver Utilization Hub if you change your mind. There are many wonderful therapy approaches — we\'re here to help you find what works for your family.',
  },
};

export default function ABAQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);

  const handleAnswer = async (q: Question, weight: number, value: string) => {
    const next = { ...answers, [q.id]: weight };

    if (value === 'opt_out') {
      // Immediate opt-out
      await AsyncStorage.setItem(ABA_OPT_OUT_KEY, 'true');
      setAnswers(next);
      setResult('opt_out');
      return;
    }

    if (currentQ < QUESTIONS.length - 1) {
      setAnswers(next);
      setCurrentQ(currentQ + 1);
    } else {
      setAnswers(next);
      setResult(getResult(next));
    }
  };

  const handleOptOut = async () => {
    await AsyncStorage.setItem(ABA_OPT_OUT_KEY, 'true');
    router.back();
  };

  const handleKeepABA = () => {
    router.back();
  };

  if (result) {
    const res = RESULTS[result];
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ABA Quiz</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.resultCard, { backgroundColor: res.bg, borderColor: res.color + '44' }]}>
            <Text style={styles.resultEmoji}>{res.emoji}</Text>
            <Text style={[styles.resultTitle, { color: res.color }]}>{res.title}</Text>
            <Text style={styles.resultBody}>{res.body}</Text>
          </View>

          <View style={styles.neutralNote}>
            <Text style={styles.neutralNoteTitle}>🤝 Our commitment to you</Text>
            <Text style={styles.neutralNoteBody}>
              Autism Pathways does not advocate for or against ABA. This quiz is a starting point for reflection, not a medical recommendation. Please consult with your child's care team before making any therapy decisions.
            </Text>
          </View>

          {result === 'opt_out' ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>← Return to Waiver Hub</Text>
            </TouchableOpacity>
          ) : (
            <>
              {result !== 'explore' && (
                <TouchableOpacity style={styles.optOutBtn} onPress={handleOptOut}>
                  <Text style={styles.optOutBtnText}>Hide ABA content from my app</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleKeepABA}>
                <Text style={styles.primaryBtnText}>← Return to Waiver Hub</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  const q = QUESTIONS[currentQ];
  const progress = (currentQ / QUESTIONS.length) * 100;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Is ABA Right for My Child?</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.qCounter}>Question {currentQ + 1} of {QUESTIONS.length}</Text>
        <Text style={styles.qText}>{q.text}</Text>

        {q.options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={styles.optionCard}
            onPress={() => handleAnswer(q, opt.weight, opt.value)}
            activeOpacity={0.75}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.neutralNote}>
          <Text style={styles.neutralNoteBody}>
            There are no right or wrong answers. This quiz is a reflection tool, not a diagnosis or recommendation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  progressBar: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: 4, backgroundColor: COLORS.purple },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  qCounter: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600', marginBottom: SPACING.sm, letterSpacing: 0.5 },
  qText: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xl, lineHeight: 28 },
  optionCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.sm, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  optionText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  optionArrow: { fontSize: 20, color: COLORS.textLight, marginLeft: SPACING.sm },
  resultCard: {
    borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg,
    alignItems: 'center', borderWidth: 1,
  },
  resultEmoji: { fontSize: 48, marginBottom: SPACING.md },
  resultTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.md },
  resultBody: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22, textAlign: 'center' },
  neutralNote: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.warningBorder, marginBottom: SPACING.lg,
  },
  neutralNoteTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: SPACING.xs },
  neutralNoteBody: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 19 },
  primaryBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.sm,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  optOutBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, paddingVertical: 12,
    alignItems: 'center', marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border,
  },
  optOutBtnText: { color: COLORS.textLight, fontWeight: '600', fontSize: FONT_SIZES.sm },
});
