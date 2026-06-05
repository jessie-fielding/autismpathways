import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../lib/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

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

const PREMIUM_TOOLS = [
  {
    id: 'able',
    emoji: '💰',
    title: 'ABLE Account Finder',
    desc: 'Find your state\'s ABLE program. Save up to $18K/year without affecting SSI.',
    route: '/transition/able-account-finder',
    accent: '#059669',
    badge: '⭐ Premium',
  },
  {
    id: 'preets',
    emoji: '🛠️',
    title: 'Pre-ETS Tool',
    desc: 'Find Pre-Employment Transition Services in your state. Available at age 14.',
    route: '/transition/pre-ets-tool',
    accent: '#5B9BD5',
    badge: '⭐ Premium',
  },
  {
    id: 'dayprograms',
    emoji: '🏢',
    title: 'Day Program Finder',
    desc: 'Adult day programs with life skills, vocational training & community access.',
    route: '/transition/day-program-finder',
    accent: '#2D6A4F',
    badge: '⭐ Premium',
  },
  {
    id: 'grouphomes',
    emoji: '🏡',
    title: 'Group Home Finder',
    desc: 'State-funded group homes with waitlist status. Apply early — lists are long.',
    route: '/transition/group-home-finder',
    accent: '#4A1942',
    badge: '⭐ Premium',
  },
  {
    id: 'jobs',
    emoji: '💼',
    title: 'Special Needs Jobs',
    desc: 'Supported employment, job boards, and employer programs by state.',
    route: '/transition/special-needs-jobs',
    accent: '#1E3A5F',
    badge: '⭐ Premium',
  },
  {
    id: 'college',
    emoji: '🎓',
    title: 'College & Vocational',
    desc: 'Inclusive college programs and vocational training options by state.',
    route: '/transition/college-vocational-lookup',
    accent: '#1E3A5F',
    badge: '⭐ Premium',
  },
  {
    id: 'apartments',
    emoji: '🔑',
    title: 'Apartment & Housing Finder',
    desc: 'Supported living and affordable housing options for adults with disabilities.',
    route: '/transition/apartment-lookup',
    accent: '#1A3C34',
    badge: '⭐ Premium',
  },
];


const TOOL_GROUPS = [
  {
    id: 'financial',
    emoji: '💰',
    title: 'Financial & Benefits',
    accent: '#059669',
    tools: ['able'],
  },
  {
    id: 'employment',
    emoji: '💼',
    title: 'Employment & Education',
    accent: '#5B9BD5',
    tools: ['preets', 'jobs', 'college'],
  },
  {
    id: 'housing',
    emoji: '🏡',
    title: 'Housing & Day Programs',
    accent: '#4A1942',
    tools: ['dayprograms', 'grouphomes', 'apartments'],
  },
];

