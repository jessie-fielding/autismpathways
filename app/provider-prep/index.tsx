import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
      const wins = pool.filter((o: any) => o.type === 'win').map((o: any) => o.text).join('\n');
      const challenges = pool.filter((o: any) => o.type === 'challenge').map((o: any) => o.text).join('\n');
      const changes = pool.filter((o: any) => o.type === 'change').map((o: any) => o.text).join('\n');

      updateDraft({ wins, challenges, recentChanges: changes });
    } catch (e) {
      console.error('SmartFill error', e);
      Alert.alert('SmartFill Error', 'Could not auto-fill observations.');
    } finally {
      setSmartFillLoading(false);
    }
  }, [updateDraft]);

  const saveNote = useCallback(async () => {
    if (!draft.providerName || !draft.apptDate) {
      Alert.alert('Missing Info', 'Please enter Provider Name and Appointment Date.');
      return;
    }
    const newNote: SavedNote = {
      id: Date.now(),
      title: `${draft.providerName} - ${draft.apptDate}`,
      date: draft.apptDate,
      savedAt: new Date().toISOString(),
      draft: draft,
    };
    const updatedNotes = [...savedNotes, newNote];
    setSavedNotes(updatedNotes);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updatedNotes));
    Alert.alert('Note Saved', 'Your preparation note has been saved.');
    setDraft(EMPTY_DRAFT); // Clear current draft after saving
    setActiveTab('saved');
  }, [draft, savedNotes]);

  const deleteNote = useCallback(async (id: number) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this saved note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            const updatedNotes = savedNotes.filter(note => note.id !== id);
            setSavedNotes(updatedNotes);
            await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updatedNotes));
          }
        },
      ]
    );
  }, [savedNotes]);

  const shareNote = useCallback(async (note: SavedNote) => {
    let shareContent = `Provider Prep Note: ${note.title}\n\n`;
    shareContent += `Child: ${note.draft.childName}\n`;
    shareContent += `Visit Type: ${note.draft.visitType}\n\n`;

    shareContent += `Recent Changes: ${note.draft.recentChanges}\n\n`;
    shareContent += `Wins: ${note.draft.wins}\n\n`;
    shareContent += `Challenges: ${note.draft.challenges}\n\n`;
    shareContent += `Therapies: ${note.draft.therapies}\n\n`;
    shareContent += `Medications: ${note.draft.medications}\n\n`;
    shareContent += `Last Evaluation: ${note.draft.lastEval}\n\n`;
    shareContent += `Top Priority: ${note.draft.topPriority}\n\n`;
    shareContent += `Hoping For: ${note.draft.hopingFor}\n\n`;
    shareContent += `Worried About: ${note.draft.worriedAbout}\n\n`;
    shareContent += `After Appointment: ${note.draft.afterAppt}\n\n`;

    if (note.draft.selectedFocus.length > 0) {
      shareContent += 'Areas of Focus:\n';
      note.draft.selectedFocus.forEach(key => {
        const focus = FOCUS_CHIPS.find(chip => chip.key === key);
        if (focus) shareContent += `- ${focus.label}\n`;
      });
      shareContent += '\n';
    }

    if (note.draft.checkedQuestions.length > 0 || note.draft.customQuestions.length > 0) {
      shareContent += 'Questions for Provider:\n';
      note.draft.selectedFocus.forEach(focusKey => {
        const bank = QUESTION_BANK[focusKey];
        if (bank) {
          bank.questions.forEach(q => {
            if (note.draft.checkedQuestions.includes(q)) {
              shareContent += `- ${q}\n`;
            }
          });
        }
      });
      note.draft.customQuestions.forEach(q => {
        shareContent += `- ${q}\n`;
      });
      shareContent += '\n';
    }

    if (note.visitSummary) {
      shareContent += '--- Visit Summary ---\n\n';
      shareContent += `Child Background: ${note.visitSummary.childBackground}\n\n`;
      shareContent += `Current Treatment: ${note.visitSummary.currentTreatment}\n\n`;
      shareContent += `Goals for Visit: ${note.visitSummary.goalsForVisit}\n\n`;
      shareContent += `What Provider Said: ${note.visitSummary.whatProviderSaid}\n\n`;
      shareContent += `Post-Appt Notes: ${note.visitSummary.postApptNotes}\n\n`;
      shareContent += `Next Steps: ${note.visitSummary.nextSteps}\n\n`;
      shareContent += `Follow-up Date: ${note.visitSummary.followUpDate}\n\n`;
    }

    try {
      await Share.share({
        message: shareContent,
        title: `Provider Prep Note: ${note.title}`,
      });
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f4f8',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingBottom: 15,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tabButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
    },
    tabButtonActive: {
      backgroundColor: '#007AFF',
    },
    tabButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    tabButtonTextActive: {
      color: '#fff',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: '#333',
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 5,
      color: '#555',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor: '#f9f9f9',
      color: '#333',
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    smartFillButton: {
      backgroundColor: '#4CAF50',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
    },
    smartFillButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 5,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    chip: {
      flexDirection: 'row',
      backgroundColor: '#e0e0e0',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 8,
      marginBottom: 8,
      alignItems: 'center',
    },
    chipSelected: {
      backgroundColor: '#007AFF',
    },
    chipText: {
      color: '#333',
      fontSize: 14,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: '#fff',
    },
    chipEmoji: {
      fontSize: 16,
      marginRight: 5,
    },
    questionBankContainer: {
      marginBottom: 15,
    },
    questionBankTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 8,
      color: '#333',
    },
    questionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: '#007AFF',
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#007AFF',
    },
    checkboxInner: {
      color: '#fff',
      fontSize: 14,
    },
    questionText: {
      flex: 1,
      fontSize: 15,
      color: '#333',
    },
    customQuestionInput: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    addQuestionButton: {
      backgroundColor: '#4CAF50',
      padding: 8,
      borderRadius: 5,
      marginLeft: 10,
    },
    addQuestionButtonText: {
      color: '#fff',
      fontSize: 14,
    },
    savedNoteItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    savedNoteTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    savedNoteDate: {
      fontSize: 14,
      color: '#666',
    },
    savedNoteActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      marginLeft: 10,
      padding: 5,
    },
    actionButtonText: {
      color: '#007AFF',
      fontSize: 14,
    },
    deleteButtonText: {
      color: '#FF3B30',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
    },
    modalCloseButton: {
      marginTop: 20,
      backgroundColor: '#ccc',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalCloseButtonText: {
      color: '#333',
      fontSize: 16,
      fontWeight: '600',
    },
    dropdownButton: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor: '#f9f9f9',
      color: '#333',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownContainer: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: '#f9f9f9',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 1000,
      maxHeight: 200,
    },
    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    dropdownItemText: {
      fontSize: 16,
      color: '#333',
    },
    dropdownItemSelected: {
      backgroundColor: '#e0e0e0',
    },
    arrowIcon: {
      width: 10,
      height: 10,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderColor: '#888',
      transform: [{ rotate: '45deg' }],
    },
    arrowIconOpen: {
      transform: [{ rotate: '-135deg' }],
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'setup' && styles.tabButtonActive]}
          onPress={() => setActiveTab('setup')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'setup' && styles.tabButtonTextActive]}>Setup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'before' && styles.tabButtonActive]}
          onPress={() => setActiveTab('before')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'before' && styles.tabButtonTextActive]}>Before Appt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'questions' && styles.tabButtonActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'questions' && styles.tabButtonTextActive]}>Questions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'saved' && styles.tabButtonTextActive]}>Saved Notes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'setup' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Appointment Details</Text>
              <Text style={styles.label}>Provider Name</Text>
              <TextInput
                style={styles.input}
                value={draft.providerName}
                onChangeText={text => updateDraft({ providerName: text })}
                placeholder="e.g., Dr. Smith"
              />

              <Text style={styles.label}>Appointment Date</Text>
              <TextInput
                style={styles.input}
                value={draft.apptDate}
                onChangeText={text => updateDraft({ apptDate: text })}
                placeholder="MM/DD/YYYY"
              />

              <Text style={styles.label}>Visit Type</Text>
              <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisitTypeOpen(!visitTypeOpen)}>
                <Text style={styles.dropdownItemText}>{draft.visitType}</Text>
                <View style={[styles.arrowIcon, visitTypeOpen && styles.arrowIconOpen]} />
              </TouchableOpacity>
              {visitTypeOpen && (
                <View style={styles.dropdownContainer}>
                  <ScrollView nestedScrollEnabled={true}>
                    {VISIT_TYPES.map((type, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.dropdownItem, draft.visitType === type && styles.dropdownItemSelected]}
                        onPress={() => {
                          updateDraft({ visitType: type });
                          setVisitTypeOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.label}>Child's Name</Text>
              <TextInput
                style={styles.input}
                value={draft.childName}
                onChangeText={text => updateDraft({ childName: text })}
                placeholder="e.g., Alex"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Smart-Fill from Observations</Text>
              <TouchableOpacity
                style={styles.smartFillButton}
                onPress={smartFill}
                disabled={smartFillLoading}
              >
                {smartFillLoading ? (
                  <Text style={styles.smartFillButtonText}>Loading...</Text>
                ) : (
                  <>
                    <Text style={styles.smartFillButtonText}>Auto-fill Recent Observations</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={saveNote}>
              <Text style={styles.buttonText}>Save Preparation Note</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'before' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Changes / Updates</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.recentChanges}
                onChangeText={text => updateDraft({ recentChanges: text })}
                multiline
                placeholder="Any new behaviors, skills, challenges, or changes since last visit?"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Wins / Progress</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.wins}
                onChangeText={text => updateDraft({ wins: text })}
                multiline
                placeholder="What positive developments or progress have you seen?"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Challenges / Concerns</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.challenges}
                onChangeText={text => updateDraft({ challenges: text })}
                multiline
                placeholder="What are the main difficulties or concerns you want to address?"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Therapies & Interventions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.therapies}
                onChangeText={text => updateDraft({ therapies: text })}
                multiline
                placeholder="List all current therapies (ABA, OT, SLP, etc.) and frequency."
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Medications & Supplements</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.medications}
                onChangeText={text => updateDraft({ medications: text })}
                multiline
                placeholder="List all medications, dosages, and any supplements."
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Last Evaluation / Diagnosis</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.lastEval}
                onChangeText={text => updateDraft({ lastEval: text })}
                multiline
                placeholder="Date and type of last evaluation or diagnosis."
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top Priority for this Visit</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.topPriority}
                onChangeText={text => updateDraft({ topPriority: text })}
                multiline
                placeholder="What is the single most important thing you want to discuss?"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Hoping For / Goals</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.hopingFor}
                onChangeText={text => updateDraft({ hopingFor: text })}
                multiline
                placeholder="What outcomes or insights are you hoping to get from this appointment?"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Worried About</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.worriedAbout}
                onChangeText={text => updateDraft({ worriedAbout: text })}
                multiline
                placeholder="Any specific concerns or anxieties about the appointment or next steps?"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>After the Appointment</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={draft.afterAppt}
                onChangeText={text => updateDraft({ afterAppt: text })}
                multiline
                placeholder="What do you plan to do after the appointment?"
              />
            </View>
          </View>
        )}

        {activeTab === 'questions' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Areas of Focus</Text>
              <View style={styles.chipContainer}>
                {FOCUS_CHIPS.map(chip => (
                  <TouchableOpacity
                    key={chip.key}
                    style={[
                      styles.chip,
                      draft.selectedFocus.includes(chip.key) && styles.chipSelected,
                      { backgroundColor: draft.selectedFocus.includes(chip.key) ? chip.color : '#e0e0e0' }
                    ]}
                    onPress={() => {
                      updateDraft({
                        selectedFocus: draft.selectedFocus.includes(chip.key)
                          ? draft.selectedFocus.filter(k => k !== chip.key)
                          : [...draft.selectedFocus, chip.key],
                      });
                    }}
                  >
                    <Text style={styles.chipEmoji}>{chip.emoji}</Text>
                    <Text style={[
                      styles.chipText,
                      draft.selectedFocus.includes(chip.key) && styles.chipTextSelected
                    ]}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {draft.selectedFocus.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Suggested Questions</Text>
                {draft.selectedFocus.map(focusKey => {
                  const bank = QUESTION_BANK[focusKey];
                  if (!bank) return null;
                  return (
                    <View key={focusKey} style={styles.questionBankContainer}>
                      <Text style={[styles.questionBankTitle, { color: bank.color }]}>{bank.label}</Text>
                      {bank.questions.map((question, qIndex) => (
                        <TouchableOpacity
                          key={qIndex}
                          style={styles.questionItem}
                          onPress={() => {
                            updateDraft({
                              checkedQuestions: draft.checkedQuestions.includes(question)
                                ? draft.checkedQuestions.filter(q => q !== question)
                                : [...draft.checkedQuestions, question],
                            });
                          }}
                        >
                          <View style={[
                            styles.checkbox,
                            draft.checkedQuestions.includes(question) && styles.checkboxChecked
                          ]}>
                            {draft.checkedQuestions.includes(question) && <Text style={styles.checkboxInner}>✓</Text>}
                          </View>
                          <Text style={styles.questionText}>{question}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Custom Questions</Text>
              {draft.customQuestions.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionText}>{question}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      updateDraft({
                        customQuestions: draft.customQuestions.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.customQuestionInput}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={customQInput}
                  onChangeText={setCustomQInput}
                  placeholder="Add your own question"
                />
                <TouchableOpacity
                  style={styles.addQuestionButton}
                  onPress={() => {
                    if (customQInput.trim()) {
                      updateDraft({ customQuestions: [...draft.customQuestions, customQInput.trim()] });
                      setCustomQInput('');
                    }
                  }}
                >
                  <Text style={styles.addQuestionButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'saved' && (
          <View>
            {savedNotes.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' }}>
                No saved notes yet. Go to 'Setup' to create one!
              </Text>
            ) : (
              savedNotes.map(note => (
                <View key={note.id} style={styles.card}>
                  <View style={styles.savedNoteItem}>
                    <View>
                      <Text style={styles.savedNoteTitle}>{note.title}</Text>
                      <Text style={styles.savedNoteDate}>Saved: {new Date(note.savedAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.savedNoteActions}>
                      <TouchableOpacity style={styles.actionButton} onPress={() => {
                        setSummaryDraft(note.visitSummary || EMPTY_SUMMARY);
                        setSummaryModal(note);
                      }}>
                        <Text style={styles.actionButtonText}>Summary</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={() => shareNote(note)}>
                        <Text style={styles.actionButtonText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={() => deleteNote(note.id)}>
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {note.visitSummary && (
                    <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                      <Text style={styles.label}>Visit Summary:</Text>
                      <Text style={styles.questionText}>- What Provider Said: {note.visitSummary.whatProviderSaid}</Text>
                      <Text style={styles.questionText}>- Next Steps: {note.visitSummary.nextSteps}</Text>
                      {/* Add more summary details as needed */}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={!!summaryModal}
        onRequestClose={() => setSummaryModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Visit Summary for {summaryModal?.title}</Text>

            <ScrollView>
              <Text style={styles.label}>Child Background</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summaryDraft.childBackground}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, childBackground: text }))}
                multiline
                placeholder="Key background info shared with provider"
              />

              <Text style={styles.label}>Current Treatment</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summaryDraft.currentTreatment}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, currentTreatment: text }))}
                multiline
                placeholder="Current therapies, medications, interventions"
              />

              <Text style={styles.label}>Goals for Visit</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summaryDraft.goalsForVisit}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, goalsForVisit: text }))}
                multiline
                placeholder="What you hoped to achieve from this visit"
              />

              <Text style={styles.label}>What Provider Said</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summaryDraft.whatProviderSaid}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, whatProviderSaid: text }))}
                multiline
                placeholder="Key takeaways, diagnoses, recommendations from provider"
              />

              <Text style={styles.label}>Post-Appointment Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summaryDraft.postApptNotes}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, postApptNotes: text }))}
                multiline
                placeholder="Your immediate thoughts, feelings, and reflections"
              />

              <Text style={styles.label}>Next Steps</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={summaryDraft.nextSteps}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, nextSteps: text }))}
                multiline
                placeholder="Actions to take, referrals, follow-up appointments"
              />

              <Text style={styles.label}>Follow-up Date</Text>
              <TextInput
                style={styles.input}
                value={summaryDraft.followUpDate}
                onChangeText={text => setSummaryDraft(prev => ({ ...prev, followUpDate: text }))}
                placeholder="MM/DD/YYYY"
              />
            </ScrollView>

            <TouchableOpacity style={styles.button} onPress={() => summaryModal && saveSummary(summaryModal.id)}>
              <Text style={styles.buttonText}>Save Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSummaryModal(null)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
