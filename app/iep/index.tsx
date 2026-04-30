import React, { useCallback, useRef, useState } from 'react';
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
            <Text style={cs.scriptBoxText}>"{item.script}"</Text>
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function IEPScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<'rights' | 'prep' | 'goals' | 'meetings' | 'flagged'>('rights');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Setup
  const [setup, setSetup] = useState<IEPSetup>({ grade: '', status: 'annual', district: '' });
  const [showSetup, setShowSetup] = useState(false);
  const [draftSetup, setDraftSetup] = useState<IEPSetup>({ grade: '', status: 'annual', district: '' });

  // Goals
  const [goals, setGoals] = useState<IEPGoal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [goalArea, setGoalArea] = useState('Communication');
  const [goalText, setGoalText] = useState('');
  const [goalBaseline, setGoalBaseline] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalYear, setGoalYear] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Meetings
  const [meetings, setMeetings] = useState<IEPMeeting[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [mDate, setMDate] = useState('');
  const [mType, setMType] = useState('Annual Review');
  const [mAttendees, setMAttendees] = useState('');
  const [mDiscussed, setMDiscussed] = useState('');
  const [mDecisions, setMDecisions] = useState('');
  const [mActions, setMActions] = useState('');
  const [mDocs, setMDocs] = useState('');
  const [mNextDate, setMNextDate] = useState('');
  const [mFeeling, setMFeeling] = useState('neutral');

  // Flagged obs
  const [flagged, setFlagged] = useState<FlaggedObs[]>([]);

  // ── Load ──
  useFocusEffect(useCallback(() => {
    async function load() {
      try {
        const [rawSetup, rawGoals, rawMeetings, rawFlagged, rawChecked] = await Promise.all([
          AsyncStorage.getItem('ap_iep_setup'),
          AsyncStorage.getItem('ap_iep_goals'),
          AsyncStorage.getItem('ap_iep_meetings'),
          AsyncStorage.getItem('ap_iep_flagged_obs'),
          AsyncStorage.getItem('ap_iep_checklist'),
        ]);
        if (rawSetup) setSetup(JSON.parse(rawSetup));
        if (rawGoals) setGoals(JSON.parse(rawGoals));
        if (rawMeetings) setMeetings(JSON.parse(rawMeetings));
        if (rawFlagged) setFlagged(JSON.parse(rawFlagged));
        if (rawChecked) setCheckedItems(new Set(JSON.parse(rawChecked)));
      } catch { /* ignore */ }
    }
    load();
  }, []));

  // ── Checklist ──
  async function toggleCheck(i: number) {
    const next = new Set(checkedItems);
    next.has(i) ? next.delete(i) : next.add(i);
    setCheckedItems(next);
    await AsyncStorage.setItem('ap_iep_checklist', JSON.stringify([...next]));
  }

  // ── Setup ──
  function openSetup() { setDraftSetup({ ...setup }); setShowSetup(true); }
  async function saveSetup() {
    setSetup({ ...draftSetup });
    await AsyncStorage.setItem('ap_iep_setup', JSON.stringify(draftSetup));
    setShowSetup(false);
  }

  // ── Goals ──
  function openAddGoal() {
    setEditGoalId(null); setGoalArea('Communication'); setGoalText('');
    setGoalBaseline(''); setGoalTarget(''); setGoalProgress(0);
    setGoalYear(''); setGoalNotes(''); setShowGoalModal(true);
  }
  function openEditGoal(g: IEPGoal) {
    setEditGoalId(g.id); setGoalArea(g.area); setGoalText(g.text);
    setGoalBaseline(g.baseline); setGoalTarget(g.target); setGoalProgress(g.progress);
    setGoalYear(g.year); setGoalNotes(g.notes); setShowGoalModal(true);
  }
  async function saveGoal() {
    if (!goalText.trim()) { Alert.alert('Goal description is required.'); return; }
    const newGoal: IEPGoal = {
      id: editGoalId || uid(), area: goalArea, text: goalText.trim(),
      baseline: goalBaseline.trim(), target: goalTarget.trim(),
      progress: goalProgress, year: goalYear.trim(), notes: goalNotes.trim(),
      archived: false, createdAt: editGoalId ? '' : new Date().toISOString(),
    };
    const next = editGoalId
      ? goals.map(g => g.id === editGoalId ? { ...g, ...newGoal } : g)
      : [...goals, newGoal];
    setGoals(next);
    await AsyncStorage.setItem('ap_iep_goals', JSON.stringify(next));
    setShowGoalModal(false);
  }
  async function archiveGoal(id: string) {
    const next = goals.map(g => g.id === id ? { ...g, archived: !g.archived } : g);
    setGoals(next); await AsyncStorage.setItem('ap_iep_goals', JSON.stringify(next));
  }
  async function deleteGoal(id: string) {
    Alert.alert('Delete goal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const next = goals.filter(g => g.id !== id);
        setGoals(next); await AsyncStorage.setItem('ap_iep_goals', JSON.stringify(next));
      }},
    ]);
  }

  // ── Meetings ──
  function openAddMeeting() {
    const today = new Date().toISOString().split('T')[0];
    setMDate(today); setMType('Annual Review'); setMAttendees('');
    setMDiscussed(''); setMDecisions(''); setMActions('');
    setMDocs(''); setMNextDate(''); setMFeeling('neutral');
    setShowMeetingModal(true);
  }
  async function saveMeeting() {
    if (!mDate) { Alert.alert('Please enter a meeting date.'); return; }
    const m: IEPMeeting = {
      id: uid(), date: mDate, type: mType, attendees: mAttendees,
      discussed: mDiscussed, decisions: mDecisions, actions: mActions,
      docs: mDocs, nextDate: mNextDate, feeling: mFeeling,
      savedAt: new Date().toISOString(),
    };
    const next = [m, ...meetings];
    setMeetings(next);
    await AsyncStorage.setItem('ap_iep_meetings', JSON.stringify(next));
    setShowMeetingModal(false);
  }

  // ── Clear flags ──
  async function clearFlags() {
    Alert.alert('Clear all flags?', 'This will remove all flagged observations from this view.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        setFlagged([]); await AsyncStorage.removeItem('ap_iep_flagged_obs');
      }},
    ]);
  }

  // ── Grade label ──
  const gradeLabel = setup.grade
    ? GRADE_OPTIONS.find(g => g.value === setup.grade)?.label ?? setup.grade
    : null;

  const activeGoals = goals.filter(g => !g.archived);
  const archivedGoals = goals.filter(g => g.archived);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={s.backBtn}>
          <Text style={s.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Autism <Text style={s.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 90 }} />
      </View>

      {/* Dark purple hero banner */}
      <View style={s.banner}>
        <Text style={s.bannerEyebrow}>IEP PATHWAY</Text>
        <Text style={s.bannerTitle}>Your child's <Text style={s.bannerAccent}>IEP journey</Text></Text>
        <Text style={s.bannerSub}>From first evaluation to graduation — rights, prep scripts, goal tracking, and meeting logs all in one place.</Text>
        <TouchableOpacity style={s.gradeBtn} onPress={openSetup}>
          <Text style={s.gradeBtnText}>
            {gradeLabel ? `📚 ${gradeLabel}` : '📚 Set grade level'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabBarContent}>
        {(['rights', 'prep', 'goals', 'meetings', 'flagged'] as const).map(tab => {
          const labels: Record<string, string> = { rights: '⚖️ Rights', prep: '📋 Prep', goals: '🎯 Goals', meetings: '📝 Meetings', flagged: '📌 From Obs' };
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => { setActiveTab(tab); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>{labels[tab]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab content */}
      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── RIGHTS TAB ── */}
        {activeTab === 'rights' && (
          <View>
            <Callout type="green" label="✅ Your federal rights under IDEA" text="The Individuals with Disabilities Education Act (IDEA) guarantees your child the right to a free, appropriate public education. These rights apply in every state." />

            <Text style={s.sectionLabel}>KEY TERMS EXPLAINED</Text>
            <View style={s.card}>
              {RIGHTS_TERMS.map((item, i) => (
                <View key={item.term} style={[s.rightsItem, i < RIGHTS_TERMS.length - 1 && s.rightsItemBorder]}>
                  <Text style={s.rightsTerm}>{item.term}</Text>
                  <Text style={s.rightsDef}>{item.def}</Text>
                  {item.tip && <Text style={s.rightsTip}>{item.tip}</Text>}
                </View>
              ))}
            </View>

            <Text style={s.sectionLabel}>IF THE SCHOOL SAYS NO</Text>
            <View style={s.card}>
              <Callout type="amber" label="⚠️ You always have options" text="A school denial is not final. You have the right to disagree, request mediation, or file a due process complaint." />
              {SCHOOL_SAYS_NO.map((item, i) => (
                <View key={item.term} style={[s.rightsItem, i < SCHOOL_SAYS_NO.length - 1 && s.rightsItemBorder]}>
                  <Text style={s.rightsTerm}>{item.term}</Text>
                  <Text style={s.rightsDef}>{item.def}</Text>
                </View>
              ))}
            </View>

            <Callout type="blue" label="📍 State-specific resources" text='Each state has a Parent Training and Information (PTI) center that provides free advocacy support. Search "PTI center [your state]" to find yours.' />
          </View>
        )}

        {/* ── PREP TAB ── */}
        {activeTab === 'prep' && (
          <View>
            <Text style={s.sectionLabel}>BEFORE THE MEETING — CHECKLIST</Text>
            <View style={s.card}>
              {PREP_CHECKLIST.map((item, i) => {
                const checked = checkedItems.has(i);
                return (
                  <TouchableOpacity key={item} style={[s.checkRow, i < PREP_CHECKLIST.length - 1 && s.checkRowBorder]} onPress={() => toggleCheck(i)}>
                    <View style={[s.checkbox, checked && s.checkboxChecked]}>
                      {checked && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>}
                    </View>
                    <Text style={[s.checkText, checked && s.checkTextDone]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.sectionLabel}>PUSHBACK SCRIPTS</Text>
            {PUSHBACK_SCRIPTS.map(item => <ScriptCard key={item.title} item={item} />)}

            <Callout type="green" label="✅ Always remember" text="You are an equal member of the IEP team. You have the right to bring a support person, record the meeting (check your state's law), and request any document in writing." />
          </View>
        )}

        {/* ── GOALS TAB ── */}
        {activeTab === 'goals' && (
          <View>
            <TouchableOpacity style={s.addBtn} onPress={openAddGoal}>
              <Text style={s.addBtnText}>+ Add IEP Goal</Text>
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
              <Text style={s.modalTitle}>{editGoalId ? 'Edit IEP Goal' : 'Add IEP Goal'}</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.formLabel}>Goal area</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {GOAL_AREAS.map(a => (
                  <TouchableOpacity key={a} style={[s.gradeChip, goalArea === a && s.gradeChipActive]} onPress={() => setGoalArea(a)}>
                    <Text style={[s.gradeChipText, goalArea === a && s.gradeChipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.formLabel}>Goal description</Text>
              <TextInput style={[s.input, s.textarea]} value={goalText} onChangeText={setGoalText} placeholder="e.g. By June 2025, Emma will initiate a conversation with a peer 3 out of 5 opportunities across 3 consecutive sessions." placeholderTextColor={COLORS.textLight} multiline numberOfLines={3} />
              <Text style={s.formLabel}>Baseline (where they started)</Text>
              <TextInput style={s.input} value={goalBaseline} onChangeText={setGoalBaseline} placeholder="e.g. Currently initiates 0/5 opportunities" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Target (the goal)</Text>
              <TextInput style={s.input} value={goalTarget} onChangeText={setGoalTarget} placeholder="e.g. 3/5 opportunities across 3 sessions" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Current progress: {goalProgress}%</Text>
              <View style={s.sliderRow}>
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
                  <TouchableOpacity key={v} style={[s.sliderChip, goalProgress === v && s.sliderChipActive]} onPress={() => setGoalProgress(v)}>
                    <Text style={[s.sliderChipText, goalProgress === v && s.sliderChipTextActive]}>{v}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.formLabel}>School year</Text>
              <TextInput style={s.input} value={goalYear} onChangeText={setGoalYear} placeholder="e.g. 2024-2025" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Notes</Text>
              <TextInput style={[s.input, s.textarea]} value={goalNotes} onChangeText={setGoalNotes} placeholder="Any additional notes on progress or concerns..." placeholderTextColor={COLORS.textLight} multiline numberOfLines={2} />
              <TouchableOpacity style={s.primaryBtn} onPress={saveGoal}>
                <Text style={s.primaryBtnText}>Save Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.secondaryBtn} onPress={() => setShowGoalModal(false)}>
                <Text style={s.secondaryBtnText}>Cancel</Text>
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
              <Text style={s.modalTitle}>Log IEP Meeting</Text>
              <TouchableOpacity onPress={() => setShowMeetingModal(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.formLabel}>Meeting date</Text>
              <TextInput style={s.input} value={mDate} onChangeText={setMDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Meeting type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                {MEETING_TYPES.map(t => (
                  <TouchableOpacity key={t} style={[s.gradeChip, mType === t && s.gradeChipActive]} onPress={() => setMType(t)}>
                    <Text style={[s.gradeChipText, mType === t && s.gradeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.formLabel}>Attendees (comma separated)</Text>
              <TextInput style={s.input} value={mAttendees} onChangeText={setMAttendees} placeholder="e.g. Ms. Johnson (teacher), Dr. Smith (psych), Parent" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>What was discussed</Text>
              <TextInput style={[s.input, s.textarea]} value={mDiscussed} onChangeText={setMDiscussed} placeholder="Key topics, goal reviews, placement discussions..." placeholderTextColor={COLORS.textLight} multiline numberOfLines={3} />
              <Text style={s.formLabel}>Decisions made</Text>
              <TextInput style={[s.input, s.textarea]} value={mDecisions} onChangeText={setMDecisions} placeholder="What was agreed to, changed, or approved..." placeholderTextColor={COLORS.textLight} multiline numberOfLines={3} />
              <Text style={s.formLabel}>Action items</Text>
              <TextInput style={[s.input, s.textarea]} value={mActions} onChangeText={setMActions} placeholder={'Each on a new line, e.g.\nSchool to provide OT eval by March 1 (Ms. Johnson)\nParent to send updated therapy records by Feb 15'} placeholderTextColor={COLORS.textLight} multiline numberOfLines={3} />
              <Text style={s.formLabel}>Documents signed</Text>
              <TextInput style={s.input} value={mDocs} onChangeText={setMDocs} placeholder="e.g. IEP consent, PWN received" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Next meeting date (if scheduled)</Text>
              <TextInput style={s.input} value={mNextDate} onChangeText={setMNextDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} />
              <Text style={s.formLabel}>Overall feeling about this meeting</Text>
              {MEETING_FEELINGS.map(f => (
                <TouchableOpacity key={f.value} style={[s.radioRow, mFeeling === f.value && s.radioRowActive]} onPress={() => setMFeeling(f.value)}>
                  <View style={[s.radioCircle, mFeeling === f.value && s.radioCircleActive]} />
                  <Text style={s.radioText}>{f.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[s.primaryBtn, { marginTop: SPACING.lg }]} onPress={saveMeeting}>
                <Text style={s.primaryBtnText}>Save Meeting Log</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.secondaryBtn} onPress={() => setShowMeetingModal(false)}>
                <Text style={s.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Callout styles (module-level safe — no StyleSheet references) ─────────────
const cs = StyleSheet.create({
  callout: {
    borderRadius: RADIUS.sm, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  calloutLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  calloutText: { fontSize: FONT_SIZES.sm, lineHeight: 19 },
  scriptCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOWS.sm,
  },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  scriptIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.lavender, justifyContent: 'center', alignItems: 'center' },
  scriptTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  scriptArrow: { fontSize: 16, color: COLORS.textLight, fontWeight: '700' },
  scriptBody: { padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  scriptBox: { backgroundColor: '#eff6ff', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#bfdbfe', padding: SPACING.md, marginBottom: SPACING.sm },
  scriptBoxLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#2563eb', marginBottom: 4 },
  scriptBoxText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, fontStyle: 'italic' },
  scriptCopy: { fontSize: 11, fontWeight: '600', color: '#2563eb', marginTop: SPACING.sm },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 90 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },

  // Banner
  banner: { backgroundColor: '#1a1f5e', padding: SPACING.lg, paddingBottom: SPACING.xl },
  bannerEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 6 },
  bannerAccent: { color: '#a89ee8' },
  bannerSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  gradeBtn: { marginTop: SPACING.md, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.pill, paddingVertical: 6, paddingHorizontal: 14 },
  gradeBtnText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  // Tabs
  tabBar: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 44 },
  tabBarContent: { paddingHorizontal: SPACING.sm },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.purple },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight, whiteSpace: 'nowrap' } as any,
  tabBtnTextActive: { color: COLORS.purpleDark },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: COLORS.textLight, marginBottom: SPACING.sm, marginTop: SPACING.sm },

  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.sm },

  // Rights
  rightsItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.md },
  rightsItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rightsTerm: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  rightsDef: { fontSize: 12.5, color: COLORS.textMid, lineHeight: 19 },
  rightsTip: { fontSize: 12, color: COLORS.purpleDark, fontWeight: '600', marginTop: 4 },

  // Checklist
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, gap: SPACING.sm },
  checkRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: '#3BBFA3', borderColor: '#3BBFA3' },
  checkText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, flex: 1 },
  checkTextDone: { textDecorationLine: 'line-through', color: COLORS.textLight },

  // Goals
  addBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.md, backgroundColor: COLORS.lavender },
  addBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purpleDark },
  goalCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
  goalCardArchived: { opacity: 0.6, borderStyle: 'dashed' },
  goalArea: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.purple, marginBottom: 4 },
  goalText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, lineHeight: 19, marginBottom: SPACING.sm },
  goalProgressWrap: { marginBottom: 4 },
  goalProgressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  goalProgressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.purple },
  goalMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalMetaText: { fontSize: 11, color: COLORS.textLight },
  goalSubText: { fontSize: 11, color: COLORS.textMid, marginTop: 2, lineHeight: 16 },
  goalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  goalBtn: { flex: 1, paddingVertical: 7, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  goalBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },
  goalBtnSecondary: { borderColor: COLORS.purple },
  goalBtnDanger: { borderColor: '#e8a09a' },
  archiveToggle: { paddingVertical: SPACING.sm, marginBottom: SPACING.sm },
  archiveToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },

  // Meetings
  meetingCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOWS.sm },
  meetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.lavender },
  meetingDate: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  meetingType: { fontSize: 11, fontWeight: '600', color: COLORS.purple, marginTop: 2 },
  meetingFeeling: { fontSize: 20 },
  meetingBody: { padding: SPACING.md },
  meetingSection: { marginBottom: SPACING.md },
  meetingSectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.textLight, marginBottom: 4 },
  meetingContent: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 19, flex: 1 },
  attendeeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  attendeeChip: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3 },
  attendeeChipText: { fontSize: 11, fontWeight: '600', color: COLORS.purpleDark },
  actionItem: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  actionBullet: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginTop: 1 },

  // Flagged obs
  flaggedCard: { backgroundColor: '#e3f7f1', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#a0d8cc', padding: SPACING.md, marginBottom: SPACING.sm },
  flaggedDate: { fontSize: 11, fontWeight: '600', color: '#0F6E56', marginBottom: 3 },
  flaggedText: { fontSize: 12.5, color: COLORS.text, lineHeight: 19 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  tag: { backgroundColor: 'rgba(59,191,163,0.2)', borderRadius: RADIUS.pill, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600', color: '#0F6E56' },
  clearFlagsBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.pill, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.sm },
  clearFlagsBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
  goObsBtn: { borderWidth: 1, borderColor: COLORS.purple, borderRadius: RADIUS.pill, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.sm },
  goObsBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyIcon: { fontSize: 36, marginBottom: SPACING.sm, opacity: 0.4 },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 19 },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg, maxHeight: '88%' },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textLight },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text, backgroundColor: COLORS.white, marginBottom: SPACING.md },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  gradeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm, backgroundColor: COLORS.white },
  gradeChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  gradeChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMid },
  gradeChipTextActive: { color: COLORS.white },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: 4 },
  radioRowActive: { backgroundColor: COLORS.lavender },
  radioCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border },
  radioCircleActive: { borderColor: COLORS.purple, backgroundColor: COLORS.purple },
  radioText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  sliderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  sliderChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  sliderChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  sliderChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },
  sliderChipTextActive: { color: COLORS.white },
  primaryBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.lg, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.sm },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  secondaryBtn: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.pill, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  secondaryBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
});
