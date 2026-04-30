import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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
  diagnosis: { label: 'Diagnosis & Evaluation', color: '#b8a9e8', questions: [
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
  sleep: { label: 'Sleep', color: '#b8a9e8', questions: [
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
  medication: { label: 'Medication', color: '#b8a9e8', questions: [
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
  { key: 'diagnosis',   label: 'Diagnosis / Evaluation',   emoji: '🔍' },
  { key: 'behavior',    label: 'Behavior & Communication', emoji: '💬' },
  { key: 'sensory',     label: 'Sensory Sensitivities',    emoji: '🌊' },
  { key: 'sleep',       label: 'Sleep',                    emoji: '🌙' },
  { key: 'eating',      label: 'Eating & Feeding',         emoji: '🍎' },
  { key: 'therapy',     label: 'Therapy Options',          emoji: '🧩' },
  { key: 'school',      label: 'School & IEP',             emoji: '🏫' },
  { key: 'medication',  label: 'Medication',               emoji: '💊' },
  { key: 'development', label: 'Development & Milestones', emoji: '📈' },
  { key: 'family',      label: 'Family Support',           emoji: '❤️' },
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProviderPrepScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'setup' | 'before' | 'questions' | 'saved'>('setup');
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
      const recent = obs.filter((o: any) => new Date(o.date).getTime() >= cutoff);
      const pool = recent.length > 0 ? recent : obs.slice(0, 10);

      const tagCounts: Record<string, number> = {};
      const triggerCounts: Record<string, number> = {};
      const summaries: string[] = [];

      pool.forEach((o: any) => {
        if (o.summary) summaries.push(o.summary);
        (o.tags || []).forEach((t: string) => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
        (o.triggers || []).forEach((t: string) => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; });
      });

      const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
      const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

      const recentChanges = summaries.slice(0, 3).join(' | ') || '';
      const challenges = topTags.length > 0
        ? `Frequently observed: ${topTags.join(', ')}.${topTriggers.length > 0 ? ` Common triggers: ${topTriggers.join(', ')}.` : ''}`
        : '';
      const worriedAbout = topTriggers.length > 0
        ? `Concerned about patterns around: ${topTriggers.join(', ')}.`
        : '';

      updateDraft({ recentChanges, challenges, worriedAbout });
      Alert.alert('Smart Fill Complete!', `Pulled from ${pool.length} recent observations. Review and edit the fields below.`);
    } catch (e) {
      Alert.alert('Error', 'Could not load observations.');
    }
    setSmartFillLoading(false);
  }, [updateDraft]);

  const saveNotes = useCallback(async () => {
    try {
      const entry: SavedNote = {
        id: Date.now(),
        title: draft.providerName || 'Appointment',
        date: draft.apptDate || new Date().toISOString().split('T')[0],
        savedAt: new Date().toLocaleString(),
        draft: { ...draft },
      };
      const next = [entry, ...savedNotes].slice(0, 20);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSavedNotes(next);
      Alert.alert('Saved!', 'Your prep notes have been saved.');
      setActiveTab('saved');
    } catch (e) { Alert.alert('Error', 'Could not save notes.'); }
  }, [draft, savedNotes]);

  const deleteNote = useCallback(async (id: number) => {
    Alert.alert('Delete?', 'Remove this saved session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const next = savedNotes.filter(n => n.id !== id);
        await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setSavedNotes(next);
      }},
    ]);
  }, [savedNotes]);

  const loadNote = useCallback((note: SavedNote) => {
    setDraft(note.draft);
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(note.draft)).catch(() => {});
    setActiveTab('setup');
    Alert.alert('Loaded!', `"${note.title}" has been loaded into the form.`);
  }, []);

  const openSummary = useCallback((note: SavedNote) => {
    setSummaryModal(note);
    setSummaryDraft(note.visitSummary ?? {
      ...EMPTY_SUMMARY,
      childBackground: note.draft.childName ? `Child: ${note.draft.childName}` : '',
      currentTreatment: note.draft.therapies || '',
      goalsForVisit: note.draft.checkedQuestions.slice(0, 5).join('\n') || '',
      postApptNotes: note.draft.afterAppt || '',
    });
  }, []);

  const saveSummary = useCallback(async () => {
    if (!summaryModal) return;
    try {
      const next = savedNotes.map(n => n.id === summaryModal.id ? { ...n, visitSummary: summaryDraft } : n);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSavedNotes(next);
      setSummaryModal(null);
      Alert.alert('Visit Summary Saved!');
    } catch (e) { Alert.alert('Error', 'Could not save summary.'); }
  }, [summaryModal, summaryDraft, savedNotes]);

  const shareSummary = useCallback(async () => {
    if (!summaryModal) return;
    const lines = [
      `APPOINTMENT REPORT - ${summaryModal.title}`,
      `Date: ${summaryModal.date}`,
      summaryModal.draft.visitType ? `Visit Type: ${summaryModal.draft.visitType}` : '',
      summaryModal.draft.childName ? `Child: ${summaryModal.draft.childName}` : '',
      '',
      summaryDraft.childBackground ? `CHILD BACKGROUND\n${summaryDraft.childBackground}` : '',
      summaryDraft.currentTreatment ? `CURRENT TREATMENT\n${summaryDraft.currentTreatment}` : '',
      summaryDraft.goalsForVisit ? `GOALS FOR THIS VISIT\n${summaryDraft.goalsForVisit}` : '',
      summaryDraft.whatProviderSaid ? `WHAT THE PROVIDER SAID\n${summaryDraft.whatProviderSaid}` : '',
      summaryDraft.nextSteps ? `NEXT STEPS\n${summaryDraft.nextSteps}` : '',
      summaryDraft.postApptNotes ? `POST-APPOINTMENT NOTES\n${summaryDraft.postApptNotes}` : '',
      summaryDraft.followUpDate ? `Follow-up: ${summaryDraft.followUpDate}` : '',
    ].filter(Boolean).join('\n\n');
    await Share.share({ message: lines });
  }, [summaryModal, summaryDraft]);

  const toggleQuestion = useCallback((qKey: string) => {
    const checked = draft.checkedQuestions.includes(qKey)
      ? draft.checkedQuestions.filter(k => k !== qKey)
      : [...draft.checkedQuestions, qKey];
    updateDraft({ checkedQuestions: checked });
  }, [draft.checkedQuestions, updateDraft]);

  const toggleFocus = useCallback((key: string) => {
    const sel = draft.selectedFocus.includes(key)
      ? draft.selectedFocus.filter(k => k !== key)
      : [...draft.selectedFocus, key];
    updateDraft({ selectedFocus: sel });
  }, [draft.selectedFocus, updateDraft]);

  const addCustomQ = useCallback(() => {
    if (!customQInput.trim()) return;
    updateDraft({ customQuestions: [...draft.customQuestions, customQInput.trim()] });
    setCustomQInput('');
  }, [customQInput, draft.customQuestions, updateDraft]);

  const removeCustomQ = useCallback((idx: number) => {
    updateDraft({ customQuestions: draft.customQuestions.filter((_, i) => i !== idx) });
  }, [draft.customQuestions, updateDraft]);

  const totalQ = draft.selectedFocus.reduce((acc, k) => acc + (QUESTION_BANK[k]?.questions.length ?? 0), 0) + draft.customQuestions.length;
  const checkedCount = draft.checkedQuestions.length;
  const pct = totalQ > 0 ? Math.round((checkedCount / totalQ) * 100) : 0;

  const clearAll = () => {
    Alert.alert('Clear all fields?', 'Your saved notes will not be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { setDraft(EMPTY_DRAFT); AsyncStorage.removeItem(DRAFT_KEY); } },
    ]);
  };

  return (
    <View style={s.root}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Provider Prep</Text>
        <Text style={s.headerSub}>Get ready for every appointment</Text>
      </View>

      {/* ── Tip banner ─────────────────────────────────────────────── */}
      <View style={s.tipBanner}>
        <Text style={s.tipIcon}>💡</Text>
        <Text style={s.tipText}>
          <Text style={s.tipBold}>You know your child best.</Text>
          {' '}Use this tool to capture what matters most before appointments — so nothing gets forgotten in the moment.
        </Text>
      </View>

      {/* ── Tab bar ────────────────────────────────────────────────── */}
      <View style={s.tabBar}>
        {(['setup', 'before', 'questions', 'saved'] as const).map(tab => {
          const icons = { setup: '📋', before: '✏️', questions: '❓', saved: '📂' };
          return (
            <TouchableOpacity key={tab} style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={s.tabIcon}>{icons[tab]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ════════════════ TAB 1: SETUP ════════════════ */}
          {activeTab === 'setup' && (
            <View>
              <SCard icon="📅" title="Appointment Setup" sub="Tell us about the upcoming visit">
                <FL>Provider / Clinic Name</FL>
                <TextInput style={s.input} placeholder="e.g. Dr. Jones, Children's Hospital" placeholderTextColor="#9a9ab0" value={draft.providerName} onChangeText={v => updateDraft({ providerName: v })} />
                <FL>Appointment Date</FL>
                <TextInput style={s.input} placeholder="e.g. May 15, 2026" placeholderTextColor="#9a9ab0" value={draft.apptDate} onChangeText={v => updateDraft({ apptDate: v })} />
                <FL>Type of Visit</FL>
                <TouchableOpacity style={s.picker} onPress={() => setVisitTypeOpen(true)}>
                  <Text style={s.pickerTxt}>{draft.visitType || 'Select visit type'}</Text>
                  <Text style={s.pickerArrow}>▾</Text>
                </TouchableOpacity>
                <FL>Child's Name <Text style={s.optional}>(optional)</Text></FL>
                <TextInput style={s.input} placeholder="e.g. Ellie" placeholderTextColor="#9a9ab0" value={draft.childName} onChangeText={v => updateDraft({ childName: v })} />
              </SCard>
              <BtnRow onSave={saveNotes} onClear={clearAll} />
            </View>
          )}

          {/* ════════════════ TAB 2: BEFORE ════════════════ */}
          {activeTab === 'before' && (
            <View>
              <TouchableOpacity style={s.smartFillBtn} onPress={smartFill} disabled={smartFillLoading}>
                <Text style={s.sfIcon}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.sfTitle}>{smartFillLoading ? 'Filling from observations...' : 'Smart Fill from Observations'}</Text>
                  <Text style={s.sfSub}>Auto-populate from your last 14 days of daily logs</Text>
                </View>
                <Text style={s.sfArrow}>→</Text>
              </TouchableOpacity>

              <SCard icon="✏️" title="Before the Appointment" sub="Capture what's been happening lately">
                <FL>Recent Changes or Concerns</FL>
                <TextInput style={[s.input, s.ta]} placeholder="e.g. More meltdowns over the past 2 weeks, especially during transitions." placeholderTextColor="#9a9ab0" multiline value={draft.recentChanges} onChangeText={v => updateDraft({ recentChanges: v })} />
                <FL>Progress & Wins ⭐</FL>
                <TextInput style={[s.input, s.ta]} placeholder="e.g. Said 3 new words this week. Slept through the night twice." placeholderTextColor="#9a9ab0" multiline value={draft.wins} onChangeText={v => updateDraft({ wins: v })} />
                <FL>Ongoing Challenges</FL>
                <TextInput style={[s.input, s.ta]} placeholder="e.g. Still struggling with transitions. Covering ears in public." placeholderTextColor="#9a9ab0" multiline value={draft.challenges} onChangeText={v => updateDraft({ challenges: v })} />
                <FL>Current Therapies / Services</FL>
                <TextInput style={s.input} placeholder="e.g. OT 2x/week, Speech 1x/week, ABA 10 hrs/week" placeholderTextColor="#9a9ab0" value={draft.therapies} onChangeText={v => updateDraft({ therapies: v })} />
                <FL>Current Medications</FL>
                <TextInput style={s.input} placeholder="e.g. Melatonin 2mg at bedtime" placeholderTextColor="#9a9ab0" value={draft.medications} onChangeText={v => updateDraft({ medications: v })} />
                <FL>Last Evaluation Date</FL>
                <TextInput style={s.input} placeholder="e.g. March 2025" placeholderTextColor="#9a9ab0" value={draft.lastEval} onChangeText={v => updateDraft({ lastEval: v })} />
              </SCard>

              <SCard icon="💭" title="What I Most Want to Talk About" sub="Your top priorities for this visit">
                <FL>Most Important Topic</FL>
                <TextInput style={[s.input, s.ta]} placeholder="If we only have time for one thing, I most want to discuss..." placeholderTextColor="#9a9ab0" multiline value={draft.topPriority} onChangeText={v => updateDraft({ topPriority: v })} />
                <FL>What I'm Hoping to Hear</FL>
                <TextInput style={[s.input, s.ta]} placeholder="e.g. A referral for evaluation, guidance on the meltdowns, advice on sleep..." placeholderTextColor="#9a9ab0" multiline value={draft.hopingFor} onChangeText={v => updateDraft({ hopingFor: v })} />
                <FL>What I'm Worried About</FL>
                <TextInput style={[s.input, s.ta]} placeholder="e.g. I'm worried they'll dismiss my concerns. I'm not sure if this is typical..." placeholderTextColor="#9a9ab0" multiline value={draft.worriedAbout} onChangeText={v => updateDraft({ worriedAbout: v })} />
                <FL>After-Appointment Notes</FL>
                <TextInput style={[s.input, s.ta]} placeholder="Fill this in after your visit — what did the provider say? What are next steps?" placeholderTextColor="#9a9ab0" multiline value={draft.afterAppt} onChangeText={v => updateDraft({ afterAppt: v })} />
              </SCard>
              <BtnRow onSave={saveNotes} onClear={clearAll} />
            </View>
          )}

          {/* ════════════════ TAB 3: QUESTIONS ════════════════ */}
          {activeTab === 'questions' && (
            <View>
              <SCard icon="❓" title="Your Question List" sub="Check off what you want to ask — add your own too">
                {/* Progress */}
                <View style={s.progRow}>
                  <View style={s.progTrack}>
                    <View style={[s.progFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={s.progLabel}>{totalQ > 0 ? `${checkedCount} of ${totalQ} selected` : '0 selected'}</Text>
                </View>

                {/* Focus chips */}
                <Text style={s.focusTitle}>What would you like to focus on today?</Text>
                <Text style={s.focusSub}>Select all that apply — we'll suggest relevant questions.</Text>
                <View style={s.chipWrap}>
                  {FOCUS_CHIPS.map(fc => (
                    <TouchableOpacity key={fc.key} style={[s.chip, draft.selectedFocus.includes(fc.key) && s.chipOn]} onPress={() => toggleFocus(fc.key)}>
                      <Text style={s.chipEmoji}>{fc.emoji}</Text>
                      <Text style={[s.chipTxt, draft.selectedFocus.includes(fc.key) && s.chipTxtOn]}>{fc.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Questions */}
                {draft.selectedFocus.length === 0 && draft.customQuestions.length === 0 ? (
                  <View style={s.emptyQ}>
                    <Text style={s.emptyQIcon}>💭</Text>
                    <Text style={s.emptyQTxt}>Select focus areas above to generate{'\n'}relevant questions for your appointment.</Text>
                  </View>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    {draft.selectedFocus.map(fk => {
                      const cat = QUESTION_BANK[fk];
                      const fc = FOCUS_CHIPS.find(f => f.key === fk);
                      if (!cat) return null;
                      return (
                        <View key={fk} style={s.qCat}>
                          <View style={s.qCatHead}>
                            <View style={[s.qDot, { backgroundColor: cat.color }]} />
                            <Text style={s.qCatLabel}>{fc?.emoji} {cat.label}</Text>
                            <Text style={s.qCatCount}>{cat.questions.length}q</Text>
                          </View>
                          {cat.questions.map((q, i) => {
                            const qk = `${fk}-${i}`;
                            const on = draft.checkedQuestions.includes(qk);
                            return (
                              <TouchableOpacity key={qk} style={[s.qItem, on && s.qItemOn]} onPress={() => toggleQuestion(qk)}>
                                <View style={[s.qBox, on && s.qBoxOn]}>{on && <Text style={s.qCheck}>✓</Text>}</View>
                                <Text style={[s.qTxt, on && s.qTxtOn]}>{q}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      );
                    })}
                    {draft.customQuestions.length > 0 && (
                      <View style={s.qCat}>
                        <View style={s.qCatHead}>
                          <View style={[s.qDot, { backgroundColor: '#f5c6a0' }]} />
                          <Text style={s.qCatLabel}>✏️ My Own Questions</Text>
                          <Text style={s.qCatCount}>{draft.customQuestions.length}q</Text>
                        </View>
                        {draft.customQuestions.map((q, i) => {
                          const qk = `custom-${i}`;
                          const on = draft.checkedQuestions.includes(qk);
                          return (
                            <View key={qk} style={[s.qItem, on && s.qItemOn]}>
                              <TouchableOpacity style={[s.qBox, on && s.qBoxOn]} onPress={() => toggleQuestion(qk)}>
                                {on && <Text style={s.qCheck}>✓</Text>}
                              </TouchableOpacity>
                              <Text style={[s.qTxt, on && s.qTxtOn, { flex: 1 }]}>{q}</Text>
                              <TouchableOpacity onPress={() => removeCustomQ(i)} style={s.qRm}><Text style={s.qRmTxt}>✕</Text></TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                {/* Add custom */}
                <View style={s.customRow}>
                  <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} placeholder="Add your own question..." placeholderTextColor="#9a9ab0" value={customQInput} onChangeText={setCustomQInput} onSubmitEditing={addCustomQ} />
                  <TouchableOpacity style={s.addQBtn} onPress={addCustomQ}><Text style={s.addQTxt}>Add</Text></TouchableOpacity>
                </View>
              </SCard>
              <BtnRow onSave={saveNotes} onClear={clearAll} />
            </View>
          )}

          {/* ════════════════ TAB 4: SAVED ════════════════ */}
          {activeTab === 'saved' && (
            <SCard icon="📂" title="Saved Appointment Notes" sub="Your saved prep sessions">
              {savedNotes.length === 0 ? (
                <View style={s.emptyQ}>
                  <Text style={s.emptyQIcon}>📂</Text>
                  <Text style={s.emptyQTxt}>No saved notes yet.{'\n'}Fill out Appointment Notes and tap <Text style={{ fontWeight: '700', color: '#7c6fd4' }}>Save</Text>.</Text>
                </View>
              ) : (
                savedNotes.map(note => (
                  <View key={note.id} style={s.savedCard}>
                    <View style={s.savedHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.savedTitle}>{note.title}</Text>
                        <Text style={s.savedMeta}>📅 {note.date}  ·  Saved {note.savedAt}</Text>
                        {note.draft.visitType ? <Text style={s.savedType}>{note.draft.visitType}</Text> : null}
                      </View>
                      <View style={s.savedActions}>
                        <TouchableOpacity style={s.savedBtn} onPress={() => loadNote(note)}><Text style={s.savedBtnTxt}>📂 Load</Text></TouchableOpacity>
                        <TouchableOpacity style={s.savedBtn} onPress={() => deleteNote(note.id)}><Text style={[s.savedBtnTxt, { color: '#e88a8a' }]}>✕</Text></TouchableOpacity>
                      </View>
                    </View>
                    {note.draft.recentChanges ? <Text style={s.savedPreview} numberOfLines={2}>{note.draft.recentChanges}</Text> : null}
                    <TouchableOpacity style={s.summaryBtn} onPress={() => openSummary(note)}>
                      <Text style={s.summaryBtnTxt}>⭐ {note.visitSummary ? 'View Visit Summary' : 'Add Visit Summary'}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </SCard>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Visit Type Picker Modal ─────────────────────────────────── */}
      <Modal visible={visitTypeOpen} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} onPress={() => setVisitTypeOpen(false)} activeOpacity={1}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Type of Visit</Text>
            {VISIT_TYPES.map(vt => (
              <TouchableOpacity key={vt} style={[s.sheetOpt, draft.visitType === vt && s.sheetOptOn]} onPress={() => { updateDraft({ visitType: vt }); setVisitTypeOpen(false); }}>
                <Text style={[s.sheetOptTxt, draft.visitType === vt && s.sheetOptTxtOn]}>{vt}</Text>
                {draft.visitType === vt && <Text style={s.sheetCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Visit Summary Modal (Premium) ──────────────────────────── */}
      <Modal visible={!!summaryModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={[s.sheet, { maxHeight: '92%' }]}>
            <ScrollView>
              <View style={s.sumHero}>
                <Text style={s.sumEyebrow}>APPOINTMENT REPORT</Text>
                <Text style={s.sumProvider}>{summaryModal?.title}</Text>
                <Text style={s.sumDate}>📅 {summaryModal?.date}</Text>
                <View style={s.sumTagRow}>
                  {summaryModal?.draft.visitType ? <View style={s.sumTag}><Text style={s.sumTagTxt}>{summaryModal.draft.visitType}</Text></View> : null}
                  {summaryModal?.draft.childName ? <View style={s.sumTag}><Text style={s.sumTagTxt}>👶 {summaryModal.draft.childName}</Text></View> : null}
                </View>
              </View>

              {([
                { key: 'childBackground' as keyof VisitSummary,  label: 'CHILD BACKGROUND',       icon: '👶', ph: 'Child name, age, diagnosis status...' },
                { key: 'currentTreatment' as keyof VisitSummary, label: 'CURRENT TREATMENT',      icon: '💊', ph: 'Therapies, medications, services...' },
                { key: 'goalsForVisit' as keyof VisitSummary,    label: 'GOALS FOR THIS VISIT',   icon: '🎯', ph: 'What you wanted to discuss...' },
                { key: 'whatProviderSaid' as keyof VisitSummary, label: 'WHAT THE PROVIDER SAID', icon: '🩺', ph: 'Key things the provider told you...' },
                { key: 'nextSteps' as keyof VisitSummary,        label: 'NEXT STEPS',             icon: '➡️', ph: 'Referrals, follow-ups, action items...' },
                { key: 'postApptNotes' as keyof VisitSummary,    label: 'POST-APPOINTMENT NOTES', icon: '📝', ph: 'How did it go? Anything else to remember?' },
                { key: 'followUpDate' as keyof VisitSummary,     label: 'FOLLOW-UP DATE',         icon: '📅', ph: 'e.g. June 15, 2026' },
              ]).map(f => (
                <View key={f.key} style={s.sumSection}>
                  <Text style={s.sumSecTitle}>{f.icon}  {f.label}</Text>
                  <TextInput
                    style={[s.input, f.key !== 'followUpDate' && s.ta]}
                    placeholder={f.ph}
                    placeholderTextColor="#9a9ab0"
                    multiline={f.key !== 'followUpDate'}
                    value={summaryDraft[f.key]}
                    onChangeText={v => setSummaryDraft(prev => ({ ...prev, [f.key]: v }))}
                  />
                </View>
              ))}

              <View style={s.actionRow}>
                <TouchableOpacity style={s.btnP} onPress={saveSummary}><Text style={s.btnPTxt}>💾  Save Summary</Text></TouchableOpacity>
                <TouchableOpacity style={s.btnS} onPress={shareSummary}><Text style={s.btnSTxt}>📋  Copy / Share</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={[s.btnS, { marginHorizontal: 16, marginBottom: 32 }]} onPress={() => setSummaryModal(null)}>
                <Text style={s.btnSTxt}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rainbow bar */}
      <View style={s.rainbow}>
        {['#FF6B6B','#FF9F43','#FECA57','#48DBFB','#FF9FF3','#A29BFE'].map((c, i) => (
          <View key={i} style={[s.rainbowSlice, { backgroundColor: c }]} />
        ))}
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SCard({ icon, title, sub, children }: { icon: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.cardIcon}><Text style={s.cardIconTxt}>{icon}</Text></View>
        <View><Text style={s.cardTitle}>{title}</Text><Text style={s.cardSub}>{sub}</Text></View>
      </View>
      <View style={s.cardBody}>{children}</View>
    </View>
  );
}
function FL({ children }: { children: React.ReactNode }) {
  return <Text style={s.fl}>{children}</Text>;
}
function BtnRow({ onSave, onClear }: { onSave: () => void; onClear: () => void }) {
  return (
    <View style={s.actionRow}>
      <TouchableOpacity style={s.btnP} onPress={onSave}><Text style={s.btnPTxt}>💾  Save Notes</Text></TouchableOpacity>
      <TouchableOpacity style={s.btnS} onPress={onClear}><Text style={s.btnSTxt}>🗑️  Clear All</Text></TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { backgroundColor: '#fff', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E8E8F0' },
  backBtn: { marginBottom: 6 },
  backTxt: { fontSize: 13, color: '#7a7a96', fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#2d2d3a' },
  headerSub: { fontSize: 13, color: '#7a7a96', marginTop: 2 },

  tipBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E8F1FD', margin: 16, borderRadius: 14, padding: 14, gap: 10 },
  tipIcon: { fontSize: 20, marginTop: 1 },
  tipText: { flex: 1, fontSize: 13.5, color: '#2d5fa6', lineHeight: 20 },
  tipBold: { fontWeight: '700' },

  tabBar: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 4, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#EDE9FB' },
  tabIcon: { fontSize: 20 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#E8E8F0' },
  cardIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EDE9FB', alignItems: 'center', justifyContent: 'center' },
  cardIconTxt: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#2d2d3a' },
  cardSub: { fontSize: 12, color: '#7a7a96', marginTop: 1 },
  cardBody: { padding: 16 },

  fl: { fontSize: 13, fontWeight: '600', color: '#2d2d3a', marginBottom: 6, marginTop: 12 },
  optional: { fontWeight: '400', color: '#7a7a96' },
  input: { backgroundColor: '#F4F6FB', borderWidth: 1.5, borderColor: '#E8E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#2d2d3a', marginBottom: 4 },
  ta: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },

  picker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6FB', borderWidth: 1.5, borderColor: '#E8E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  pickerTxt: { flex: 1, fontSize: 14, color: '#2d2d3a' },
  pickerArrow: { fontSize: 14, color: '#7a7a96' },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btnP: { flex: 1, backgroundColor: '#7c6fd4', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnPTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnS: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E8E8F0' },
  btnSTxt: { color: '#2d2d3a', fontWeight: '600', fontSize: 14 },

  smartFillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FB', borderRadius: 14, padding: 14, marginBottom: 12, gap: 10 },
  sfIcon: { fontSize: 22 },
  sfTitle: { fontSize: 14, fontWeight: '700', color: '#5c4d9a' },
  sfSub: { fontSize: 12, color: '#7a7a96', marginTop: 2 },
  sfArrow: { fontSize: 18, color: '#7c6fd4' },

  progRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  progTrack: { flex: 1, height: 6, backgroundColor: '#E8E8F0', borderRadius: 3, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: '#7c6fd4', borderRadius: 3 },
  progLabel: { fontSize: 12, color: '#7a7a96', minWidth: 100, textAlign: 'right' },

  focusTitle: { fontSize: 14, fontWeight: '600', color: '#2d2d3a', marginBottom: 4 },
  focusSub: { fontSize: 12, color: '#7a7a96', marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#E8E8F0', backgroundColor: '#F4F6FB' },
  chipOn: { backgroundColor: '#EDE9FB', borderColor: '#b8a9e8' },
  chipEmoji: { fontSize: 14 },
  chipTxt: { fontSize: 12, fontWeight: '500', color: '#7a7a96' },
  chipTxtOn: { color: '#5c4d9a' },

  emptyQ: { alignItems: 'center', paddingVertical: 32 },
  emptyQIcon: { fontSize: 36, opacity: 0.4, marginBottom: 10 },
  emptyQTxt: { fontSize: 14, color: '#7a7a96', textAlign: 'center', lineHeight: 22 },

  qCat: { marginBottom: 16 },
  qCatHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  qDot: { width: 10, height: 10, borderRadius: 5 },
  qCatLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: '#2d2d3a' },
  qCatCount: { fontSize: 11, color: '#7a7a96', backgroundColor: '#F4F6FB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  qItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4, backgroundColor: '#F4F6FB' },
  qItemOn: { backgroundColor: '#EDE9FB' },
  qBox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: '#b8a9e8', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  qBoxOn: { backgroundColor: '#7c6fd4', borderColor: '#7c6fd4' },
  qCheck: { color: '#fff', fontSize: 12, fontWeight: '700' },
  qTxt: { flex: 1, fontSize: 13, color: '#2d2d3a', lineHeight: 19 },
  qTxtOn: { color: '#5c4d9a', textDecorationLine: 'line-through' },
  qRm: { padding: 4 },
  qRmTxt: { fontSize: 14, color: '#7a7a96' },

  customRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  addQBtn: { backgroundColor: '#7c6fd4', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11 },
  addQTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  savedCard: { backgroundColor: '#F4F6FB', borderRadius: 14, padding: 14, marginBottom: 12 },
  savedHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  savedTitle: { fontSize: 15, fontWeight: '700', color: '#2d2d3a' },
  savedMeta: { fontSize: 12, color: '#7a7a96', marginTop: 2 },
  savedType: { fontSize: 12, color: '#5c4d9a', marginTop: 3, fontWeight: '500' },
  savedActions: { flexDirection: 'row', gap: 6 },
  savedBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E8E8F0' },
  savedBtnTxt: { fontSize: 12, fontWeight: '600', color: '#2d2d3a' },
  savedPreview: { fontSize: 13, color: '#7a7a96', marginTop: 8, lineHeight: 18 },
  summaryBtn: { marginTop: 10, backgroundColor: '#EDE9FB', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  summaryBtnTxt: { fontSize: 13, fontWeight: '700', color: '#5c4d9a' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 40 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#2d2d3a', textAlign: 'center', marginBottom: 12, paddingHorizontal: 20 },
  sheetOpt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F4F6FB' },
  sheetOptOn: { backgroundColor: '#EDE9FB' },
  sheetOptTxt: { flex: 1, fontSize: 14, color: '#2d2d3a' },
  sheetOptTxtOn: { color: '#5c4d9a', fontWeight: '600' },
  sheetCheck: { fontSize: 16, color: '#7c6fd4' },

  sumHero: { backgroundColor: '#EDE9FB', margin: 16, borderRadius: 16, padding: 20 },
  sumEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: '#7c6fd4', marginBottom: 4 },
  sumProvider: { fontSize: 20, fontWeight: '800', color: '#2d2d3a', marginBottom: 4 },
  sumDate: { fontSize: 13, color: '#7a7a96' },
  sumTagRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  sumTag: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#E8E8F0' },
  sumTagTxt: { fontSize: 12, color: '#7a7a96', fontWeight: '500' },
  sumSection: { paddingHorizontal: 16, paddingBottom: 4 },
  sumSecTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: '#7c6fd4', marginBottom: 6, marginTop: 12 },

  rainbow: { flexDirection: 'row', height: 4 },
  rainbowSlice: { flex: 1 },
});
