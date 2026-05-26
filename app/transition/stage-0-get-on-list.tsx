import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import {
  scheduleAdultWaitlistNudge,
  cancelAdultWaitlistNudge,
} from '../../lib/transitionNotification';

const CHECKLIST_KEY = 'ap_transition_stage0_checklist';

const CHECKLIST_ITEMS = [
  {
    id: 'get_diagnosis',
    emoji: '📄',
    title: 'Get a formal diagnosis on record',
    desc: 'Most waivers require documentation of an intellectual or developmental disability with onset before age 22.',
    free: true,
  },
  {
    id: 'find_waiver',
    emoji: '🗺️',
    title: "Find your state's DD/ID waiver program",
    desc: 'Every state has a different program name and application process. Tap "Find Waivers in Your State" below.',
    free: true,
  },
  {
    id: 'apply_waiver',
    emoji: '📝',
    title: 'Submit the waiver application NOW',
    desc: "Don't wait until your child is older. In CO, CA, TX and many other states, the waitlist is 10+ years.",
    free: true,
  },
  {
    id: 'open_able',
    emoji: '💰',
    title: 'Open an ABLE account',
    desc: 'ABLE accounts let families save money without affecting SSI or Medicaid eligibility. Open one early.',
    free: true,
  },
  {
    id: 'build_paper_trail',
    emoji: '🗂️',
    title: 'Start building the paper trail',
    desc: "Collect evaluations, IEPs, medical records, and therapy notes. You'll need them for every application.",
    free: true,
  },
  {
    id: 'waiver_approved',
    emoji: '✅',
    title: 'Waiver approved!',
    desc: "Mark this when your current waiver is approved. We'll remind you in 3 months to apply for the adult DD waitlist while the momentum is there.",
    free: false,
    // PREMIUM: checking this schedules the adult waitlist nudge notification
    triggersAdultNudge: true,
  },
  {
    id: 'set_reminder',
    emoji: '🔔',
    title: 'Set annual check-in reminders',
    desc: "Call your state's DD agency every year to confirm your child is still on the waitlist.",
    free: false,
  },
];

const URGENCY_STATES = ['Colorado', 'California', 'Texas', 'New York', 'Illinois', 'Florida', 'Ohio', 'Georgia', 'Michigan', 'New Jersey'];

export default function Stage0GetOnList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(CHECKLIST_KEY).then((raw) => {
      if (raw) setChecked(JSON.parse(raw));
    });
  }, []);

  const toggleItem = async (id: string, free: boolean, triggersAdultNudge?: boolean) => {
    // Non-free items require premium
    if (!free && !isPremium) {
      router.push('/paywall' as any);
      return;
    }
    const nowChecked = !checked[id];
    const updated = { ...checked, [id]: nowChecked };
    setChecked(updated);
    await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated));

    // PREMIUM ONLY: wire the adult waitlist nudge to the "waiver_approved" item
    if (triggersAdultNudge && isPremium) {
      if (nowChecked) {
        scheduleAdultWaitlistNudge().catch(() => {});
      } else {
        cancelAdultWaitlistNudge().catch(() => {});
      }
    }
  };

  const completedCount = CHECKLIST_ITEMS.filter((i) => checked[i.id]).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Get on the List Now</Text>
          <Text style={styles.headerSub}>Under 13 — Stage 0</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero urgency card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>⏰</Text>
          <Text style={styles.heroTitle}>The waitlist starts the day you apply.</Text>
          <Text style={styles.heroDesc}>
            In many states, families wait 10–15 years for adult DD services. If you apply when your child is 8, they may have services by 18. If you wait until 16, they may wait until their late 20s.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>10+</Text>
              <Text style={styles.heroStatLabel}>year wait in CO, CA, TX</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>700k+</Text>
              <Text style={styles.heroStatLabel}>people on waitlists nationwide</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{completedCount} of {CHECKLIST_ITEMS.length} steps complete</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%` }]} />
          </View>
        </View>

        {/* Checklist */}
        <Text style={styles.sectionTitle}>Your Action Checklist</Text>
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checked[item.id];
          const locked = !item.free && !isPremium;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.checkItem, isChecked && styles.checkItemDone]}
              onPress={() => toggleItem(item.id, item.free, (item as any).triggersAdultNudge)}
              activeOpacity={0.8}
            >
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
                {/* Notification badge shown when the waiver-approved item is checked (premium) */}
                {(item as any).triggersAdultNudge && isChecked && isPremium && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>🔔 Adult waitlist reminder set for 3 months from now</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* State lookup CTA */}
        <TouchableOpacity
          style={styles.stateBtn}
          onPress={() => router.push('/transition/state-waivers' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.stateBtnText}>🗺️  Find Waivers in Your State →</Text>
        </TouchableOpacity>

        {/* ABLE account link */}
        <TouchableOpacity
          style={styles.ableCard}
          onPress={() => Linking.openURL('https://www.ablenrc.org/open-an-able-account/')}
          activeOpacity={0.85}
        >
          <Text style={styles.ableTitle}>💰 What is an ABLE Account?</Text>
          <Text style={styles.ableDesc}>
            ABLE accounts allow families to save up to $18,000/year without affecting SSI or Medicaid eligibility. Interest grows tax-free. Open one at any age after diagnosis.
          </Text>
          <Text style={styles.ableLink}>Learn more at ABLENRC.org →</Text>
        </TouchableOpacity>

        {/* Urgency states */}
        <View style={styles.urgencyCard}>
          <Text style={styles.urgencyTitle}>⚠️  States with Critical Waitlists</Text>
          <Text style={styles.urgencyDesc}>These states have waitlists of 7–15+ years. Apply immediately:</Text>
          <View style={styles.urgencyStates}>
            {URGENCY_STATES.map((s) => (
              <View key={s} style={styles.urgencyBadge}>
                <Text style={styles.urgencyBadgeText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: COLORS.purple },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  headerSub: { fontSize: FONT_SIZES.xs, color: '#4CAF82', fontWeight: '600', marginTop: 2 },
  headerSpacer: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },
  heroCard: {
    backgroundColor: '#4CAF82',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm },
  heroDesc: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20, marginBottom: SPACING.md },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  heroStat: { alignItems: 'center' },
  heroStatNum: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 90 },
  heroStatDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressRow: { marginBottom: SPACING.md },
  progressLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF82', borderRadius: 3 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  checkItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  checkItemDone: { backgroundColor: '#F0FAF5', borderColor: '#4CAF82' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxDone: { backgroundColor: '#4CAF82', borderColor: '#4CAF82' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkContent: { flex: 1 },
  checkTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  checkEmoji: { fontSize: 16 },
  checkTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, flex: 1 },
  checkTitleDone: { color: COLORS.textLight, textDecorationLine: 'line-through' },
  lockIcon: { fontSize: 14 },
  checkDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 17 },
  notifBadge: {
    marginTop: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  notifBadgeText: { fontSize: 11, color: '#2E7D32', fontWeight: '600' },
  stateBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stateBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  ableCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#F6D860',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  ableTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  ableDesc: { fontSize: FONT_SIZES.sm, color: '#78350F', lineHeight: 19, marginBottom: 8 },
  ableLink: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  urgencyCard: {
    backgroundColor: '#FDF0F0',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  urgencyTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#991B1B', marginBottom: 4 },
  urgencyDesc: { fontSize: FONT_SIZES.sm, color: '#7F1D1D', marginBottom: SPACING.sm },
  urgencyStates: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  urgencyBadge: { backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  urgencyBadgeText: { fontSize: 12, color: '#991B1B', fontWeight: '600' },
});
