import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../../lib/theme';

const TOTAL_STEPS = 6;
const CURRENT_STEP = 3;

type Answer = 'a' | 'b' | null;

const QUESTIONS = [
  {
    id: 'schedule',
    question: 'How flexible is your schedule for appointments?',
    optionA: { emoji: '📅', label: 'Pretty flexible', sub: 'We can travel and take time off' },
    optionB: { emoji: '⏰', label: 'Very limited', sub: 'We need something fast and convenient' },
    telehealthScore: { a: 0, b: 2 },
  },
  {
    id: 'age',
    question: 'How old is your child?',
    optionA: { emoji: '🧒', label: 'Under 5 years old', sub: 'Younger children often do better in person' },
    optionB: { emoji: '👦', label: '5 years or older', sub: 'Older kids adapt well to video evaluations' },
    telehealthScore: { a: 0, b: 2 },
  },
  {
    id: 'complexity',
    question: 'Does your child have multiple diagnoses or complex needs?',
    optionA: { emoji: '🧩', label: 'Yes, multiple concerns', sub: 'We need a thorough, comprehensive evaluation' },
    optionB: { emoji: '✅', label: 'Primarily autism concerns', sub: 'Focused evaluation is fine' },
    telehealthScore: { a: 0, b: 2 },
  },
  {
    id: 'insurance',
    question: 'What matters most to you right now?',
    optionA: { emoji: '🏆', label: 'Most comprehensive evaluation', sub: 'I want the most thorough assessment possible' },
    optionB: { emoji: '⚡', label: 'Fastest path forward', sub: 'I want to get started as quickly as possible' },
    telehealthScore: { a: 0, b: 2 },
  },
  {
    id: 'location',
    question: 'How far are you from a major city or children\'s hospital?',
    optionA: { emoji: '🏙️', label: 'Within 30-60 minutes', sub: 'In-person is accessible for us' },
    optionB: { emoji: '🌾', label: 'More than an hour away', sub: 'Travel is a real barrier for us' },
    telehealthScore: { a: 0, b: 2 },
  },
];

