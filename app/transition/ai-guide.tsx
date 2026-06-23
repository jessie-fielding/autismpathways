/**
 * Transition Pathway AI Guide
 *
 * Generates a personalized transition action plan using the child's profile
 * (name, age, state, diagnosis level, concerns) + user-selected goals and timeline.
 *
 * Free: Download PDF summary
 * Premium: Full interactive in-app guide with deep links to all premium tools
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Share, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useActiveChild } from '../../services/childManager';
import { trackPaywallViewed } from '../../../lib/analytics';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GuideStep {
  number: number;
  title: string;
  description: string;
  toolRoute?: string;
  toolLabel?: string;
  accentColor: string;
  emoji: string;
  priority: 'critical' | 'high' | 'normal';
}

interface Deadline {
  title: string;
  detail: string;
  urgency: 'overdue' | 'urgent' | 'upcoming';
}

interface GeneratedGuide {
  score: number;
  scoreLabel: string;
  scoreNote: string;
  deadlines: Deadline[];
  steps: GuideStep[];
  summary: string;
}

// ─── Goal options ─────────────────────────────────────────────────────────────
const GOALS = [
  { id: 'housing', label: '🏠 Housing & Living', desc: 'Group homes, supported living, apartments' },
  { id: 'employment', label: '💼 Employment', desc: 'Supported jobs, Pre-ETS, job coaching' },
  { id: 'college', label: '🎓 College / Vocational', desc: 'Inclusive programs, VR, Think College' },
  { id: 'financial', label: '💰 Financial Independence', desc: 'ABLE account, SSI, benefits planning' },
  { id: 'community', label: '🤝 Community & Social', desc: 'Day programs, social groups, activities' },
  { id: 'medical', label: '🏥 Medical Continuity', desc: 'Adult Medicaid, waiver, healthcare transition' },
];

const TIMELINES = ['Next 6 months', '1 Year', '2+ Years'];

// ─── Stage checklist keys ─────────────────────────────────────────────────────
const STAGE_KEYS = [
  { key: 'ap_transition_stage0_checklist', total: 8 },
  { key: 'ap_transition_stage1_checklist', total: 6 },
  { key: 'ap_transition_stage2_checklist', total: 7 },
  { key: 'ap_transition_stage3_checklist', total: 7 },
  { key: 'ap_transition_stage4_checklist', total: 7 },
  { key: 'ap_transition_stage5_checklist', total: 7 },
];

// ─── Tool route map ───────────────────────────────────────────────────────────
const TOOL_ROUTES: Record<string, { route: string; label: string }> = {
  able: { route: '/transition/able-account-finder', label: 'Open ABLE Finder →' },
  preets: { route: '/transition/pre-ets-tool', label: 'Open Pre-ETS Tool →' },
  dayprogram: { route: '/transition/day-program-finder', label: 'Open Day Program Finder →' },
  grouphome: { route: '/transition/group-home-finder', label: 'Open Group Home Finder →' },
  jobs: { route: '/transition/special-needs-jobs', label: 'Open Jobs Finder →' },
  college: { route: '/transition/college-vocational-lookup', label: 'Open College Lookup →' },
  apartment: { route: '/transition/apartment-lookup', label: 'Open Apartment Finder →' },
  waiver: { route: '/transition/state-waivers', label: 'Find Waivers →' },
  provider: { route: '/provider-directory', label: 'Open Provider Directory →' },
};

// ─── Score calculation ────────────────────────────────────────────────────────
async function calculateTransitionScore(): Promise<{ completed: number; total: number }> {
  let completed = 0;
  let total = 0;
  for (const { key, total: t } of STAGE_KEYS) {
    total += t;
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const checked: string[] = JSON.parse(raw);
        completed += checked.length;
      }
    } catch { /* ignore */ }
  }
  return { completed, total };
}

// ─── Age calculation ─────────────────────────────────────────────────────────
function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const parts = dob.split('/');
  if (parts.length < 3) return null;
  const birth = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return isNaN(age) ? null : age;
}

