import PremiumLockSheet from '../../components/PremiumLockSheet';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { scheduleStage2FollowUp, cancelStage2FollowUp } from '../../lib/transitionNotification';

const CHECKLIST_KEY = 'ap_transition_stage2_checklist';

const CHECKLIST_ITEMS = [
  { id: 'measurable_goals', emoji: '🎯', title: 'Ensure IEP has measurable post-secondary goals', desc: 'Goals must be specific, measurable, and address education/training, employment, and independent living.', free: true },
  { id: 'vr_application', emoji: '💼', title: 'Apply to Vocational Rehabilitation (VR)', desc: 'VR provides job training, education support, assistive technology, and more. Apply at 16 — don\'t wait. We\'ll remind you to follow up in 45 days.', free: true, triggersFollowUp: true },
  { id: 'pre_ets', emoji: '🏢', title: 'Explore Pre-Employment Transition Services', desc: 'Pre-ETS through VR includes job exploration, work-based learning, and workplace readiness training.', free: true },
  { id: 'ssi_prep', emoji: '💰', title: 'Prepare for SSI application at 17y 9m', desc: 'You can apply for SSI 3 months before your child\'s 18th birthday. Gather documentation now.', free: true },
  { id: 'waiver_status', emoji: '📋', title: 'Check waiver waitlist status', desc: 'Call your state DD agency to confirm your child is still on the list and ask about current wait times.', free: false },
  { id: 'adult_providers', emoji: '🏥', title: 'Start researching adult service providers', desc: 'Adult day programs, supported employment providers, and residential options often have their own waitlists.', free: false },
];

const TOPICS = [
  { emoji: '💼', title: 'Vocational Rehabilitation (VR)', desc: 'VR is a federally funded program that helps people with disabilities prepare for, find, and keep employment. Services include job coaching, education support, assistive technology, and more. Apply as early as 16 — there can be waitlists.' },
  { emoji: '💰', title: 'SSI Application Timeline', desc: 'You can apply for Supplemental Security Income (SSI) 3 months before your child turns 18. At 18, SSA re-evaluates using adult disability criteria. Apply at 17 years 9 months. Gather: diagnosis documentation, medical records, school records, and financial information.' },
  { emoji: '🎓', title: 'Post-Secondary Education Options', desc: 'Options include: community college with disability services, vocational/trade programs, Transition and Postsecondary Programs for Students with Intellectual Disabilities (TPSID), and supported education programs.' },
  { emoji: '📋', title: 'Transition IEP Requirements at 16', desc: 'By age 16 (or earlier), the IEP must include: measurable post-secondary goals, transition services to achieve those goals, and a course of study. The student must be invited to their own IEP meeting.' },
];

export default function Stage2BuildPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [lockSheet, setLockSheet] = useState<{ title: string; desc: string; emoji: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CHECKLIST_KEY).then((raw) => { if (raw) setChecked(JSON.parse(raw)); });
  }, []);

  const toggleItem = async (id: string, free: boolean, triggersFollowUp?: boolean) => {
    if (!free && !isPremium) {
      const item = CHECKLIST_ITEMS.find((i) => i.id === id);
      setLockSheet({ title: item?.title ?? 'Premium Feature', desc: item?.desc ?? '', emoji: item?.emoji ?? '⭐' });
      return;
    }
    const nowChecked = !checked[id];
    const updated = { ...checked, [id]: nowChecked };
    setChecked(updated);
    await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
    if (triggersFollowUp && isPremium) {
      if (nowChecked) scheduleStage2FollowUp().catch(() => {});
      else cancelStage2FollowUp().catch(() => {});
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
          <Text style={styles.headerTitle}>Build the Plan</Text>
          <Text style={styles.headerSub}>Ages 16–17 — Stage 2</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>📋</Text>
          <Text style={styles.heroTitle}>This is the most action-dense stage.</Text>
          <Text style={styles.heroDesc}>Vocational Rehab, SSI preparation, and measurable IEP goals all need to happen now. Don't wait — VR and adult providers often have their own waitlists.</Text>
        </View>

        {/* SSI countdown alert */}
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>⏰  SSI Application Window</Text>
          <Text style={styles.alertDesc}>Apply for SSI at 17 years, 9 months — exactly 3 months before your child's 18th birthday. SSA re-evaluates using adult criteria at 18, so timing matters.</Text>
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
                  <View style={notifBadgeStyle}><Text style={notifBadgeTextStyle}>🔔 45-day VR follow-up reminder set</Text></View>
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

        <TouchableOpacity style={styles.vrBtn} onPress={() => Linking.openURL('https://rsa.ed.gov/about/states')} activeOpacity={0.85}>
          <Text style={styles.vrBtnText}>🔗  Find Your State VR Agency →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextStageBtn} onPress={() => router.push('/transition/stage-3-senior-year' as any)} activeOpacity={0.85}>
          <Text style={styles.nextStageBtnText}>Next: Senior Year Countdown (Age 18) →</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>

      {lockSheet && (
        <PremiumLockSheet
          visible={!!lockSheet}
          onClose={() => setLockSheet(null)}
          featureTitle={lockSheet.title}
          featureDesc={lockSheet.desc}
          featureEmoji={lockSheet.emoji}
        />
      )}
    </View>
  );
}

const ACCENT = '#7C5CBF';
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
  dashText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textAlign: 'right' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },
  heroCard: { backgroundColor: ACCENT, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center' },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm },
  heroDesc: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20 },
  alertCard: { backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#F6D860', padding: SPACING.md, marginBottom: SPACING.md },
  alertTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  alertDesc: { fontSize: FONT_SIZES.sm, color: '#78350F', lineHeight: 19 },
  progressRow: { marginBottom: SPACING.md },
  progressLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 3 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  checkItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  checkItemDone: { backgroundColor: '#F3F0FB', borderColor: ACCENT },
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
  vrBtn: { backgroundColor: '#EEF5FC', borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: '#5B9BD5' },
  vrBtnText: { color: '#5B9BD5', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  nextStageBtn: { backgroundColor: '#F3F0FB', borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: ACCENT },
  nextStageBtnText: { color: ACCENT, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
