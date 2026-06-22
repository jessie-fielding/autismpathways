/**
 * Medication Guide — Interactive quiz for behavioral medications in profound autism.
 * 3-question quiz: target symptom → medication class → questions to ask your doctor.
 * NOT a prescribing guide — a "questions to ask" guide.
 */
import { useState, useEffect } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent, logScreenView } from '../../../lib/analytics';
import PathwayDisclaimer from '../../../components/PathwayDisclaimer';

type TargetSymptom = 'aggression_sib' | 'anxiety_ocd' | 'sleep' | 'attention' | 'mood' | 'gi';
type MedHistory = 'none' | 'tried_some' | 'tried_many';

interface MedClass {
  name: string;
  examples: string;
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited';
  questions: string[];
  warnings?: string;
}

const MED_CLASSES: Record<TargetSymptom, MedClass[]> = {
  aggression_sib: [
    {
      name: 'Atypical Antipsychotics (Risperidone, Aripiprazole)',
      examples: 'Risperdal, Abilify',
      evidenceLevel: 'Strong',
      questions: [
        'What is the starting dose and how will we titrate?',
        'What metabolic monitoring (weight, blood sugar, cholesterol) will we do?',
        'What is the target behavior we\'re measuring?',
        'How long before we expect to see a response?',
        'What are the risks of tardive dyskinesia with long-term use?',
      ],
      warnings: 'Weight gain and metabolic effects are common. Monitor closely.',
    },
    {
      name: 'Alpha-2 Agonists (Guanfacine, Clonidine)',
      examples: 'Intuniv, Kapvay',
      evidenceLevel: 'Moderate',
      questions: [
        'Is this being used for aggression, hyperactivity, or sleep?',
        'What blood pressure monitoring will we do?',
        'Is the extended-release formulation appropriate?',
        'Can this be combined with other medications safely?',
      ],
    },
    {
      name: 'Mood Stabilizers (Valproate, Lithium)',
      examples: 'Depakote, Lithium',
      evidenceLevel: 'Moderate',
      questions: [
        'What blood level monitoring will we need?',
        'What are the liver/kidney monitoring requirements?',
        'Is there evidence for this medication in autism specifically?',
        'What is the plan if it doesn\'t work?',
      ],
    },
  ],
  anxiety_ocd: [
    {
      name: 'SSRIs (Fluoxetine, Sertraline, Fluvoxamine)',
      examples: 'Prozac, Zoloft, Luvox',
      evidenceLevel: 'Moderate',
      questions: [
        'What specific anxiety or OCD symptoms are we targeting?',
        'What is the starting dose — is it lower than typical for autism?',
        'What is the risk of behavioral activation (increased agitation) in autism?',
        'How long before we expect to see a response?',
        'What do we do if there is a behavioral activation reaction?',
      ],
      warnings: 'Behavioral activation (increased agitation, aggression) is more common in autism. Start low, go slow.',
    },
    {
      name: 'Buspirone',
      examples: 'Buspar',
      evidenceLevel: 'Limited',
      questions: [
        'Is this being used as monotherapy or augmentation?',
        'What is the evidence for buspirone in autism specifically?',
        'What is the titration schedule?',
      ],
    },
  ],
  sleep: [
    {
      name: 'Melatonin',
      examples: 'Over-the-counter, prescription Circadin',
      evidenceLevel: 'Strong',
      questions: [
        'What dose and formulation — immediate release vs. extended release?',
        'What time should it be given relative to bedtime?',
        'Is the sleep issue sleep onset, maintenance, or both?',
        'Are there any interactions with other medications?',
      ],
    },
    {
      name: 'Clonidine / Guanfacine',
      examples: 'Kapvay, Intuniv',
      evidenceLevel: 'Moderate',
      questions: [
        'What blood pressure monitoring will we do?',
        'Is this being used for sleep specifically or for broader behavioral regulation?',
        'What is the dosing schedule?',
      ],
    },
    {
      name: 'Mirtazapine',
      examples: 'Remeron',
      evidenceLevel: 'Limited',
      questions: [
        'What is the evidence for mirtazapine in autism sleep?',
        'What are the risks of weight gain and sedation?',
        'How does this interact with other medications?',
      ],
    },
  ],
  attention: [
    {
      name: 'Stimulants (Methylphenidate, Amphetamine)',
      examples: 'Ritalin, Adderall, Vyvanse',
      evidenceLevel: 'Moderate',
      questions: [
        'Is there a co-occurring ADHD diagnosis?',
        'What is the response rate for stimulants in autism with intellectual disability?',
        'What side effects are we watching for (irritability, appetite suppression, sleep)?',
        'What is the titration schedule?',
        'What do we do if stimulants worsen behavior?',
      ],
      warnings: 'Response rates are lower in autism with intellectual disability. Irritability is more common.',
    },
    {
      name: 'Alpha-2 Agonists (Guanfacine, Clonidine)',
      examples: 'Intuniv, Kapvay',
      evidenceLevel: 'Moderate',
      questions: [
        'Is this being used for attention, hyperactivity, or both?',
        'What blood pressure monitoring will we do?',
        'Can this be combined with stimulants if needed?',
      ],
    },
  ],
  mood: [
    {
      name: 'Atypical Antipsychotics',
      examples: 'Risperdal, Abilify, Seroquel',
      evidenceLevel: 'Moderate',
      questions: [
        'What specific mood symptoms are we targeting?',
        'What metabolic monitoring will we do?',
        'How long before we expect to see a response?',
        'What is the plan if this doesn\'t work?',
      ],
    },
    {
      name: 'Mood Stabilizers',
      examples: 'Depakote, Lamictal, Lithium',
      evidenceLevel: 'Limited',
      questions: [
        'What blood level monitoring will we need?',
        'Is there a co-occurring mood disorder diagnosis?',
        'What are the monitoring requirements for this medication?',
      ],
    },
  ],
  gi: [
    {
      name: 'GI Evaluation First',
      examples: 'Pediatric GI referral',
      evidenceLevel: 'Strong',
      questions: [
        'Has my child had a formal GI evaluation?',
        'Is there evidence of constipation, reflux, or other GI issues?',
        'Should we try a bowel management plan before adding medications?',
        'Is there a connection between GI symptoms and behavioral symptoms?',
        'Should we consider a GI specialist referral?',
      ],
    },
    {
      name: 'Laxatives / Stool Softeners',
      examples: 'MiraLax, Senna, Lactulose',
      evidenceLevel: 'Strong',
      questions: [
        'What is the appropriate dose for my child\'s weight?',
        'How long should we try this before expecting results?',
        'What dietary changes should accompany this?',
        'When should we escalate to a GI specialist?',
      ],
    },
  ],
};

