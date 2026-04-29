import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, SafeAreaView, Picker } from 'react-native';
import { usePmipProviderStore, usePmipProviderStoreActions } from '../../../../lib/pmip/pmipProviderStore';
import { PMIP_COLORS, PMIP_SPACING, PMIP_SIZES } from '../../../../lib/pmip/pmipStyles';

type SectionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
type FrequencyOption = 'not_a_concern' | 'mild_concern' | 'moderate_concern' | 'significant_concern' | 'not_sure';

const SECTION_ORDER: SectionKey[] = ['A', 'B', 'C', 'D', 'E', 'F'];

const SECTION_INFO: Record<SectionKey, { title: string; subtitle: string; icon: string }> = {
  A: { title: 'Basic Background', subtitle: 'Your child\'s age, diagnosis status, and additional conditions', icon: '👤' },
  B: { title: 'Communication & Social', subtitle: 'Select how often each area is a concern for your child. Not sure is always okay.', icon: '💬' },
  C: { title: 'Sensory & Regulation', subtitle: 'Select how often each area is a concern for your child. Not sure is always okay.', icon: '🧠' },
  D: { title: 'Daily Living & Functional Needs', subtitle: 'Select how often each area is a concern for your child. Not sure is always okay.', icon: '🏠' },
  E: { title: 'Motor, Learning & School', subtitle: 'Select how often each area is a concern for your child. Not sure is always okay.', icon: '📚' },
  F: { title: 'Provider Documentation & Next Steps', subtitle: 'What should your provider focus on and document?', icon: '📋' },
};

const FREQUENCY_INFO: Record<FrequencyOption, { label: string; bg: string; text: string }> = {
  not_a_concern: { label: 'Not a concern', bg: '#f3f4f6', text: '#6b7280' },
  mild_concern: { label: 'Sometimes', bg: '#dbeafe', text: '#1d4ed8' },
  moderate_concern: { label: 'Often', bg: '#fed7aa', text: '#c2410c' },
  significant_concern: { label: 'Significant concern', bg: '#fecaca', text: '#b91c1c' },
  not_sure: { label: 'Not sure', bg: '#ede9fe', text: '#6d28d9' },
};

const COMMUNICATION_QUESTIONS = [
  'Speech delay or late talking',
  'Limited expressive language',
  'Difficulty following directions',
  'Hard to understand or unclear speech',
  'Limited social interaction or isolation',
];

const SENSORY_QUESTIONS = [
  'Sensory sensitivities (loud noises, textures, lights)',
  'Difficulty with transitions or changes',
  'Meltdowns or shutdowns',
  'Stimming behaviors (repetitive movements)',
  'Difficulty self-regulating emotions',
];

const DAILY_LIVING_QUESTIONS = [
  'Toileting or incontinence',
  'Feeding or eating challenges',
  'Personal hygiene and grooming',
  'Dressing and clothing management',
  'Sleep difficulties',
];

const MOTOR_LEARNING_QUESTIONS = [
  'Gross motor delays (running, climbing, coordination)',
  'Fine motor delays (writing, buttons, self-feeding)',
  'Processing speed or learning pace',
  'Attention or focus difficulties',
  'School or learning environment challenges',
];