// ─── Deadline engine (rule-based, no AI needed) ───────────────────────────────
function computeDeadlines(age: number | null, state: string): Deadline[] {
  const deadlines: Deadline[] = [];
  const today = new Date();

  if (age !== null) {
    // SSI window: can apply 3 months before 18th birthday
    if (age >= 17 && age < 18) {
      deadlines.push({
        title: 'SSI Application Window',
        detail: 'You can apply for SSI 3 months before your child\'s 18th birthday. Gather documentation now.',
        urgency: age >= 17.75 ? 'urgent' : 'upcoming',
      });
    }
    if (age >= 18 && age < 18.5) {
      deadlines.push({
        title: 'SSI Application — Act Now',
        detail: 'Your child is 18. Apply for SSI immediately if you haven\'t already.',
        urgency: 'overdue',
      });
    }
    // Waiver waitlist check
    if (age >= 14 && age % 1 < 0.1) {
      deadlines.push({
        title: 'Annual Waiver Waitlist Check',
        detail: `Call your ${state || 'state'} DD agency to confirm your child is still on the waitlist and ask about current wait times.`,
        urgency: 'upcoming',
      });
    }
    // Medicaid transition at 18
    if (age >= 17.5 && age < 18.5) {
      deadlines.push({
        title: 'Medicaid Transition to Adult Coverage',
        detail: 'Ensure adult Medicaid is in place before your child turns 18. Contact your state Medicaid office.',
        urgency: age >= 18 ? 'urgent' : 'upcoming',
      });
    }
    // IDEA services end at 22
    if (age >= 21 && age < 22) {
      deadlines.push({
        title: 'School Services End at 22',
        detail: 'IDEA-funded school services end at age 22. Ensure adult day programs or employment supports are lined up.',
        urgency: 'urgent',
      });
    }
  }

  return deadlines;
}

