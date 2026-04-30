import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

// ─── Quiz Data ────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  text: string;
  subtext?: string;
  multiSelect?: boolean;
  options: { label: string; value: string; icdCodes?: ICDCode[] }[];
}

interface ICDCode {
  code: string;
  description: string;
  pmipNote: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'primary_diagnosis',
    text: 'What is your child\'s primary diagnosis?',
    subtext: 'Select all that apply.',
    multiSelect: true,
    options: [
      {
        label: 'Autism Spectrum Disorder',
        value: 'asd',
        icdCodes: [
          { code: 'F84.0', description: 'Autistic disorder', pmipNote: 'Primary diagnosis code — include on all PMIP paperwork' },
          { code: 'F84.9', description: 'Pervasive developmental disorder, unspecified', pmipNote: 'Use if diagnosis is ASD without further specification' },
        ],
      },
      {
        label: 'ADHD',
        value: 'adhd',
        icdCodes: [
          { code: 'F90.0', description: 'ADHD, predominantly inattentive', pmipNote: 'Document alongside autism for PMIP — supports need for behavioral services' },
          { code: 'F90.1', description: 'ADHD, predominantly hyperactive-impulsive', pmipNote: 'Document alongside autism for PMIP' },
          { code: 'F90.2', description: 'ADHD, combined presentation', pmipNote: 'Most common ADHD code — use if both inattentive and hyperactive symptoms present' },
        ],
      },
      {
        label: 'Intellectual Disability',
        value: 'id',
        icdCodes: [
          { code: 'F70', description: 'Mild intellectual disability', pmipNote: 'Significantly strengthens PMIP and waiver applications' },
          { code: 'F71', description: 'Moderate intellectual disability', pmipNote: 'High priority for PMIP — document adaptive behavior scores' },
          { code: 'F72', description: 'Severe intellectual disability', pmipNote: 'Highest priority for PMIP and waiver services' },
        ],
      },
      {
        label: 'Down Syndrome',
        value: 'down',
        icdCodes: [
          { code: 'Q90.9', description: 'Down syndrome, unspecified', pmipNote: 'Include on all PMIP paperwork alongside any co-occurring diagnoses' },
        ],
      },
    ],
  },
  {
    id: 'communication',
    text: 'How does your child primarily communicate?',
    options: [
      {
        label: 'Verbal — speaks in sentences',
        value: 'verbal',
        icdCodes: [],
      },
      {
        label: 'Limited verbal — single words or short phrases',
        value: 'limited_verbal',
        icdCodes: [
          { code: 'F80.1', description: 'Expressive language disorder', pmipNote: 'Supports need for speech therapy services through PMIP' },
          { code: 'F80.2', description: 'Mixed receptive-expressive language disorder', pmipNote: 'Use if child has difficulty both expressing and understanding language' },
        ],
      },
      {
        label: 'Nonverbal — uses AAC, signs, or no formal communication',
        value: 'nonverbal',
        icdCodes: [
          { code: 'F80.4', description: 'Speech and language development delay due to deafness', pmipNote: 'Use only if hearing-related; otherwise use F80.2 or F84.0' },
          { code: 'R47.02', description: 'Aphasia following other nontraumatic intracranial hemorrhage', pmipNote: 'Use F80.2 for developmental nonverbal presentation; discuss with provider' },
          { code: 'F80.2', description: 'Mixed receptive-expressive language disorder', pmipNote: 'Most appropriate code for nonverbal children with autism — supports AAC services' },
        ],
      },
    ],
  },
  {
    id: 'behavior',
    text: 'Does your child have significant behavioral challenges?',
    subtext: 'Meltdowns, self-injury, aggression, or behaviors that require intervention.',
    options: [
      {
        label: 'Yes — significant, frequent behavioral challenges',
        value: 'yes_significant',
        icdCodes: [
          { code: 'F91.9', description: 'Conduct disorder, unspecified', pmipNote: 'Use carefully — discuss with provider; F84.0 with behavioral specifier is often more appropriate' },
          { code: 'R45.6', description: 'Violent behavior', pmipNote: 'Document if aggression is present — supports need for behavioral intervention through PMIP' },
          { code: 'F95.9', description: 'Tic disorder, unspecified', pmipNote: 'Use if tics are present alongside behavioral challenges' },
        ],
      },
      {
        label: 'Some behavioral challenges, managed with support',
        value: 'some',
        icdCodes: [
          { code: 'Z13.89', description: 'Encounter for screening for other disorder', pmipNote: 'Use as secondary code when behavioral monitoring is part of visit' },
        ],
      },
      {
        label: 'No significant behavioral challenges',
        value: 'none',
        icdCodes: [],
      },
    ],
  },
  {
    id: 'self_injury',
    text: 'Does your child engage in self-injurious behavior (SIB)?',
    subtext: 'Head banging, biting, scratching, or other self-harm behaviors.',
    options: [
      {
        label: 'Yes — frequently',
        value: 'yes_frequent',
        icdCodes: [
          { code: 'R45.88', description: 'Nonsuicidal self-harm', pmipNote: 'Critical to document for PMIP — supports ABA and behavioral health services' },
          { code: 'F84.0', description: 'Autistic disorder (with SIB specifier)', pmipNote: 'Note SIB in clinical documentation alongside F84.0' },
        ],
      },
      {
        label: 'Occasionally',
        value: 'occasionally',
        icdCodes: [
          { code: 'R45.88', description: 'Nonsuicidal self-harm', pmipNote: 'Still worth documenting — even occasional SIB supports need for behavioral services' },
        ],
      },
      {
        label: 'No self-injurious behavior',
        value: 'no',
        icdCodes: [],
      },
    ],
  },
  {
    id: 'anxiety_mood',
    text: 'Does your child have anxiety or mood-related challenges?',
    options: [
      {
        label: 'Yes — anxiety significantly impacts daily life',
        value: 'anxiety_major',
        icdCodes: [
          { code: 'F41.1', description: 'Generalized anxiety disorder', pmipNote: 'Document alongside autism for PMIP — supports mental health services' },
          { code: 'F93.0', description: 'Separation anxiety disorder of childhood', pmipNote: 'Use if separation anxiety is a primary concern' },
          { code: 'F94.0', description: 'Selective mutism', pmipNote: 'Use if child is verbal at home but not in other settings' },
        ],
      },
      {
        label: 'Yes — mood dysregulation or emotional outbursts',
        value: 'mood',
        icdCodes: [
          { code: 'F34.8', description: 'Other persistent mood disorders', pmipNote: 'Use for chronic mood dysregulation not meeting full criteria for other disorders' },
          { code: 'F32.9', description: 'Major depressive disorder, unspecified', pmipNote: 'Use only if depression has been evaluated and documented by a provider' },
        ],
      },
      {
        label: 'No significant anxiety or mood issues',
        value: 'no',
        icdCodes: [],
      },
    ],
  },
  {
    id: 'sleep',
    text: 'Does your child have diagnosed or significant sleep difficulties?',
    options: [
      {
        label: 'Yes — major sleep problems affecting daily functioning',
        value: 'yes_major',
        icdCodes: [
          { code: 'G47.00', description: 'Insomnia, unspecified', pmipNote: 'Document for PMIP — sleep disorders in autism are well-recognized and support service needs' },
          { code: 'G47.9', description: 'Sleep disorder, unspecified', pmipNote: 'Use if specific sleep disorder type is not yet diagnosed' },
          { code: 'F51.9', description: 'Sleep disorder not due to a substance or known physiological condition, unspecified', pmipNote: 'Use for behavioral insomnia — discuss with pediatrician' },
        ],
      },
      {
        label: 'Some sleep issues but not severe',
        value: 'some',
        icdCodes: [
          { code: 'Z72.820', description: 'Sleep problems in child', pmipNote: 'Use as secondary code to flag sleep concerns during PMIP visit' },
        ],
      },
      {
        label: 'No significant sleep issues',
        value: 'no',
        icdCodes: [],
      },
    ],
  },
  {
    id: 'gi',
    text: 'Does your child have gastrointestinal or feeding issues?',
    options: [
      {
        label: 'Yes — chronic constipation or diarrhea',
        value: 'gi_chronic',
        icdCodes: [
          { code: 'K59.00', description: 'Constipation, unspecified', pmipNote: 'Very common in autism — document for PMIP and GI specialist referral' },
          { code: 'K52.9', description: 'Noninfective gastroenteritis and colitis, unspecified', pmipNote: 'Use for chronic loose stools or GI inflammation' },
        ],
      },
      {
        label: 'Yes — extremely restricted diet (ARFID)',
        value: 'arfid',
        icdCodes: [
          { code: 'F50.82', description: 'Avoidant/restrictive food intake disorder', pmipNote: 'Important for PMIP — supports feeding therapy and nutritional services' },
          { code: 'R63.3', description: 'Feeding difficulties', pmipNote: 'Use as secondary code alongside F50.82' },
        ],
      },
      {
        label: 'No significant GI or feeding issues',
        value: 'no',
        icdCodes: [],
      },
    ],
  },
  {
    id: 'services_needed',
    text: 'Which services are you trying to get authorized through PMIP or Medicaid?',
    subtext: 'Select all that apply.',
    multiSelect: true,
    options: [
      {
        label: 'ABA Therapy',
        value: 'aba',
        icdCodes: [
          { code: 'F84.0', description: 'Autistic disorder', pmipNote: 'ABA is typically authorized under F84.0 — ensure this is on the PMIP form' },
          { code: 'Z09', description: 'Encounter for follow-up examination after completed treatment', pmipNote: 'Use for ABA continuation visits' },
        ],
      },
      {
        label: 'Speech Therapy',
        value: 'speech',
        icdCodes: [
          { code: 'F80.1', description: 'Expressive language disorder', pmipNote: 'Primary code for speech therapy authorization' },
          { code: 'F80.2', description: 'Mixed receptive-expressive language disorder', pmipNote: 'Use if both expression and comprehension are affected' },
          { code: 'F84.0', description: 'Autistic disorder', pmipNote: 'Include as secondary code for speech therapy authorization' },
        ],
      },
      {
        label: 'Occupational Therapy',
        value: 'ot',
        icdCodes: [
          { code: 'F82', description: 'Specific developmental disorder of motor function', pmipNote: 'Primary code for OT authorization for motor delays' },
          { code: 'F88', description: 'Other disorders of psychological development', pmipNote: 'Use for sensory processing — discuss with OT' },
        ],
      },
      {
        label: 'Physical Therapy',
        value: 'pt',
        icdCodes: [
          { code: 'M62.9', description: 'Disorder of muscle, unspecified', pmipNote: 'Use for low muscle tone (hypotonia) — PT authorization' },
          { code: 'G71.00', description: 'Muscular dystrophy, unspecified', pmipNote: 'Only if muscular dystrophy is diagnosed — discuss with neurologist' },
          { code: 'F82', description: 'Specific developmental disorder of motor function', pmipNote: 'Most common code for PT authorization in autism' },
        ],
      },
      {
        label: 'Personal Care / Home Support',
        value: 'personal_care',
        icdCodes: [
          { code: 'Z74.09', description: 'Other reduced mobility', pmipNote: 'Use to document need for personal care assistance' },
          { code: 'Z74.1', description: 'Need for assistance with personal care', pmipNote: 'Direct code for personal care authorization — include on PMIP' },
        ],
      },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

type Screen = 'intro' | 'quiz' | 'results';

export default function ICDQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentQuestion = QUESTIONS[currentQ];

  const handleSingleAnswer = (value: string) => {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setScreen('results');
    }
  };

  const handleMultiToggle = (value: string) => {
    const current = (answers[currentQuestion.id] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [currentQuestion.id]: updated });
  };

  const handleMultiNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setScreen('results');
    }
  };

  const isSelected = (value: string): boolean => {
    const ans = answers[currentQuestion.id];
    if (Array.isArray(ans)) return ans.includes(value);
    return ans === value;
  };

  // Collect all ICD codes from answers
  const getAllCodes = (): ICDCode[] => {
    const seen = new Set<string>();
    const codes: ICDCode[] = [];

    QUESTIONS.forEach((q) => {
      const ans = answers[q.id];
      const selectedValues = Array.isArray(ans) ? ans : ans ? [ans] : [];

      q.options.forEach((opt) => {
        if (selectedValues.includes(opt.value) && opt.icdCodes) {
          opt.icdCodes.forEach((code) => {
            if (!seen.has(code.code)) {
              seen.add(code.code);
              codes.push(code);
            }
          });
        }
      });
    });

    return codes;
  };

  const handleCopyAll = async (codes: ICDCode[]) => {
    const text = codes.map((c) => `${c.code} — ${c.description}\n💬 ${c.pmipNote}`).join('\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'All ICD codes copied to clipboard. You can paste them into notes or share with your doctor.');
  };

  const handleCopyCode = async (code: ICDCode) => {
    await Clipboard.setStringAsync(`${code.code} — ${code.description}`);
    Alert.alert('Copied', `${code.code} copied to clipboard.`);
  };

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  // ── Intro ──
  if (screen === 'intro') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ICD Support Quiz</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>🔍</Text>
            <Text style={styles.heroTitle}>Find the Right ICD-10 Codes for Your PMIP Visit</Text>
            <Text style={styles.heroBody}>
              The PMIP (Physician Medical Information Program) form requires specific ICD-10 diagnosis codes to authorize services. This quiz helps you identify which codes apply to your child so you can have an informed conversation with your doctor.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 What is a PMIP form?</Text>
            <Text style={styles.infoBody}>
              The PMIP form is completed by your child's physician and submitted to Medicaid to authorize services like ABA therapy, speech therapy, and personal care. The ICD-10 codes on this form directly determine what services get approved.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚠️ Important note</Text>
            <Text style={styles.infoBody}>
              Only a licensed physician can officially assign ICD-10 codes. This quiz helps you identify codes to discuss with your doctor — not to self-diagnose or self-code.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⏱️ About 3 minutes</Text>
            <Text style={styles.infoBody}>
              {QUESTIONS.length} questions about your child's diagnoses, communication, behavior, and the services you're seeking.
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => setScreen('quiz')}>
            <Text style={styles.startBtnText}>Start Quiz →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Quiz ──
  if (screen === 'quiz') {
    const q = currentQuestion;
    const isMulti = q.multiSelect;
    const selectedMulti = (answers[q.id] as string[]) || [];

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

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {isMulti && (
            <View style={styles.multiChip}>
              <Text style={styles.multiChipText}>Select all that apply</Text>
            </View>
          )}

          <Text style={styles.questionText}>{q.text}</Text>
          {q.subtext && <Text style={styles.questionSubtext}>{q.subtext}</Text>}

          <View style={styles.optionsContainer}>
            {q.options.map((opt) => {
              const selected = isSelected(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.optionCard, selected && styles.optionCardSelected]}
                  onPress={() => isMulti ? handleMultiToggle(opt.value) : handleSingleAnswer(opt.value)}
                >
                  <View style={styles.optionRow}>
                    {isMulti && (
                      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    )}
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {isMulti && (
            <TouchableOpacity
              style={[styles.nextBtn, selectedMulti.length === 0 && styles.nextBtnDisabled]}
              onPress={handleMultiNext}
              disabled={selectedMulti.length === 0}
            >
              <Text style={styles.nextBtnText}>
                {selectedMulti.length === 0 ? 'Select at least one →' : `Continue with ${selectedMulti.length} selected →`}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Results ──
  const allCodes = getAllCodes();

  // Group by service area
  const pmipCodes = allCodes.filter((c) => c.pmipNote.toLowerCase().includes('pmip'));
  const otherCodes = allCodes.filter((c) => !c.pmipNote.toLowerCase().includes('pmip'));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          onPress={() => { setScreen('intro'); setCurrentQ(0); setAnswers({}); }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>Retake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your ICD Codes</Text>
        <TouchableOpacity onPress={() => handleCopyAll(allCodes)} style={styles.copyBtn}>
          <Text style={styles.copyBtnText}>Copy All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🔍</Text>
          <Text style={styles.summaryTitle}>{allCodes.length} ICD-10 codes identified</Text>
          <Text style={styles.summaryBody}>
            Based on your answers, these codes may be relevant for your child's PMIP form and Medicaid service authorizations. Share this list with your doctor at your next appointment.
          </Text>
        </View>

        {/* Doctor conversation starter */}
        <View style={styles.convoCard}>
          <Text style={styles.convoTitle}>💬 What to say to your doctor</Text>
          <Text style={styles.convoBody}>
            "I've been researching ICD-10 codes that may apply to my child for the PMIP form. I'd like to review these with you and make sure we're capturing everything that could support authorization for [ABA / speech / OT / personal care]. Can we go through this list together?"
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(
                "I've been researching ICD-10 codes that may apply to my child for the PMIP form. I'd like to review these with you and make sure we're capturing everything that could support authorization for services. Can we go through this list together?"
              );
              Alert.alert('Copied', 'Conversation starter copied to clipboard.');
            }}
            style={styles.convoBtn}
          >
            <Text style={styles.convoBtnText}>Copy Script</Text>
          </TouchableOpacity>
        </View>

        {/* PMIP-specific codes */}
        {pmipCodes.length > 0 && (
          <View style={styles.codeSection}>
            <Text style={styles.codeSectionLabel}>PMIP FORM CODES</Text>
            {pmipCodes.map((code) => (
              <CodeCard key={code.code} code={code} onCopy={handleCopyCode} />
            ))}
          </View>
        )}

        {/* Other codes */}
        {otherCodes.length > 0 && (
          <View style={styles.codeSection}>
            <Text style={styles.codeSectionLabel}>ADDITIONAL CODES</Text>
            {otherCodes.map((code) => (
              <CodeCard key={code.code} code={code} onCopy={handleCopyCode} />
            ))}
          </View>
        )}

        {allCodes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No codes were identified based on your answers. Try retaking the quiz or consult with your child's physician directly.
            </Text>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ⚠️ These codes are suggestions for discussion with your child's physician only. Only a licensed provider can officially assign ICD-10 codes. This tool is not a substitute for medical advice.
          </Text>
        </View>

        {/* Link to developmental quiz */}
        <TouchableOpacity style={styles.devQuizBtn} onPress={() => router.push('/disability-quiz')}>
          <Text style={styles.devQuizBtnText}>← Also take the Developmental Quiz</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function CodeCard({ code, onCopy }: { code: ICDCode; onCopy: (c: ICDCode) => void }) {
  return (
    <View style={styles.codeCard}>
      <View style={styles.codeRow}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeBadgeText}>{code.code}</Text>
        </View>
        <TouchableOpacity onPress={() => onCopy(code)} style={styles.codeCopyBtn}>
          <Text style={styles.codeCopyText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.codeDescription}>{code.description}</Text>
      <View style={styles.pmipNote}>
        <Text style={styles.pmipNoteText}>💬 {code.pmipNote}</Text>
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

  scroll: { padding: SPACING.lg },

  heroCard: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.blueAccent,
  },
  heroIcon: { fontSize: 44, marginBottom: SPACING.md },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.infoText,
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

  multiChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  multiChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText },

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
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionTextSelected: { color: COLORS.purpleDark, fontWeight: '700' },

  nextBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.lg,
  },
  nextBtnDisabled: { backgroundColor: COLORS.border },
  nextBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },

  summaryCard: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.blueAccent,
  },
  summaryIcon: { fontSize: 36, marginBottom: SPACING.sm },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.infoText,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  summaryBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
  },

  convoCard: {
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.mintAccent,
  },
  convoTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.successText,
    marginBottom: SPACING.sm,
  },
  convoBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  convoBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successText,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
  },
  convoBtnText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '700' },

  codeSection: { marginBottom: SPACING.xl },
  codeSectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  codeCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blueAccent,
    ...SHADOWS.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  codeBadge: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  codeBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.infoText,
    fontFamily: 'monospace',
  },
  codeCopyBtn: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  codeCopyText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark },
  codeDescription: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  pmipNote: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  pmipNoteText: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, lineHeight: 17 },

  emptyCard: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },

  disclaimerCard: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
  },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, lineHeight: 18 },

  devQuizBtn: {
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  devQuizBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.sm },
});
