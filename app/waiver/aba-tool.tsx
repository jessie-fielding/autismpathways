/**
 * ABA Provider Tool (Premium)
 *
 * Mirrors the IEP talking-points pattern:
 *  - Log observations about ABA sessions
 *  - Identify trends to discuss
 *  - Pre-built talking points + pushback scripts for ABA provider meetings
 *
 * Free: view talking point categories, first 3 scripts
 * Premium: all scripts, pushbacks, observation log, trend tracker
 */
import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, Share,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { trackPaywallViewed } from '../../lib/analytics';

const OBS_KEY = 'ap_aba_observations';
const FREE_SCRIPTS = 3;

interface Pushback { objection: string; response: string; }
interface TalkingPoint { script: string; pushbacks?: Pushback[]; }
interface Category {
  id: string;
  emoji: string;
  color: string;
  title: string;
  subtitle: string;
  points: TalkingPoint[];
}

const ABA_CONTENT: Category[] = [
  {
    id: 'progress',
    emoji: '📈',
    color: COLORS.mintAccent,
    title: 'Discussing Progress & Goals',
    subtitle: 'Asking the right questions about your child\'s program goals',
    points: [
      {
        script: 'Can you walk me through [CHILD]\'s current active goals? I want to understand what we\'re working toward and how progress is being measured.',
        pushbacks: [
          { objection: '"We\'re working on several things — it\'s hard to summarize."', response: 'I understand it\'s complex. Can you give me the top 3 priority goals right now, and what the mastery criteria are for each? I want to be able to reinforce these at home.' },
        ],
      },
      {
        script: 'What data are you collecting on [CHILD]\'s goals, and can I see the graphs or data sheets from the last 4 weeks?',
        pushbacks: [
          { objection: '"Data is reviewed internally by the clinical team."', response: 'As [CHILD]\'s parent, I have the right to review all data collected during sessions. Can we schedule a time to go through it together?' },
        ],
      },
      {
        script: 'I\'ve noticed [CHILD] seems to be plateauing on [specific goal]. Has the team considered modifying the teaching procedure or trying a different approach?',
        pushbacks: [
          { objection: '"Plateaus are normal — we just need more time."', response: 'I appreciate that, but how long is appropriate before we consider a program modification? Is there a specific number of sessions or data points that would trigger a review?' },
        ],
      },
      {
        script: 'How are [CHILD]\'s goals being generalized across different environments — home, school, and community? I want to make sure skills aren\'t only showing up in the clinic.',
        pushbacks: [
          { objection: '"Generalization is built into the program."', response: 'Can you show me specifically where generalization probes are being run and what the data looks like? I\'d like to understand how we can support this at home too.' },
        ],
      },
      {
        script: 'Who is responsible for writing and updating [CHILD]\'s behavior intervention plan, and how often is it reviewed?',
        pushbacks: [],
      },
    ],
  },
  {
    id: 'concerns',
    emoji: '⚠️',
    color: COLORS.peachAccent,
    title: 'Raising Concerns',
    subtitle: 'Advocating when something doesn\'t feel right',
    points: [
      {
        script: 'I\'ve observed [CHILD] coming home from sessions [describe behavior — e.g., distressed, shut down, dysregulated]. Can you help me understand what happened in today\'s session?',
        pushbacks: [
          { objection: '"Sessions can be hard work — some dysregulation is expected."', response: 'I understand ABA is challenging. But this level of distress is outside [CHILD]\'s baseline. Can we review what specific procedures were used today and whether any aversives were involved?' },
        ],
      },
      {
        script: 'I\'m concerned about the use of [specific procedure]. Can you explain the evidence base for this approach and whether there are less aversive alternatives we could try first?',
        pushbacks: [
          { objection: '"This is a standard, evidence-based procedure."', response: 'I respect that. I\'d like to see the specific research you\'re referencing, and I\'d also like to understand whether a functional behavior assessment has been completed to confirm this is the right approach for [CHILD].' },
        ],
      },
      {
        script: 'I\'ve noticed [CHILD]\'s BCBA has changed several times. How does the team ensure continuity of care and that [CHILD]\'s history is properly handed off?',
        pushbacks: [
          { objection: '"Staff transitions are handled professionally."', response: 'I\'d like to see a written transition plan and understand how the new BCBA will be briefed on [CHILD]\'s history, preferences, and current programming before taking over.' },
        ],
      },
      {
        script: 'I want to request a parent training session so I can learn how to implement [CHILD]\'s programs at home. Is this included in our service authorization?',
        pushbacks: [
          { objection: '"Parent training is limited in your authorization."', response: 'Parent training is a required component of quality ABA services. Can you help me understand what\'s authorized and how we can request more if needed? I can contact our caseworker to discuss increasing hours.' },
        ],
      },
    ],
  },
  {
    id: 'assent',
    emoji: '💙',
    color: COLORS.blueAccent,
    title: 'Assent & Child Voice',
    subtitle: 'Making sure your child\'s preferences are respected',
    points: [
      {
        script: 'How does your team assess and honor [CHILD]\'s assent during sessions? What does it look like when [CHILD] indicates they don\'t want to continue, and how does the team respond?',
        pushbacks: [
          { objection: '"We use reinforcement to keep children motivated."', response: 'I understand reinforcement is central to ABA. But I want to make sure [CHILD]\'s protests and withdrawal behaviors are being interpreted as communication, not just extinction bursts. Can you walk me through your assent protocol?' },
        ],
      },
      {
        script: 'What reinforcers are currently being used with [CHILD], and how are you ensuring they\'re still preferred? I want to make sure [CHILD] actually enjoys coming to sessions.',
        pushbacks: [],
      },
      {
        script: 'Is [CHILD]\'s therapy incorporating their interests and strengths? I want to see goals that build on what [CHILD] loves, not just deficit-focused targets.',
        pushbacks: [
          { objection: '"We address all areas of the assessment."', response: 'I\'d like to see the balance between skill-building goals and goals that are directly connected to [CHILD]\'s interests and quality of life. Can we review the goal list together with that lens?' },
        ],
      },
    ],
  },
  {
    id: 'naturalistic',
    emoji: '🌿',
    color: COLORS.mintAccent,
    title: 'Naturalistic & Play-Based Approaches',
    subtitle: 'Asking about modern, child-led ABA methods',
    points: [
      {
        script: 'What percentage of [CHILD]\'s programming uses naturalistic developmental behavioral interventions (NDBIs) versus discrete trial training (DTT)? I\'d like to understand the balance.',
        pushbacks: [
          { objection: '"We use a mix of approaches based on the child\'s needs."', response: 'Can you show me in the program book where NDBIs are being used? I want to see specific examples of how [CHILD] is being taught in natural contexts.' },
        ],
      },
      {
        script: 'How is [CHILD]\'s therapy being delivered in natural environments — home, school, community — versus clinic-only? I want to make sure skills transfer to real life.',
        pushbacks: [],
      },
    ],
  },
  {
    id: 'transition',
    emoji: '🚀',
    color: COLORS.lavenderAccent,
    title: 'Transition & Discharge Planning',
    subtitle: 'Planning for what comes after ABA',
    points: [
      {
        script: 'What are the criteria for [CHILD] to graduate from ABA services? I want to understand what success looks like and how we\'ll know when [CHILD] is ready.',
        pushbacks: [],
      },
      {
        script: 'As [CHILD] approaches discharge, how will the team support transition to school-based or community-based services? I want to make sure there\'s no gap in support.',
        pushbacks: [
          { objection: '"We\'ll provide a summary report at discharge."', response: 'A report is helpful, but I\'d like a formal transition meeting with the school team before discharge so everyone is aligned. Can we schedule that at least 60 days before the anticipated end date?' },
        ],
      },
    ],
  },
];

