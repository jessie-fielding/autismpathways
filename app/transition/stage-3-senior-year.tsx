import PremiumLockSheet from '../../components/PremiumLockSheet';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { scheduleStage3FollowUp, cancelStage3FollowUp } from '../../lib/transitionNotification';
import { logScreenView, useScreenTime } from '../../lib/analytics';

const CHECKLIST_KEY = 'ap_transition_stage3_checklist';

const CHECKLIST_ITEMS = [
  { id: 'guardianship', emoji: '⚖️', title: 'Decide on guardianship vs. alternatives', desc: 'Full guardianship removes your child\'s legal rights. Consider supported decision-making, power of attorney, or limited guardianship first.', free: true },
  { id: 'ssi_apply', emoji: '💰', title: 'Apply for SSI at 17y 9m', desc: 'Apply 3 months before the 18th birthday. Gather diagnosis docs, medical records, and financial info. We\'ll remind you to check your status in 90 days.', free: true, triggersFollowUp: true },
  { id: 'adult_medicaid', emoji: '🏥', title: 'Transition to adult Medicaid', desc: 'Children\'s Medicaid ends at 18 in most states. Apply for adult Medicaid and confirm your child\'s coverage continues.', free: true },
  { id: 'able_account', emoji: '💳', title: 'Open or fund ABLE account', desc: 'If you haven\'t opened an ABLE account yet, do it before 18. Contributions don\'t affect SSI or Medicaid eligibility.', free: true },
  { id: 'adult_providers', emoji: '🤝', title: 'Connect with adult service providers', desc: 'Day programs, supported employment, and residential providers often have their own waitlists. Start connecting now.', free: false },
  { id: 'letter_of_intent', emoji: '📝', title: 'Start your Letter of Intent', desc: 'A letter of intent documents your child\'s history, preferences, routines, and your wishes for their future care.', free: false },
];

const TOPICS = [
  { emoji: '⚖️', title: 'Guardianship vs. Supported Decision-Making', desc: 'Full guardianship removes all legal rights from your child. Alternatives include: Supported Decision-Making Agreements (SDMAs), Limited Guardianship, Power of Attorney, and Representative Payee for SSI. Many disability advocates recommend trying alternatives before pursuing full guardianship.' },
  { emoji: '🏥', title: 'Adult Medicaid Transition', desc: 'At 18, your child moves from children\'s Medicaid to adult Medicaid. This is not automatic in all states. Contact your state Medicaid office 6 months before the 18th birthday to ensure continuous coverage. Gaps in coverage can be costly.' },
  { emoji: '💰', title: 'SSI at 18: What Changes', desc: 'At 18, SSA re-evaluates using adult disability criteria (not childhood criteria). Parental income is no longer counted. Your child\'s own income and resources are evaluated. Most children who received SSI before 18 continue to qualify, but re-evaluation is required.' },
  { emoji: '📝', title: 'Letter of Intent', desc: 'A Letter of Intent is not a legal document, but it\'s one of the most important things you can create. It documents: your child\'s daily routines, medical history, communication style, likes/dislikes, emergency contacts, and your wishes for their future. Update it annually.' },
];

export default function Stage3SeniorYear() {
  useScreenTime('transition_stage_3');
  useEffect(() => { logScreenView('transition_stage_3'); }, []);
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
      if (nowChecked) scheduleStage3FollowUp().catch(() => {});
      else cancelStage3FollowUp().catch(() => {});
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
          <Text style={styles.headerTitle}>Senior Year Countdown</Text>
          <Text style={styles.headerSub}>Age 18 — Stage 3</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎓</Text>
          <Text style={styles.heroTitle}>Legal rights shift at 18.</Text>
          <Text style={styles.heroDesc}>Your child becomes a legal adult. Medicaid, SSI, and guardianship all require action this year. Don't let the paperwork catch you off guard.</Text>
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
                  <View style={notifBadgeStyle}><Text style={notifBadgeTextStyle}>🔔 90-day SSI status reminder set</Text></View>
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

        <TouchableOpacity style={styles.nextStageBtn} onPress={() => router.push('/transition/stage-4-navigating-gap' as any)} activeOpacity={0.85}>
          <Text style={styles.nextStageBtnText}>Next: Navigating the Gap (Ages 18–22) →</Text>
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

const ACCENT = '#E07B54';
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
  progressRow: { marginBottom: SPACING.md },
  progressLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 3 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  checkItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  checkItemDone: { backgroundColor: '#FDF3EE', borderColor: ACCENT },
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
  nextStageBtn: { backgroundColor: '#FDF3EE', borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.md, borderWidth: 1, borderColor: ACCENT },
  nextStageBtnText: { color: ACCENT, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