// ─── AI guide generation ──────────────────────────────────────────────────────
async function generateGuideFromAI(params: {
  childName: string;
  age: number | null;
  state: string;
  diagnosisLevel: string;
  goals: string[];
  timeline: string;
  completedSteps: number;
  totalSteps: number;
}): Promise<GuideStep[]> {
  const { childName, age, state, diagnosisLevel, goals, timeline, completedSteps, totalSteps } = params;

  const prompt = `You are an expert autism transition planning specialist. Generate a personalized transition action plan.

Child Profile:
- Name: ${childName || 'the child'}
- Age: ${age !== null ? age : 'unknown'}
- State: ${state || 'unknown'}
- Autism Level: ${diagnosisLevel ? `Level ${diagnosisLevel}` : 'unspecified'}
- Selected Goals: ${goals.join(', ')}
- Timeline Focus: ${timeline}
- Transition Progress: ${completedSteps} of ${totalSteps} checklist steps completed

Generate exactly 6 personalized action steps. For each step, return JSON with these exact fields:
- title: short action title (max 8 words)
- description: 2-3 sentences of specific, actionable guidance mentioning ${state || 'their state'} where relevant
- toolKey: one of [able, preets, dayprogram, grouphome, jobs, college, apartment, waiver, provider] or null if no tool applies
- accentColor: one of [#7C5CBF, #3BBFA3, #F59E0B, #6366F1, #E07B6A, #10B981]
- emoji: a single relevant emoji
- priority: one of [critical, high, normal]

Prioritize steps based on the selected goals (${goals.join(', ')}) and timeline (${timeline}).
For younger children (under 16), focus on waitlists, documentation, and early planning.
For older teens (16-18), focus on SSI, Medicaid transition, Pre-ETS, and post-secondary planning.
For young adults (18-22), focus on day programs, employment, housing, and adult services.

Return ONLY a valid JSON array of 6 step objects. No markdown, no explanation.`;

  const res = await fetch(`${API_BASE}/api/provider-translator/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: prompt, mode: 'guide_generation' }),
  });

  if (!res.ok) throw new Error('Failed to generate guide');
  const data = await res.json();

  // Parse the AI response
  let rawSteps: any[] = [];
  try {
    const content = data.result || data.translation || data.text || '';
    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) rawSteps = JSON.parse(match[0]);
  } catch {
    throw new Error('Could not parse AI response');
  }

  return rawSteps.map((s: any, i: number) => ({
    number: i + 1,
    title: s.title || `Step ${i + 1}`,
    description: s.description || '',
    toolRoute: s.toolKey && TOOL_ROUTES[s.toolKey] ? TOOL_ROUTES[s.toolKey].route : undefined,
    toolLabel: s.toolKey && TOOL_ROUTES[s.toolKey] ? TOOL_ROUTES[s.toolKey].label : undefined,
    accentColor: s.accentColor || COLORS.purple,
    emoji: s.emoji || '📋',
    priority: s.priority || 'normal',
  }));
}

// ─── Fallback guide (rule-based, no AI) ──────────────────────────────────────
function buildFallbackGuide(age: number | null, goals: string[], state: string): GuideStep[] {
  const steps: GuideStep[] = [];

  if (goals.includes('financial') || !goals.length) {
    steps.push({
      number: 1, emoji: '💰', accentColor: COLORS.teal, priority: 'high',
      title: 'Open an ABLE Account',
      description: `${state || 'Your state'} has an ABLE program that lets families save up to $18,000/year without affecting SSI or Medicaid eligibility. Open one as early as possible.`,
      toolRoute: TOOL_ROUTES.able.route, toolLabel: TOOL_ROUTES.able.label,
    });
  }
  if (goals.includes('employment') || goals.includes('college') || !goals.length) {
    steps.push({
      number: 2, emoji: '🎓', accentColor: COLORS.purple, priority: 'high',
      title: 'Explore Pre-ETS Services',
      description: `Pre-Employment Transition Services (Pre-ETS) through Vocational Rehabilitation are free for students with disabilities ages 14–21. Services include job exploration, workplace readiness, and self-advocacy training.`,
      toolRoute: TOOL_ROUTES.preets.route, toolLabel: TOOL_ROUTES.preets.label,
    });
  }
  if (goals.includes('community') || !goals.length) {
    steps.push({
      number: 3, emoji: '🏢', accentColor: '#F59E0B', priority: 'normal',
      title: 'Research Adult Day Programs',
      description: `Adult day programs provide structured activities, skill-building, and social connection. Many programs in ${state || 'your state'} have 2–3 year waitlists — start researching now.`,
      toolRoute: TOOL_ROUTES.dayprogram.route, toolLabel: TOOL_ROUTES.dayprogram.label,
    });
  }
  if (goals.includes('housing') || !goals.length) {
    steps.push({
      number: 4, emoji: '🏠', accentColor: '#6366F1', priority: 'normal',
      title: 'Explore Housing Options',
      description: `Group homes, supported living, and special needs apartments are all options depending on your child's support needs. Many have long waitlists — start exploring early.`,
      toolRoute: TOOL_ROUTES.grouphome.route, toolLabel: TOOL_ROUTES.grouphome.label,
    });
  }
  if (goals.includes('medical') || !goals.length) {
    steps.push({
      number: 5, emoji: '📋', accentColor: COLORS.teal, priority: 'high',
      title: 'Check Waiver Waitlist Status',
      description: `Call your ${state || 'state'} DD agency to confirm your child is still on the waitlist and ask about current wait times. Do this annually.`,
      toolRoute: TOOL_ROUTES.waiver.route, toolLabel: TOOL_ROUTES.waiver.label,
    });
  }
  steps.push({
    number: steps.length + 1, emoji: '🤝', accentColor: '#10B981', priority: 'normal',
    title: 'Find Autism-Specialized Providers',
    description: `Having the right team of providers is essential for a smooth transition. Our directory includes ABA, speech, OT, psychiatry, and advocacy providers in your state.`,
    toolRoute: TOOL_ROUTES.provider.route, toolLabel: TOOL_ROUTES.provider.label,
  });

  return steps.slice(0, 6).map((s, i) => ({ ...s, number: i + 1 }));
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TransitionAIGuideScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium } = useIsPremium();
  const { child } = useActiveChild();

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const childName = child?.name || profile?.childName || 'your child';
  const age = calcAge(child?.dob || profile?.dob);
  const state = child?.diagnosis ? '' : (profile?.state || '');
  const diagnosisLevel = child?.diagnosisLevel || profile?.diagnosisLevel || '';
  const childState = profile?.state || '';

  // Input state
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('Next 6 months');

  // Guide state
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [guide, setGuide] = useState<GeneratedGuide | null>(null);
  const [scoreData, setScoreData] = useState<{ completed: number; total: number }>({ completed: 0, total: 42 });

  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('profile').then(raw => {
      if (raw) setProfile(JSON.parse(raw));
    });
    calculateTransitionScore().then(setScoreData);
  }, []);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setPhase('loading');
    try {
      const { completed, total } = await calculateTransitionScore();
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;
      const deadlines = computeDeadlines(age, childState);

      let steps: GuideStep[];
      if (isPremium) {
        try {
          steps = await generateGuideFromAI({
            childName, age, state: childState, diagnosisLevel,
            goals: selectedGoals, timeline,
            completedSteps: completed, totalSteps: total,
          });
        } catch {
          // Fallback to rule-based if AI fails
          steps = buildFallbackGuide(age, selectedGoals, childState);
        }
      } else {
        steps = buildFallbackGuide(age, selectedGoals, childState);
      }

      const scoreLabel = score >= 75 ? 'Excellent Progress' : score >= 50 ? 'On Track' : score >= 25 ? 'Getting Started' : 'Just Beginning';
      const scoreNote = `Based on ${completed} completed checklist step${completed !== 1 ? 's' : ''} across all transition stages`;

      setGuide({ score, scoreLabel, scoreNote, deadlines, steps, summary: '' });
      setPhase('result');

      // Animate score bar
      Animated.timing(scoreAnim, {
        toValue: score / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();

    } catch (err) {
      setPhase('input');
      Alert.alert('Could not generate guide', 'Please check your connection and try again.');
    }
  };

  const handleShare = async () => {
    if (!guide) return;
    const lines = [
      `🌟 ${childName}'s Transition Guide`,
      `Transition Score: ${guide.score}/100 — ${guide.scoreLabel}`,
      '',
      '📋 Priority Action Plan:',
      ...guide.steps.map(s => `${s.number}. ${s.emoji} ${s.title}\n   ${s.description}`),
      '',
      '— Generated by Autism Pathways App',
    ];
    await Share.share({ message: lines.join('\n') });
  };

  const urgencyStyle = (u: Deadline['urgency']) => {
    if (u === 'overdue') return { bg: COLORS.errorBg, border: COLORS.errorBorder, text: COLORS.errorText, badge: COLORS.errorText, badgeBg: COLORS.errorBg };
    if (u === 'urgent') return { bg: COLORS.warningBg, border: COLORS.warningBorder, text: COLORS.warningText, badge: COLORS.warningText, badgeBg: COLORS.warningBg };
    return { bg: COLORS.infoBg, border: COLORS.infoBorder, text: COLORS.infoText, badge: COLORS.infoText, badgeBg: COLORS.infoBg };
  };

  // ── Input screen ────────────────────────────────────────────────────────────
  if (phase === 'input') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transition Guide</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ {isPremium ? 'Premium' : 'Free'}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>✨</Text>
            <Text style={styles.heroTitle}>Your Personalized{'\n'}Transition Roadmap</Text>
            <Text style={styles.heroSub}>
              {isPremium ? 'AI-powered, built for ' : 'Rule-based guide for '}
              <Text style={{ fontWeight: '700' }}>{childName}'s journey</Text>
            </Text>
          </View>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <Text style={styles.profileAvatar}>{child?.avatar || '👦'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {childName}
                {age !== null ? ` · Age ${age}` : ''}
                {childState ? ` · ${childState}` : ''}
                {diagnosisLevel ? ` · Level ${diagnosisLevel} ASD` : ''}
              </Text>
              <Text style={styles.profileSub}>Tap to update profile</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/start-here')}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are your top goals?</Text>
            <Text style={styles.sectionSub}>Select all that apply</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map(goal => {
                const active = selectedGoals.includes(goal.id);
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[styles.goalChip, active && styles.goalChipActive]}
                    onPress={() => toggleGoal(goal.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.goalChipText, active && styles.goalChipTextActive]}>{goal.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline focus</Text>
            <View style={styles.timelineRow}>
              {TIMELINES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timelineBtn, timeline === t && styles.timelineBtnActive]}
                  onPress={() => setTimeline(t)}
                >
                  <Text style={[styles.timelineBtnText, timeline === t && styles.timelineBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Generate button */}
          <View style={styles.generateSection}>
            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.85}>
              <Text style={styles.generateBtnText}>Generate My Guide ✨</Text>
            </TouchableOpacity>
            <Text style={styles.generateNote}>
              {isPremium
                ? '🤖 AI-powered, personalized to your child\'s profile and state'
                : 'Free: Download & share summary  ·  Premium: Full AI-powered interactive guide'}
            </Text>
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingTitle}>Building {childName}'s guide…</Text>
        <Text style={styles.loadingText}>Analyzing profile, state resources, and transition stage progress</Text>
      </View>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────────
  if (!guide) return null;

  const scoreBarWidth = scoreAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => setPhase('input')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{childName}'s Guide</Text>
        <TouchableOpacity onPress={() => setPhase('input')}>
          <Text style={styles.regenerateText}>🔄 Redo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Score card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreIcon}>📊</Text>
            <Text style={styles.scoreTitle}>Transition Score</Text>
          </View>
          <View style={styles.scoreBarTrack}>
            <Animated.View style={[styles.scoreBarFill, { width: scoreBarWidth }]} />
          </View>
          <Text style={styles.scoreValue}>{guide.score} / 100 — <Text style={{ color: COLORS.purple }}>{guide.scoreLabel}</Text></Text>
          <Text style={styles.scoreNote}>{guide.scoreNote}</Text>
        </View>

        {/* Deadlines */}
        {guide.deadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Act Now — Critical Deadlines</Text>
            {guide.deadlines.map((d, i) => {
              const s = urgencyStyle(d.urgency);
              return (
                <View key={i} style={[styles.deadlineCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <View style={styles.deadlineRow}>
                    <Text style={[styles.deadlineTitle, { color: s.text }]}>{d.title}</Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: s.badgeBg, borderColor: s.badge }]}>
                      <Text style={[styles.urgencyText, { color: s.badge }]}>
                        {d.urgency === 'overdue' ? 'Overdue' : d.urgency === 'urgent' ? 'Urgent' : 'Upcoming'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.deadlineDetail, { color: s.text }]}>{d.detail}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Action plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Your Priority Action Plan</Text>
          {guide.steps.map((step) => (
            <View key={step.number} style={[styles.stepCard, { borderLeftColor: step.accentColor }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNum, { backgroundColor: step.accentColor }]}>
                  <Text style={styles.stepNumText}>{step.number}</Text>
                </View>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDesc}>{step.description}</Text>
              {step.toolRoute && isPremium && (
                <TouchableOpacity
                  style={styles.stepToolLink}
                  onPress={() => router.push(step.toolRoute as any)}
                >
                  <Text style={[styles.stepToolLinkText, { color: step.accentColor }]}>{step.toolLabel}</Text>
                </TouchableOpacity>
              )}
              {step.toolRoute && !isPremium && (
                <TouchableOpacity
                  style={styles.stepToolLinkLocked}
                  onPress={() => (trackPaywallViewed('transition_ai_guide'), router.push('/paywall'))}
                >
                  <Text style={styles.stepToolLinkLockedText}>🔒 Unlock tool with Premium</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Premium upsell */}
        {!isPremium && (
          <View style={styles.premiumUpsell}>
            <Text style={styles.premiumUpsellTitle}>⭐ Unlock the Full AI Guide</Text>
            <Text style={styles.premiumUpsellText}>
              Get AI-personalized steps, deep links to all 7 premium lookup tools, and follow-up reminders.
            </Text>
            <TouchableOpacity style={styles.premiumUpsellBtn} onPress={() => (trackPaywallViewed('transition_ai_guide'), router.push('/paywall'))}>
              <Text style={styles.premiumUpsellBtnText}>Upgrade to Premium →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Download / Share */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleShare}>
          <Text style={styles.downloadBtnText}>📥 Download / Share Summary</Text>
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          <Text style={styles.progressDotsText}>
            {scoreData.completed} of {scoreData.total} checklist steps complete
          </Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: Math.min(8, scoreData.total) }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < Math.round((scoreData.completed / scoreData.total) * 8) && styles.dotFilled,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.text, flex: 1, textAlign: 'center' },
  premiumBadge: {
    backgroundColor: '#FFF8E1', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: '#F59E0B', width: 80, alignItems: 'center',
  },
  premiumBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#92400E' },
  regenerateText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600', width: 60, textAlign: 'right' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', gap: SPACING.lg },
  loadingTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', paddingHorizontal: SPACING.xxxl },
  hero: {
    backgroundColor: COLORS.lavender, margin: SPACING.lg, borderRadius: RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  heroEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.purpleDark, textAlign: 'center', lineHeight: 28 },
  heroSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginTop: SPACING.sm, textAlign: 'center' },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  profileAvatar: { fontSize: 28 },
  profileName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  profileSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  editIcon: { fontSize: 18 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  sectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.md },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  goalChip: {
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
    minWidth: '47%', alignItems: 'center',
  },
  goalChipActive: { backgroundColor: COLORS.lavender, borderColor: COLORS.purple },
  goalChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  goalChipTextActive: { color: COLORS.purpleDark },
  timelineRow: { flexDirection: 'row', gap: SPACING.sm },
  timelineBtn: {
    flex: 1, borderRadius: RADIUS.sm, paddingVertical: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center',
  },
  timelineBtnActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  timelineBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  timelineBtnTextActive: { color: COLORS.white },
  generateSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  generateBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingVertical: SPACING.lg,
    alignItems: 'center', ...SHADOWS.sm,
  },
  generateBtnText: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.white },
  generateNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 17 },
  scoreCard: {
    backgroundColor: COLORS.white, margin: SPACING.lg, borderRadius: RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
    borderLeftColor: COLORS.purple, ...SHADOWS.sm,
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  scoreIcon: { fontSize: 20 },
  scoreTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  scoreBarTrack: {
    height: 10, backgroundColor: COLORS.border, borderRadius: RADIUS.pill,
    overflow: 'hidden', marginBottom: SPACING.sm,
  },
  scoreBarFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.pill },
  scoreValue: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  scoreNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 4 },
  deadlineCard: {
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  deadlineTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', flex: 1 },
  urgencyBadge: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderWidth: 1, marginLeft: SPACING.sm,
  },
  urgencyText: { fontSize: 10, fontWeight: '700' },
  deadlineDetail: { fontSize: FONT_SIZES.xs, lineHeight: 17 },
  stepCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 4, ...SHADOWS.sm,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  stepEmoji: { fontSize: 18 },
  stepTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  stepDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, marginBottom: SPACING.sm },
  stepToolLink: { alignSelf: 'flex-start' },
  stepToolLinkText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  stepToolLinkLocked: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  stepToolLinkLockedText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.warningText },
  premiumUpsell: {
    backgroundColor: COLORS.lavender, marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.lavenderAccent,
  },
  premiumUpsellTitle: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.purpleDark, marginBottom: SPACING.sm },
  premiumUpsellText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg },
  premiumUpsellBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.md,
  },
  premiumUpsellBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  downloadBtn: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.purple, backgroundColor: COLORS.white,
  },
  downloadBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  progressDots: { alignItems: 'center', paddingBottom: SPACING.lg },
  progressDotsText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.sm },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  dotFilled: { backgroundColor: COLORS.purple },
});
