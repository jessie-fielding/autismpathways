import PremiumLockSheet from '../../components/PremiumLockSheet';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { scheduleStage5FollowUp, cancelStage5FollowUp } from '../../lib/transitionNotification';

const CHECKLIST_KEY = 'ap_transition_stage5_checklist';

const CHECKLIST_ITEMS = [
  { id: 'housing_plan', emoji: '🏠', title: 'Create a housing plan', desc: 'Explore options: family home, supported living, group home, host home, or independent living. Each has different funding sources.', free: true },
  { id: 'employment_pathway', emoji: '💼', title: 'Establish an employment pathway', desc: 'Supported employment, competitive integrated employment, self-employment, or volunteer work — find what fits your child.', free: true },
  { id: 'special_needs_trust', emoji: '📜', title: 'Set up a Special Needs Trust', desc: 'A Special Needs Trust protects assets while preserving SSI and Medicaid eligibility. Consult a disability attorney. We\'ll remind you to review it in 6 months.', free: true, triggersFollowUp: true },
  { id: 'letter_of_intent', emoji: '📝', title: 'Complete your Letter of Intent', desc: 'Document your child\'s history, preferences, routines, medical needs, and your wishes for their future care.', free: true },
  { id: 'community_connections', emoji: '🤝', title: 'Build community connections', desc: 'Social isolation is a major risk for autistic adults. Seek out autism-friendly social groups, clubs, and activities.', free: false },
  { id: 'annual_review', emoji: '🔄', title: 'Schedule annual service reviews', desc: 'Review SSI, Medicaid, waiver services, and employment supports annually. Report changes promptly to avoid gaps.', free: false },
];

const HOUSING_OPTIONS = [
  { label: 'Family Home', desc: 'Living with family, with or without in-home supports funded by Medicaid waiver.' },
  { label: 'Supported Living', desc: 'Living in own home or apartment with paid support staff. Often funded by Medicaid HCBS waiver.' },
  { label: 'Host Home / Shared Living', desc: 'Living with a trained host family who provides support. Common in rural areas.' },
  { label: 'Group Home', desc: 'Shared residence with other adults with disabilities and 24/7 staff support.' },
  { label: 'Independent Living', desc: 'Living independently with minimal or no paid support. May use assistive technology.' },
];

const TOPICS = [
  { emoji: '📜', title: 'Special Needs Trust', desc: 'A Special Needs Trust (SNT) allows family members to leave money to a person with a disability without affecting their SSI or Medicaid eligibility. There are three types: first-party SNT, third-party SNT, and pooled trust. Consult a disability attorney to set one up correctly.' },
  { emoji: '💼', title: 'Employment Pathways', desc: 'Options include: Supported Employment (job coach, funded by VR or waiver), Competitive Integrated Employment (working alongside non-disabled peers), Customized Employment (job carved to match unique strengths), Self-Employment, and Volunteer/Community work.' },
  { emoji: '🔄', title: 'Ongoing Medicaid & SSI Management', desc: 'SSI and Medicaid require annual reviews and prompt reporting of changes. Report: changes in income, living situation, bank accounts, or marital status. Failure to report can result in overpayments that must be repaid.' },
  { emoji: '🌐', title: 'Finding Your Community', desc: 'The Autism Society, ASAN (Autistic Self Advocacy Network), local Arc chapters, and online communities like Wrong Planet and Reddit\'s r/autism can provide connection and support for autistic adults and their families.' },
];

export default function Stage5AdultLife() {
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
      if (nowChecked) scheduleStage5FollowUp().catch(() => {});
      else cancelStage5FollowUp().catch(() => {});
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
          <Text style={styles.headerTitle}>Adult Life</Text>
          <Text style={styles.headerSub}>Age 22+ — Stage 5</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🏡</Text>
          <Text style={styles.heroTitle}>Building a good life.</Text>
          <Text style={styles.heroDesc}>The school system is behind you. Now it's about building a life with meaning — work, community, housing, and connection — on your child's own terms.</Text>
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
                  <View style={notifBadgeStyle}><Text style={notifBadgeTextStyle}>🔔 6-month trust review reminder set</Text></View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>Housing Options</Text>
        {HOUSING_OPTIONS.map((opt) => (
          <View key={opt.label} style={styles.housingCard}>
            <Text style={styles.housingLabel}>🏠 {opt.label}</Text>
            <Text style={styles.housingDesc}>{opt.desc}</Text>
          </View>
        ))}

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

        <View style={styles.stateWaiverCard}>
          <Text style={styles.stateWaiverTitle}>Still waiting for waiver services?</Text>
          <Text style={styles.stateWaiverDesc}>Check your state's current waitlist status and confirm your position annually.</Text>
          <TouchableOpacity style={styles.stateWaiverBtn} onPress={() => router.push('/transition/state-waivers' as any)} activeOpacity={0.85}>
            <Text style={styles.stateWaiverBtnText}>Check Your State →</Text>
          </TouchableOpacity>
        </View>

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

const ACCENT = '#059669';
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
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.sm },
  checkItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  checkItemDone: { backgroundColor: '#ECFDF5', borderColor: ACCENT },
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
  housingCard: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  housingLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  housingDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 17 },
  topicCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  topicEmoji: { fontSize: 20 },
  topicTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  topicChevron: { fontSize: 12, color: COLORS.textLight },
  topicDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 19, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  stateWaiverCard: { backgroundColor: '#F3F0FB', borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.purple },
  stateWaiverTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple, marginBottom: 4 },
  stateWaiverDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: SPACING.sm },
  stateWaiverBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingVertical: 10, alignItems: 'center' },
  stateWaiverBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
