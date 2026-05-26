/**
 * Waiver Utilization Hub
 *
 * Entry point after waiver approval. Surfaces tools:
 *  1. Services List — what your waiver covers + caseworker email generator (premium)
 *  2. ABA Provider Tool — observations, trends, talking points (premium)
 *  3. ABA Quiz — "Is ABA right for my child?"
 *  4. Service Scheduler — plan and track service appointments
 *  5. Tracker — waiver progress tracker
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

export const ABA_OPT_OUT_KEY = 'ap_aba_opted_out';

export default function WaiverUtilizationHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [abaOptedOut, setAbaOptedOut] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ABA_OPT_OUT_KEY).then(v => setAbaOptedOut(v === 'true'));
  }, []);

  const tools = [
    {
      id: 'services',
      emoji: '📋',
      color: '#2A7FAF',
      bg: '#EBF5FB',
      title: 'Waiver Services List',
      subtitle: 'See what your waiver covers, mark what you want, and generate a caseworker request email.',
      badge: isPremium ? null : '🔒 Email generator is premium',
      onPress: () => router.push('/waiver/services-list'),
    },
    {
      id: 'scheduler',
      emoji: '📅',
      color: '#2e7d5e',
      bg: '#f0fff4',
      title: 'Service Scheduler',
      subtitle: 'Plan and track your service appointments. Never miss a session or renewal.',
      badge: null,
      onPress: () => router.push('/waiver/service-scheduler'),
    },
    {
      id: 'tracker',
      emoji: '📊',
      color: '#7c6fd4',
      bg: '#f5f0ff',
      title: 'Waiver Progress Tracker',
      subtitle: 'Track your waiver journey milestones from application to active services.',
      badge: null,
      onPress: () => router.push('/waiver/tracker'),
    },
    ...(!abaOptedOut ? [
      {
        id: 'aba-tool',
        emoji: '🧠',
        color: COLORS.lavenderAccent,
        bg: '#f5f0ff',
        title: 'ABA Provider Tool',
        subtitle: 'Log observations, spot trends, and build talking points and pushback scripts for your ABA provider meetings.',
        badge: isPremium ? null : '🔒 Premium feature',
        onPress: () => router.push('/waiver/aba-tool'),
      },
      {
        id: 'aba-quiz',
        emoji: '❓',
        color: COLORS.mintAccent,
        bg: COLORS.successBg,
        title: 'Is ABA Right for My Child?',
        subtitle: 'A neutral, judgment-free quiz to help you decide if ABA is something you want to explore.',
        badge: null,
        onPress: () => router.push('/waiver/aba-quiz'),
      },
    ] : []),
    ...(abaOptedOut ? [
      {
        id: 'aba-restore',
        emoji: '↩️',
        color: COLORS.border,
        bg: COLORS.bg,
        title: 'ABA content is hidden',
        subtitle: 'You previously chose not to explore ABA. Tap to restore ABA tools to your app.',
        badge: null,
        onPress: async () => {
          await AsyncStorage.removeItem(ABA_OPT_OUT_KEY);
          setAbaOptedOut(false);
        },
      },
    ] : []),
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiver Utilization</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero gradient banner */}
        <LinearGradient
          colors={['#4a3f8f', '#7c6fd4', '#9d84b7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEmoji}>🎯</Text>
          <Text style={styles.heroTitle}>Make the Most of Your Waiver</Text>
          <Text style={styles.heroBody}>
            Your child's waiver covers more than you might think. Use these tools to understand your benefits, schedule services, and communicate effectively with your team.
          </Text>
          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>5</Text>
              <Text style={styles.statLabel}>Tools</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>Free</Text>
              <Text style={styles.statLabel}>Core tools</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>💜</Text>
              <Text style={styles.statLabel}>No judgment</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionLabel}>YOUR TOOLS</Text>

        {tools.map(tool => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.toolCard, { backgroundColor: tool.bg, borderLeftColor: tool.color }]}
            onPress={tool.onPress}
            activeOpacity={0.75}
          >
            <View style={styles.toolRow}>
              <View style={[styles.toolIconBox, { backgroundColor: tool.color + '22' }]}>
                <Text style={styles.toolEmoji}>{tool.emoji}</Text>
              </View>
              <View style={styles.toolText}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
                {tool.badge && (
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeText}>{tool.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.toolArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* ABA neutrality note */}
        <View style={styles.neutralNote}>
          <Text style={styles.neutralNoteTitle}>🤝 A note on ABA</Text>
          <Text style={styles.neutralNoteBody}>
            Autism Pathways does not advocate for or against ABA therapy. We know this is a deeply personal decision with strong feelings on all sides of the autism community. Our tools are here to support whatever path you choose — no judgment, ever.
          </Text>
        </View>

        {/* Back to waiver journey */}
        <TouchableOpacity
          style={styles.waiverJourneyBtn}
          onPress={() => router.push('/waiver')}
          activeOpacity={0.8}
        >
          <Text style={styles.waiverJourneyText}>← Back to Waiver Journey</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  dashText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },

  // Hero
  heroCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  heroEmoji: { fontSize: 44, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  heroBody: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.3)' },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },

  // Tool cards
  toolCard: {
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  toolRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  toolIconBox: {
    width: 48, height: 48, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  toolEmoji: { fontSize: 24 },
  toolText: { flex: 1 },
  toolTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  toolSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  badgeRow: { marginTop: SPACING.xs },
  badgeText: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, fontWeight: '600' },
  toolArrow: { fontSize: 24, color: COLORS.textLight, alignSelf: 'center' },

  // ABA note
  neutralNote: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  neutralNoteTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: SPACING.xs },
  neutralNoteBody: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },

  // Back to journey
  waiverJourneyBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  waiverJourneyText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
});
