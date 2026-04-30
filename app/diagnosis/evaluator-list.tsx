import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { getEvaluatorsForState, normalizeState, type Evaluator } from '../../data/evaluators';
import { useActiveChild } from '../../services/childManager';

const TOTAL_STEPS = 6;
const CURRENT_STEP = 4;

export default function EvaluatorListScreen() {
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  const params = useLocalSearchParams<{ retry?: string }>();
  const isRetry = params.retry === 'true';

  const [filter, setFilter] = useState<'all' | 'telehealth' | 'inperson'>('all');
  const [triedIds, setTriedIds] = useState<string[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [childState, setChildState] = useState<string>('');
  const [childName, setChildName] = useState<string>('');

  useEffect(() => {
    async function load() {
      // Load eval type filter
      const evalFilter = await AsyncStorage.getItem('eval_type_filter');
      if (evalFilter === 'telehealth') setFilter('telehealth');
      else if (evalFilter === 'in-person') setFilter('inperson');

      // Load tried evaluators
      const triedRaw = await AsyncStorage.getItem('tried_evaluators');
      if (triedRaw) setTriedIds(JSON.parse(triedRaw));

      // Load child state from profile (set by start-here screen)
      const profileRaw = await AsyncStorage.getItem('profile');
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        const stateCode = normalizeState(profile.state || profile.childState || '');
        setChildState(stateCode);
        setChildName(profile.childName || profile.name || '');
        setEvaluators(getEvaluatorsForState(stateCode));
      } else {
        // No profile yet — show national fallbacks
        setEvaluators(getEvaluatorsForState('NATIONAL'));
      }
    }
    load();
  }, []);

  const filtered = evaluators.filter((e) => {
    if (filter === 'all') return true;
    return e.type === filter || e.type === 'both';
  });

  // Sort: tried evaluators go to the bottom
  const sorted = [...filtered].sort((a, b) => {
    const aTried = triedIds.includes(a.id) ? 1 : 0;
    const bTried = triedIds.includes(b.id) ? 1 : 0;
    return aTried - bTried;
  });

  const handleSelect = async (evaluator: Evaluator) => {
    await AsyncStorage.setItem('selected_evaluator', JSON.stringify(evaluator));
    await AsyncStorage.setItem(childKey('ap_diagnosis_step'), '4');
    router.push({
      pathname: '/diagnosis/appointment-date',
      params: {
        evaluatorName: evaluator.name,
        evalType: evaluator.type,
      },
    });
  };

  const typeColors = (type: string) => {
    if (type === 'telehealth') return { bg: COLORS.blue, text: COLORS.infoText };
    if (type === 'inperson') return { bg: COLORS.mint, text: COLORS.successText };
    return { bg: COLORS.lavender, text: COLORS.purple };
  };

  const typeLabel = (type: string) => {
    if (type === 'telehealth') return 'Telehealth';
    if (type === 'inperson') return 'In-person';
    return 'Telehealth + In-person';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism Pathways</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.dashBtn}>
          <Text style={styles.dashText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < CURRENT_STEP ? styles.progressSegmentActive : styles.progressSegmentInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>Step {CURRENT_STEP} of {TOTAL_STEPS}</Text>
      </View>

      {/* Retry banner */}
      {isRetry && (
        <View style={styles.retryBanner}>
          <Text style={styles.retryBannerIcon}>💡</Text>
          <View style={styles.retryBannerText}>
            <Text style={styles.retryBannerTitle}>What to say to the next evaluator</Text>
            <Text style={styles.retryBannerBody}>
              "We had a previous evaluation that did not result in a diagnosis, but we're still seeing significant concerns. We'd like a second opinion from a specialist who focuses on autism."
            </Text>
          </View>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'telehealth', 'inperson'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'All' : f === 'telehealth' ? 'Telehealth' : 'In-person'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro card */}
        <View style={styles.stepCard}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 4 OF 6</Text>
          </View>
          <Text style={styles.title}>Find an evaluator</Text>
          <Text style={styles.subtitle}>
            {childState
              ? `Showing evaluators available in ${childState}${childName ? ` for ${childName}` : ''}. Tap one to select.`
              : 'Showing evaluators available in your area. Tap one to select.'}
          </Text>
          {!childState && (
            <TouchableOpacity
              style={styles.addStateBtn}
              onPress={() => router.push('/(tabs)/start-here')}
            >
              <Text style={styles.addStateBtnText}>📍 Add your state for personalized results</Text>
            </TouchableOpacity>
          )}
        </View>

        {sorted.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No evaluators found</Text>
            <Text style={styles.emptyText}>Try switching to "All" or a different filter type.</Text>
          </View>
        )}

        {sorted.map((evaluator) => {
          const tried = triedIds.includes(evaluator.id);
          const colors = typeColors(evaluator.type);
          return (
            <TouchableOpacity
              key={evaluator.id}
              style={[styles.evaluatorCard, tried && styles.evaluatorCardTried]}
              onPress={() => !tried && handleSelect(evaluator)}
              activeOpacity={tried ? 1 : 0.7}
            >
              {/* Type badge + tried badge */}
              <View style={styles.evaluatorTopRow}>
                <View style={[styles.typeBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: colors.text }]}>
                    {typeLabel(evaluator.type)}
                  </Text>
                </View>
                {tried && (
                  <View style={styles.triedBadge}>
                    <Text style={styles.triedBadgeText}>Previously tried</Text>
                  </View>
                )}
              </View>

              {/* Name */}
              <Text style={[styles.evaluatorName, tried && styles.evaluatorNameTried]}>
                {evaluator.name}
              </Text>

              {/* Detail */}
              <Text style={[styles.evaluatorDetail, tried && styles.evaluatorTextTried]}>
                {evaluator.detail}
              </Text>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {evaluator.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={[styles.tagText, tried && styles.evaluatorTextTried]}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Contact + CTA — only for non-tried */}
              {!tried && (
                <>
                  <View style={styles.contactRow}>
                    {evaluator.phone && (
                      <TouchableOpacity onPress={() => Linking.openURL(`tel:${evaluator.phone}`)}>
                        <Text style={styles.contactPhone}>📞 {evaluator.phone}</Text>
                      </TouchableOpacity>
                    )}
                    {evaluator.url && (
                      <TouchableOpacity onPress={() => Linking.openURL(evaluator.url!)}>
                        <Text style={styles.contactWebsite}>🔗 Website</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelect(evaluator)}>
                    <Text style={styles.selectBtnText}>Select this evaluator →</Text>
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  dashBtn: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dashText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBarRow: { flexDirection: 'row', gap: 4, marginBottom: SPACING.xs },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressSegmentActive: { backgroundColor: COLORS.purple },
  progressSegmentInactive: { backgroundColor: COLORS.border },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '700' },
  retryBanner: {
    backgroundColor: COLORS.yellow,
    padding: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.yellowAccent,
  },
  retryBannerIcon: { fontSize: 20 },
  retryBannerText: { flex: 1 },
  retryBannerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: 4 },
  retryBannerBody: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterTabText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60, gap: SPACING.md },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  stepBadge: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stepBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1 },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.sm },
  addStateBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  addStateBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: { fontSize: 36, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center' },
  evaluatorCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    gap: SPACING.sm,
  },
  evaluatorCardTried: { backgroundColor: COLORS.bg, opacity: 0.75 },
  evaluatorTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  typeBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  typeBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  triedBadge: {
    backgroundColor: COLORS.errorBg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  triedBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.errorText },
  evaluatorName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  evaluatorNameTried: { textDecorationLine: 'line-through', color: COLORS.textLight },
  evaluatorDetail: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  evaluatorTextTried: { textDecorationLine: 'line-through', color: COLORS.textLight },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tag: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  contactRow: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.xs },
  contactPhone: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  contactWebsite: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  selectBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  selectBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
});