function AccordionGroup({
  group,
  isPremium,
  openGroupId,
  setOpenGroupId,
  onToolPress,
  onPaywall,
}: {
  group: typeof TOOL_GROUPS[0];
  isPremium: boolean;
  openGroupId: string | null;
  setOpenGroupId: (id: string | null) => void;
  onToolPress: (route: string) => void;
  onPaywall: () => void;
}) {
  const isOpen = openGroupId === group.id;
  const tools = PREMIUM_TOOLS.filter((t) => group.tools.includes(t.id));
  return (
    <View style={accordionStyles.wrap}>
      <TouchableOpacity
        style={[accordionStyles.header, { borderLeftColor: group.accent }]}
        onPress={() => setOpenGroupId(isOpen ? null : group.id)}
        activeOpacity={0.8}
      >
        <Text style={accordionStyles.headerEmoji}>{group.emoji}</Text>
        <Text style={accordionStyles.headerTitle}>{group.title}</Text>
        <Text style={accordionStyles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isOpen && tools.map((tool) => (
        <TouchableOpacity
          key={tool.id}
          style={accordionStyles.toolRow}
          onPress={() => isPremium ? onToolPress(tool.route) : onPaywall()}
          activeOpacity={0.8}
        >
          <View style={[accordionStyles.toolAccent, { backgroundColor: tool.accent }]} />
          <Text style={accordionStyles.toolEmoji}>{tool.emoji}</Text>
          <View style={accordionStyles.toolText}>
            <Text style={accordionStyles.toolTitle}>{tool.title}</Text>
            <Text style={accordionStyles.toolDesc}>{tool.desc}</Text>
          </View>
          {!isPremium && <Text style={accordionStyles.lockIcon}>🔒</Text>}
          <Text style={accordionStyles.toolChevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const accordionStyles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderLeftWidth: 4,
    backgroundColor: '#FAFAFA',
  },
  headerEmoji: { fontSize: 20 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  chevron: { fontSize: 11, color: '#9CA3AF', fontWeight: '700' },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  toolAccent: { width: 3, height: 36, borderRadius: 2 },
  toolEmoji: { fontSize: 22, width: 28, textAlign: 'center' },
  toolText: { flex: 1 },
  toolTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  toolDesc: { fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 15 },
  lockIcon: { fontSize: 14 },
  toolChevron: { fontSize: 20, color: '#D1D5DB' },
});

export default function TransitionHub() {
  const router = useRouter();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

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
          <Text style={styles.checkStateBtnText}>🗺️ Check Your State →</Text>
        </TouchableOpacity>

        {/* AI Guide CTA */}
        <TouchableOpacity
          style={styles.aiGuideCard}
          onPress={() => router.push('/transition/ai-guide' as any)}
          activeOpacity={0.85}
        >
          <View style={styles.aiGuideLeft}>
            <Text style={styles.aiGuideEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.aiGuideTitleRow}>
                <Text style={styles.aiGuideTitle}>Your Personalized Transition Guide</Text>
                <View style={styles.aiGuideBadge}><Text style={styles.aiGuideBadgeText}>AI</Text></View>
              </View>
              <Text style={styles.aiGuideDesc}>Get a custom action plan based on your child's age, state, and goals — with deep links to every tool.</Text>
            </View>
          </View>
          <Text style={styles.aiGuideArrow}>›</Text>
        </TouchableOpacity>

        {/* Premium Tools Section — Accordion Groups */}
        <View style={styles.premiumSection}>
          <View style={styles.premiumHeader}>
            <Text style={styles.premiumHeaderEmoji}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumHeaderTitle}>Premium Lookup Tools</Text>
              <Text style={styles.premiumHeaderSub}>{isPremium ? 'Tap a category to expand' : '🔒 Unlock with Premium'}</Text>
            </View>
          </View>
          {TOOL_GROUPS.map((group) => (
            <AccordionGroup
              key={group.id}
              group={group}
              isPremium={isPremium}
              openGroupId={openGroupId}
              setOpenGroupId={setOpenGroupId}
              onToolPress={(route) => router.push(route as any)}
              onPaywall={() => router.push('/paywall' as any)}
            />
          ))}
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
    marginBottom: SPACING.lg,
  },
  checkStateBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },

  // Premium tools section
  premiumSection: { marginTop: SPACING.sm },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#F5D87A',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  premiumHeaderEmoji: { fontSize: 24 },
  premiumHeaderTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#92400E' },
  premiumHeaderSub: { fontSize: FONT_SIZES.xs, color: '#92400E', marginTop: 2 },

  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  toolAccent: { width: 5, alignSelf: 'stretch' },
  toolContent: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  toolEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  toolText: { flex: 1 },
  toolTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  toolDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2, lineHeight: 16 },
  premiumBadge: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#F5D87A',
  },
  premiumBadgeText: { fontSize: 14 },
  toolChevron: { fontSize: 22, color: COLORS.textLight, paddingRight: SPACING.sm },

  // AI Guide card
  aiGuideCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.purple, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  aiGuideLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  aiGuideEmoji: { fontSize: 28, marginTop: 2 },
  aiGuideTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  aiGuideTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#fff', flex: 1 },
  aiGuideBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.pill,
    paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  aiGuideBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  aiGuideDesc: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.85)', lineHeight: 16 },
  aiGuideArrow: { fontSize: 22, color: 'rgba(255,255,255,0.7)', paddingLeft: SPACING.sm },
});
