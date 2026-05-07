import React, { useCallback, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveChild } from '../../services/childManager';
import {
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useChildChanged } from '../../hooks/useChildChanged';

// ─── Types ────────────────────────────────────────────────────────────────────
interface IEPGoal {
  id: string;
  area: string;
  text: string;
  baseline: string;
  target: string;
  progress: number;
  year: string;
  notes: string;
  archived: boolean;
  createdAt: string;
}

interface IEPMeeting {
  id: string;
  date: string;
  type: string;
  attendees: string;
  discussed: string;
  decisions: string;
  actions: string;
  docs: string;
  nextDate: string;
  feeling: string;
  savedAt: string;
}

interface IEPSetup {
  grade: string;
  status: string;
  district: string;
}

interface FlaggedObs {
  date: string;
  mood: string;
  summary: string;
  tags: string[];
  savedAt: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const RIGHTS_TERMS = [
  {
    term: 'FAPE — Free Appropriate Public Education',
    def: 'Your child is entitled to special education and related services at no cost to you. "Appropriate" means designed for your child\'s unique needs — not the best possible education, but one that provides meaningful benefit.',
    tip: '💡 If the school says they "can\'t afford" a service your child needs — that\'s not a valid reason under IDEA.',
  },
  {
    term: 'LRE — Least Restrictive Environment',
    def: 'Your child must be educated alongside non-disabled peers to the maximum extent appropriate. Removal from general education must be justified.',
    tip: '💡 You can push back if your child is being placed in a more restrictive setting than necessary.',
  },
  {
    term: 'PWN — Prior Written Notice',
    def: 'The school must give you written notice before changing (or refusing to change) your child\'s placement, evaluation, or services. This is a legal document.',
    tip: '💡 Always request a PWN in writing any time the school proposes or refuses a change.',
  },
  {
    term: 'ESY — Extended School Year',
    def: 'If your child regresses significantly during summer breaks, they may be entitled to ESY services at no cost. You can request this evaluation.',
    tip: null,
  },
  {
    term: 'Triennial Evaluation',
    def: 'Every 3 years the school must re-evaluate your child\'s eligibility and needs. You can request an evaluation at any time if you believe your child\'s needs have changed.',
    tip: '💡 You don\'t have to wait 3 years. You can request an evaluation in writing at any time.',
  },
  {
    term: 'Transition Planning',
    def: 'By age 16 (age 14 in some states), the IEP must include transition goals for post-secondary education, employment, and independent living.',
    tip: '💡 This is where the Medicaid/waiver pathway connects — start early!',
  },
];

const SCHOOL_SAYS_NO = [
  { term: 'Step 1 — Request a PWN', def: 'Ask for the refusal in writing. Schools are required to provide this. It documents exactly what they denied and why.' },
  { term: 'Step 2 — Request an IEP meeting', def: 'You can call an IEP meeting at any time. Submit the request in writing and keep a copy.' },
  { term: 'Step 3 — File a state complaint', def: 'Each state has a complaint process through the State Education Agency (SEA). This is free and faster than due process.' },
  { term: 'Step 4 — Due process hearing', def: 'A formal legal proceeding where an impartial hearing officer decides the dispute. You can have an attorney represent you.' },
];

const PREP_CHECKLIST = [
  'Review current IEP document before meeting',
  'Collect recent progress reports on each goal',
  'Review flagged observations from home',
  'Request recent therapy notes from providers',
  'Write down your top 3 questions/concerns',
  'Review notes from previous IEP meeting',
  'Bring copies of any private evaluations',
  'Invite a support person or advocate if needed',
  'Check state law on recording meetings',
  'Remember: you do NOT have to sign anything today',
];

const PUSHBACK_SCRIPTS = [
  {
    icon: '💰',
    title: '"We don\'t have the budget for that"',
    script: 'I understand budget constraints are real, but under IDEA, the school district is required to provide the services my child needs regardless of cost. Can you show me the evaluation data that supports the current level of service being appropriate?',
    callout: { type: 'purple', label: 'Know this', text: 'Budget is never a valid reason to deny services under IDEA. Document this statement in writing.' },
  },
  {
    icon: '✅',
    title: '"Your child is making progress"',
    script: 'I\'m glad to hear about progress, but progress alone doesn\'t mean the current level of service is appropriate. Can we look at the rate of progress and whether my child is closing the gap with peers?',
    callout: { type: 'blue', label: 'Key point', text: 'Progress must be meaningful and at a rate that allows your child to be involved in and make progress in the general curriculum.' },
  },
  {
    icon: '❌',
    title: '"Your child doesn\'t qualify for that service"',
    script: 'Can you walk me through the specific evaluation data that led to that determination? I\'d like to understand the criteria used and whether an independent educational evaluation might be appropriate.',
    callout: { type: 'amber', label: 'Your right', text: 'You have the right to request an Independent Educational Evaluation (IEE) at the school\'s expense if you disagree with their evaluation.' },
  },
  {
    icon: '⏰',
    title: '"We need you to sign today"',
    script: 'I appreciate the team\'s time today, but I never sign IEP documents at the meeting. I need time to review everything carefully. I\'ll have my response to you within 10 days. The current IEP remains in place while I review.',
    callout: { type: 'amber', label: 'Important', text: 'You are NEVER required to sign at the meeting. Take the document home. You have the right to review it.' },
  },
  {
    icon: '🏫',
    title: '"This is our standard program"',
    script: 'I understand you have standard programs, but my child\'s IEP must be individualized based on their unique needs — not based on what programs are available. Can we discuss what my child specifically needs first, and then look at how those needs can be met?',
    callout: null,
  },
];

const GOAL_AREAS = [
  'Communication', 'Social Skills', 'Academics — Reading', 'Academics — Math',
  'Academics — Writing', 'Behavior', 'Adaptive Skills', 'Motor Skills',
  'Sensory', 'Transition', 'Other',
];

const MEETING_TYPES = [
  'Annual Review', 'Initial IEP', 'Triennial Re-evaluation', 'Amendment',
  'Transition Planning', 'Manifestation Determination', 'Other',
];

const MEETING_FEELINGS = [
  { value: 'positive', label: '😊 Positive — good progress' },
  { value: 'neutral', label: '😐 Neutral — mixed results' },
  { value: 'concerned', label: '😟 Concerned — need to follow up' },
  { value: 'disputed', label: '⚠️ Disputed — I disagree with decisions' },
];

const GRADE_OPTIONS = [
  { value: 'prek', label: 'Pre-K' }, { value: 'k', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' }, { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' }, { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' }, { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' }, { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' }, { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' }, { value: '12', label: '12th Grade' },
  { value: 'transition', label: 'Transition (18-21)' },
];

const IEP_STATUS_OPTIONS = [
  { value: 'first', label: 'First IEP / Initial eligibility' },
  { value: 'annual', label: 'Annual review' },
  { value: 'triennial', label: 'Triennial re-evaluation' },
  { value: 'transition', label: 'Transition planning' },
  { value: 'dispute', label: 'In dispute / due process' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return '';
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ─── Sub-components ───────────────────────────────────────────────────────────
function Callout({ type, label, text }: { type: string; label: string; text: string }) {
  const bg = type === 'green' ? '#d4edda' : type === 'amber' ? '#fff8e0' : type === 'blue' ? '#eff6ff' : type === 'purple' ? '#f0edfc' : '#fff8e0';
  const border = type === 'green' ? '#a0d8aa' : type === 'amber' ? '#f0d080' : type === 'blue' ? '#bfdbfe' : '#d4d0ef';
  const labelColor = type === 'green' ? '#2e7d32' : type === 'amber' ? '#e8a800' : type === 'blue' ? '#2563eb' : '#7c6fd4';
  const textColor = type === 'green' ? '#1a4a1e' : type === 'amber' ? '#5a3a00' : type === 'blue' ? '#1e3a8a' : '#4a3f8f';
  return (
    <View style={[cs.callout, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[cs.calloutLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[cs.calloutText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

function ScriptCard({ item }: { item: typeof PUSHBACK_SCRIPTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={cs.scriptCard}>
      <TouchableOpacity style={cs.scriptHeader} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <View style={cs.scriptIconBox}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
        <Text style={cs.scriptTitle}>{item.title}</Text>
        <Text style={cs.scriptArrow}>{open ? '↑' : '›'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={cs.scriptBody}>
          <View style={cs.scriptBox}>
            <Text style={cs.scriptBoxLabel}>YOUR RESPONSE</Text>
            <Text style={cs.scriptBoxText}>\"{item.script}\"</Text>
            <TouchableOpacity onPress={() => { Clipboard.setString(item.script); Alert.alert('Copied!', 'Script copied to clipboard.'); }}>
              <Text style={cs.scriptCopy}>📋 Copy</Text>
            </TouchableOpacity>
          </View>
          {item.callout && <Callout type={item.callout.type} label={item.callout.label} text={item.callout.text} />}
        </View>
      )}
    </View>
  );
}

function TermCard({ item }: { item: typeof RIGHTS_TERMS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={cs.termCard}>
      <TouchableOpacity style={cs.termHeader} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <Text style={cs.termTitle}>{item.term}</Text>
        <Text style={cs.termArrow}>{open ? '↑' : '›'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={cs.termBody}>
          <Text style={cs.termDef}>{item.def}</Text>
          {item.tip && <Text style={cs.termTip}>{item.tip}</Text>}
        </View>
      )}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IEPScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const [activeTab, setActiveTab] = useState('prep');

  const [goals, setGoals] = useState<IEPGoal[]>([]);
  const [meetings, setMeetings] = useState<IEPMeeting[]>([]);
  const [setup, setSetup] = useState<IEPSetup>({ grade: '', status: '', district: '' });
  const [flagged, setFlagged] = useState<FlaggedObs[]>([]);

  const [showSetup, setShowSetup] = useState(false);
  const [draftSetup, setDraftSetup] = useState<IEPSetup>({ grade: '', status: '', district: '' });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<IEPGoal | null>(null);
  const [draftGoal, setDraftGoal] = useState<Partial<IEPGoal>>({});

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<IEPMeeting | null>(null);
  const [draftMeeting, setDraftMeeting] = useState<Partial<IEPMeeting>>({});

  const [showArchived, setShowArchived] = useState(false);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  const loadData = async () => {
    if (!activeChild) return;
    const keyPrefix = `iep_${activeChild.id}_`;
    const goals = JSON.parse(await AsyncStorage.getItem(keyPrefix + 'goals') || '[]');
    const meetings = JSON.parse(await AsyncStorage.getItem(keyPrefix + 'meetings') || '[]');
    const setup = JSON.parse(await AsyncStorage.getItem(keyPrefix + 'setup') || 'null');
    const flagged = JSON.parse(await AsyncStorage.getItem('ap_iep_flagged_obs') || '[]');
    setGoals(goals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setMeetings(meetings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setSetup(setup || { grade: '', status: '', district: '' });
    setFlagged(flagged);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [activeChild]));
  useChildChanged(() => { loadData(); });

  // Helper: recalculate and persist IEP progress score (0-5) to dashboard key
  const updateIepProgress = async (updatedGoals: IEPGoal[], updatedMeetings: IEPMeeting[], hasSetup: boolean) => {
    if (!activeChild) return;
    let score = 0;
    if (hasSetup) score += 1;                                    // setup done
    if (updatedGoals.length > 0) score += 1;                    // has goals
    if (updatedMeetings.length > 0) score += 1;                 // has meeting
    if (updatedGoals.some(g => g.progress >= 50)) score += 1;  // goal >=50%
    if (updatedGoals.some(g => g.progress >= 100)) score += 1; // goal 100%
    await AsyncStorage.setItem(`ap_iep_progress_${activeChild.id}`, String(score));
    await AsyncStorage.setItem('ap_iep_progress', String(score));
  };

  const saveGoals = async (newGoals: IEPGoal[]) => {
    if (!activeChild) return;
    await AsyncStorage.setItem(`iep_${activeChild.id}_goals`, JSON.stringify(newGoals));
    setGoals(newGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    const curSetup = JSON.parse(await AsyncStorage.getItem(`iep_${activeChild.id}_setup`) || 'null');
    const curMeetings = JSON.parse(await AsyncStorage.getItem(`iep_${activeChild.id}_meetings`) || '[]');
    await updateIepProgress(newGoals, curMeetings, !!curSetup);
  };

  const saveMeetings = async (newMeetings: IEPMeeting[]) => {
    if (!activeChild) return;
    await AsyncStorage.setItem(`iep_${activeChild.id}_meetings`, JSON.stringify(newMeetings));
    setMeetings(newMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const curSetup = JSON.parse(await AsyncStorage.getItem(`iep_${activeChild.id}_setup`) || 'null');
    const curGoals = JSON.parse(await AsyncStorage.getItem(`iep_${activeChild.id}_goals`) || '[]');
    await updateIepProgress(curGoals, newMeetings, !!curSetup);
  };

  const saveSetup = async () => {
    if (!activeChild) return;
    await AsyncStorage.setItem(`iep_${activeChild.id}_setup`, JSON.stringify(draftSetup));
    setSetup(draftSetup);
    setShowSetup(false);
    const curGoals = JSON.parse(await AsyncStorage.getItem(`iep_${activeChild.id}_goals`) || '[]');
    const curMeetings = JSON.parse(await AsyncStorage.getItem(`iep_${activeChild.id}_meetings`) || '[]');
    await updateIepProgress(curGoals, curMeetings, true);
  };

  const clearFlags = async () => {
    if (!activeChild) return;
    Alert.alert(
      'Clear Flagged Observations?',
      'This will remove all flagged items from this screen. This is usually done after an IEP meeting.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Flags', style: 'destructive', onPress: async () => {
          const allFlagged = JSON.parse(await AsyncStorage.getItem('ap_iep_flagged_obs') || '[]');
          const remaining = allFlagged.filter((f: any) => f.childId !== activeChild.id);
          await AsyncStorage.setItem('ap_iep_flagged_obs', JSON.stringify(remaining));
          setFlagged([]);
        }},
      ]
    );
  };

  const openAddGoal = () => { setEditingGoal(null); setDraftGoal({ progress: 0, archived: false, year: new Date().getFullYear().toString() }); setShowGoalModal(true); };
  const openEditGoal = (goal: IEPGoal) => { setEditingGoal(goal); setDraftGoal(goal); setShowGoalModal(true); };
  const saveGoal = () => {
    const now = new Date().toISOString();
    if (editingGoal) {
      const updatedGoals = goals.map(g => g.id === editingGoal.id ? { ...g, ...draftGoal } : g);
      saveGoals(updatedGoals);
    } else {
      const newGoal = { ...draftGoal, id: uid(), createdAt: now } as IEPGoal;
      saveGoals([...goals, newGoal]);
    }
    setShowGoalModal(false);
  };
  const deleteGoal = (id: string) => {
    Alert.alert('Delete Goal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => saveGoals(goals.filter(g => g.id !== id)) },
    ]);
  };
  const archiveGoal = (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, archived: !g.archived } : g);
    saveGoals(updated);
  };

  const openAddMeeting = () => { setEditingMeeting(null); setDraftMeeting({ date: new Date().toISOString().split('T')[0] }); setShowMeetingModal(true); };
  const saveMeeting = () => {
    const now = new Date().toISOString();
    if (editingMeeting) {
      const updatedMeetings = meetings.map(m => m.id === editingMeeting.id ? { ...m, ...draftMeeting } : m);
      saveMeetings(updatedMeetings);
    } else {
      const newMeeting = { ...draftMeeting, id: uid(), savedAt: now } as IEPMeeting;
      saveMeetings([...meetings, newMeeting]);
    }
    setShowMeetingModal(false);
  };

  const activeGoals = goals.filter(g => !g.archived);
  const archivedGoals = goals.filter(g => g.archived);

  const s = cs; // alias for styles
  const insets = useSafeAreaInsets();

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20 }}>🏠</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>IEP Pathway</Text>
        <TouchableOpacity style={s.setupBtn} onPress={() => { setDraftSetup(setup); setShowSetup(true); }}>
          <Text style={s.setupBtnText}>⚙️ Setup</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, activeTab === 'prep' && s.tabActive]} onPress={() => setActiveTab('prep')}><Text style={[s.tabText, activeTab === 'prep' && s.tabTextActive]}>Prep</Text></TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'goals' && s.tabActive]} onPress={() => setActiveTab('goals')}><Text style={[s.tabText, activeTab === 'goals' && s.tabTextActive]}>Goals</Text></TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'meetings' && s.tabActive]} onPress={() => setActiveTab('meetings')}><Text style={[s.tabText, activeTab === 'meetings' && s.tabTextActive]}>Meetings</Text></TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'flagged' && s.tabActive]} onPress={() => setActiveTab('flagged')}><Text style={[s.tabText, activeTab === 'flagged' && s.tabTextActive]}>From Obs</Text></TouchableOpacity>
      </View>

      <ScrollView style={s.contentScroll} showsVerticalScrollIndicator={false}>
        {/* ── PREP TAB ── */}
        {activeTab === 'prep' && (
          <View>
            <Text style={s.sectionLabel}>MEETING PREP CHECKLIST</Text>
            <View style={s.checklist}>
              {PREP_CHECKLIST.map((item, i) => <Text key={i} style={s.checklistItem}>- {item}</Text>)}
            </View>

            <Text style={s.sectionLabel}>PUSHBACK SCRIPTS</Text>
            {PUSHBACK_SCRIPTS.map((item, i) => <ScriptCard key={i} item={item} />)}

            <Text style={s.sectionLabel}>KNOW YOUR RIGHTS</Text>
            {RIGHTS_TERMS.map((item, i) => <TermCard key={i} item={item} />)}

            <Text style={s.sectionLabel}>IF THE SCHOOL SAYS NO</Text>
            {SCHOOL_SAYS_NO.map((item, i) => <TermCard key={i} item={item} />)}
          </View>
        )}

        {/* ── GOALS TAB ── */}
        {activeTab === 'goals' && (
          <View>
            <TouchableOpacity style={s.addBtn} onPress={openAddGoal}>
              <Text style={s.addBtnText}>+ Add New Goal</Text>
            </TouchableOpacity>

            <Text style={s.sectionLabel}>ACTIVE GOALS</Text>
            {activeGoals.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🎯</Text>
                <Text style={s.emptyTitle}>No active goals</Text>
                <Text style={s.emptySub}>Add your child's IEP goals to track progress.</Text>
              </View>
            ) : activeGoals.map(g => (
              <View key={g.id} style={s.goalCard}>
                <Text style={s.goalArea}>{g.area.toUpperCase()}</Text>
                <Text style={s.goalText}>{g.text}</Text>
                <View style={s.goalProgressWrap}>
                  <View style={s.goalProgressBar}>
                    <View style={[s.goalProgressFill, { width: `${g.progress}%` as any }]} />
                  </View>
                </View>
                <View style={s.goalMeta}>
                  {g.year ? <Text style={s.goalMetaText}>{g.year}</Text> : <Text />}
                  <Text style={s.goalMetaText}>{g.progress}% progress</Text>
                </View>
                {g.baseline ? <Text style={s.goalSubText}>Baseline: {g.baseline}</Text> : null}
                {g.target ? <Text style={s.goalSubText}>Target: {g.target}</Text> : null}
                {g.notes ? <Text style={s.goalSubText}>Notes: {g.notes}</Text> : null}
                <View style={s.goalActions}>
                  <TouchableOpacity style={s.goalBtn} onPress={() => openEditGoal(g)}>
                    <Text style={s.goalBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.goalBtn, s.goalBtnSecondary]} onPress={() => archiveGoal(g.id)}>
                    <Text style={s.goalBtnText}>Archive</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.goalBtn, s.goalBtnDanger]} onPress={() => deleteGoal(g.id)}>
                    <Text style={[s.goalBtnText, { color: '#c0392b' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {archivedGoals.length > 0 && (
              <View>
                <TouchableOpacity style={s.archiveToggle} onPress={() => setShowArchived(a => !a)}>
                  <Text style={s.archiveToggleText}>{showArchived ? 'Hide' : 'Show'} archived goals ({archivedGoals.length})</Text>
                </TouchableOpacity>
                {showArchived && archivedGoals.map(g => (
                  <View key={g.id} style={[s.goalCard, s.goalCardArchived]}>
                    <Text style={s.goalArea}>{g.area.toUpperCase()}</Text>
                    <Text style={[s.goalText, { opacity: 0.6 }]}>{g.text}</Text>
                    <TouchableOpacity style={s.goalBtn} onPress={() => archiveGoal(g.id)}>
                      <Text style={s.goalBtnText}>Restore</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── MEETINGS TAB ── */}
        {activeTab === 'meetings' && (
          <View>
            <TouchableOpacity style={s.addBtn} onPress={openAddMeeting}>
              <Text style={s.addBtnText}>+ Log IEP Meeting</Text>
            </TouchableOpacity>

            {meetings.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📝</Text>
                <Text style={s.emptyTitle}>No meetings logged yet</Text>
                <Text style={s.emptySub}>Log your first IEP meeting to start building your history.</Text>
              </View>
            ) : meetings.map(m => {
              const feelingEmoji = m.feeling === 'positive' ? '😊' : m.feeling === 'neutral' ? '😐' : m.feeling === 'concerned' ? '😟' : '⚠️';
              const expanded = expandedMeeting === m.id;
              return (
                <View key={m.id} style={s.meetingCard}>
                  <TouchableOpacity style={s.meetingHeader} onPress={() => setExpandedMeeting(expanded ? null : m.id)}>
                    <View>
                      <Text style={s.meetingDate}>{fmtDate(m.date)}</Text>
                      <Text style={s.meetingType}>{m.type}</Text>
                    </View>
                    <Text style={s.meetingFeeling}>{feelingEmoji}</Text>
                  </TouchableOpacity>
                  {expanded && (
                    <View style={s.meetingBody}>
                      {m.attendees ? (
                        <View style={s.meetingSection}>
                          <Text style={s.meetingSectionTitle}>ATTENDEES</Text>
                          <View style={s.attendeeRow}>
                            {m.attendees.split(',').map(a => (
                              <View key={a.trim()} style={s.attendeeChip}>
                                <Text style={s.attendeeChipText}>{a.trim()}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null}
                      {m.discussed ? <View style={s.meetingSection}><Text style={s.meetingSectionTitle}>DISCUSSED</Text><Text style={s.meetingContent}>{m.discussed}</Text></View> : null}
                      {m.decisions ? <View style={s.meetingSection}><Text style={s.meetingSectionTitle}>DECISIONS</Text><Text style={s.meetingContent}>{m.decisions}</Text></View> : null}
                      {m.actions ? (
                        <View style={s.meetingSection}>
                          <Text style={s.meetingSectionTitle}>ACTION ITEMS</Text>
                          {m.actions.split('\n').filter(Boolean).map((a, i) => (
                            <View key={i} style={s.actionItem}>
                              <Text style={s.actionBullet}>•</Text>
                              <Text style={s.meetingContent}>{a}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {m.docs ? <View style={s.meetingSection}><Text style={s.meetingSectionTitle}>DOCUMENTS SIGNED</Text><Text style={s.meetingContent}>{m.docs}</Text></View> : null}
                      {m.nextDate ? <View style={s.meetingSection}><Text style={s.meetingSectionTitle}>NEXT MEETING</Text><Text style={s.meetingContent}>{fmtDate(m.nextDate)}</Text></View> : null}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── FROM OBS TAB ── */}
        {activeTab === 'flagged' && (
          <View>
            <Callout type="green" label="📌 How this works" text='When you log an observation and tap "Flag for IEP," it appears here. Bring these to your next meeting. After logging a meeting, you can clear the flags.' />

            <Text style={s.sectionLabel}>FLAGGED FROM OBSERVATIONS</Text>
            {flagged.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📌</Text>
                <Text style={s.emptyTitle}>No flagged observations</Text>
                <Text style={s.emptySub}>Go to Observations and tap "Flag for IEP" on any entry to add it here.</Text>
                <TouchableOpacity style={s.goObsBtn} onPress={() => router.push('/observations')}>
                  <Text style={s.goObsBtnText}>Go to Observations →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {flagged.map(f => (
                  <View key={f.savedAt} style={s.flaggedCard}>
                    <Text style={s.flaggedDate}>{fmtDate(f.date)}</Text>
                    <Text style={s.flaggedText}>{f.summary}</Text>
                    {(f.tags || []).length > 0 && (
                      <View style={s.tagsRow}>
                        {f.tags.map(t => <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}
                      </View>
                    )}
                  </View>
                ))}
                <TouchableOpacity style={s.clearFlagsBtn} onPress={clearFlags}>
                  <Text style={s.clearFlagsBtnText}>Clear all flags after meeting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.goObsBtn} onPress={() => router.push('/observations')}>
                  <Text style={s.goObsBtnText}>Go to Observations →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── SETUP MODAL ── */}
      <Modal visible={showSetup} transparent animationType="slide" onRequestClose={() => setShowSetup(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowSetup(false)} />
          <View style={s.modalCard}>
            <View style={s.modalTitleRow}>
              <Text style={s.modalTitle}>Child's IEP Setup</Text>
              <TouchableOpacity onPress={() => setShowSetup(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>Grade level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {GRADE_OPTIONS.map(g => (
                  <TouchableOpacity key={g.value} style={[s.gradeChip, draftSetup.grade === g.value && s.gradeChipActive]} onPress={() => setDraftSetup(d => ({ ...d, grade: g.value }))}>
                    <Text style={[s.gradeChipText, draftSetup.grade === g.value && s.gradeChipTextActive]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.formLabel}>Current IEP status</Text>
              {IEP_STATUS_OPTIONS.map(o => (
                <TouchableOpacity key={o.value} style={[s.radioRow, draftSetup.status === o.value && s.radioRowActive]} onPress={() => setDraftSetup(d => ({ ...d, status: o.value }))}>
                  <View style={[s.radioCircle, draftSetup.status === o.value && s.radioCircleActive]} />
                  <Text style={s.radioText}>{o.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[s.formLabel, { marginTop: SPACING.md }]}>School district (optional)</Text>
              <TextInput style={s.input} value={draftSetup.district} onChangeText={v => setDraftSetup(d => ({ ...d, district: v }))} placeholder="e.g. Denver Public Schools" placeholderTextColor={COLORS.textLight} />
              <TouchableOpacity style={s.primaryBtn} onPress={saveSetup}>
                <Text style={s.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── GOAL MODAL ── */}
      <Modal visible={showGoalModal} transparent animationType="slide" onRequestClose={() => setShowGoalModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowGoalModal(false)} />
          <View style={s.modalCard}>
            <View style={s.modalTitleRow}>
              <Text style={s.modalTitle}>{editingGoal ? 'Edit' : 'Add'} IEP Goal</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>Goal Area</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {GOAL_AREAS.map(g => (
                  <TouchableOpacity key={g} style={[s.gradeChip, draftGoal.area === g && s.gradeChipActive]} onPress={() => setDraftGoal(d => ({ ...d, area: g }))}>
                    <Text style={[s.gradeChipText, draftGoal.area === g && s.gradeChipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.formLabel}>Goal Text</Text>
              <TextInput style={[s.input, { height: 100 }]} value={draftGoal.text} onChangeText={v => setDraftGoal(d => ({ ...d, text: v }))} placeholder="e.g. Will read a 3rd grade passage and answer 4/5 comprehension questions." multiline placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Baseline</Text>
              <TextInput style={s.input} value={draftGoal.baseline} onChangeText={v => setDraftGoal(d => ({ ...d, baseline: v }))} placeholder="e.g. Currently reads at a 1st grade level." placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Target</Text>
              <TextInput style={s.input} value={draftGoal.target} onChangeText={v => setDraftGoal(d => ({ ...d, target: v }))} placeholder="e.g. Read at a 3rd grade level by end of year." placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Progress</Text>
              <View style={s.progressRow}>
                <Text style={s.progressText}>{draftGoal.progress || 0}%</Text>
                <TouchableOpacity style={s.progressBtn} onPress={() => setDraftGoal(d => ({ ...d, progress: Math.max(0, (d.progress || 0) - 10) }))}><Text style={s.progressBtnText}>-</Text></TouchableOpacity>
                <TouchableOpacity style={s.progressBtn} onPress={() => setDraftGoal(d => ({ ...d, progress: Math.min(100, (d.progress || 0) + 10) }))}><Text style={s.progressBtnText}>+</Text></TouchableOpacity>
              </View>
              <Text style={s.formLabel}>School Year</Text>
              <TextInput style={s.input} value={draftGoal.year} onChangeText={v => setDraftGoal(d => ({ ...d, year: v }))} placeholder="e.g. 2023-2024" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Notes (optional)</Text>
              <TextInput style={[s.input, { height: 80 }]} value={draftGoal.notes} onChangeText={v => setDraftGoal(d => ({ ...d, notes: v }))} placeholder="e.g. As measured by teacher-administered reading assessments." multiline placeholderTextColor={COLORS.textLight} />
              <TouchableOpacity style={s.primaryBtn} onPress={saveGoal}>
                <Text style={s.primaryBtnText}>Save Goal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── MEETING MODAL ── */}
      <Modal visible={showMeetingModal} transparent animationType="slide" onRequestClose={() => setShowMeetingModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowMeetingModal(false)} />
          <View style={s.modalCard}>
            <View style={s.modalTitleRow}>
              <Text style={s.modalTitle}>{editingMeeting ? 'Edit' : 'Log'} IEP Meeting</Text>
              <TouchableOpacity onPress={() => setShowMeetingModal(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>Meeting Date</Text>
              <TextInput style={s.input} value={draftMeeting.date} onChangeText={v => setDraftMeeting(d => ({ ...d, date: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Meeting Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {MEETING_TYPES.map(t => (
                  <TouchableOpacity key={t} style={[s.gradeChip, draftMeeting.type === t && s.gradeChipActive]} onPress={() => setDraftMeeting(d => ({ ...d, type: t }))}>
                    <Text style={[s.gradeChipText, draftMeeting.type === t && s.gradeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.formLabel}>Attendees (comma-separated)</Text>
              <TextInput style={s.input} value={draftMeeting.attendees} onChangeText={v => setDraftMeeting(d => ({ ...d, attendees: v }))} placeholder="e.g. Mom, Dad, Ms. Smith, Dr. Jones" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>What was discussed?</Text>
              <TextInput style={[s.input, { height: 100 }]} value={draftMeeting.discussed} onChangeText={v => setDraftMeeting(d => ({ ...d, discussed: v }))} multiline placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Decisions made?</Text>
              <TextInput style={[s.input, { height: 100 }]} value={draftMeeting.decisions} onChangeText={v => setDraftMeeting(d => ({ ...d, decisions: v }))} multiline placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Action items (one per line)</Text>
              <TextInput style={[s.input, { height: 100 }]} value={draftMeeting.actions} onChangeText={v => setDraftMeeting(d => ({ ...d, actions: v }))} multiline placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>How did you feel about this meeting?</Text>
              {MEETING_FEELINGS.map(f => (
                <TouchableOpacity key={f.value} style={[s.radioRow, draftMeeting.feeling === f.value && s.radioRowActive]} onPress={() => setDraftMeeting(d => ({ ...d, feeling: f.value }))}>
                  <View style={[s.radioCircle, draftMeeting.feeling === f.value && s.radioCircleActive]} />
                  <Text style={s.radioText}>{f.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.primaryBtn} onPress={saveMeeting}>
                <Text style={s.primaryBtnText}>Save Meeting</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const cs = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  setupBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md },
  setupBtnText: { color: COLORS.text, fontWeight: '500' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', ...SHADOWS.sm },
  tab: { flex: 1, padding: SPACING.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.text, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary },
  contentScroll: { flex: 1, padding: SPACING.md },
  sectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm, letterSpacing: 0.5 },
  addBtn: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.sm },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl, backgroundColor: 'white', borderRadius: RADIUS.lg, marginVertical: SPACING.md },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', marginBottom: SPACING.sm },
  emptySub: { color: COLORS.text, textAlign: 'center', maxWidth: '80%' },
  goObsBtn: { marginTop: SPACING.lg, padding: SPACING.md },
  goObsBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  // Checklist
  checklist: { backgroundColor: 'white', padding: SPACING.md, borderRadius: RADIUS.lg, ...SHADOWS.sm },
  checklistItem: { fontSize: FONT_SIZES.md, marginBottom: SPACING.sm, color: COLORS.text },
  // Script Cards
  scriptCard: { backgroundColor: 'white', borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm, overflow: 'hidden' },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  scriptIconBox: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  scriptTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text },
  scriptArrow: { fontSize: 20, color: COLORS.textLight },
  scriptBody: { padding: SPACING.md, paddingTop: 0 },
  scriptBox: { backgroundColor: COLORS.light, padding: SPACING.md, borderRadius: RADIUS.md },
  scriptBoxLabel: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', color: COLORS.text, letterSpacing: 0.5, marginBottom: SPACING.sm },
  scriptBoxText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontStyle: 'italic', lineHeight: 22 },
  scriptCopy: { color: COLORS.primary, fontWeight: 'bold', marginTop: SPACING.md, textAlign: 'right' },
  callout: { marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  calloutLabel: { fontWeight: 'bold', marginBottom: SPACING.sm },
  calloutText: { lineHeight: 20 },
  // Term Cards
  termCard: { backgroundColor: 'white', borderRadius: RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.sm, overflow: 'hidden' },
  termHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  termTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text },
  termArrow: { fontSize: 20, color: COLORS.textLight },
  termBody: { padding: SPACING.md, paddingTop: 0 },
  termDef: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  termTip: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: SPACING.md, backgroundColor: '#fff8e0', padding: SPACING.sm, borderRadius: RADIUS.sm },
  // Goal Cards
  goalCard: { backgroundColor: 'white', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  goalCardArchived: { opacity: 0.6, backgroundColor: '#eee' },
  goalArea: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', color: COLORS.text, letterSpacing: 0.5, marginBottom: SPACING.sm },
  goalText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
  goalProgressWrap: { height: 8, backgroundColor: COLORS.light, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.sm },
  goalProgressBar: { height: '100%', backgroundColor: COLORS.light },
  goalProgressFill: { height: '100%', backgroundColor: COLORS.primary },
  goalMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  goalMetaText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  goalSubText: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: 2 },
  goalActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.md, paddingTop: SPACING.md },
  goalBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, backgroundColor: COLORS.light, marginRight: SPACING.sm },
  goalBtnSecondary: { backgroundColor: '#e0e0e0' },
  goalBtnDanger: { backgroundColor: '#fbe9e7' },
  goalBtnText: { fontWeight: 'bold', color: COLORS.text },
  archiveToggle: { padding: SPACING.md, alignItems: 'center' },
  archiveToggleText: { color: COLORS.primary, fontWeight: 'bold' },
  // Meeting Cards
  meetingCard: { backgroundColor: 'white', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm, overflow: 'hidden' },
  meetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  meetingDate: { fontSize: FONT_SIZES.md, fontWeight: 'bold' },
  meetingType: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  meetingFeeling: { fontSize: 24 },
  meetingBody: { padding: SPACING.md, paddingTop: 0, borderTopWidth: 1, borderTopColor: COLORS.border },
  meetingSection: { marginBottom: SPACING.md },
  meetingSectionTitle: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', color: COLORS.text, letterSpacing: 0.5, marginBottom: SPACING.sm },
  meetingContent: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  attendeeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  attendeeChip: { backgroundColor: COLORS.light, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, marginRight: SPACING.sm, marginBottom: SPACING.sm },
  attendeeChipText: { fontSize: FONT_SIZES.sm },
  actionItem: { flexDirection: 'row', alignItems: 'flex-start' },
  actionBullet: { marginRight: SPACING.sm, fontSize: FONT_SIZES.md, color: COLORS.text },
  // Flagged Cards
  flaggedCard: { backgroundColor: 'white', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  flaggedDate: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: SPACING.sm },
  flaggedText: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md },
  tag: { backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, marginRight: SPACING.sm, marginBottom: SPACING.sm },
  tagText: { color: 'white', fontSize: FONT_SIZES.sm },
  clearFlagsBtn: { backgroundColor: '#ffebee', padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md },
  clearFlagsBtnText: { color: '#c62828', fontWeight: 'bold' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: SPACING.lg, maxHeight: '85%', ...SHADOWS.lg },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  modalClose: { fontSize: 20, color: COLORS.textLight },
  formLabel: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.light, padding: SPACING.md, borderRadius: RADIUS.md, fontSize: FONT_SIZES.md, marginBottom: SPACING.md },
  primaryBtn: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md },
  gradeChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill, backgroundColor: COLORS.light, marginRight: SPACING.sm },
  gradeChipActive: { backgroundColor: COLORS.primary },
  gradeChipText: { fontWeight: '500' },
  gradeChipTextActive: { color: 'white' },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  radioRowActive: { backgroundColor: '#eff6ff' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, marginRight: SPACING.md },
  radioCircleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  radioText: { fontSize: FONT_SIZES.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  progressText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', marginRight: SPACING.lg },
  progressBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center', marginHorizontal: SPACING.sm },
  progressBtnText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
});
