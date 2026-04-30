/**
 * Talking Points Screen
 *
 * Freemium model:
 *  - Free: first 2 audience types (Diagnostician + School/IEP) + first 5 scripts per audience
 *  - Premium: all 5 audiences + all scripts + pushback responses + follow-up scripts
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Share, Platform, Clipboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

// ── Freemium limits ────────────────────────────────────────────────────────────
const FREE_AUDIENCES   = 2;  // first N audience types unlocked
const FREE_SCRIPTS     = 5;  // first N scripts per audience unlocked

// ── Types ─────────────────────────────────────────────────────────────────────
interface Pushback { objection: string; response: string; }
interface TalkingPoint { script: string; pushbacks?: Pushback[]; }
interface FollowUpStep { title: string; script: string; timing?: string; }
interface AudienceData {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  points: TalkingPoint[];
  followup: FollowUpStep[];
}
interface Profile { childName?: string; childAge?: string; diagnosis?: string; }

// ── Content library ────────────────────────────────────────────────────────────
const TP_CONTENT: Record<string, AudienceData> = {
  diagnostician: {
    icon: '🔬', color: '#7C5CBF',
    title: 'Talking to a Diagnostician',
    subtitle: 'Getting a timely, thorough autism evaluation',
    points: [
      {
        script: "I'm seeking a comprehensive autism evaluation for [CHILD], who is [AGE]. I've observed specific, consistent behaviors over an extended period and I want to document them formally.",
        pushbacks: [
          { objection: '"Kids develop at different rates — this might just be a phase."', response: "I understand development varies, but the patterns I'm seeing have been consistent for over six months across multiple settings — home, school, and public. I'm not asking you to diagnose today. I'm asking for a formal evaluation so we have an accurate picture." },
          { objection: '"They seem fine to me in this office."', response: "That's actually very common with autism — many children can mask in a structured, one-on-one setting. The challenges show up most in unstructured environments, transitions, and sensory-heavy situations. I'd be happy to share my written observations." },
          { objection: '"We have a long waitlist."', response: "I understand you're busy. Can you add [CHILD] to the waitlist today? In the meantime, can you recommend another provider we can pursue in parallel so we're not waiting without options?" },
        ],
      },
      {
        script: "I have written observations documenting [CHILD]'s behavior. May I share these with you now, or submit them in advance so your team can review before our evaluation appointment?",
        pushbacks: [
          { objection: '"We do our own assessment — parental notes aren\'t part of our process."', response: "I'd like to understand your process better. Research shows parent-reported observations are clinically significant in autism diagnosis. Can you tell me how parent input is factored into your evaluation?" },
        ],
      },
      {
        script: "We're concerned about a potential autism diagnosis. Early identification is important for accessing services — especially school supports and Medicaid-funded therapies. Time matters for [CHILD].",
        pushbacks: [
          { objection: '"A diagnosis isn\'t always necessary to get services."', response: "In our experience and from what we've researched, many of the most effective services — ABA therapy, certain school accommodations, and waiver programs — require a formal diagnosis. Can you help us understand what [CHILD] could access with and without a diagnosis?" },
        ],
      },
      {
        script: "What specific evaluations will be conducted? I want to make sure the assessment covers speech and language, cognitive, adaptive behavior, and sensory processing — not just a checklist.",
        pushbacks: [
          { objection: '"Our standard evaluation covers everything necessary."', response: "Can you walk me through exactly what's included? I want to make sure we're not missing any domain that could affect [CHILD]'s eligibility for services down the road." },
        ],
      },
      {
        script: "How long will results take, and what happens after? I want to understand the timeline for receiving the written report and what next steps look like for accessing services.",
        pushbacks: [
          { objection: '"It usually takes 6–8 weeks for the report."', response: "Is there any way to expedite that? We're trying to get [CHILD] connected to services before the school year starts, and the report is required for the IEP process." },
        ],
      },
      {
        script: "I'd like to request a copy of all raw test scores and assessments, not just the summary. I want to be able to share the full report with [CHILD]'s school and other providers.",
        pushbacks: [],
      },
      {
        script: "If [CHILD] doesn't meet the full criteria for autism, will you document any related findings — like sensory processing differences, ADHD, or language delays — that could still support service access?",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Same-day follow-up", timing: "Within 2 hours", script: "Hi, I wanted to follow up on our conversation today about scheduling an evaluation for [CHILD]. Can you confirm I'm on the waitlist and let me know the estimated wait time?" },
      { title: "One-week check-in", timing: "7 days later", script: "Hi, this is [CHILD]'s parent. I'm following up on the evaluation request I submitted last week. I haven't received confirmation yet — can you check the status and let me know where we are in the process?" },
      { title: "Escalation call", timing: "If no response after 2 weeks", script: "I'd like to speak with the clinical director or office manager. I submitted an evaluation request for [CHILD] two weeks ago and haven't received any response. I need to understand what's causing the delay and what I can do to move this forward." },
    ],
  },

  school: {
    icon: '🏫', color: '#F5A623',
    title: 'Talking to Your School / IEP Team',
    subtitle: 'Advocating for the right supports and services',
    points: [
      {
        script: "I'm requesting a formal evaluation for [CHILD] under IDEA. I'd like this in writing. Please confirm the date my written request was received, as the 60-day evaluation timeline begins from that date.",
        pushbacks: [
          { objection: '"We can just do a pre-referral intervention first."', response: "I understand the RTI process, but I'm making a formal written request for a special education evaluation under IDEA. The school is required to respond within a specific timeframe regardless of prior interventions. Can you confirm you've received my request?" },
          { objection: '"[CHILD] is doing fine academically."', response: "Academic performance is just one area IDEA considers. I'm concerned about [CHILD]'s social-emotional development, sensory needs, and ability to access the curriculum in a way that doesn't cause significant stress. I'd like the evaluation to cover all areas of suspected disability." },
        ],
      },
      {
        script: "I want to ensure [CHILD]'s IEP goals are specific, measurable, and tied to their present levels of performance. Can we review each goal and confirm how progress will be measured and reported to me?",
        pushbacks: [
          { objection: '"These are standard goals we use for all students at this level."', response: "IEP goals are required to be individualized to [CHILD]'s specific needs and present levels. I'd like to go through each goal and make sure it reflects [CHILD]'s unique profile, not a template." },
        ],
      },
      {
        script: "I'm requesting that [CHILD]'s IEP include a Behavior Support Plan. The behaviors we're seeing are communication-based, and I want to make sure the team is addressing the underlying cause, not just the behavior.",
        pushbacks: [
          { objection: '"The behaviors aren\'t severe enough to warrant a BSP."', response: "A BSP isn't just for severe behaviors — it's for any behavior that's impeding learning. [CHILD]'s behaviors are impacting their ability to access instruction. I'd like this formally assessed and addressed in the IEP." },
        ],
      },
      {
        script: "I'd like to discuss [CHILD]'s least restrictive environment. I want to understand what supports would allow [CHILD] to be successful in a general education setting before we consider a more restrictive placement.",
        pushbacks: [],
      },
      {
        script: "I'm requesting an independent educational evaluation at the district's expense. I disagree with the school's evaluation findings and I believe an outside evaluator would give us a more complete picture.",
        pushbacks: [
          { objection: '"You\'d need to pay for that yourself."', response: "Under IDEA, if I disagree with the school's evaluation, I have the right to request an IEE at public expense. I'm formally making that request now. Can you provide me with the district's IEE policy in writing?" },
        ],
      },
      {
        script: "I want all communications about [CHILD]'s IEP documented in writing. Going forward, please follow up any verbal conversations with an email summary so we have a shared record.",
        pushbacks: [],
      },
      {
        script: "I'm invoking my right to an IEP meeting. I'd like to schedule one within the next two weeks to review [CHILD]'s current progress and discuss whether the current services are meeting their needs.",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Post-meeting summary request", timing: "Within 24 hours", script: "Thank you for today's IEP meeting. Can you please send me a copy of the meeting notes and any documents that were reviewed? I'd also like to confirm the timeline for implementing the updated goals." },
      { title: "Progress check-in", timing: "6 weeks after IEP", script: "Hi, I'm following up on [CHILD]'s IEP goals. I haven't received a progress report yet. Can you tell me how [CHILD] is progressing on each goal and whether any adjustments are needed?" },
      { title: "Escalation to Special Ed Director", timing: "If concerns aren't addressed", script: "I'd like to request a meeting with the Special Education Director. I have unresolved concerns about [CHILD]'s IEP that haven't been addressed at the building level, and I'd like to discuss them with district leadership." },
    ],
  },

  insurance: {
    icon: '📋', color: '#4BBFAD',
    title: 'Talking to Insurance',
    subtitle: 'Getting coverage for therapies and evaluations',
    points: [
      {
        script: "I'm calling to verify coverage for autism-related services for [CHILD], including ABA therapy, speech therapy, and occupational therapy. Can you confirm what's covered under our plan and what the prior authorization requirements are?",
        pushbacks: [
          { objection: '"ABA therapy requires a prior authorization."', response: "I understand. Can you walk me through the exact prior authorization process — what documentation is required, who submits it, and what the typical timeline is? I want to make sure we don't have any delays in starting services." },
        ],
      },
      {
        script: "I'm appealing the denial of [CHILD]'s [SERVICE] claim. The denial states [REASON], but [CHILD] has a documented diagnosis of [DIAG] and this service is medically necessary as determined by their treating provider.",
        pushbacks: [
          { objection: '"The service isn\'t covered under your plan."', response: "Under the Mental Health Parity and Addiction Equity Act, autism-related behavioral health services must be covered comparably to medical services. I'd like to understand specifically why this service is being excluded and receive that in writing." },
        ],
      },
      {
        script: "I'd like to request a peer-to-peer review between [CHILD]'s treating provider and your medical director. The treating provider can speak directly to the medical necessity of this service.",
        pushbacks: [],
      },
      {
        script: "I'm requesting the specific clinical criteria your plan used to deny this claim. I have the right to this information and I need it to prepare my appeal.",
        pushbacks: [
          { objection: '"That information is proprietary."', response: "Under the ACA and ERISA, I have the right to the specific clinical criteria used to make coverage decisions. Please provide this in writing within the required timeframe or I will file a complaint with the state insurance commissioner." },
        ],
      },
      {
        script: "I want to confirm: what is the deadline for filing an internal appeal, and what is the process for requesting an external independent review if the internal appeal is denied?",
        pushbacks: [],
      },
      {
        script: "I'm requesting a case manager to be assigned to [CHILD]'s case. Given the complexity of [CHILD]'s needs, I'd like a single point of contact who can help coordinate authorizations and resolve issues quickly.",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Appeal confirmation", timing: "Same day as appeal submission", script: "I'm calling to confirm receipt of my appeal for [CHILD]'s [SERVICE] claim. Can you give me a confirmation number and the expected timeline for a decision?" },
      { title: "Status check", timing: "10 days after appeal", script: "I'm following up on the appeal I submitted for [CHILD]'s [SERVICE] claim. The reference number is [NUMBER]. Can you tell me the current status and expected decision date?" },
      { title: "External review request", timing: "If internal appeal denied", script: "My internal appeal has been denied. I'm requesting an external independent review. Can you provide me with the process and timeline for submitting that request?" },
    ],
  },

  pediatrician: {
    icon: '👩‍⚕️', color: '#E8A0C8',
    title: 'Talking to Your Pediatrician',
    subtitle: 'Getting referrals, screenings, and documentation',
    points: [
      {
        script: "I'm concerned about [CHILD]'s development and I'd like to discuss a referral for a comprehensive autism evaluation. I've been tracking specific behaviors and I'd like to share my observations with you today.",
        pushbacks: [
          { objection: '"Let\'s wait and see — [CHILD] is still young."', response: "I understand the instinct to wait, but early intervention has the strongest evidence base for autism. If we wait and [CHILD] does have autism, we're losing critical intervention time. Can we at least do a formal developmental screening today and discuss next steps?" },
          { objection: '"I don\'t see any red flags."', response: "I appreciate that. But I'm seeing things at home and in other settings that concern me. Can I share my written observations? I'd also like to request a formal M-CHAT or similar screening tool to make sure we're not missing anything." },
        ],
      },
      {
        script: "I'd like [CHILD] to have a developmental screening at every well visit going forward. Can you document today's screening results in [CHILD]'s chart so we have a baseline?",
        pushbacks: [],
      },
      {
        script: "I need a referral letter for [CHILD]'s evaluation. The evaluator has asked for documentation of our concerns and any prior screenings. Can you prepare that for me?",
        pushbacks: [
          { objection: '"We don\'t typically write referral letters."', response: "I understand it's not always standard, but many evaluation centers and schools require documentation from the primary care provider. Even a brief note summarizing our discussions and any screening results would be very helpful. Can you do that?" },
        ],
      },
      {
        script: "I'd like to discuss whether [CHILD] should be referred to a developmental pediatrician or neuropsychologist in addition to the standard evaluation. I want to make sure we're getting the most comprehensive picture possible.",
        pushbacks: [],
      },
      {
        script: "Can you help me understand what documentation I'll need to access school services and Medicaid waiver programs? I want to make sure [CHILD]'s medical records are complete and support those applications.",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Referral follow-up", timing: "3 days after appointment", script: "Hi, I'm following up on the referral we discussed for [CHILD]. Can you confirm it's been submitted and give me the name of the specialist or evaluation center you referred us to?" },
      { title: "Records request", timing: "Before evaluation appointment", script: "I have an evaluation scheduled for [CHILD] and the evaluator has requested medical records. Can you send [CHILD]'s developmental screening results, growth charts, and any relevant visit notes to [EVALUATOR] at [FAX/EMAIL]?" },
    ],
  },

  waiver: {
    icon: '🗺️', color: '#5BA4E0',
    title: 'Talking to Waiver / Medicaid Staff',
    subtitle: 'Navigating waitlists, eligibility, and services',
    points: [
      {
        script: "I'd like to add [CHILD] to the [STATE] Medicaid waiver waitlist. Can you walk me through the application process and confirm what documentation I need to submit today?",
        pushbacks: [
          { objection: '"The waitlist is very long — it could be years."', response: "I understand, and that's exactly why I want to get [CHILD] on the list today. Every day we wait is another day further back. Can we start the application now?" },
        ],
      },
      {
        script: "I'm calling to confirm [CHILD]'s position on the waiver waitlist and verify that our contact information is current. I want to make sure we don't miss any notifications.",
        pushbacks: [],
      },
      {
        script: "I'd like to understand what services [CHILD] would be eligible for once they reach the top of the waitlist. Can you walk me through the typical service package and how needs are assessed?",
        pushbacks: [],
      },
      {
        script: "Are there any bridge services or interim programs [CHILD] could access while waiting for the waiver? I want to make sure we're not leaving any support on the table during the wait.",
        pushbacks: [
          { objection: '"There\'s nothing available until the waiver slot opens."', response: "I've heard that some families access state plan Medicaid services, early intervention programs, or school-based services in the interim. Can you help me understand what [CHILD] might qualify for right now?" },
        ],
      },
      {
        script: "I'm requesting a copy of [CHILD]'s waitlist application and current status in writing. I want to have documentation of when we applied and where we are in the process.",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Application confirmation", timing: "Same day as application", script: "I'm calling to confirm that [CHILD]'s waiver application was received and processed today. Can you give me a confirmation number and the date [CHILD] was added to the waitlist?" },
      { title: "Annual check-in", timing: "Every 12 months", script: "Hi, I'm calling to do our annual check-in on [CHILD]'s waiver waitlist status. Can you confirm [CHILD] is still active on the list, verify our contact information, and give me an updated estimate of wait time?" },
      { title: "Status escalation", timing: "If no movement after 2 years", script: "I'd like to speak with a supervisor about [CHILD]'s waiver application. We've been on the waitlist for [X] years and I'd like to understand if there's anything we can do to move the process forward or if there are any priority categories [CHILD] might qualify for." },
    ],
  },
};

const AUDIENCES = [
  { key: 'diagnostician', icon: '🔬', label: 'Diagnostician' },
  { key: 'school',        icon: '🏫', label: 'School / IEP' },
  { key: 'insurance',     icon: '📋', label: 'Insurance' },
  { key: 'pediatrician',  icon: '👩‍⚕️', label: 'Pediatrician' },
  { key: 'waiver',        icon: '🗺️',  label: 'Waiver' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function TalkingPointsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

  const [selectedAudience, setSelectedAudience] = useState('diagnostician');
  const [expandedPushbacks, setExpandedPushbacks] = useState<Record<number, boolean>>({});
  const [profile, setProfile] = useState<Profile>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    loadProfile();
  }, []));

  const loadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem('ap_profile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  };

  const personalize = (script: string) => {
    const child = profile.childName || 'my child';
    const age   = profile.childAge  ? `${profile.childAge}-year-old` : '';
    const diag  = profile.diagnosis || 'autism';
    return script
      .replace(/\[CHILD\]/g, child)
      .replace(/\[AGE\]/g,   age)
      .replace(/\[DIAG\]/g,  diag);
  };

  const copyToClipboard = async (text: string, idx: number) => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Clipboard.setString(text);
      }
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {}
  };

  const shareAll = async () => {
    const data  = TP_CONTENT[selectedAudience];
    const limit = isPremium ? data.points.length : FREE_SCRIPTS;
    const lines = [
      `${data.title} — Talking Points`,
      '',
      ...data.points.slice(0, limit).map((p, i) => `${i + 1}. ${personalize(p.script)}`),
      '',
      '--- Follow-Up Scripts ---',
      ...data.followup.map((s, i) => `${i + 1}. ${s.title}: ${personalize(s.script)}`),
      '',
      'Generated by Autism Pathways',
    ];
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {}
  };

  const data = TP_CONTENT[selectedAudience];
  const audienceIdx = AUDIENCES.findIndex(a => a.key === selectedAudience);
  const audienceLocked = !isPremium && audienceIdx >= FREE_AUDIENCES;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Talking Points</Text>
        <TouchableOpacity onPress={shareAll} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Rainbow bar */}
      <View style={styles.rainbow} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>🗣️</Text>
          </View>
          <Text style={styles.heroTitle}>Talking Points</Text>
          <Text style={styles.heroSub}>
            Personalized scripts for every conversation — with pushback responses built in.
          </Text>
        </View>

        {/* Audience selector */}
        <View style={styles.audienceWrap}>
          <Text style={styles.audienceLabel}>Who are you talking to?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.audienceRow}>
            {AUDIENCES.map((a, idx) => {
              const locked = !isPremium && idx >= FREE_AUDIENCES;
              const active = selectedAudience === a.key;
              return (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.audienceBtn, active && styles.audienceBtnActive, locked && styles.audienceBtnLocked]}
                  onPress={() => {
                    if (locked) {
                      router.push('/paywall');
                    } else {
                      setSelectedAudience(a.key);
                      setExpandedPushbacks({});
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.audienceBtnIcon}>{locked ? '🔒' : a.icon}</Text>
                  <Text style={[styles.audienceBtnLabel, active && styles.audienceBtnLabelActive, locked && styles.audienceBtnLabelLocked]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Context card */}
        <View style={styles.contextWrap}>
          <View style={styles.contextCard}>
            <Text style={styles.contextIcon}>💡</Text>
            <Text style={styles.contextText}>
              <Text style={styles.contextBold}>{data.title}.</Text>{' '}
              {data.subtitle}. Scripts are personalized with{' '}
              {profile.childName ? profile.childName : 'your child'}'s name.
            </Text>
          </View>
        </View>

        {/* Talking points */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionHeaderIcon, { backgroundColor: COLORS.lavender }]}>
              <Text>💬</Text>
            </View>
            <View>
              <Text style={styles.sectionHeaderTitle}>Talking Points</Text>
              <Text style={styles.sectionHeaderSub}>Tap a script to copy it</Text>
            </View>
          </View>

          {data.points.map((point, idx) => {
            const locked = !isPremium && idx >= FREE_SCRIPTS;
            const script = personalize(point.script);
            const pbOpen = expandedPushbacks[idx];

            if (locked && idx === FREE_SCRIPTS) {
              // Show premium gate after last free point
              return (
                <View key="gate" style={styles.premiumGateCard}>
                  <Text style={styles.premiumGateIcon}>🔒</Text>
                  <Text style={styles.premiumGateTitle}>
                    Unlock All {data.points.length} Talking Points
                  </Text>
                  <Text style={styles.premiumGateSub}>
                    Plus pushback responses, follow-up scripts, and all 5 audience types.
                  </Text>
                  <TouchableOpacity
                    style={styles.premiumGateBtn}
                    onPress={() => router.push('/paywall')}
                  >
                    <Text style={styles.premiumGateBtnText}>Upgrade to Premium →</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            if (locked) return null;

            return (
              <View key={idx} style={styles.pointCard}>
                {/* Script row */}
                <TouchableOpacity
                  style={styles.pointHeader}
                  onPress={() => copyToClipboard(script, idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pointNumber}>
                    <Text style={styles.pointNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.pointScript}>{script}</Text>
                  <TouchableOpacity
                    style={[styles.copyBtn, copiedIdx === idx && styles.copyBtnCopied]}
                    onPress={() => copyToClipboard(script, idx)}
                  >
                    <Text style={styles.copyBtnText}>{copiedIdx === idx ? '✓' : '📋'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Pushback toggle */}
                {point.pushbacks && point.pushbacks.length > 0 && (
                  <>
                    <TouchableOpacity
                      style={styles.pushbackToggle}
                      onPress={() => setExpandedPushbacks(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    >
                      <Text style={styles.pushbackToggleText}>
                        {pbOpen ? '▲' : '▼'} {point.pushbacks.length} pushback response{point.pushbacks.length !== 1 ? 's' : ''}
                      </Text>
                    </TouchableOpacity>

                    {pbOpen && (
                      <View style={styles.pushbacksWrap}>
                        {point.pushbacks.map((pb, pi) => (
                          <View key={pi} style={styles.pushbackItem}>
                            <Text style={styles.pushbackObjLabel}>They say:</Text>
                            <Text style={styles.pushbackObjText}>{pb.objection}</Text>
                            <Text style={styles.pushbackRespLabel}>You say:</Text>
                            <View style={styles.pushbackRespRow}>
                              <Text style={styles.pushbackRespText}>{personalize(pb.response)}</Text>
                              <TouchableOpacity
                                style={styles.pushbackCopyBtn}
                                onPress={() => copyToClipboard(personalize(pb.response), idx * 100 + pi)}
                              >
                                <Text style={styles.copyBtnText}>
                                  {copiedIdx === idx * 100 + pi ? '✓' : '📋'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>

        {/* Follow-up scripts */}
        {isPremium && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionHeaderIcon, { backgroundColor: COLORS.mint }]}>
                <Text>📅</Text>
              </View>
              <View>
                <Text style={styles.sectionHeaderTitle}>How to Follow Up</Text>
                <Text style={styles.sectionHeaderSub}>Exact scripts for getting callbacks and escalating</Text>
              </View>
            </View>

            <View style={styles.followupCard}>
              {data.followup.map((step, si) => (
                <View key={si} style={[styles.followupItem, si < data.followup.length - 1 && styles.followupItemBorder]}>
                  <View style={styles.followupStep}>
                    <Text style={styles.followupStepText}>{si + 1}</Text>
                  </View>
                  <View style={styles.followupBody}>
                    <Text style={styles.followupTitle}>{step.title}</Text>
                    {step.timing && (
                      <Text style={styles.followupTiming}>⏱ {step.timing}</Text>
                    )}
                    <View style={styles.followupScriptRow}>
                      <Text style={styles.followupScript}>{personalize(step.script)}</Text>
                      <TouchableOpacity
                        style={styles.pushbackCopyBtn}
                        onPress={() => copyToClipboard(personalize(step.script), 9000 + si)}
                      >
                        <Text style={styles.copyBtnText}>
                          {copiedIdx === 9000 + si ? '✓' : '📋'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Premium teaser for follow-ups */}
        {!isPremium && (
          <View style={[styles.section, { paddingBottom: SPACING.xxxl }]}>
            <View style={styles.followupTeaser}>
              <Text style={styles.followupTeaserIcon}>📅</Text>
              <Text style={styles.followupTeaserTitle}>Follow-Up Scripts</Text>
              <Text style={styles.followupTeaserSub}>
                Unlock exact scripts for follow-up calls, escalations, and getting callbacks — included with Premium.
              </Text>
              <TouchableOpacity
                style={styles.premiumGateBtn}
                onPress={() => router.push('/paywall')}
              >
                <Text style={styles.premiumGateBtnText}>Unlock Follow-Up Scripts →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  shareBtn: {
    backgroundColor: COLORS.lavender,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  shareBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple },

  // Rainbow
  rainbow: {
    height: 4,
    backgroundColor: COLORS.purple,
    backgroundImage: undefined,
  },

  // Hero
  hero: {
    backgroundColor: COLORS.lavender,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroIcon: {
    width: 60, height: 60,
    backgroundColor: COLORS.purple,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  heroIconText: { fontSize: 28 },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  heroSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, opacity: 0.85 },

  // Audience selector
  audienceWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.lg,
  },
  audienceLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  audienceRow: { gap: SPACING.sm, paddingRight: SPACING.lg },
  audienceBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    minWidth: 72,
  },
  audienceBtnActive: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.lavender,
  },
  audienceBtnLocked: { opacity: 0.5 },
  audienceBtnIcon: { fontSize: 22, marginBottom: 4 },
  audienceBtnLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMid, textAlign: 'center' },
  audienceBtnLabelActive: { color: COLORS.purple },
  audienceBtnLabelLocked: { color: COLORS.textLight },

  // Context card
  contextWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  contextIcon: { fontSize: 16, marginTop: 2 },
  contextText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  contextBold: { fontWeight: '700', color: COLORS.text },

  // Section
  section: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionHeaderIcon: {
    width: 36, height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  sectionHeaderSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },

  // Point card
  pointCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  pointNumber: {
    width: 26, height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  pointNumberText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.purple },
  pointScript: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
  copyBtn: {
    width: 32, height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copyBtnCopied: { backgroundColor: COLORS.successBg, borderColor: COLORS.successBorder },
  copyBtnText: { fontSize: 14 },

  // Pushbacks
  pushbackToggle: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  pushbackToggleText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple },
  pushbacksWrap: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  pushbackItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pushbackObjLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  pushbackObjText: { fontSize: FONT_SIZES.xs, fontStyle: 'italic', color: COLORS.textMid, marginBottom: SPACING.sm },
  pushbackRespLabel: { fontSize: 10, fontWeight: '700', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  pushbackRespRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  pushbackRespText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 18 },
  pushbackCopyBtn: {
    width: 26, height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Premium gate card
  premiumGateCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  premiumGateIcon: { fontSize: 28, marginBottom: SPACING.sm },
  premiumGateTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  premiumGateSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg },
  premiumGateBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    ...SHADOWS.md,
  },
  premiumGateBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },

  // Follow-up card
  followupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  followupItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, padding: SPACING.md },
  followupItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  followupStep: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  followupStepText: { fontSize: 10, fontWeight: '800', color: COLORS.purple },
  followupBody: { flex: 1 },
  followupTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  followupTiming: { fontSize: 11, fontWeight: '700', color: '#4BBFAD', marginBottom: SPACING.xs },
  followupScriptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  followupScript: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    lineHeight: 18,
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Follow-up teaser
  followupTeaser: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  followupTeaserIcon: { fontSize: 28, marginBottom: SPACING.sm },
  followupTeaserTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  followupTeaserSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg },
});
