import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

const CHECKLIST_KEY = 'ap_transition_stage4_checklist';

const CHECKLIST_ITEMS = [
  { id: 'confirm_ssi', emoji: '💰', title: 'Confirm SSI is active and correct', desc: 'Verify SSI payments started and the amount is correct. Report any changes in income or living situation to SSA.', free: true },
  { id: 'confirm_medicaid', emoji: '🏥', title: 'Confirm adult Medicaid is active', desc: 'Ensure there is no gap in Medicaid coverage after leaving school. Contact your state Medicaid office if needed.', free: true },
  { id: 'waiver_status_check', emoji: '📋', title: 'Check waiver waitlist status again', desc: 'Call your state DD agency. Ask your current position on the waitlist and estimated wait time.', free: true },
  { id: 'day_program', emoji: '🏢', title: 'Research day programs and adult day services', desc: 'Adult day programs provide structured activities, skill-building, and social connection. Many have waitlists.', free: true },
  { id: 'supported_employment', emoji: '💼', title: 'Explore supported employment options', desc: 'Supported employment helps people with disabilities find and keep competitive integrated employment with job coaching support.', free: false },
  { id: 'college_options', emoji: '🎓', title: 'Explore college/vocational programs', desc: 'Many community colleges and universities have inclusive programs for students with intellectual and developmental disabilities.', free: false },
];

const TOPICS = [
  { emoji: '🏢', title: 'Adult Day Programs', desc: 'Adult day programs (also called day habilitation or day services) provide structured daytime activities for adults with disabilities. Services vary widely: some focus on life skills, others on community integration or employment readiness. Many have waitlists — apply early.' },
  { emoji: '💼', title: 'Supported Employment', desc: 'Supported employment (SE) helps people with significant disabilities obtain and maintain competitive integrated employment. Job coaches provide on-the-job support. SE is funded through VR, Medicaid waivers, or state DD agencies. It\'s one of the most effective pathways to meaningful work.' },
  { emoji: '🎓', title: 'College Options for Autistic Young Adults', desc: 'Options include: Think College programs (TPSID), community college disability services, vocational/trade programs, and university-based transition programs. Many offer supported enrollment, job placement, and life skills training alongside academic coursework.' },
  { emoji: '📋', title: 'What Ends at 22 (and What Doesn\'t)', desc: 'What ends: IDEA-funded special education services, school-based therapies, transition IEP. What continues: SSI (if still eligible), Medicaid (if still eligible), ABLE account, waiver services (if approved), VR services (if still receiving).' },
];

export default function Stage4NavigatingGap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CHECKLIST_KEY).then((raw) => { if (raw) setChecked(JSON.parse(raw)); });
  }, []);

  const toggleItem = async (id: string, free: boolean) => {
    if (!free && !isPremium) { router.push('/paywall' as any); return; }
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));
  };

  const completedCount = CHECKLIST_ITEMS.filter((i) => checked[i.id]).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Navigating the Gap</Text>
          <Text style={styles.headerSub}>Ages 18–22 — Stage 4</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌉</Text>
          <Text style={styles.heroTitle}>School ends. The work continues.</Text>
          <Text style={styles.heroDesc}>The gap between school services and adult services is real. But with the right plan, you can bridge it. Focus on what's in place, not what's missing.</Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>💡  You are not alone</Text>
          <Text style={styles.alertDesc}>Hundreds of thousands of families navigate this gap every year. Connect with your local Arc chapter, autism society, or parent support group for community and resources.</Text>
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
            <TouchableOpacity key={item.id} style={[styles.checkItem, isChecked && styles.checkItemDone]} onPress={() => toggleItem(item.id, item.free)} activeOpacity={0.8}>
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

        <TouchableOpacity style={styles.nextStageBtn} onPress={() => router.push('/transition/stage-5-adult-life' as any)} activeOpacity={0.85}>
          <Text style={styles.nextStageBtnText}>Next: Adult Life (Age 22+) →</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const ACCENT = '#D97706';
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
  alertCard: { backgroundColor: '#EFF6FF', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#BFDBFE', padding: SPACING.md, marginBottom: SPACING.md },
  alertTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  alertDesc: { fontSize: FONT_SIZES.sm, color: '#1E3A8A', lineHeight: 19 },
  progressRow: { marginBottom: SPACING.md },
  progressLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 3 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  checkItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  checkItemDone: { backgroundColor: '#FFFBEB', borderColor: ACCENT },
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
  nextStageBtn: { backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.md, borderWidth: 1, borderColor: ACCENT },
  nextStageBtnText: { color: ACCENT, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
