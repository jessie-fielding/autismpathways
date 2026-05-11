import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

// ─── Quiz Data ────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  text: string;
  subtext?: string;
  options: { label: string; value: string }[];
  category: string;
}

const QUESTIONS: Question[] = [
  // Attention / ADHD
  {
    id: 'attention_1',
    category: 'ATTENTION',
    text: 'Does your child have significant difficulty staying focused on tasks, even ones they enjoy?',
    subtext: 'Think about homework, play, or following multi-step instructions.',
    options: [
      { label: 'Yes, it\'s a major challenge', value: 'yes_major' },
      { label: 'Sometimes, but manageable', value: 'sometimes' },
      { label: 'Not really', value: 'no' },
    ],
  },
  {
    id: 'attention_2',
    category: 'ATTENTION',
    text: 'Does your child act impulsively — blurting out, running, grabbing — without thinking first?',
    options: [
      { label: 'Yes, frequently', value: 'yes_major' },
      { label: 'Occasionally', value: 'sometimes' },
      { label: 'Rarely or never', value: 'no' },
    ],
  },
  {
    id: 'attention_3',
    category: 'ATTENTION',
    text: 'Does your child have trouble sitting still or seem to be "driven by a motor"?',
    options: [
      { label: 'Yes, constantly moving', value: 'yes_major' },
      { label: 'More than most kids', value: 'sometimes' },
      { label: 'Not particularly', value: 'no' },
    ],
  },
  // Anxiety
  {
    id: 'anxiety_1',
    category: 'ANXIETY',
    text: 'Does your child experience intense worry, fear, or panic that interferes with daily life?',
    subtext: 'This could include school refusal, separation anxiety, or fear of specific situations.',
    options: [
      { label: 'Yes, it significantly impacts daily life', value: 'yes_major' },
      { label: 'Some anxiety, but manageable', value: 'sometimes' },
      { label: 'Not noticeably', value: 'no' },
    ],
  },
  {
    id: 'anxiety_2',
    category: 'ANXIETY',
    text: 'Does your child have meltdowns or shutdowns when routines change unexpectedly?',
    options: [
      { label: 'Yes, major distress with any change', value: 'yes_major' },
      { label: 'Some difficulty with transitions', value: 'sometimes' },
      { label: 'Handles changes fairly well', value: 'no' },
    ],
  },
  // Sensory Processing
  {
    id: 'sensory_1',
    category: 'SENSORY',
    text: 'Does your child have strong reactions to sensory input — sounds, textures, lights, smells, or touch?',
    subtext: 'E.g., covers ears, refuses certain fabrics, overwhelmed in busy places.',
    options: [
      { label: 'Yes, major sensory sensitivities', value: 'yes_major' },
      { label: 'Some sensitivities', value: 'sometimes' },
      { label: 'Not particularly', value: 'no' },
    ],
  },
  {
    id: 'sensory_2',
    category: 'SENSORY',
    text: 'Does your child seek out intense sensory input — spinning, crashing, chewing, or touching everything?',
    options: [
      { label: 'Yes, constantly seeking input', value: 'yes_major' },
      { label: 'Sometimes', value: 'sometimes' },
      { label: 'Not really', value: 'no' },
    ],
  },
  // Sleep
  {
    id: 'sleep_1',
    category: 'SLEEP',
    text: 'Does your child have significant sleep difficulties — trouble falling asleep, staying asleep, or waking very early?',
    options: [
      { label: 'Yes, sleep is a major problem', value: 'yes_major' },
      { label: 'Occasional sleep issues', value: 'sometimes' },
      { label: 'Sleeps fairly well', value: 'no' },
    ],
  },
  {
    id: 'sleep_2',
    category: 'SLEEP',
    text: 'Does poor sleep significantly affect your child\'s behavior and functioning the next day?',
    options: [
      { label: 'Yes, dramatically', value: 'yes_major' },
      { label: 'Somewhat', value: 'sometimes' },
      { label: 'Not really', value: 'no' },
    ],
  },
  // GI / Medical
  {
    id: 'gi_1',
    category: 'GI / MEDICAL',
    text: 'Does your child have ongoing gastrointestinal issues — constipation, diarrhea, stomach pain, or food refusal?',
    options: [
      { label: 'Yes, chronic GI issues', value: 'yes_major' },
      { label: 'Occasional issues', value: 'sometimes' },
      { label: 'No significant GI problems', value: 'no' },
    ],
  },
  {
    id: 'gi_2',
    category: 'GI / MEDICAL',
    text: 'Does your child have a very restricted diet — limited to only a few foods due to texture, taste, or smell?',
    options: [
      { label: 'Yes, extremely limited diet', value: 'yes_major' },
      { label: 'Picky but eats a reasonable variety', value: 'sometimes' },
      { label: 'Eats a fairly typical range of foods', value: 'no' },
    ],
  },
  // Speech / Language
  {
    id: 'speech_1',
    category: 'SPEECH / LANGUAGE',
    text: 'Does your child have significant delays or differences in speech and language?',
    subtext: 'This includes being nonverbal, limited vocabulary, or difficulty being understood.',
    options: [
      { label: 'Yes, significant speech/language differences', value: 'yes_major' },
      { label: 'Some delays, receiving services', value: 'sometimes' },
      { label: 'Speech is at or near age level', value: 'no' },
    ],
  },
  {
    id: 'speech_2',
    category: 'SPEECH / LANGUAGE',
    text: 'Does your child have difficulty with pragmatic language — understanding social cues, taking turns in conversation, or interpreting tone?',
    options: [
      { label: 'Yes, significant social communication challenges', value: 'yes_major' },
      { label: 'Some difficulty', value: 'sometimes' },
      { label: 'Manages social communication fairly well', value: 'no' },
    ],
  },
  // Intellectual / Adaptive
  {
    id: 'adaptive_1',
    category: 'ADAPTIVE FUNCTIONING',
    text: 'Does your child need significantly more support than same-age peers for daily living skills — dressing, hygiene, eating, safety?',
    options: [
      { label: 'Yes, needs substantial support', value: 'yes_major' },
      { label: 'Needs some support', value: 'sometimes' },
      { label: 'Fairly independent for age', value: 'no' },
    ],
  },
  {
    id: 'adaptive_2',
    category: 'ADAPTIVE FUNCTIONING',
    text: 'Has your child been evaluated for intellectual disability or received scores significantly below average on cognitive testing?',
    options: [
      { label: 'Yes, diagnosed or scores indicate ID', value: 'yes_major' },
      { label: 'Borderline or unclear', value: 'sometimes' },
      { label: 'No, cognitive scores are typical', value: 'no' },
    ],
  },
];