const SYMPTOMS: { id: TargetSymptom; emoji: string; label: string; sub: string }[] = [
  { id: 'aggression_sib', emoji: '👊', label: 'Aggression / SIB', sub: 'Physical aggression, self-injury' },
  { id: 'anxiety_ocd', emoji: '😰', label: 'Anxiety / OCD', sub: 'Repetitive behaviors, distress' },
  { id: 'sleep', emoji: '😴', label: 'Sleep', sub: 'Difficulty falling or staying asleep' },
  { id: 'attention', emoji: '🧠', label: 'Attention / Hyperactivity', sub: 'ADHD symptoms' },
  { id: 'mood', emoji: '🌊', label: 'Mood Instability', sub: 'Extreme mood swings' },
  { id: 'gi', emoji: '🫃', label: 'GI / Stomach', sub: 'Constipation, reflux, GI pain' },
];

const EVIDENCE_COLORS: Record<string, string> = {
  Strong: '#065F46',
  Moderate: '#7A6020',
  Limited: '#555',
};

const EVIDENCE_BG: Record<string, string> = {
  Strong: '#E3F7F1',
  Moderate: '#FFF6D8',
  Limited: COLORS.bg,
};

export default function MedicationGuide() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSymptom, setSelectedSymptom] = useState<TargetSymptom | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    logScreenView('medication_guide');
    logEvent('tool_opened', { tool: 'Medication Guide' });
  }, []);

  const handleGetGuide = () => {
    if (!selectedSymptom) return;
    logEvent('tool_completed', { tool: 'Medication Guide', symptom: selectedSymptom });
    setShowResults(true);
  };

  if (showResults && selectedSymptom) {
    const classes = MED_CLASSES[selectedSymptom];
    const symptomLabel = SYMPTOMS.find((s) => s.id === selectedSymptom)?.label;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setShowResults(false)}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medication Guide</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsBanner}>
            <Text style={styles.resultsBannerLabel}>QUESTIONS TO ASK YOUR DOCTOR</Text>
            <Text style={styles.resultsBannerTitle}>{symptomLabel}</Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              ⚠️ This is not a prescribing guide. These are questions to help you have an informed conversation with your child's doctor or psychiatrist. Never start, stop, or change medications without medical supervision.
            </Text>
          </View>

          {classes.map((medClass, idx) => (
            <View key={idx} style={styles.medCard}>
              <View style={styles.medHeader}>
                <Text style={styles.medName}>{medClass.name}</Text>
                <View style={[styles.evidenceBadge, { backgroundColor: EVIDENCE_BG[medClass.evidenceLevel] }]}>
                  <Text style={[styles.evidenceBadgeText, { color: EVIDENCE_COLORS[medClass.evidenceLevel] }]}>
                    {medClass.evidenceLevel} Evidence
                  </Text>
                </View>
              </View>
              <Text style={styles.medExamples}>Examples: {medClass.examples}</Text>
              {medClass.warnings && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>⚠️ {medClass.warnings}</Text>
                </View>
              )}
              <Text style={styles.questionsLabel}>Questions to ask your doctor:</Text>
              {medClass.questions.map((q, qIdx) => (
                <View key={qIdx} style={styles.questionRow}>
                  <Text style={styles.questionNum}>{qIdx + 1}.</Text>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            style={styles.psychiatristBtn}
            onPress={() => Linking.openURL('https://www.aacap.org/AACAP/Families_and_Youth/Resources/CAP_Finder.aspx')}
            activeOpacity={0.85}
          >
            <Text style={styles.psychiatristBtnText}>Find a Child Psychiatrist (AACAP) →</Text>
          </TouchableOpacity>

          <PathwayDisclaimer type="medical" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Guide</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>💊 Know What to Ask</Text>
          <Text style={styles.introText}>
            Navigating behavioral medications for profound autism is complex. This guide helps you understand the medication classes most commonly used and — most importantly — the questions to ask your doctor before starting any medication.
          </Text>
        </View>

        {/* Symptom selector */}
        <Text style={styles.questionLabel}>What symptom are you trying to address?</Text>
        <View style={styles.symptomsGrid}>
          {SYMPTOMS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.symptomCard, selectedSymptom === s.id && styles.symptomCardSelected]}
              onPress={() => setSelectedSymptom(s.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.symptomEmoji}>{s.emoji}</Text>
              <Text style={[styles.symptomLabel, selectedSymptom === s.id && styles.symptomLabelSelected]}>
                {s.label}
              </Text>
              <Text style={styles.symptomSub}>{s.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !selectedSymptom && styles.submitBtnDisabled]}
          onPress={handleGetGuide}
          disabled={!selectedSymptom}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Get Questions to Ask →</Text>
        </TouchableOpacity>

        <PathwayDisclaimer type="medical" />
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
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.md },
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  introTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  introText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  questionLabel: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  symptomCard: {
    width: '47.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  symptomCardSelected: { borderColor: '#1A6B5A', backgroundColor: '#E3F7F1' },
  symptomEmoji: { fontSize: 24, marginBottom: SPACING.xs },
  symptomLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 18 },
  symptomLabelSelected: { color: '#1A6B5A' },
  symptomSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2, lineHeight: 16 },
  submitBtn: {
    backgroundColor: '#1A6B5A',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  submitBtnDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },
  // Results
  resultsBanner: {
    backgroundColor: '#1A6B5A',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  resultsBannerLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xs,
  },
  resultsBannerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#fff' },
  disclaimerCard: {
    backgroundColor: '#FFF6D8',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FFE58A',
  },
  disclaimerText: { fontSize: FONT_SIZES.sm, color: '#7A6020', lineHeight: 20 },
  medCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  medHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, flexWrap: 'wrap' },
  medName: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, lineHeight: 22 },
  evidenceBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  evidenceBadgeText: { fontSize: 11, fontWeight: '700' },
  medExamples: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },
  warningBox: {
    backgroundColor: '#FFF6D8',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FFE58A',
  },
  warningText: { fontSize: FONT_SIZES.xs, color: '#7A6020', lineHeight: 18 },
  questionsLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  questionRow: { flexDirection: 'row', gap: SPACING.sm },
  questionNum: { fontSize: FONT_SIZES.sm, color: '#1A6B5A', fontWeight: '800', width: 20 },
  questionText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  psychiatristBtn: {
    backgroundColor: '#1A6B5A',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  psychiatristBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
});