const PROVIDER_FOCUS_OPTIONS = [
  { key: 'diagnoses_icd', label: 'Diagnoses & ICD codes' },
  { key: 'daily_living', label: 'Daily living needs' },
  { key: 'safety', label: 'Safety & supervision' },
  { key: 'sensory_reg', label: 'Sensory & regulation' },
  { key: 'motor_learning', label: 'Motor & learning' },
  { key: 'school_docs', label: 'School/therapy reports' },
  { key: 'letters_forms', label: 'Letters & forms' },
  { key: 'next_evals', label: 'Next evaluations' },
  { key: 'not_sure', label: 'Not sure' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PMIP_COLORS.screenBg },
  header: {
    backgroundColor: PMIP_COLORS.cardBg,
    paddingHorizontal: PMIP_SPACING.xl,
    paddingVertical: PMIP_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: PMIP_COLORS.heroTitle },
  progressLabel: { fontSize: 13, color: PMIP_COLORS.mutedText },
  progressBar: { flexDirection: 'row', gap: 4, marginTop: PMIP_SPACING.md },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: PMIP_COLORS.progressEmpty },
  progressSegmentFilled: { backgroundColor: PMIP_COLORS.progressFilled },
  scrollContent: { paddingHorizontal: PMIP_SPACING.xl, paddingTop: PMIP_SPACING.lg, paddingBottom: 120 },
  sectionIcon: { width: PMIP_SIZES.iconSize, height: PMIP_SIZES.iconSize, borderRadius: PMIP_SIZES.iconSize / 2, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: PMIP_SPACING.md },
  sectionIconText: { fontSize: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: PMIP_COLORS.heroTitle, textAlign: 'center', marginBottom: PMIP_SPACING.xs },
  sectionSubtitle: { fontSize: 14, fontWeight: '400', color: PMIP_COLORS.mutedText, fontStyle: 'italic', textAlign: 'center', marginBottom: PMIP_SPACING.xl },
  card: { backgroundColor: PMIP_COLORS.cardBg, borderRadius: PMIP_SIZES.largeRadius, padding: PMIP_SPACING.lg, marginBottom: PMIP_SPACING.md, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: PMIP_COLORS.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  questionText: { fontSize: 16, fontWeight: '600', color: PMIP_COLORS.heroTitle, marginBottom: PMIP_SPACING.md },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: PMIP_SPACING.sm },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: PMIP_SPACING.sm },
  pillText: { fontSize: 12, fontWeight: '500' },
  frequencyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: PMIP_SPACING.md, gap: PMIP_SPACING.xs },
  frequencyPill: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 10, alignItems: 'center' },
  frequencyText: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: PMIP_SPACING.md, borderRadius: PMIP_SIZES.borderRadius, paddingVertical: PMIP_SPACING.md, paddingHorizontal: PMIP_SPACING.md, backgroundColor: PMIP_COLORS.cardBg, borderWidth: 1, borderColor: '#e5e7eb' },
  checkbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, marginRight: PMIP_SPACING.md, alignItems: 'center', justifyContent: 'center' },
  textInput: { backgroundColor: PMIP_COLORS.cardBg, borderRadius: PMIP_SIZES.borderRadius, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: PMIP_SPACING.md, paddingVertical: PMIP_SPACING.md, fontSize: 14, color: PMIP_COLORS.bodyText, marginBottom: PMIP_SPACING.md },
  button: { backgroundColor: PMIP_COLORS.primaryPurple, borderRadius: 50, paddingVertical: PMIP_SPACING.lg, alignItems: 'center', justifyContent: 'center', marginTop: PMIP_SPACING.lg },
  buttonText: { color: PMIP_COLORS.cardBg, fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#e5e7eb' },
  secondaryButtonText: { color: PMIP_COLORS.bodyText },
  buttonRow: { flexDirection: 'row', gap: PMIP_SPACING.md, marginTop: PMIP_SPACING.lg },
});