// ─── Condition Results ─────────────────────────────────────────────────────────

interface ConditionResult {
  id: string;
  name: string;
  icon: string;
  ltdRelevant: boolean;
  description: string;
  ltdNote: string;
  icdHint: string;
  nextSteps: string[];
  accentColor: string;
}

const CONDITIONS: Record<string, ConditionResult> = {
  ATTENTION: {
    id: 'ATTENTION',
    name: 'ADHD / Attention Difficulties',
    icon: '⚡',
    ltdRelevant: true,
    description: 'Your child shows signs consistent with ADHD or significant attention difficulties.',
    ltdNote: 'ADHD is a recognized co-occurring condition that can strengthen LTD applications when documented alongside autism.',
    icdHint: 'Relevant ICD-10 codes include F90.0 (Inattentive), F90.1 (Hyperactive-Impulsive), F90.2 (Combined)',
    nextSteps: [
      'Ask your pediatrician for an ADHD evaluation or referral to a developmental pediatrician',
      'Request that attention difficulties be noted in your child\'s IEP',
      'Bring ADHD rating scale results to your next Medicaid PMIP appointment',
    ],
    accentColor: COLORS.blueAccent,
  },
  ANXIETY: {
    id: 'ANXIETY',
    name: 'Anxiety / Emotional Regulation',
    icon: '😰',
    ltdRelevant: true,
    description: 'Your child shows signs of significant anxiety or emotional regulation challenges.',
    ltdNote: 'Anxiety disorders co-occurring with autism can support LTD applications by documenting the full scope of functional impairment.',
    icdHint: 'Relevant ICD-10 codes include F41.1 (Generalized Anxiety), F93.0 (Separation Anxiety), F94.0 (Selective Mutism)',
    nextSteps: [
      'Discuss anxiety symptoms with your child\'s pediatrician or psychiatrist',
      'Ask about a referral to a therapist specializing in autism + anxiety',
      'Document meltdown frequency and triggers in the Observations tool',
    ],
    accentColor: COLORS.peachAccent,
  },
  SENSORY: {
    id: 'SENSORY',
    name: 'Sensory Processing Differences',
    icon: '🌀',
    ltdRelevant: true,
    description: 'Your child shows significant sensory processing differences.',
    ltdNote: 'Sensory processing disorder is often documented in OT evaluations and supports waiver and LTD applications.',
    icdHint: 'Relevant ICD-10 codes include F84.0 (Autism with sensory features), R44.8 (Other sensory disturbances)',
    nextSteps: [
      'Request an occupational therapy (OT) evaluation focused on sensory processing',
      'Ask for a Sensory Profile assessment',
      'Ensure sensory needs are documented in the IEP',
    ],
    accentColor: COLORS.mintAccent,
  },
  SLEEP: {
    id: 'SLEEP',
    name: 'Sleep Difficulties',
    icon: '😴',
    ltdRelevant: true,
    description: 'Your child has significant sleep difficulties that impact daily functioning.',
    ltdNote: 'Chronic sleep disorders in children with autism are well-documented and relevant to LTD applications, particularly when they affect caregiver functioning.',
    icdHint: 'Relevant ICD-10 codes include G47.00 (Insomnia), G47.9 (Sleep disorder), F51.9 (Sleep disorder, unspecified)',
    nextSteps: [
      'Discuss sleep issues with your pediatrician — melatonin and sleep hygiene strategies may help',
      'Ask about a sleep study referral if needed',
      'Document sleep patterns to bring to medical appointments',
    ],
    accentColor: COLORS.yellowAccent,
  },
  'GI / MEDICAL': {
    id: 'GI / MEDICAL',
    name: 'GI / Medical Issues',
    icon: '🫃',
    ltdRelevant: true,
    description: 'Your child has GI or medical issues that may be connected to autism.',
    ltdNote: 'GI conditions are among the most common co-occurring medical issues in autism and can support LTD documentation.',
    icdHint: 'Relevant ICD-10 codes include K59.00 (Constipation), K52.9 (Gastroenteritis), F50.82 (Avoidant/Restrictive Food Intake)',
    nextSteps: [
      'Discuss GI symptoms with your pediatrician — a GI specialist referral may be appropriate',
      'Ask about ARFID (Avoidant/Restrictive Food Intake Disorder) if diet is very restricted',
      'Keep a food and symptom diary to bring to appointments',
    ],
    accentColor: COLORS.mintAccent,
  },
  'SPEECH / LANGUAGE': {
    id: 'SPEECH / LANGUAGE',
    name: 'Speech / Language Differences',
    icon: '🗣️',
    ltdRelevant: true,
    description: 'Your child has significant speech or language differences.',
    ltdNote: 'Speech and language delays are directly relevant to LTD applications and support the need for ongoing therapy services.',
    icdHint: 'Relevant ICD-10 codes include F80.1 (Expressive Language Disorder), F80.2 (Mixed Receptive-Expressive), F84.0 (Autism)',
    nextSteps: [
      'Ensure your child has a current speech-language evaluation',
      'Request speech therapy services through the IEP if not already in place',
      'Ask about AAC (Augmentative and Alternative Communication) if speech is limited',
    ],
    accentColor: COLORS.lavenderAccent,
  },
  'ADAPTIVE FUNCTIONING': {
    id: 'ADAPTIVE FUNCTIONING',
    name: 'Adaptive Functioning / Intellectual Disability',
    icon: '🧩',
    ltdRelevant: true,
    description: 'Your child may have intellectual disability or significant adaptive functioning challenges.',
    ltdNote: 'Intellectual disability co-occurring with autism is one of the strongest factors in LTD eligibility and waiver priority.',
    icdHint: 'Relevant ICD-10 codes include F70 (Mild ID), F71 (Moderate ID), F72 (Severe ID), F73 (Profound ID)',
    nextSteps: [
      'Request a comprehensive psychological evaluation including adaptive behavior scales (Vineland)',
      'Ask your school to assess for intellectual disability if not already done',
      'Bring cognitive and adaptive scores to all benefit applications',
    ],
    accentColor: COLORS.peachAccent,
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

type Screen = 'intro' | 'quiz' | 'results';

export default function DisabilityQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, value: string) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setScreen('results');
      saveResultsToProfile(updated);
    }
  };
  const saveResultsToProfile = async (finalAnswers: Record<string, string>) => {
    try {
      const categoryScores: Record<string, number> = {};
      QUESTIONS.forEach((q) => {
        const answer = finalAnswers[q.id];
        if (!categoryScores[q.category]) categoryScores[q.category] = 0;
        if (answer === 'yes_major') categoryScores[q.category] += 2;
        else if (answer === 'sometimes') categoryScores[q.category] += 1;
      });
      const flagNames = Object.entries(categoryScores)
        .filter(([, score]) => score >= 2)
        .sort(([, a], [, b]) => b - a)
        .map(([cat]) => CONDITIONS[cat]?.name)
        .filter(Boolean) as string[];
      await AsyncStorage.setItem('ap_dev_quiz_results', JSON.stringify({
        flagNames,
        completedAt: new Date().toISOString(),
      }));
    } catch (e) {
      // silently fail — non-critical
    }
  };

  const getFlags = (): ConditionResult[] => {
    const categoryScores: Record<string, number> = {};
    QUESTIONS.forEach((q) => {
      const answer = answers[q.id];
      if (!categoryScores[q.category]) categoryScores[q.category] = 0;
      if (answer === 'yes_major') categoryScores[q.category] += 2;
      else if (answer === 'sometimes') categoryScores[q.category] += 1;
    });
    return Object.entries(categoryScores)
      .filter(([, score]) => score >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => CONDITIONS[cat])
      .filter(Boolean);
  };

  const handleCopyAll = async (flags: ConditionResult[]) => {
    const text = flags
      .map((f) => `${f.name}\n${f.icdHint}\nNext steps:\n${f.nextSteps.map((s) => `• ${s}`).join('\n')}`)
      .join('\n\n---\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Results copied to clipboard. You can paste them into notes or an email to your doctor.');
  };

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  // ── Intro Screen ──
  if (screen === 'intro') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Developmental Quiz</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll}>
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>🧩</Text>
            <Text style={styles.heroTitle}>Understand Your Child's Full Profile</Text>
            <Text style={styles.heroBody}>
              Many children with autism have co-occurring conditions — ADHD, anxiety, sensory processing differences, sleep disorders, and more. Identifying these can unlock additional support and strengthen LTD applications.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 What this quiz does</Text>
            <Text style={styles.infoBody}>
              This is not a diagnostic tool. It helps you identify areas worth discussing with your child's doctors and specialists, and flags which conditions may be relevant for LTD (Long-Term Disability) applications.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⏱️ About 5 minutes</Text>
            <Text style={styles.infoBody}>
              {QUESTIONS.length} questions across 7 areas: attention, anxiety, sensory, sleep, GI/medical, speech, and adaptive functioning.
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => setScreen('quiz')}>
            <Text style={styles.startBtnText}>Start Quiz →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Quiz Screen ──
  if (screen === 'quiz') {
    const q = QUESTIONS[currentQ];
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity
            onPress={() => currentQ === 0 ? setScreen('intro') : setCurrentQ(currentQ - 1)}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentQ + 1} of {QUESTIONS.length}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{q.category}</Text>
          </View>

          <Text style={styles.questionText}>{q.text}</Text>
          {q.subtext && <Text style={styles.questionSubtext}>{q.subtext}</Text>}

          <View style={styles.optionsContainer}>
            {q.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionCard,
                  answers[q.id] === opt.value && styles.optionCardSelected,
                ]}
                onPress={() => handleAnswer(q.id, opt.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[q.id] === opt.value && styles.optionTextSelected,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Results Screen ──
  const flags = getFlags();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => { setScreen('intro'); setCurrentQ(0); setAnswers({}); }} style={styles.backBtn}>
          <Text style={styles.backText}>Retake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Results</Text>
        <TouchableOpacity onPress={() => handleCopyAll(flags)} style={styles.copyBtn}>
          <Text style={styles.copyBtnText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll}>
        {flags.length === 0 ? (
          <View style={styles.noFlagsCard}>
            <Text style={styles.noFlagsIcon}>✅</Text>
            <Text style={styles.noFlagsTitle}>No significant flags identified</Text>
            <Text style={styles.noFlagsBody}>
              Based on your answers, no strong indicators of co-occurring conditions were detected. This doesn't mean they don't exist — if you have concerns, always discuss them with your child's doctor.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsSummary}>
              <Text style={styles.resultsSummaryTitle}>
                {flags.length} area{flags.length !== 1 ? 's' : ''} flagged for follow-up
              </Text>
              <Text style={styles.resultsSummaryBody}>
                These are areas where your answers suggest it may be worth talking to a doctor or specialist. All flagged areas are also relevant for LTD applications.
              </Text>
            </View>

            {flags.map((flag) => (
              <View key={flag.id} style={[styles.resultCard, { borderTopColor: flag.accentColor }]}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardIcon}>{flag.icon}</Text>
                  <View style={styles.resultCardTitleRow}>
                    <Text style={styles.resultCardTitle}>{flag.name}</Text>
                    {flag.ltdRelevant && (
                      <View style={styles.ltdBadge}>
                        <Text style={styles.ltdBadgeText}>⚖️ LTD Relevant</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.resultCardDesc}>{flag.description}</Text>

                {flag.ltdRelevant && (
                  <View style={styles.ltdNote}>
                    <Text style={styles.ltdNoteTitle}>LTD Application Note</Text>
                    <Text style={styles.ltdNoteText}>{flag.ltdNote}</Text>
                  </View>
                )}

                <View style={styles.icdRow}>
                  <Text style={styles.icdText}>{flag.icdHint}</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await Clipboard.setStringAsync(flag.icdHint);
                      Alert.alert('Copied', 'ICD hint copied to clipboard.');
                    }}
                  >
                    <Text style={styles.icdCopy}>Copy</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.nextStepsTitle}>Suggested Next Steps</Text>
                {flag.nextSteps.map((step, i) => (
                  <View key={i} style={styles.nextStepRow}>
                    <Text style={styles.nextStepBullet}>→</Text>
                    <Text style={styles.nextStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerText}>
                ⚠️ This quiz is for informational purposes only and is not a medical diagnosis. Always consult qualified healthcare professionals for evaluation and diagnosis.
              </Text>
            </View>

            <TouchableOpacity style={styles.icdQuizBtn} onPress={() => router.push('/icd-quiz')}>
              <Text style={styles.icdQuizBtnText}>Next: Take the ICD Support Quiz →</Text>
            </TouchableOpacity>
          </>
        )}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs, minWidth: 60 },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  copyBtn: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  copyBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark },

  progressBarBg: { height: 4, backgroundColor: COLORS.border },
  progressBarFill: { height: '100%', backgroundColor: COLORS.purple },

  scrollContainer: { flex: 1 },
  scroll: { padding: SPACING.lg },

  heroCard: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  heroIcon: { fontSize: 44, marginBottom: SPACING.md },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.purpleDark,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  heroBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  infoTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  infoBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },

  startBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.lg,
  },
  startBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },

  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.lg,
  },
  categoryChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark },

  questionText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  questionSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },

  optionsContainer: { gap: SPACING.md, marginTop: SPACING.lg },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  optionCardSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.lavender,
  },
  optionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionTextSelected: { color: COLORS.purpleDark, fontWeight: '700' },

  noFlagsCard: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  noFlagsIcon: { fontSize: 44, marginBottom: SPACING.md },
  noFlagsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.successText,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  noFlagsBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
  },

  resultsSummary: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  resultsSummaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.purpleDark,
    marginBottom: SPACING.xs,
  },
  resultsSummaryBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },

  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 4,
    ...SHADOWS.sm,
  },
  resultCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  resultCardIcon: { fontSize: 28, marginRight: SPACING.md },
  resultCardTitleRow: { flex: 1 },
  resultCardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ltdBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  ltdBadgeText: { fontSize: 10, fontWeight: '700', color: '#8B6914' },
  resultCardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },

  ltdNote: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.yellowAccent,
  },
  ltdNoteTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#8B6914',
    marginBottom: SPACING.xs,
  },
  ltdNoteText: { fontSize: FONT_SIZES.xs, color: '#8B6914', lineHeight: 18 },

  icdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  icdText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.infoText, lineHeight: 17 },
  icdCopy: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    marginLeft: SPACING.sm,
  },

  nextStepsTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  nextStepRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  nextStepBullet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.purple,
    fontWeight: '700',
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  nextStepText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },

  disclaimerCard: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
  },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, lineHeight: 18 },

  icdQuizBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  icdQuizBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
});