export default function HelpMeDecideScreen() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(Array(QUESTIONS.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [recommendation, setRecommendation] = useState<'telehealth' | 'in-person' | null>(null);

  const question = QUESTIONS[currentQ];
  const progress = (currentQ / QUESTIONS.length) * 100;

  const handleAnswer = (answer: Answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answer;
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      // Calculate recommendation
      let telehealthScore = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans === 'b') telehealthScore += QUESTIONS[idx].telehealthScore.b;
      });
      const rec = telehealthScore >= 6 ? 'telehealth' : 'in-person';
      setRecommendation(rec);
      setShowResult(true);
    }
  };

  const handleAccept = async () => {
    await AsyncStorage.setItem('eval_type_filter', recommendation!);
    router.push('/diagnosis/evaluator-list');
  };

  const handleOverride = async (choice: 'telehealth' | 'in-person') => {
    await AsyncStorage.setItem('eval_type_filter', choice);
    router.push('/diagnosis/evaluator-list');
  };

  if (showResult && recommendation) {
    const isTelehealth = recommendation === 'telehealth';
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowResult(false)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Autism Pathways</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.resultCard, { borderColor: isTelehealth ? COLORS.blueAccent : COLORS.mintAccent }]}>
            <View style={[styles.resultBanner, { backgroundColor: isTelehealth ? COLORS.blue : COLORS.mint }]}>
              <Text style={styles.resultBannerLabel}>OUR RECOMMENDATION</Text>
              <Text style={styles.resultEmoji}>{isTelehealth ? '💻' : '🏥'}</Text>
              <Text style={styles.resultTitle}>
                {isTelehealth ? 'Telehealth evaluation' : 'In-person evaluation'}
              </Text>
            </View>

            <View style={styles.resultBody}>
              <Text style={styles.resultBodyText}>
                {isTelehealth
                  ? 'Based on your answers, a telehealth evaluation looks like a great fit. It\'s faster to schedule, flexible for busy families, and just as valid for an autism diagnosis.'
                  : 'Based on your answers, an in-person evaluation is likely the better fit for your child. It allows for more hands-on observation and is ideal for complex or younger children.'}
              </Text>

              <View style={styles.reasonsList}>
                <Text style={styles.reasonsTitle}>Why we suggest this:</Text>
                {isTelehealth ? (
                  <>
                    <Text style={styles.reasonItem}>✓ Faster scheduling — often within weeks</Text>
                    <Text style={styles.reasonItem}>✓ No travel required</Text>
                    <Text style={styles.reasonItem}>✓ Fully valid for autism diagnosis</Text>
                    <Text style={styles.reasonItem}>✓ Works well for school-age children</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.reasonItem}>✓ Most comprehensive evaluation type</Text>
                    <Text style={styles.reasonItem}>✓ Better for younger or complex children</Text>
                    <Text style={styles.reasonItem}>✓ Multidisciplinary teams available</Text>
                    <Text style={styles.reasonItem}>✓ Widely accepted by schools and Medicaid</Text>
                  </>
                )}
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleAccept}>
                <Text style={styles.primaryBtnText}>
                  Show me {isTelehealth ? 'telehealth' : 'in-person'} evaluators →
                </Text>
              </TouchableOpacity>

              <Text style={styles.orText}>— or change your mind —</Text>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => handleOverride(isTelehealth ? 'in-person' : 'telehealth')}
              >
                <Text style={styles.secondaryBtnText}>
                  Show me {isTelehealth ? 'in-person' : 'telehealth'} evaluators instead
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.textBtn} onPress={() => router.push('/diagnosis/evaluator-list')}>
                <Text style={styles.textBtnText}>Show me all evaluators</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Me Decide</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.dashBtn}>
          <Text style={styles.dashText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Mini progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarRow}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i <= currentQ ? styles.progressSegmentActive : styles.progressSegmentInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>Question {currentQ + 1} of {QUESTIONS.length}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>HELP ME DECIDE</Text>
          </View>
          <Text style={styles.title}>{question.question}</Text>

          <View style={styles.answersContainer}>
            {/* Option A */}
            <TouchableOpacity
              style={[styles.answerCard, answers[currentQ] === 'a' && styles.answerCardSelected]}
              onPress={() => handleAnswer('a')}
              activeOpacity={0.7}
            >
              <Text style={styles.answerEmoji}>{question.optionA.emoji}</Text>
              <View style={styles.answerText}>
                <Text style={[styles.answerLabel, answers[currentQ] === 'a' && styles.answerLabelSelected]}>
                  {question.optionA.label}
                </Text>
                <Text style={styles.answerSub}>{question.optionA.sub}</Text>
              </View>
            </TouchableOpacity>

            {/* Option B */}
            <TouchableOpacity
              style={[styles.answerCard, answers[currentQ] === 'b' && styles.answerCardSelected]}
              onPress={() => handleAnswer('b')}
              activeOpacity={0.7}
            >
              <Text style={styles.answerEmoji}>{question.optionB.emoji}</Text>
              <View style={styles.answerText}>
                <Text style={[styles.answerLabel, answers[currentQ] === 'b' && styles.answerLabelSelected]}>
                  {question.optionB.label}
                </Text>
                <Text style={styles.answerSub}>{question.optionB.sub}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.tapHint}>Tap an answer to continue</Text>
        </View>
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
  progressSegmentActive: { backgroundColor: '#4ECBA8' },
  progressSegmentInactive: { backgroundColor: COLORS.border },
  progressLabel: { fontSize: FONT_SIZES.xs, color: '#4ECBA8', fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  stepBadge: {
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#0A7A5A', letterSpacing: 1 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xl },
  answersContainer: { gap: SPACING.md, marginBottom: SPACING.lg },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  answerCardSelected: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.purple,
  },
  answerEmoji: { fontSize: 26, marginTop: 2 },
  answerText: { flex: 1 },
  answerLabel: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  answerLabelSelected: { color: COLORS.purple },
  answerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  tapHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.sm },
  // Result styles
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  resultBanner: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  resultBannerLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMid,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  resultEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  resultTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  resultBody: { padding: SPACING.xl },
  resultBodyText: { fontSize: FONT_SIZES.base, color: COLORS.textMid, lineHeight: 22, marginBottom: SPACING.lg },
  reasonsList: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  reasonsTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  reasonItem: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  primaryBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.base },
  orText: { textAlign: 'center', color: COLORS.textLight, fontSize: FONT_SIZES.sm, marginBottom: SPACING.md },
  secondaryBtn: {
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  secondaryBtnText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.sm },
  textBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  textBtnText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
});
