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
  Alert, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useChildChanged } from '../../hooks/useChildChanged';

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
          { objection: `"We do our own assessment — parental notes aren\'t part of our process."`, response: "I'd like to understand your process better. Research shows parent-reported observations are clinically significant in autism diagnosis. Can you tell me how parent input is factored into your evaluation?" },
        ],
      },
      {
        script: "We're concerned about a potential autism diagnosis. Early identification is important for accessing services — especially school supports and Medicaid-funded therapies. Time matters for [CHILD].",
        pushbacks: [
          { objection: `"A diagnosis isn\'t always necessary to get services."`, response: "In our experience and from what we've researched, many of the most effective services — ABA therapy, certain school accommodations, and waiver programs — require a formal diagnosis. Can you help us understand what [CHILD] could access with and without a diagnosis?" },
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
          { objection: `"The behaviors aren\'t severe enough to warrant a BSP."`, response: "A BSP isn't just for severe behaviors — it's for any behavior that's impeding learning. [CHILD]'s behaviors are impacting their ability to access instruction. I'd like this formally assessed and addressed in the IEP." },
        ],
      },
      {
        script: "I'd like to discuss [CHILD]'s least restrictive environment. I want to understand what supports would allow [CHILD] to be successful in a general education setting before we consider a more restrictive placement.",
        pushbacks: [],
      },
      {
        script: "I'm requesting an independent educational evaluation at the district's expense. I disagree with the school's evaluation findings and I believe an outside evaluator would give us a more complete picture.",
        pushbacks: [
          { objection: `"You\'d need to pay for that yourself."`, response: "Under IDEA, if I disagree with the school's evaluation, I have the right to request an IEE at public expense. I'm formally making that request now. Can you provide me with the district's IEE policy in writing?" },
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
    subtitle: 'Getting coverage for therapies and services',
    points: [
      {
        script: "I'm calling to verify [CHILD]'s benefits for autism-related therapies, specifically ABA, speech, and occupational therapy. Can you confirm coverage details, including deductibles, co-pays, and out-of-pocket maximums?",
        pushbacks: [
          { objection: '"Autism is not a covered diagnosis."', response: "My state has an autism insurance mandate. Can you confirm that you are in compliance with [STATE]'s autism insurance laws? I'd like to speak with a supervisor if you're unable to confirm this." },
          { objection: '"We only cover in-network providers."', response: "Can you provide me with a list of in-network providers for ABA, speech, and occupational therapy in my area? If there are no in-network providers available, what is the process for obtaining an out-of-network exception?" },
        ],
      },
      {
        script: "I'm requesting a copy of [CHILD]'s Explanation of Benefits (EOB) for recent therapy sessions. I want to ensure that claims are being processed correctly and that benefits are being applied as expected.",
        pushbacks: [],
      },
      {
        script: "I'm appealing a denial for [CHILD]'s therapy services. I believe this denial was made in error and I have documentation to support the medical necessity of these services. Can you guide me through the appeals process?",
        pushbacks: [
          { objection: '"You need to submit a written appeal."', response: "I understand. Can you tell me exactly what documentation is required for a written appeal and where I need to send it? Is there a specific form I need to use?" },
        ],
      },
      {
        script: "I'm requesting a single case agreement for an out-of-network provider. This provider offers specialized services that are not available in-network, and I believe it's medically necessary for [CHILD].",
        pushbacks: [],
      },
      {
        script: "What are the requirements for prior authorization for [CHILD]'s ABA therapy? I want to make sure we have all the necessary documentation in place to avoid any delays or denials.",
        pushbacks: [],
      },
      {
        script: "I'm requesting a peer-to-peer review for a denied service. I'd like [CHILD]'s treating physician to speak directly with your medical reviewer to discuss the medical necessity of the service.",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Follow-up on benefits verification", timing: "Within 24 hours", script: "Hi, I'm following up on my call yesterday regarding [CHILD]'s autism benefits. Can you confirm the information you provided and send me a written summary of benefits?" },
      { title: "Follow-up on appeal", timing: "2 weeks after appeal submission", script: "Hi, I'm following up on the appeal I submitted for [CHILD]'s therapy services two weeks ago. Can you provide an update on the status of the appeal and the expected timeline for a decision?" },
      { title: "Escalation to State Department of Insurance", timing: "If insurance is non-compliant", script: "I'd like to file a complaint with the State Department of Insurance regarding my insurance company's denial of [CHILD]'s autism services. I believe they are not complying with state mandates." },
    ],
  },

  therapist: {
    icon: '🧠', color: '#F76C6C',
    title: 'Talking to Your Therapist',
    subtitle: 'Maximizing the effectiveness of therapy sessions',
    points: [
      {
        script: "I'd like to discuss [CHILD]'s therapy goals. I want to make sure they are aligned with our family's priorities and that we're seeing measurable progress in key areas.",
        pushbacks: [
          { objection: `"We're already working on these goals."`, response: "I understand, but I'd like to review them in detail. Can you explain how each goal is being addressed in sessions and what progress you're observing?" },
        ],
      },
      {
        script: "What strategies can we implement at home to support [CHILD]'s progress in therapy? I want to ensure consistency between sessions and our home environment.",
        pushbacks: [],
      },
      {
        script: "I'm concerned about [CHILD]'s motivation in therapy. Are there ways we can make sessions more engaging or incorporate [CHILD]'s interests to improve participation?",
        pushbacks: [],
      },
      {
        script: "I'd like to understand the rationale behind the therapy techniques you're using. Can you explain how these methods are supported by research and how they're tailored to [CHILD]'s specific needs?",
        pushbacks: [],
      },
      {
        script: "Can we schedule a regular check-in to discuss [CHILD]'s progress and adjust therapy goals as needed? I want to ensure we're continuously optimizing the therapy plan.",
        pushbacks: [],
      },
      {
        script: "I'm noticing some challenging behaviors at home. Can we discuss how these might be related to [CHILD]'s therapy and what strategies we can use to address them?",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Therapy progress check-in", timing: "Monthly", script: "Hi, I'm checking in on [CHILD]'s therapy progress. Can we schedule a brief call to discuss how things are going and if any adjustments are needed to the therapy plan?" },
      { title: "Behavior strategy discussion", timing: "As needed", script: "I'd like to discuss some recent challenging behaviors we're seeing at home with [CHILD]. Can we talk about potential strategies to address these in therapy and at home?" },
    ],
  },

  family: {
    icon: '🏡', color: '#6C7FF7',
    title: 'Talking to Family & Friends',
    subtitle: 'Building a supportive network',
    points: [
      {
        script: "[CHILD] has recently been diagnosed with autism. We're still learning a lot, but we wanted to share this with you so you can better understand [CHILD]'s needs and how to best support them.",
        pushbacks: [
          { objection: '"But [CHILD] seems so normal!"', response: "Autism is a spectrum, and it presents differently in everyone. [CHILD]'s autism might not be immediately obvious, but it impacts how they experience the world and interact with others. We're learning to understand their unique perspective." },
          { objection: '"All kids do that."', response: "While some behaviors might seem typical, for [CHILD], these behaviors are part of a larger pattern that impacts their daily life and development. It's not just a phase; it's how their brain is wired." },
          { objection: '"Have you tried [unsolicited advice]?"', response: "We appreciate your suggestions, and we're working closely with professionals who are guiding us. Right now, the most helpful thing you can do is to learn about autism and how it affects [CHILD] specifically." },
        ],
      },
      {
        script: "We're trying to create a consistent and predictable environment for [CHILD]. It would be really helpful if you could follow these routines when you're with them.",
        pushbacks: [],
      },
      {
        script: "[CHILD] communicates differently. Sometimes they might not make eye contact or respond verbally, but they are still listening and understanding. Here are some ways you can interact with them.",
        pushbacks: [],
      },
      {
        script: "We're focusing on [specific skill] with [CHILD] right now. If you could reinforce this when you're together, it would be a huge help.",
        pushbacks: [],
      },
      {
        script: "[CHILD] has some sensory sensitivities. Loud noises or certain textures can be overwhelming for them. We'll try to avoid those situations, and it would be great if you could too.",
        pushbacks: [],
      },
      {
        script: "We might need to leave social gatherings early if [CHILD] gets overwhelmed. Please understand that we're doing what's best for them, and it's not a reflection on you or your event.",
        pushbacks: [],
      },
    ],
    followup: [
      { title: "Share resources", timing: "Ongoing", script: "Here are some resources about autism that we've found helpful. We'd love for you to take a look when you have a moment." },
      { title: "Discuss specific behaviors", timing: "As needed", script: "I wanted to chat about [specific behavior] that [CHILD] exhibited when we were together. Can we talk about how to best respond to that in the future?" },
    ],
  },
};

// ── Main component ────────────────────────────────────────────────────────────
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

  useChildChanged(() => { loadProfile(); });

  const loadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem('ap_profile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  };

  const currentAudience = TP_CONTENT[selectedAudience];

  const getScript = (script: string) => {
    let s = script;
    if (profile.childName) s = s.replace(/\b\[CHILD\]\b/g, profile.childName);
    if (profile.childAge) s = s.replace(/\b\[AGE\]\b/g, profile.childAge);
    if (profile.diagnosis) s = s.replace(/\b\[DIAGNOSIS\]\b/g, profile.diagnosis);
    return s;
  };

  const copyToClipboard = (text: string, idx: number) => {
    Clipboard.setStringAsync(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    Alert.alert('Copied!', 'The text has been copied to your clipboard.');
  };

  const shareScript = async (text: string) => {
    try {
      await Share.share({
        message: text,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share script: ' + error.message);
    }
  };

  const renderPremiumGate = () => (
    <View style={styles.premiumGateCard}>
      <Text style={styles.premiumGateIcon}>✨</Text>
      <Text style={styles.premiumGateTitle}>Unlock All Talking Points</Text>
      <Text style={styles.premiumGateSub}>
        Go Premium to access all 5 audience types, unlimited scripts, pushback responses, and follow-up plans.
      </Text>
      <TouchableOpacity style={styles.premiumGateBtn} onPress={() => router.push('/paywall')}>
        <Text style={styles.premiumGateBtnText}>Go Premium</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* AP-branded header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>Talking Points</Text>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subheader}>Scripts for advocating for your child</Text>

        {/* Audience Selector */}
        <View style={styles.audienceSelector}>
          {Object.keys(TP_CONTENT).map((key, index) => {
            const audience = TP_CONTENT[key];
            const isLocked = !isPremium && index >= FREE_AUDIENCES;
            const isSelected = selectedAudience === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.audienceBtn,
                  { backgroundColor: isSelected ? audience.color : COLORS.white },
                  isSelected && styles.audienceBtnSelected,
                  isLocked && styles.audienceBtnLocked,
                ]}
                onPress={() => !isLocked && setSelectedAudience(key)}
                disabled={isLocked}
              >
                <Text style={styles.audienceIcon}>{audience.icon}</Text>
                <Text style={[
                  styles.audienceText,
                  { color: isSelected ? COLORS.white : COLORS.text },
                  isLocked && { color: COLORS.textLight },
                ]}>{audience.title}</Text>
                {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Talking Points List */}
        <View style={styles.pointsList}>
          <Text style={styles.pointsListTitle}>{currentAudience.title}</Text>
          <Text style={styles.pointsListSubtitle}>{currentAudience.subtitle}</Text>

          {currentAudience.points.map((point, index) => {
            const isLocked = !isPremium && index >= FREE_SCRIPTS && selectedAudience !== 'diagnostician' && selectedAudience !== 'school';
            const scriptText = getScript(point.script);
            const isCopied = copiedIdx === index;

            return (
              <View key={index} style={styles.pointCard}>
                <View style={styles.pointHeader}>
                  <View style={styles.pointNumber}><Text style={styles.pointNumberText}>{index + 1}</Text></View>
                  <Text style={styles.pointScript}>{scriptText}</Text>
                  <TouchableOpacity
                    style={[styles.copyBtn, isCopied && styles.copyBtnCopied]}
                    onPress={() => copyToClipboard(scriptText, index)}
                  >
                    <Text style={styles.copyBtnText}>{isCopied ? '✅' : '📋'}</Text>
                  </TouchableOpacity>
                </View>

                {point.pushbacks && point.pushbacks.length > 0 && (
                  <>
                    <TouchableOpacity
                      style={styles.pushbackToggle}
                      onPress={() => setExpandedPushbacks(prev => ({ ...prev, [index]: !prev[index] }))}
                    >
                      <Text style={styles.pushbackToggleText}>
                        {expandedPushbacks[index] ? 'Hide Pushbacks ▲' : 'Show Pushbacks ▼'}
                      </Text>
                    </TouchableOpacity>

                    {expandedPushbacks[index] && (
                      <View style={styles.pushbacksWrap}>
                        {point.pushbacks.map((pb, pbIdx) => (
                          <View key={pbIdx} style={styles.pushbackItem}>
                            <Text style={styles.pushbackObjLabel}>Objection:</Text>
                            <Text style={styles.pushbackObjText}>{getScript(pb.objection)}</Text>
                            <Text style={styles.pushbackRespLabel}>Response:</Text>
                            <View style={styles.pushbackRespRow}>
                              <Text style={styles.pushbackRespText}>{getScript(pb.response)}</Text>
                              <TouchableOpacity
                                style={styles.pushbackCopyBtn}
                                onPress={() => copyToClipboard(getScript(pb.response), index * 100 + pbIdx)}
                              >
                                <Text style={styles.copyBtnText}>📋</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {isLocked && renderPremiumGate()}
              </View>
            );
          })}

          {!isPremium && selectedAudience !== 'diagnostician' && selectedAudience !== 'school' && currentAudience.points.length > FREE_SCRIPTS && (
            renderPremiumGate()
          )}
        </View>

        {/* Follow-up Plans */}
        {currentAudience.followup && currentAudience.followup.length > 0 && (
          <View style={styles.pointsList}>
            <Text style={styles.pointsListTitle}>Follow-up Plans</Text>
            <Text style={styles.pointsListSubtitle}>What to do after the conversation</Text>

            {!isPremium ? (
              <View style={styles.followupTeaser}>
                <Text style={styles.followupTeaserIcon}>🗓️</Text>
                <Text style={styles.followupTeaserTitle}>Unlock Follow-up Plans</Text>
                <Text style={styles.followupTeaserSub}>
                  Go Premium to access detailed follow-up plans for every audience, ensuring you never miss a step.
                </Text>
                <TouchableOpacity style={styles.premiumGateBtn} onPress={() => router.push('/paywall')}>
                  <Text style={styles.premiumGateBtnText}>Go Premium</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.followupCard}>
                {currentAudience.followup.map((step, index) => (
                  <View key={index} style={[styles.followupItem, index < currentAudience.followup.length - 1 && styles.followupItemBorder]}>
                    <View style={styles.followupStep}><Text style={styles.followupStepText}>{index + 1}</Text></View>
                    <View style={styles.followupBody}>
                      <Text style={styles.followupTitle}>{step.title}</Text>
                      {step.timing && <Text style={styles.followupTiming}>{step.timing}</Text>}
                      <View style={styles.followupScriptRow}>
                        <Text style={styles.followupScript}>{getScript(step.script)}</Text>
                        <TouchableOpacity
                          style={styles.pushbackCopyBtn}
                          onPress={() => copyToClipboard(getScript(step.script), index * 1000)}
                        >
                          <Text style={styles.copyBtnText}>📋</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerBar: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  backBtn: { paddingVertical: SPACING.xs },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerBarTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  homeBtn: { paddingVertical: SPACING.xs },
  homeText: { fontSize: 20 },
  rainbow: { height: 4 },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  subheader: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  // Audience selector
  audienceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  audienceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  audienceBtnSelected: {
    borderColor: 'transparent',
  },
  audienceBtnLocked: {
    opacity: 0.6,
  },
  audienceIcon: {
    fontSize: FONT_SIZES.sm,
  },
  audienceText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.xs,
  },
  // Talking points list
  pointsList: {
    marginBottom: SPACING.xl,
  },
  pointsListTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  pointsListSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
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