interface Observation {
  id: string;
  date: string;
  text: string;
  category: string;
}

export default function ABAToolScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [activeTab, setActiveTab] = useState<'talking-points' | 'observations'>('talking-points');
  const [expandedCat, setExpandedCat] = useState<string | null>('progress');
  const [expandedPushback, setExpandedPushback] = useState<string | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsText, setObsText] = useState('');
  const [obsCategory, setObsCategory] = useState('General');
  const [childName, setChildName] = useState('');

  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet([OBS_KEY, 'ap_child_name']).then(pairs => {
      if (pairs[0][1]) setObservations(JSON.parse(pairs[0][1]));
      if (pairs[1][1]) setChildName(pairs[1][1]);
    });
  }, []));

  const addObservation = async () => {
    if (!obsText.trim()) return;
    const obs: Observation = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      text: obsText.trim(),
      category: obsCategory,
    };
    const next = [obs, ...observations];
    setObservations(next);
    await AsyncStorage.setItem(OBS_KEY, JSON.stringify(next));
    setObsText('');
    setShowObsModal(false);
  };

  const deleteObs = async (id: string) => {
    const next = observations.filter(o => o.id !== id);
    setObservations(next);
    await AsyncStorage.setItem(OBS_KEY, JSON.stringify(next));
  };

  const personalizeScript = (script: string) =>
    childName ? script.replace(/\[CHILD\]/g, childName) : script;

  const copyScript = async (script: string) => {
    await Clipboard.setStringAsync(personalizeScript(script));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ABA Provider Tool</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'talking-points' && styles.tabActive]}
          onPress={() => setActiveTab('talking-points')}
        >
          <Text style={[styles.tabText, activeTab === 'talking-points' && styles.tabTextActive]}>💬 Talking Points</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'observations' && styles.tabActive]}
          onPress={() => setActiveTab('observations')}
        >
          <Text style={[styles.tabText, activeTab === 'observations' && styles.tabTextActive]}>
            📝 Observations {observations.length > 0 ? `(${observations.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'talking-points' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>ABA Provider Meeting Prep</Text>
            <Text style={styles.introBody}>
              Use these scripts to advocate effectively at your next ABA team meeting. Tap any script to copy it.
            </Text>
          </View>

          {ABA_CONTENT.map((cat, catIdx) => {
            const isLocked = !isPremium && catIdx >= 2;
            return (
              <View key={cat.id} style={styles.catCard}>
                <TouchableOpacity
                  style={[styles.catHeader, { borderLeftColor: cat.color }]}
                  onPress={() => {
                    if (isLocked) { (trackPaywallViewed('waiver_aba_tool'), router.push('/paywall')); return; }
                    setExpandedCat(expandedCat === cat.id ? null : cat.id);
                  }}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <View style={styles.catHeaderText}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text style={styles.catSubtitle}>{cat.subtitle}</Text>
                  </View>
                  {isLocked ? (
                    <Text style={styles.lockIcon}>🔒</Text>
                  ) : (
                    <Text style={styles.chevron}>{expandedCat === cat.id ? '▲' : '▼'}</Text>
                  )}
                </TouchableOpacity>

                {expandedCat === cat.id && !isLocked && (
                  <View style={styles.catBody}>
                    {cat.points.map((point, idx) => {
                      const isScriptLocked = !isPremium && idx >= FREE_SCRIPTS;
                      const pbKey = `${cat.id}-${idx}`;
                      return (
                        <View key={idx} style={styles.scriptCard}>
                          {isScriptLocked ? (
                            <TouchableOpacity style={styles.lockedScript} onPress={() => (trackPaywallViewed('waiver_aba_tool'), router.push('/paywall'))}>
                              <Text style={styles.lockedScriptText}>🔒 Unlock more scripts with Premium</Text>
                            </TouchableOpacity>
                          ) : (
                            <>
                              <Text style={styles.scriptText}>{personalizeScript(point.script)}</Text>
                              <TouchableOpacity style={styles.copyBtn} onPress={() => copyScript(point.script)}>
                                <Text style={styles.copyBtnText}>📋 Copy</Text>
                              </TouchableOpacity>
                              {point.pushbacks && point.pushbacks.length > 0 && (
                                <>
                                  <TouchableOpacity
                                    style={styles.pushbackToggle}
                                    onPress={() => setExpandedPushback(expandedPushback === pbKey ? null : pbKey)}
                                  >
                                    <Text style={styles.pushbackToggleText}>
                                      {expandedPushback === pbKey ? '▲ Hide' : '▼ Show'} pushback responses ({point.pushbacks.length})
                                    </Text>
                                  </TouchableOpacity>
                                  {expandedPushback === pbKey && point.pushbacks.map((pb, pbIdx) => (
                                    <View key={pbIdx} style={styles.pushbackCard}>
                                      <Text style={styles.pushbackObjection}>❝ {pb.objection}</Text>
                                      <Text style={styles.pushbackResponse}>→ {pb.response}</Text>
                                      <TouchableOpacity onPress={() => copyScript(pb.response)}>
                                        <Text style={styles.copyBtnText}>📋 Copy response</Text>
                                      </TouchableOpacity>
                                    </View>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {activeTab === 'observations' && (
        <View style={{ flex: 1 }}>
          {!isPremium ? (
            <View style={styles.paywallContainer}>
              <Text style={styles.paywallEmoji}>🔒</Text>
              <Text style={styles.paywallTitle}>Premium Feature</Text>
              <Text style={styles.paywallBody}>
                Log session observations and track trends to bring to your ABA provider meetings.
              </Text>
              <TouchableOpacity style={styles.paywallBtn} onPress={() => (trackPaywallViewed('waiver_aba_tool'), router.push('/paywall'))}>
                <Text style={styles.paywallBtnText}>Unlock with Premium</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {observations.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                    <Text style={styles.emptyTitle}>No observations yet</Text>
                    <Text style={styles.emptyBody}>Tap the button below to log your first observation after a session.</Text>
                  </View>
                )}
                {observations.map(obs => (
                  <View key={obs.id} style={styles.obsCard}>
                    <View style={styles.obsHeader}>
                      <Text style={styles.obsDate}>{obs.date}</Text>
                      <Text style={styles.obsCat}>{obs.category}</Text>
                      <TouchableOpacity onPress={() => deleteObs(obs.id)}>
                        <Text style={styles.obsDelete}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.obsText}>{obs.text}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.addObsBar}>
                <TouchableOpacity style={styles.addObsBtn} onPress={() => setShowObsModal(true)}>
                  <Text style={styles.addObsBtnText}>+ Log Observation</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Add Observation Modal */}
      <Modal visible={showObsModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Observation</Text>
              <TouchableOpacity onPress={() => setShowObsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.catChips}>
                {['General', 'Behavior', 'Progress', 'Concern', 'Positive', 'Regression'].map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.catChip, obsCategory === c && styles.catChipActive]}
                    onPress={() => setObsCategory(c)}
                  >
                    <Text style={[styles.catChipText, obsCategory === c && styles.catChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Observation</Text>
              <TextInput
                style={[styles.input, styles.obsInput]}
                value={obsText}
                onChangeText={setObsText}
                placeholder="What did you notice today? e.g. 'Came home very dysregulated after session, took 45 min to calm down. Session was 3 hrs.'"
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                autoFocus
              />
              <TouchableOpacity style={styles.saveBtn} onPress={addObservation}>
                <Text style={styles.saveBtnText}>Save Observation</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.purple },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '600' },
  tabTextActive: { color: COLORS.purple },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: '#f5f0ff', borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  introTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.purple, marginBottom: SPACING.xs },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 19 },
  catCard: { marginBottom: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOWS.sm },
  catHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: SPACING.md, borderLeftWidth: 4, gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catEmoji: { fontSize: 22 },
  catHeaderText: { flex: 1 },
  catTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  catSubtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  lockIcon: { fontSize: 16 },
  chevron: { fontSize: 12, color: COLORS.textLight },
  catBody: { backgroundColor: COLORS.white, borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.border, padding: SPACING.md },
  scriptCard: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  scriptText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 21, marginBottom: SPACING.sm },
  copyBtn: { alignSelf: 'flex-start' },
  copyBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  lockedScript: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, padding: SPACING.md,
    alignItems: 'center',
  },
  lockedScriptText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  pushbackToggle: { marginTop: SPACING.sm },
  pushbackToggleText: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, fontWeight: '600' },
  pushbackCard: {
    backgroundColor: '#fff8f0', borderRadius: RADIUS.sm, padding: SPACING.md,
    marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.peachAccent,
  },
  pushbackObjection: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic', marginBottom: SPACING.xs },
  pushbackResponse: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.xs },
  // Observations
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl * 2 },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 19 },
  obsCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  obsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, gap: SPACING.sm },
  obsDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  obsCat: { fontSize: FONT_SIZES.xs, color: COLORS.purple, backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2, fontWeight: '600' },
  obsDelete: { marginLeft: 'auto', color: COLORS.textLight, fontSize: 14, padding: 4 },
  obsText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  addObsBar: { padding: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  addObsBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14, alignItems: 'center' },
  addObsBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  // Paywall
  paywallContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  paywallEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  paywallTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  paywallBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  paywallBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14, paddingHorizontal: SPACING.xl },
  paywallBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textLight, padding: SPACING.sm },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
  catChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.pill,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  catChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  catChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600' },
  catChipTextActive: { color: COLORS.white },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm, color: COLORS.text, backgroundColor: COLORS.white,
  },
  obsInput: { minHeight: 120 },
  saveBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.xl },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
});