export default function Step2Quiz() {
  const router = useRouter();
  const store = usePmipProviderStore();
  const setStore = usePmipProviderStoreActions();
  const [currentSection, setCurrentSection] = useState<SectionKey>('A');

  const [childNickname, setChildNickname] = useState(store.childNickname);
  const [childAge, setChildAge] = useState(store.childAge);
  const [autismDxStatus, setAutismDxStatus] = useState<'yes' | 'no' | 'in_progress' | 'suspected' | null>(store.autismDxStatus);
  const [additionalDx, setAdditionalDx] = useState(store.additionalDx);

  const [communicationResponses, setCommunicationResponses] = useState<Record<string, FrequencyOption>>({});
  const [sensoryResponses, setSensoryResponses] = useState<Record<string, FrequencyOption>>({});
  const [dailyLivingResponses, setDailyLivingResponses] = useState<Record<string, FrequencyOption>>({});
  const [motorLearningResponses, setMotorLearningResponses] = useState<Record<string, FrequencyOption>>({});
  const [providerFocusAreas, setProviderFocusAreas] = useState(store.providerFocusAreas);

  const currentSectionIndex = SECTION_ORDER.indexOf(currentSection);

  const goToNextSection = () => {
    if (currentSectionIndex < SECTION_ORDER.length - 1) {
      setCurrentSection(SECTION_ORDER[currentSectionIndex + 1]);
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSection(SECTION_ORDER[currentSectionIndex - 1]);
    }
  };

  const handleContinueToSummary = () => {
    setStore({ childNickname, childAge, autismDxStatus, additionalDx, providerFocusAreas });
    router.push('/medicaid/ltd-journey/pmip-provider-journey/step-3-summary');
  };

  const FrequencyQuestion = (props: { question: string; value: FrequencyOption | undefined; onChange: (val: FrequencyOption) => void }) => (
    <View style={styles.card}>
      <Text style={styles.questionText}>{props.question}</Text>
      <View style={styles.frequencyRow}>
        {(Object.keys(FREQUENCY_INFO) as FrequencyOption[]).map((opt) => {
          const info = FREQUENCY_INFO[opt];
          const selected = props.value === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => props.onChange(opt)}
              style={[
                styles.frequencyPill,
                { backgroundColor: selected ? info.bg : '#f3f4f6' },
                selected && { borderWidth: 2, borderColor: info.text },
              ]}
            >
              <Text style={[styles.frequencyText, { color: selected ? info.text : PMIP_COLORS.mutedText }]}>
                {info.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSectionA = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.questionText}>What's your child's name or nickname?</Text>
        <TextInput
          value={childNickname}
          onChangeText={(v) => {
            setChildNickname(v);
            setStore({ childNickname: v });
          }}
          placeholder="For example: Sam, Maya, or just 'my child'"
          placeholderTextColor={PMIP_COLORS.mutedText}
          style={styles.textInput}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>How old are they?</Text>
        <TextInput
          value={childAge}
          onChangeText={(v) => {
            setChildAge(v);
            setStore({ childAge: v });
          }}
          placeholder="Age in years"
          placeholderTextColor={PMIP_COLORS.mutedText}
          keyboardType="numeric"
          style={styles.textInput}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>Autism diagnosis status</Text>
        <View style={styles.pillRow}>
          {[{ key: 'yes' as const, label: 'Yes' }, { key: 'in_progress' as const, label: 'In progress' }, { key: 'suspected' as const, label: 'Suspected' }, { key: 'no' as const, label: 'No' }].map((opt) => {
            const selected = autismDxStatus === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  setAutismDxStatus(opt.key);
                  setStore({ autismDxStatus: opt.key });
                }}
                style={[styles.pill, { backgroundColor: selected ? PMIP_COLORS.primaryPurple : '#e5e7eb' }]}
              >
                <Text style={[styles.pillText, { color: selected ? PMIP_COLORS.cardBg : PMIP_COLORS.bodyText }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>Any additional diagnoses already given? Select all that apply.</Text>
        {['adhd', 'anxiety', 'id', 'dev_delay', 'speech_delay', 'sensory', 'epilepsy', 'sleep', 'gi_feeding', 'other'].map((key) => {
          const labels: Record<string, string> = {
            adhd: 'ADHD',
            anxiety: 'Anxiety',
            id: 'Intellectual Disability (ID)',
            dev_delay: 'Developmental Delay',
            speech_delay: 'Speech / Language Delay',
            sensory: 'Sensory Processing Disorder',
            epilepsy: 'Epilepsy / Seizures',
            sleep: 'Sleep Disorder',
            gi_feeding: 'GI / Feeding Issues',
            other: 'Other',
          };
          const selected = additionalDx.includes(key);
          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                const next = selected ? additionalDx.filter((x) => x !== key) : [...additionalDx, key];
                setAdditionalDx(next);
                setStore({ additionalDx: next });
              }}
              style={[styles.checkboxRow, { borderColor: selected ? PMIP_COLORS.primaryPurple : '#e5e7eb', borderWidth: selected ? 1.5 : 1 }]}
            >
              <View style={[styles.checkbox, { borderColor: selected ? PMIP_COLORS.primaryPurple : '#d1d5db', backgroundColor: selected ? PMIP_COLORS.primaryPurple : PMIP_COLORS.cardBg }]}>
                {selected && <Text style={{ color: PMIP_COLORS.cardBg }}>✓</Text>}
              </View>
              <Text style={{ fontSize: 14, color: PMIP_COLORS.bodyText, fontWeight: selected ? '600' : '400' }}>
                {labels[key]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const renderSectionB = () => (
    <>
      {COMMUNICATION_QUESTIONS.map((q) => (
        <FrequencyQuestion
          key={q}
          question={q}
          value={communicationResponses[q]}
          onChange={(v) => setCommunicationResponses({ ...communicationResponses, [q]: v })}
        />
      ))}
    </>
  );

  const renderSectionC = () => (
    <>
      {SENSORY_QUESTIONS.map((q) => (
        <FrequencyQuestion
          key={q}
          question={q}
          value={sensoryResponses[q]}
          onChange={(v) => setSensoryResponses({ ...sensoryResponses, [q]: v })}
        />
      ))}
    </>
  );

  const renderSectionD = () => (
    <>
      {DAILY_LIVING_QUESTIONS.map((q) => (
        <FrequencyQuestion
          key={q}
          question={q}
          value={dailyLivingResponses[q]}
          onChange={(v) => setDailyLivingResponses({ ...dailyLivingResponses, [q]: v })}
        />
      ))}
    </>
  );

  const renderSectionE = () => (
    <>
      {MOTOR_LEARNING_QUESTIONS.map((q) => (
        <FrequencyQuestion
          key={q}
          question={q}
          value={motorLearningResponses[q]}
          onChange={(v) => setMotorLearningResponses({ ...motorLearningResponses, [q]: v })}
        />
      ))}
    </>
  );

  const renderSectionF = () => (
    <View style={styles.card}>
      <Text style={styles.questionText}>What should your provider focus on and document?</Text>
      <Text style={{ fontSize: 14, color: PMIP_COLORS.mutedText, marginBottom: PMIP_SPACING.md }}>
        Select the areas most important for Medicaid or disability paperwork.
      </Text>
      {PROVIDER_FOCUS_OPTIONS.map((opt) => {
        const selected = providerFocusAreas.includes(opt.key);
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => {
              const next = selected ? providerFocusAreas.filter((x) => x !== opt.key) : [...providerFocusAreas, opt.key];
              setProviderFocusAreas(next);
              setStore({ providerFocusAreas: next });
            }}
            style={[styles.checkboxRow, { borderColor: selected ? PMIP_COLORS.primaryPurple : '#e5e7eb', borderWidth: selected ? 1.5 : 1 }]}
          >
            <View style={[styles.checkbox, { borderColor: selected ? PMIP_COLORS.primaryPurple : '#d1d5db', backgroundColor: selected ? PMIP_COLORS.primaryPurple : PMIP_COLORS.cardBg }]}>
              {selected && <Text style={{ color: PMIP_COLORS.cardBg }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 14, color: PMIP_COLORS.bodyText, fontWeight: selected ? '600' : '400' }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'A':
        return renderSectionA();
      case 'B':
        return renderSectionB();
      case 'C':
        return renderSectionC();
      case 'D':
        return renderSectionD();
      case 'E':
        return renderSectionE();
      case 'F':
        return renderSectionF();
    }
  };

  const sectionInfo = SECTION_INFO[currentSection];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Provider Prep</Text>
          <Text style={styles.progressLabel}>Step {currentSectionIndex + 1} of {SECTION_ORDER.length}</Text>
        </View>
        <View style={styles.progressBar}>
          {SECTION_ORDER.map((_, idx) => (
            <View
              key={idx}
              style={[styles.progressSegment, idx <= currentSectionIndex && styles.progressSegmentFilled]}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionIcon}>
          <Text style={styles.sectionIconText}>{sectionInfo.icon}</Text>
        </View>
        <Text style={styles.sectionTitle}>{sectionInfo.title}</Text>
        <Text style={styles.sectionSubtitle}>{sectionInfo.subtitle}</Text>

        {renderCurrentSection()}

        <View style={styles.buttonRow}>
          {currentSectionIndex > 0 && (
            <TouchableOpacity onPress={goToPreviousSection} style={[styles.button, { flex: 1, backgroundColor: '#e5e7eb' }]}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={currentSectionIndex === SECTION_ORDER.length - 1 ? handleContinueToSummary : goToNextSection}
            style={[styles.button, { flex: 1 }]}
          >
            <Text style={styles.buttonText}>
              {currentSectionIndex === SECTION_ORDER.length - 1 ? 'Continue to Summary' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
