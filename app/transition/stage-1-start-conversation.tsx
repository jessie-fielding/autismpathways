import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { scheduleStage1FollowUp, cancelStage1FollowUp } from '../../lib/transitionNotification';

const CHECKLIST_KEY = 'ap_transition_stage1_checklist';

const CHECKLIST_ITEMS = [
  { id: 'request_transition_iep', emoji: '📋', title: 'Request transition goals be added to the IEP', desc: 'At age 14, IDEA requires transition planning to begin. If your IEP doesn\'t include it, request it in writing.', free: true },
  { id: 'strengths_assessment', emoji: '💪', title: 'Complete a strengths & interests assessment', desc: 'Transition planning must be based on your child\'s interests, preferences, and strengths — not just deficits.', free: true },
  { id: 'course_of_study', emoji: '📚', title: 'Discuss course of study', desc: 'What classes will prepare your child for their post-secondary goals? This should be documented in the IEP.', free: true },
  { id: 'post_secondary_goals', emoji: '🎯', title: 'Start thinking about post-secondary goals', desc: 'Education, employment, and independent living goals don\'t have to be final — but the conversation should start now.', free: true },
  { id: 'agency_connections', emoji: '🤝', title: 'Connect with your state\'s DD agency', desc: 'If you haven\'t applied for the waiver yet, do it now. Also ask about Pre-ETS (Pre-Employment Transition Services). We\'ll remind you to follow up in 60 days.', free: false, triggersFollowUp: true },
];

const TOPICS = [
  { emoji: '📋', title: 'What changes at 14 in the IEP', desc: 'IDEA requires transition planning to begin at 14 (or earlier in some states). The IEP must include measurable post-secondary goals and the services needed to achieve them.' },
  { emoji: '🎯', title: 'The 3 post-secondary goal areas', desc: 'Every transition IEP must address: (1) Education/Training, (2) Employment, and (3) Independent Living. Goals must be measurable and based on assessment.' },
  { emoji: '💼', title: 'Pre-Employment Transition Services (Pre-ETS)', desc: 'Students with disabilities ages 14-21 may be eligible for Pre-ETS through Vocational Rehabilitation — job exploration, work-based learning, workplace readiness, and self-advocacy training.' },
  { emoji: '🏫', title: 'Talking to your school team', desc: 'Ask your IEP team: "What transition assessments have been done? What are the post-secondary goals? What services are in place to support them?"' },
];

export default function Stage1StartConversation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CHECKLIST_KEY).then((raw) => { if (raw) setChecked(JSON.parse(raw)); });
  }, []);

  const toggleItem = async (id: string, free: boolean, triggersFollowUp?: boolean) => {
    if (!free && !isPremium) { router.push('/paywall' as any); return; }
    const nowChecked = !checked[id];
    const updated = { ...checked, [id]: nowChecked };
    setChecked(updated);
    await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
    if (triggersFollowUp && isPremium) {
      if (nowChecked) scheduleStage1FollowUp().catch(() => {});
      else cancelStage1FollowUp().catch(() => {});
    }
  };

  const completedCount = CHECKLIST_ITEMS.filter((i) => checked[i.id]).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Start the Conversation</Text>
          <Text style={styles.headerSub}>Ages 14–15 — Stage 1</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>💬</Text>
          <Text style={styles.heroTitle}>Transition planning starts at 14.</Text>
          <Text style={styles.heroDesc}>Most families don't find out until it's too late. The IEP must include transition goals — and if it doesn't, you have the right to request them.</Text>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{completedCount} of {CHECKLIST_ITEMS.length} steps complete</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Action Checklist</Text>
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checked[item.id];
          const locked = !item.free && !isPremium;
          return (
            <TouchableOpacity key={item.id} style={[styles.checkItem, isChecked && styles.checkItemDone]} onPress={() => toggleItem(item.id, item.free, (item as any).triggersFollowUp)} activeOpacity={0.8}>
              <View style={[styles.checkbox, isChecked && styles.checkboxDone]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.checkContent}>
                <View style={styles.checkTitleRow}>
                  <Text style={styles.checkEmoji}>{item.emoji}</Text>
                  <Text style={[styles.checkTitle, isChecked && styles.checkTitleDone]}>{item.title}</Text>
                  {locked && <Text style={styles.lockIcon}>🔒</Text>}
                </View>
                <Text style={styles.checkDesc}>{item.desc}</Text>
                {(item as any).triggersFollowUp && isChecked && isPremium && (
                  <View style={notifBadgeStyle}><Text style={notifBadgeTextStyle}>🔔 60-day follow-up reminder set</Text></View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>Key Topics</Text>
        {TOPICS.map((topic) => (
          <TouchableOpacity key={topic.title} style={styles.topicCard} onPress={() => setExpanded(expanded === topic.title ? null : topic.title)} activeOpacity={0.85}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicEmoji}>{topic.emoji}</Text>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicChevron}>{expanded === topic.title ? '▲' : '▼'}</Text>
            </View>
            {expanded === topic.title && <Text style={styles.topicDesc}>{topic.desc}</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.nextStageBtn} onPress={() => router.push('/transition/stage-2-build-plan' as any)} activeOpacity={0.85}>
          <Text style={styles.nextStageBtnText}>Next: Build the Plan (Ages 16–17) →</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const ACCENT = '#5B9BD5';
const notifBadgeStyle = { marginTop: 6, backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' as const };
const notifBadgeTextStyle = { fontSize: 11, color: '#2E7D32', fontWeight: '600' as const };
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: COLORS.purple },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  headerSub: { fontSize: FONT_SIZES.xs, color: ACCENT, fontWeight: '600', marginTop: 2 },
  headerSpacer: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },
  heroCard: { backgroundColor: ACCENT, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center' },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm },
  heroDesc: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20 },
  progressRow: { marginBottom: SPACING.md },
  progressLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 3 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  checkItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  checkItemDone: { backgroundColor: '#EEF5FC', borderColor: ACCENT },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm, marginTop: 2, flexShrink: 0 },
  checkboxDone: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkContent: { flex: 1 },
  checkTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  checkEmoji: { fontSize: 16 },
  checkTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, flex: 1 },
  checkTitleDone: { color: COLORS.textLight, textDecorationLine: 'line-through' },
  lockIcon: { fontSize: 14 },
  checkDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 17 },
  topicCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  topicEmoji: { fontSize: 20 },
  topicTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  topicChevron: { fontSize: 12, color: COLORS.textLight },
  topicDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 19, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextStageBtn: { backgroundColor: '#F3F0FB', borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.purple },
  nextStageBtnText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
