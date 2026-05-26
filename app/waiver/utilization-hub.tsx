/**
 * Waiver Utilization Hub
 *
 * Entry point at the end of the waiver pathway. Surfaces three tools:
 *  1. Services List — what your waiver covers + caseworker email generator (premium)
 *  2. ABA Tool — observations, trends, talking points, pushback scripts
 *  3. ABA Quiz — "Is ABA right for my child?" with opt-out
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      color: COLORS.blueAccent,
      bg: COLORS.infoBg,
      title: 'Waiver Services List',
      subtitle: 'See what your waiver covers, mark what you want, and generate a caseworker request email.',
      badge: isPremium ? null : '🔒 Email generator is premium',
      onPress: () => router.push('/waiver/services-list'),
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiver Utilization</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎯</Text>
          <Text style={styles.heroTitle}>Make the Most of Your Waiver</Text>
          <Text style={styles.heroBody}>
            Your child's waiver covers more than you might think. Use these tools to understand your benefits, schedule services, and communicate effectively with your team.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>TOOLS</Text>

        {tools.map(tool => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.toolCard, { backgroundColor: tool.bg, borderLeftColor: tool.color }]}
            onPress={tool.onPress}
            activeOpacity={0.75}
          >
            <View style={styles.toolRow}>
              <View style={[styles.toolIconBox, { backgroundColor: tool.color + '33' }]}>
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

        <View style={styles.neutralNote}>
          <Text style={styles.neutralNoteTitle}>🤝 A note on ABA</Text>
          <Text style={styles.neutralNoteBody}>
            Autism Pathways does not advocate for or against ABA therapy. We know this is a deeply personal decision with strong feelings on all sides of the autism community. Our tools are here to support whatever path you choose — no judgment, ever.
          </Text>
        </View>
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
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  heroCard: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  heroBody: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.sm },
  toolCard: {
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  toolRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  toolIconBox: { width: 44, height: 44, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  toolEmoji: { fontSize: 22 },
  toolText: { flex: 1 },
  toolTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  toolSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 19 },
  badgeRow: { marginTop: SPACING.xs },
  badgeText: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, fontWeight: '600' },
  toolArrow: { fontSize: 22, color: COLORS.textLight, alignSelf: 'center' },
  neutralNote: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    marginTop: SPACING.sm,
  },
  neutralNoteTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: SPACING.xs },
  neutralNoteBody: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
});
