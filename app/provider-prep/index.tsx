import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
// ─── Storage Keys ─────────────────────────────────────────────────────────────
const DRAFT_KEY   = 'ap_provider_prep_draft';
const SAVED_KEY   = 'ap_provider_prep_saved';
const OBS_KEY     = 'ap_observations';
const PROFILE_KEY = 'profile';
// ─── Types ────────────────────────────────────────────────────────────────────
interface PrepDraft {
  providerName: string; apptDate: string; visitType: string; childName: string;
  recentChanges: string; wins: string; challenges: string; therapies: string;
  medications: string; lastEval: string; topPriority: string; hopingFor: string;
  worriedAbout: string; afterAppt: string;
  selectedFocus: string[]; checkedQuestions: string[]; customQuestions: string[];
}
interface VisitSummary {
  childBackground: string; currentTreatment: string; goalsForVisit: string;
  postApptNotes: string; whatProviderSaid: string; nextSteps: string; followUpDate: string;
}
interface SavedNote {
  id: number; title: string; date: string; savedAt: string;
  draft: PrepDraft; visitSummary?: VisitSummary;
}
// ─── Question Bank ────────────────────────────────────────────────────────────
const QUESTION_BANK: Record<string, { label: string; color: string; questions: string[] }> = {
  diagnosis: { label: 'Diagnosis & Evaluation', color: COLORS.purpleLight, questions: [
    "Based on what you're seeing, do you think an autism evaluation is appropriate?",
    "What does the autism evaluation process look like, and how long does it take?",
    "Which type of evaluation would you recommend — developmental pediatrician, neuropsychologist, or a multidisciplinary team?",
    "How is the diagnosis determined, and what assessments are used?",
    "What will a diagnosis mean for my child's services and support?",
    "If we get a diagnosis, what are the next immediate steps?",
    "Can you explain what the diagnostic criteria actually look like in everyday life?",
  ]},
  behavior: { label: 'Behavior & Communication', color: '#a3c4f3', questions: [
    "What strategies can help reduce meltdowns at home and in public?",
    "How do I tell the difference between a tantrum and a meltdown?",
    "What should I do during a meltdown to keep everyone safe and calm?",
    "What communication approach do you recommend for my child's current level?",
    "Are there AAC (augmentative communication) devices we should be exploring?",
    "How can I support language development at home between therapy sessions?",
    "What are realistic communication goals for the next 6 months?",
  ]},
  sensory: { label: 'Sensory Sensitivities', color: '#a8ddc9', questions: [
    "How do sensory sensitivities typically affect daily life and behavior?",
    "Should we pursue a formal sensory processing evaluation?",
    "What can I do at home to reduce sensory overload?",
    "Are there specific OT approaches that help with sensory regulation?",
    "How can I create a sensory-friendly environment at home or school?",
    "What sensory tools or supports would you recommend?",
  ]},
  sleep: { label: 'Sleep', color: COLORS.purpleLight, questions: [
    "Why do many autistic children struggle with sleep, and is this the case here?",
    "What are the safest options for helping my child sleep?",
    "Is melatonin appropriate, and what dose or form do you suggest?",
    "What bedtime routine changes might help?",
    "When should we consider a sleep study?",
    "How does poor sleep affect behavior, learning, and development?",
  ]},
  eating: { label: 'Eating & Feeding', color: '#f5c6a0', questions: [
    "Is my child's selective eating a concern nutritionally?",
    "Would feeding therapy help, and what does that look like?",
    "How do I tell the difference between sensory-based food avoidance and pickiness?",
    "Should we see a feeding specialist or dietitian?",
    "Are there supplements or vitamins we should consider?",
    "What strategies can I try at home to expand my child's diet?",
  ]},
  therapy: { label: 'Therapy Options', color: '#a3c4f3', questions: [
    "What therapies do you recommend for my child at this stage?",
    "How do we know if current therapies are working?",
    "What is the evidence behind ABA therapy, and is it right for my child?",
    "How many hours of therapy per week is recommended?",
    "What should I look for in a quality therapist or program?",
    "How can I support therapy goals at home?",
    "When should we reassess our therapy plan?",
  ]},
  school: { label: 'School & IEP', color: '#a8ddc9', questions: [
    "Does my child qualify for an IEP, and how do we request an evaluation?",
    "What services are typically included in an IEP for an autistic child?",
    "What are our rights as parents in the IEP process?",
    "How do I advocate for my child if the school pushes back?",
    "What should I look for in a classroom environment?",
    "Should we request a 1:1 aide, and how do we make that case?",
    "How can we ensure consistency between school and home?",
  ]},
  medication: { label: 'Medication', color: COLORS.purpleLight, questions: [
    "Are there medications that help with the challenges my child is having?",
    "What are the benefits vs. risks of the medications you're recommending?",
    "How will we know if the medication is working?",
    "What side effects should I watch for?",
    "How long before we see effects, and how long would my child be on this?",
    "Are there non-medication alternatives we should try first?",
    "How does medication interact with my child's other treatments?",
  ]},
  development: { label: 'Development & Milestones', color: '#f5c6a0', questions: [
    "Is my child's development on track in areas outside of autism?",
    "Should we monitor any specific developmental areas more closely?",
    "What milestones should I be watching for in the next 6-12 months?",
    "Are there any developmental concerns I might be missing?",
    "How does early intervention affect long-term outcomes?",
    "What does the research say about outcomes for children with my child's profile?",
  ]},
  family: { label: 'Family Support', color: '#a3c4f3', questions: [
    "What resources are available for parents and caregivers?",
    "How do I help siblings understand and support their autistic brother/sister?",
    "Where can I find parent support groups or communities?",
    "Are there respite care options available in our area?",
    "How do I manage my own stress and avoid burnout?",
    "What financial assistance or funding programs should we know about?",
    "Are there books, websites, or courses you recommend for parents?",
  ]},
};
const FOCUS_CHIPS = [
  { key: 'diagnosis',   label: 'Diagnosis',       emoji: '🔍' },
  { key: 'behavior',    label: 'Behavior',         emoji: '💬' },
  { key: 'sensory',     label: 'Sensory',          emoji: '🌊' },
  { key: 'sleep',       label: 'Sleep',            emoji: '🌙' },
  { key: 'eating',      label: 'Eating',           emoji: '🍎' },
  { key: 'therapy',     label: 'Therapy',          emoji: '🧩' },
  { key: 'school',      label: 'School / IEP',     emoji: '🏫' },
  { key: 'medication',  label: 'Medication',       emoji: '💊' },
  { key: 'development', label: 'Development',      emoji: '📈' },
  { key: 'family',      label: 'Family Support',   emoji: '❤️' },
];
const VISIT_TYPES = [
  'Pediatrician / Well-child visit',
  'Developmental Pediatrician',
  'Neuropsychologist',
  'Occupational Therapist (OT)',
  'Speech-Language Pathologist (SLP)',
  'ABA / Behavior Analyst',
  'Psychiatrist',
  'School / IEP Meeting',
  'Other',
];
const EMPTY_DRAFT: PrepDraft = {
  providerName: '', apptDate: '', visitType: VISIT_TYPES[0], childName: '',
  recentChanges: '', wins: '', challenges: '', therapies: '',
  medications: '', lastEval: '', topPriority: '', hopingFor: '',
  worriedAbout: '', afterAppt: '',
  selectedFocus: [], checkedQuestions: [], customQuestions: [],
};
const EMPTY_SUMMARY: VisitSummary = {
  childBackground: '', currentTreatment: '', goalsForVisit: '',
  postApptNotes: '', whatProviderSaid: '', nextSteps: '', followUpDate: '',
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { key: 'setup',     label: 'Setup',        emoji: '📋' },
  { key: 'before',    label: 'Before',       emoji: '📝' },
  { key: 'questions', label: 'Questions',    emoji: '❓' },
  { key: 'saved',     label: 'Saved Notes',  emoji: '💾' },
] as const;
type TabKey = typeof STEPS[number]['key'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProviderPrepScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('setup');
  const [draft, setDraft] = useState<PrepDraft>(EMPTY_DRAFT);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [customQInput, setCustomQInput] = useState('');
  const [visitTypeOpen, setVisitTypeOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState<SavedNote | null>(null);
  const [summaryDraft, setSummaryDraft] = useState<VisitSummary>(EMPTY_SUMMARY);
  const [smartFillLoading, setSmartFillLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const [rawDraft, rawSaved, rawProfile] = await Promise.all([
          AsyncStorage.getItem(DRAFT_KEY),
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(PROFILE_KEY),
        ]);
        const profile = rawProfile ? JSON.parse(rawProfile) : {};
        const loaded: PrepDraft = rawDraft ? JSON.parse(rawDraft) : { ...EMPTY_DRAFT };
        if (!loaded.childName && profile.childName) loaded.childName = profile.childName;
        setDraft(loaded);
        setSavedNotes(rawSaved ? JSON.parse(rawSaved) : []);
      } catch (e) { console.warn('ProviderPrep load error', e); }
    })();
  }, []));

  const updateDraft = useCallback((patch: Partial<PrepDraft>) => {
    setDraft(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // ── SmartFill: reads real Observation objects ──────────────────────────────
  const smartFill = useCallback(async () => {
    setSmartFillLoading(true);
    try {
      const raw = await AsyncStorage.getItem(OBS_KEY);
      const obs: any[] = raw ? JSON.parse(raw) : [];
      if (obs.length === 0) {
        Alert.alert('No observations yet', 'Log some daily observations first and this will auto-fill from them!');
        setSmartFillLoading(false);
        return;
      }
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const recent = obs.filter((o: any) => new Date(o.savedAt || o.date).getTime() >= cutoff);
      const pool = recent.length > 0 ? recent : obs.slice(0, 10);

      const winEntries = pool
        .filter((o: any) => o.mood === 'Happy' || o.mood === 'Calm')
        .map((o: any) => `${o.summary}${o.helped ? ` (what helped: ${o.helped})` : ''}`)
        .filter(Boolean);

      const challengeEntries = pool
        .filter((o: any) => o.mood === 'Frustrated' || o.mood === 'Dysregulated' || o.mood === 'Anxious')
        .map((o: any) => `${o.summary}${o.triggers?.length ? ` (triggers: ${o.triggers.join(', ')})` : ''}`)
        .filter(Boolean);

      const recentSummaries = pool.slice(0, 3).map((o: any) => o.summary).filter(Boolean);

      updateDraft({
        wins: winEntries.length > 0 ? winEntries.join('\n') : draft.wins,
        challenges: challengeEntries.length > 0 ? challengeEntries.join('\n') : draft.challenges,
        recentChanges: recentSummaries.length > 0 ? recentSummaries.join('\n') : draft.recentChanges,
      });

      if (winEntries.length === 0 && challengeEntries.length === 0) {
        Alert.alert('Filled from observations', 'Recent summaries added to Recent Changes. Log more observations with mood ratings to auto-fill Wins and Challenges!');
      } else {
        Alert.alert('Auto-filled!', `Pulled ${pool.length} recent observation${pool.length > 1 ? 's' : ''} into your prep notes.`);
      }
    } catch (e) {
      Alert.alert('SmartFill Error', 'Could not auto-fill observations.');
    } finally {
      setSmartFillLoading(false);
    }
  }, [updateDraft, draft]);

  const saveNote = useCallback(async () => {
    if (!draft.providerName || !draft.apptDate) {
      Alert.alert('Missing Info', 'Please enter Provider Name and Appointment Date.');
      return;
    }
    const newNote: SavedNote = {
      id: Date.now(),
      title: `${draft.providerName} — ${draft.apptDate}`,
      date: draft.apptDate,
      savedAt: new Date().toISOString(),
      draft: { ...draft },
    };
    const updatedNotes = [newNote, ...savedNotes];
    setSavedNotes(updatedNotes);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updatedNotes));
    Alert.alert('Note Saved!', 'Your preparation note has been saved. View it in Saved Notes or generate a report from Provider Report.');
    setDraft(EMPTY_DRAFT);
    await AsyncStorage.removeItem(DRAFT_KEY);
    setActiveTab('saved');
  }, [draft, savedNotes]);

  const deleteNote = useCallback(async (id: number) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this saved note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updatedNotes = savedNotes.filter(note => note.id !== id);
          setSavedNotes(updatedNotes);
          await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updatedNotes));
        },
      },
    ]);
  }, [savedNotes]);

  const shareNote = useCallback(async (note: SavedNote) => {
    const d = note.draft;
    let content = `Provider Prep Note: ${note.title}\n\n`;
    if (d.childName) content += `Child: ${d.childName}\n`;
    if (d.visitType) content += `Visit Type: ${d.visitType}\n\n`;
    if (d.recentChanges) content += `Recent Changes:\n${d.recentChanges}\n\n`;
    if (d.wins) content += `Wins / Progress:\n${d.wins}\n\n`;
    if (d.challenges) content += `Challenges:\n${d.challenges}\n\n`;
    if (d.topPriority) content += `Top Priority:\n${d.topPriority}\n\n`;
    if (d.hopingFor) content += `Hoping For:\n${d.hopingFor}\n\n`;
    if (d.worriedAbout) content += `Worried About:\n${d.worriedAbout}\n\n`;
    if (d.checkedQuestions.length > 0 || d.customQuestions.length > 0) {
      content += 'Questions for Provider:\n';
      d.selectedFocus.forEach(focusKey => {
        const bank = QUESTION_BANK[focusKey];
        if (bank) bank.questions.forEach(q => { if (d.checkedQuestions.includes(q)) content += `- ${q}\n`; });
      });
      d.customQuestions.forEach(q => { content += `- ${q}\n`; });
      content += '\n';
    }
    if (note.visitSummary) {
      content += '--- Visit Summary ---\n\n';
      if (note.visitSummary.whatProviderSaid) content += `What Provider Said:\n${note.visitSummary.whatProviderSaid}\n\n`;
      if (note.visitSummary.nextSteps) content += `Next Steps:\n${note.visitSummary.nextSteps}\n\n`;
      if (note.visitSummary.followUpDate) content += `Follow-up Date: ${note.visitSummary.followUpDate}\n`;
    }
    try {
      await Share.share({ message: content, title: `Provider Prep: ${note.title}` });
    } catch (error: any) {
      Alert.alert('Share Error', error.message);
    }
  }, []);

  const saveSummary = useCallback(async (noteId: number) => {
    const noteIndex = savedNotes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;
    const updatedNotes = [...savedNotes];
    updatedNotes[noteIndex] = { ...updatedNotes[noteIndex], visitSummary: summaryDraft };
    setSavedNotes(updatedNotes);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updatedNotes));
    Alert.alert('Summary Saved', 'Visit summary has been saved.');
    setSummaryModal(null);
    setSummaryDraft(EMPTY_SUMMARY);
  }, [savedNotes, summaryDraft]);

  const currentStepIndex = STEPS.findIndex(s => s.key === activeTab);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── AP-branded Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Prep</Text>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.homeBtn}>
            <Text style={styles.homeText}>🏠</Text>
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.rainbow}
        />
      </View>

      {/* ── Pathway step tabs ── */}
      <View style={styles.stepsRow}>
        {STEPS.map((step, i) => {
          const isActive = step.key === activeTab;
          const isDone = i < currentStepIndex;
          return (
            <TouchableOpacity
              key={step.key}
              style={[styles.stepBtn, isActive && styles.stepBtnActive]}
              onPress={() => setActiveTab(step.key)}
            >
              <Text style={styles.stepEmoji}>{isDone ? '✓' : step.emoji}</Text>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── SETUP TAB ── */}
        {activeTab === 'setup' && (
          <View>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Appointment Details</Text>
              <Text style={styles.sectionSub}>Fill in the basics so your prep note is ready to share.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Provider Name <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={draft.providerName} onChangeText={text => updateDraft({ providerName: text })} placeholder="e.g. Dr. Smith" placeholderTextColor={COLORS.textLight} />
              <Text style={styles.fieldLabel}>Appointment Date <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={draft.apptDate} onChangeText={text => updateDraft({ apptDate: text })} placeholder="MM/DD/YYYY" placeholderTextColor={COLORS.textLight} />
              <Text style={styles.fieldLabel}>Visit Type</Text>
              <TouchableOpacity style={styles.dropdownBtn} onPress={() => setVisitTypeOpen(!visitTypeOpen)}>
                <Text style={styles.dropdownBtnText}>{draft.visitType}</Text>
                <Text style={styles.dropdownArrow}>{visitTypeOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {visitTypeOpen && (
                <View style={styles.dropdownList}>
                  {VISIT_TYPES.map((type) => (
                    <TouchableOpacity key={type} style={[styles.dropdownItem, draft.visitType === type && styles.dropdownItemActive]} onPress={() => { updateDraft({ visitType: type }); setVisitTypeOpen(false); }}>
                      <Text style={[styles.dropdownItemText, draft.visitType === type && styles.dropdownItemTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.fieldLabel}>Child's Name</Text>
              <TextInput style={styles.input} value={draft.childName} onChangeText={text => updateDraft({ childName: text })} placeholder="e.g. Alex" placeholderTextColor={COLORS.textLight} />
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveTab('before')}>
              <Text style={styles.nextBtnText}>Next: Before Appointment →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── BEFORE TAB ── */}
        {activeTab === 'before' && (
          <View>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Before the Appointment</Text>
              <Text style={styles.sectionSub}>Document what's been happening so you're ready to share the full picture.</Text>
            </View>
            <TouchableOpacity style={styles.smartFillBtn} onPress={smartFill} disabled={smartFillLoading}>
              <Text style={styles.smartFillIcon}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.smartFillTitle}>{smartFillLoading ? 'Filling from observations…' : 'Auto-fill from Recent Observations'}</Text>
                <Text style={styles.smartFillSub}>Pulls wins, challenges, and recent changes from your observation log</Text>
              </View>
            </TouchableOpacity>
            {[
              { key: 'recentChanges', label: 'Recent Changes / Updates', placeholder: 'Any new behaviors, skills, challenges, or changes since last visit?' },
              { key: 'wins', label: 'Wins / Progress', placeholder: 'What positive developments or progress have you seen?' },
              { key: 'challenges', label: 'Challenges / Concerns', placeholder: 'What are the main difficulties or concerns you want to address?' },
              { key: 'therapies', label: 'Current Therapies', placeholder: 'List all current therapies (ABA, OT, SLP, etc.) and frequency.' },
              { key: 'medications', label: 'Medications & Supplements', placeholder: 'List all medications, dosages, and any supplements.' },
              { key: 'lastEval', label: 'Last Evaluation / Diagnosis', placeholder: 'Date and type of last evaluation or diagnosis.' },
              { key: 'topPriority', label: 'Top Priority for this Visit', placeholder: 'What is the single most important thing you want to discuss?' },
              { key: 'hopingFor', label: 'Hoping For / Goals', placeholder: 'What outcomes or insights are you hoping to get?' },
              { key: 'worriedAbout', label: 'Worried About', placeholder: 'Any specific concerns or anxieties about the appointment?' },
              { key: 'afterAppt', label: 'After the Appointment', placeholder: 'What do you plan to do after the appointment?' },
            ].map(({ key, label, placeholder }) => (
              <View key={key} style={styles.card}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput style={[styles.input, styles.textarea]} value={(draft as any)[key]} onChangeText={text => updateDraft({ [key]: text } as any)} multiline placeholder={placeholder} placeholderTextColor={COLORS.textLight} />
              </View>
            ))}
            <TouchableOpacity style={styles.nextBtn} onPress={() => setActiveTab('questions')}>
              <Text style={styles.nextBtnText}>Next: Build Your Questions →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── QUESTIONS TAB ── */}
        {activeTab === 'questions' && (
          <View>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Questions for Your Provider</Text>
              <Text style={styles.sectionSub}>Select focus areas, then check the questions you want to ask.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Areas of Focus</Text>
              <View style={styles.chipRow}>
                {FOCUS_CHIPS.map(chip => {
                  const isSelected = draft.selectedFocus.includes(chip.key);
                  return (
                    <TouchableOpacity key={chip.key} style={[styles.focusChip, isSelected && styles.focusChipActive]} onPress={() => { updateDraft({ selectedFocus: isSelected ? draft.selectedFocus.filter(k => k !== chip.key) : [...draft.selectedFocus, chip.key] }); }}>
                      <Text style={styles.focusChipEmoji}>{chip.emoji}</Text>
                      <Text style={[styles.focusChipText, isSelected && styles.focusChipTextActive]}>{chip.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {draft.selectedFocus.map(focusKey => {
              const bank = QUESTION_BANK[focusKey];
              if (!bank) return null;
              return (
                <View key={focusKey} style={styles.card}>
                  <Text style={[styles.bankTitle, { color: bank.color }]}>{bank.label}</Text>
                  {bank.questions.map((question, qIndex) => {
                    const isChecked = draft.checkedQuestions.includes(question);
                    return (
                      <TouchableOpacity key={qIndex} style={styles.questionRow} onPress={() => { updateDraft({ checkedQuestions: isChecked ? draft.checkedQuestions.filter(q => q !== question) : [...draft.checkedQuestions, question] }); }}>
                        <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                          {isChecked && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={[styles.questionText, isChecked && styles.questionTextActive]}>{question}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Your Own Questions</Text>
              <View style={styles.customQRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={customQInput} onChangeText={setCustomQInput} placeholder="Add your own question" placeholderTextColor={COLORS.textLight} />
                <TouchableOpacity style={styles.addQBtn} onPress={() => { if (customQInput.trim()) { updateDraft({ customQuestions: [...draft.customQuestions, customQInput.trim()] }); setCustomQInput(''); } }}>
                  <Text style={styles.addQBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              {draft.customQuestions.map((q, i) => (
                <View key={i} style={styles.customQItem}>
                  <Text style={styles.customQText}>• {q}</Text>
                  <TouchableOpacity onPress={() => { updateDraft({ customQuestions: draft.customQuestions.filter((_, idx) => idx !== i) }); }}>
                    <Text style={styles.customQRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveNote}>
              <Text style={styles.saveBtnText}>💾 Save Preparation Note</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SAVED NOTES TAB ── */}
        {activeTab === 'saved' && (
          <View>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Saved Notes</Text>
              <Text style={styles.sectionSub}>Your past visit preparation notes. Add a visit summary or generate a report.</Text>
            </View>
            <TouchableOpacity style={styles.reportBanner} onPress={() => router.push('/provider-report')}>
              <Text style={styles.reportBannerIcon}>📄</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportBannerTitle}>Generate a Provider Report</Text>
                <Text style={styles.reportBannerSub}>Turn your saved notes into a printable PDF report to share with providers</Text>
              </View>
              <Text style={styles.reportBannerArrow}>→</Text>
            </TouchableOpacity>
            {savedNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No saved notes yet</Text>
                <Text style={styles.emptySub}>Complete Setup and Questions, then tap Save to create your first prep note.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('setup')}>
                  <Text style={styles.emptyBtnText}>Start Prep →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedNotes.map(note => (
                <View key={note.id} style={styles.savedCard}>
                  <View style={styles.savedCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedCardTitle}>{note.title}</Text>
                      <Text style={styles.savedCardDate}>Saved {new Date(note.savedAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  {note.visitSummary?.whatProviderSaid ? (
                    <View style={styles.summaryPreview}>
                      <Text style={styles.summaryPreviewLabel}>Provider said:</Text>
                      <Text style={styles.summaryPreviewText} numberOfLines={2}>{note.visitSummary.whatProviderSaid}</Text>
                    </View>
                  ) : null}
                  <View style={styles.savedCardActions}>
                    <TouchableOpacity style={styles.savedActionBtn} onPress={() => { setSummaryDraft(note.visitSummary || EMPTY_SUMMARY); setSummaryModal(note); }}>
                      <Text style={styles.savedActionBtnText}>+ Visit Summary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.savedActionBtn} onPress={() => shareNote(note)}>
                      <Text style={styles.savedActionBtnText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.savedActionBtn, styles.savedActionBtnDanger]} onPress={() => deleteNote(note.id)}>
                      <Text style={styles.savedActionBtnDangerText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Visit Summary Modal ── */}
      <Modal visible={!!summaryModal} animationType="slide" transparent onRequestClose={() => setSummaryModal(null)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Visit Summary</Text>
            <Text style={styles.modalSub}>{summaryModal?.title}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: 'childBackground', label: 'Child Background', placeholder: 'Key background info shared with provider' },
                { key: 'currentTreatment', label: 'Current Treatment', placeholder: 'Current therapies, medications, interventions' },
                { key: 'goalsForVisit', label: 'Goals for Visit', placeholder: 'What you hoped to achieve' },
                { key: 'whatProviderSaid', label: 'What Provider Said', placeholder: 'Key takeaways, diagnoses, recommendations' },
                { key: 'postApptNotes', label: 'Post-Appointment Notes', placeholder: 'Your immediate thoughts and reflections' },
                { key: 'nextSteps', label: 'Next Steps', placeholder: 'Actions to take, referrals, follow-up appointments' },
              ].map(({ key, label, placeholder }) => (
                <View key={key} style={{ marginBottom: SPACING.md }}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput style={[styles.input, styles.textarea]} value={(summaryDraft as any)[key]} onChangeText={text => setSummaryDraft(prev => ({ ...prev, [key]: text }))} multiline placeholder={placeholder} placeholderTextColor={COLORS.textLight} />
                </View>
              ))}
              <Text style={styles.fieldLabel}>Follow-up Date</Text>
              <TextInput style={styles.input} value={summaryDraft.followUpDate} onChangeText={text => setSummaryDraft(prev => ({ ...prev, followUpDate: text }))} placeholder="MM/DD/YYYY" placeholderTextColor={COLORS.textLight} />
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={() => summaryModal && saveSummary(summaryModal.id)}>
              <Text style={styles.saveBtnText}>Save Summary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSummaryModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  backBtn: { paddingVertical: SPACING.xs },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  homeBtn: { paddingVertical: SPACING.xs },
  homeText: { fontSize: 20 },
  rainbow: { height: 4 },
  stepsRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  stepBtnActive: { borderBottomColor: COLORS.purple },
  stepEmoji: { fontSize: 16, marginBottom: 2 },
  stepLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textLight },
  stepLabelActive: { color: COLORS.purple, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionIntro: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  sectionSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.sm },
  required: { color: COLORS.errorText },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: FONT_SIZES.base, color: COLORS.text, marginBottom: SPACING.md },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  dropdownBtn: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  dropdownBtnText: { fontSize: FONT_SIZES.base, color: COLORS.text },
  dropdownArrow: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  dropdownList: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, marginBottom: SPACING.md, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemActive: { backgroundColor: COLORS.lavender },
  dropdownItemText: { fontSize: FONT_SIZES.base, color: COLORS.text },
  dropdownItemTextActive: { color: COLORS.purple, fontWeight: '700' },
  smartFillBtn: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.lavenderAccent, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg, ...SHADOWS.sm },
  smartFillIcon: { fontSize: 24 },
  smartFillTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  smartFillSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  focusChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  focusChipActive: { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent },
  focusChipEmoji: { fontSize: 14 },
  focusChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  focusChipTextActive: { color: COLORS.purple },
  bankTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginBottom: SPACING.md },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  checkboxActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  questionText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  questionTextActive: { color: COLORS.text, fontWeight: '600' },
  customQRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginBottom: SPACING.sm },
  addQBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  addQBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  customQItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SPACING.xs },
  customQText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  customQRemove: { fontSize: 14, color: COLORS.textLight, paddingLeft: SPACING.sm },
  nextBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.lg, alignItems: 'center', marginBottom: SPACING.xl, ...SHADOWS.md },
  nextBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.base },
  saveBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.md },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.base },
  reportBanner: { backgroundColor: COLORS.mint, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.mintAccent, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg, ...SHADOWS.sm },
  reportBannerIcon: { fontSize: 24 },
  reportBannerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.successText },
  reportBannerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  reportBannerArrow: { fontSize: FONT_SIZES.lg, color: COLORS.successText },
  savedCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.sm },
  savedCardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACING.lg },
  savedCardTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  savedCardDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  summaryPreview: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  summaryPreviewLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  summaryPreviewText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 18 },
  savedCardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  savedActionBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRightWidth: 1, borderRightColor: COLORS.border },
  savedActionBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.purple },
  savedActionBtnDanger: { borderRightWidth: 0 },
  savedActionBtnDangerText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.errorText },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 260, marginBottom: SPACING.xl },
  emptyBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: SPACING.xl, maxHeight: '90%' },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  modalSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.lg },
  modalCloseBtn: { backgroundColor: COLORS.bg, borderRadius: RADIUS.pill, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  modalCloseBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
});
