import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../lib/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';

const STAGES = [
  {
    id: 'stage-0',
    emoji: '🌱',
    label: 'Under 13',
    title: 'Get on the List Now',
    desc: 'Waiver waitlists are 10+ years. Apply now.',
    accent: '#4CAF82',
    route: '/transition/stage-0-get-on-list',
    badge: 'Start Here',
    badgeBg: '#DCFCE7',
    badgeText: '#166534',
  },
  {
    id: 'stage-1',
    emoji: '💬',
    label: 'Ages 14–15',
    title: 'Start the Conversation',
    desc: 'Transition IEP begins. Know your rights.',
    accent: '#5B9BD5',
    route: '/transition/stage-1-start-conversation',
    badge: null,
  },
  {
    id: 'stage-2',
    emoji: '📋',
    label: 'Ages 16–17',
    title: 'Build the Plan',
    desc: 'VR, SSI prep, and measurable IEP goals.',
    accent: '#7C5CBF',
    route: '/transition/stage-2-build-plan',
    badge: null,
  },
  {
    id: 'stage-3',
    emoji: '🎓',
    label: 'Age 18',
    title: 'Senior Year Countdown',
    desc: 'Guardianship, adult Medicaid, and SSI.',
    accent: '#E07B54',
    route: '/transition/stage-3-senior-year',
    badge: null,
  },
  {
    id: 'stage-4',
    emoji: '🌉',
    label: 'Ages 18–22',
    title: 'Navigating the Gap',
    desc: 'Day programs, employment, college options.',
    accent: '#D97706',
    route: '/transition/stage-4-navigating-gap',
    badge: null,
  },
  {
    id: 'stage-5',
    emoji: '🏡',
    label: 'Age 22+',
    title: 'Adult Life',
    desc: 'Housing, employment, trusts, and community.',
    accent: '#059669',
    route: '/transition/stage-5-adult-life',
    badge: null,
  },
];

export default function TransitionHub() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('Plan Ahead & Transition', 'Planifica el Futuro')}</Text>
          <Text style={styles.headerSub}>The earlier you start, the better the outcome.</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Where is your child card */}
        <View style={styles.whereCard}>
          <View style={styles.whereIcon}>
            <Text style={styles.whereIconEmoji}>👤</Text>
          </View>
          <View style={styles.whereText}>
            <Text style={styles.whereTitle}>Where is your child right now?</Text>
            <Text style={styles.whereDesc}>Select a stage to see your action plan</Text>
          </View>
        </View>

        {/* Stage cards */}
        {STAGES.map((stage) => (
          <TouchableOpacity
            key={stage.id}
            style={styles.stageCard}
            onPress={() => router.push(stage.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.stageAccent, { backgroundColor: stage.accent }]} />
            <View style={styles.stageContent}>
              <Text style={styles.stageEmoji}>{stage.emoji}</Text>
              <View style={styles.stageText}>
                <Text style={styles.stageLabel}>{stage.label}</Text>
                <Text style={styles.stageTitle}>{stage.title}</Text>
                <Text style={styles.stageDesc}>{stage.desc}</Text>
              </View>
              {stage.badge && (
                <View style={[styles.stageBadge, { backgroundColor: stage.badgeBg }]}>
                  <Text style={[styles.stageBadgeText, { color: stage.badgeText }]}>{stage.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.stageChevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Urgency banner */}
        <View style={styles.urgencyBanner}>
          <Text style={styles.urgencyEmoji}>⚠️</Text>
          <View style={styles.urgencyText}>
            <Text style={styles.urgencyTitle}>In CO, CA, TX & many other states, waitlists are 10+ years. Apply NOW even if your child is 8.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.checkStateBtn}
          onPress={() => router.push('/transition/state-waivers' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.checkStateBtnText}>Check Your State →</Text>
        </TouchableOpacity>

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
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2, textAlign: 'center' },
  headerSpacer: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },
  whereCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lavender ?? '#E9E3FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  whereIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whereIconEmoji: { fontSize: 24 },
  whereText: { flex: 1 },
  whereTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  whereDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  stageAccent: { width: 5, alignSelf: 'stretch' },
  stageContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  stageEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  stageText: { flex: 1 },
  stageLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600', marginBottom: 1 },
  stageTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  stageDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  stageBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  stageBadgeText: { fontSize: 11, fontWeight: '700' },
  stageChevron: { fontSize: 22, color: COLORS.textLight, paddingRight: SPACING.sm },
  urgencyBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  urgencyEmoji: { fontSize: 22 },
  urgencyText: { flex: 1 },
  urgencyTitle: { fontSize: FONT_SIZES.sm, color: '#92400E', fontWeight: '600', lineHeight: 19 },
  checkStateBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkStateBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
});
