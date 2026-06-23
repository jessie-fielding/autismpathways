/**
 * Observations Trends Dashboard (Premium)
 *
 * Shows mood patterns, common triggers, environments, and intensity
 * over time from the child's observation log.
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useActiveChild } from '../../services/childManager';
import { OBS_KEY, type Observation } from './index';
import { trackPaywallViewed } from '../../lib/analytics';

const MOOD_COLORS: Record<string, string> = {
  'Calm': COLORS.mintAccent,
  'Happy': COLORS.yellowAccent,
  'Anxious': COLORS.blueAccent,
  'Frustrated': COLORS.peachAccent,
  'Dysregulated': COLORS.peach,
  'Other': COLORS.lavenderAccent,
};

const INTENSITY_ORDER = ['Low', 'Medium', 'High', 'Severe'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ObsTrends {
  total: number;
  moodCounts: Record<string, number>;
  triggerCounts: Record<string, number>;
  environmentCounts: Record<string, number>;
  intensityCounts: Record<string, number>;
  dayOfWeekCounts: number[];
  iepFlagCount: number;
  topHelped: string[];
}

function computeObsTrends(obs: Observation[]): ObsTrends {
  const moodCounts: Record<string, number> = {};
  const triggerCounts: Record<string, number> = {};
  const environmentCounts: Record<string, number> = {};
  const intensityCounts: Record<string, number> = {};
  const dayOfWeekCounts = new Array(7).fill(0);
  const helpedCounts: Record<string, number> = {};
  let iepFlagCount = 0;

  for (const o of obs) {
    moodCounts[o.mood] = (moodCounts[o.mood] ?? 0) + 1;
    for (const t of o.triggers ?? []) {
      triggerCounts[t] = (triggerCounts[t] ?? 0) + 1;
    }
    if (o.environment) {
      environmentCounts[o.environment] = (environmentCounts[o.environment] ?? 0) + 1;
    }
    if (o.intensity) {
      intensityCounts[o.intensity] = (intensityCounts[o.intensity] ?? 0) + 1;
    }
    if (o.iepFlag) iepFlagCount++;
    if (o.helped) {
      helpedCounts[o.helped] = (helpedCounts[o.helped] ?? 0) + 1;
    }
    try {
      const d = new Date(o.date);
      if (!isNaN(d.getTime())) dayOfWeekCounts[d.getDay()]++;
    } catch {}
  }

  const topHelped = Object.entries(helpedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  return { total: obs.length, moodCounts, triggerCounts, environmentCounts, intensityCounts, dayOfWeekCounts, iepFlagCount, topHelped };
}

function BarChart({ data, labels, color = COLORS.purple }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <View style={chartStyles.container}>
      {data.map((val, i) => (
        <View key={i} style={chartStyles.barCol}>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.bar, { height: `${(val / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={chartStyles.barLabel}>{labels[i]}</Text>
          {val > 0 && <Text style={chartStyles.barValue}>{val}</Text>}
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4, marginTop: SPACING.md },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', marginBottom: 4 },
  bar: { width: '100%', borderRadius: 3, minHeight: 3 },
  barLabel: { fontSize: 9, color: COLORS.textLight, textAlign: 'center' },
  barValue: { fontSize: 9, color: COLORS.textMid, fontWeight: '700', textAlign: 'center', position: 'absolute', top: -14 },
});

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.sm },
  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
});

export default function ObservationsTrends() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const { childId, loading: childLoading } = useActiveChild();

  const [trends, setTrends] = useState<ObsTrends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childLoading) return;
    const childKey = childId ? `${OBS_KEY}_${childId}` : null;
    // Load both the child-specific key and the bare key (legacy data before
    // multi-child support was added) and merge them so no observations are missed.
    const keys = childKey ? [childKey, OBS_KEY] : [OBS_KEY];
    Promise.all(keys.map((k) => AsyncStorage.getItem(k))).then((raws) => {
      const seen = new Set<string>();
      const merged: Observation[] = [];
      for (const raw of raws) {
        if (!raw) continue;
        try {
          const parsed: Observation[] = JSON.parse(raw);
          for (const o of parsed) {
            // Deduplicate by timestamp+mood to avoid counting the same entry twice
            const dedupeKey = `${o.date}_${o.mood}`;
            if (!seen.has(dedupeKey)) {
              seen.add(dedupeKey);
              merged.push(o);
            }
          }
        } catch {}
      }
      setTrends(computeObsTrends(merged));
      setLoading(false);
    });
  }, [childId, childLoading]);

  if (!isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Observation Trends</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.gateContainer}>
          <Text style={styles.gateEmoji}>📈</Text>
          <Text style={styles.gateTitle}>Observation Trends</Text>
          {trends && trends.total > 0 && (
            <View style={styles.sessionCountBadge}>
              <Text style={styles.sessionCountText}>💾 {trends.total} observation{trends.total !== 1 ? 's' : ''} logged — your data is safe!</Text>
            </View>
          )}
          <Text style={styles.gateBody}>
            Upgrade to Premium to see mood patterns, common triggers, and what support strategies work best for your child over time.
          </Text>
          <TouchableOpacity style={styles.gateBtn} onPress={() => (trackPaywallViewed('observations_trends'), router.push('/paywall'))}>
            <Text style={styles.gateBtnText}>Unlock with Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading your trends…</Text>
      </View>
    );
  }

  const noData = !trends || trends.total === 0;

  const topMoods = Object.entries(trends?.moodCounts ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTriggers = Object.entries(trends?.triggerCounts ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topEnvs = Object.entries(trends?.environmentCounts ?? {}).sort((a, b) => b[1] - a[1]);
  const intensityData = INTENSITY_ORDER.map((k) => trends?.intensityCounts[k] ?? 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Observation Trends</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryText}>{trends!.total} observation{trends!.total !== 1 ? 's' : ''} logged</Text>
        </View>

        {noData ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No observations yet</Text>
            <Text style={styles.emptyBody}>Log a few observations and your patterns will appear here.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/observations/new-entry')}>
              <Text style={styles.emptyBtnText}>Add an observation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Mood breakdown */}
            <StatCard title="😊 Mood patterns">
              {topMoods.map(([mood, count]) => (
                <View key={mood} style={styles.rankRow}>
                  <View style={[styles.moodDot, { backgroundColor: MOOD_COLORS[mood] ?? COLORS.lavenderAccent }]} />
                  <Text style={styles.rankLabel}>{mood}</Text>
                  <View style={styles.rankBarTrack}>
                    <View style={[styles.rankBar, { width: `${(count / topMoods[0][1]) * 100}%`, backgroundColor: MOOD_COLORS[mood] ?? COLORS.lavenderAccent }]} />
                  </View>
                  <Text style={styles.rankCount}>{count}</Text>
                </View>
              ))}
            </StatCard>

            {/* Top triggers */}
            {topTriggers.length > 0 && (
              <StatCard title="⚡ Common triggers">
                {topTriggers.map(([trigger, count]) => (
                  <View key={trigger} style={styles.rankRow}>
                    <Text style={styles.rankLabel} numberOfLines={1}>{trigger}</Text>
                    <View style={styles.rankBarTrack}>
                      <View style={[styles.rankBar, { width: `${(count / topTriggers[0][1]) * 100}%`, backgroundColor: COLORS.peachAccent }]} />
                    </View>
                    <Text style={styles.rankCount}>{count}</Text>
                  </View>
                ))}
              </StatCard>
            )}

            {/* Environment */}
            {topEnvs.length > 0 && (
              <StatCard title="📍 Where it happens">
                {topEnvs.map(([env, count]) => (
                  <View key={env} style={styles.rankRow}>
                    <Text style={styles.rankLabel}>{env}</Text>
                    <View style={styles.rankBarTrack}>
                      <View style={[styles.rankBar, { width: `${(count / topEnvs[0][1]) * 100}%`, backgroundColor: COLORS.blueAccent }]} />
                    </View>
                    <Text style={styles.rankCount}>{count}</Text>
                  </View>
                ))}
              </StatCard>
            )}

            {/* Intensity */}
            <StatCard title="📊 Intensity levels">
              <BarChart data={intensityData} labels={INTENSITY_ORDER} color={COLORS.purple} />
            </StatCard>

            {/* Day of week */}
            <StatCard title="📅 Day of week">
              <BarChart data={trends!.dayOfWeekCounts} labels={DAY_LABELS} color={COLORS.lavenderAccent} />
            </StatCard>

            {/* What helped */}
            {trends!.topHelped.length > 0 && (
              <StatCard title="✅ What helped most">
                {trends!.topHelped.map((h) => (
                  <View key={h} style={styles.helpedRow}>
                    <Text style={styles.helpedCheck}>✓</Text>
                    <Text style={styles.helpedText}>{h}</Text>
                  </View>
                ))}
              </StatCard>
            )}

            {/* IEP flag count */}
            {trends!.iepFlagCount > 0 && (
              <View style={styles.iepCard}>
                <Text style={styles.iepTitle}>🏫 IEP-Flagged Observations</Text>
                <Text style={styles.iepBody}>
                  You've flagged <Text style={{ fontWeight: '700' }}>{trends!.iepFlagCount}</Text> observation{trends!.iepFlagCount !== 1 ? 's' : ''} as relevant for IEP planning. Consider sharing these with your child's school team.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: insets.bottom + SPACING.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.md, color: COLORS.textMid },
  summaryPill: { alignSelf: 'flex-start', backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.lavenderAccent },
  summaryText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  emptyCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.xxl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  emptyBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl },
  emptyBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs },
  moodDot: { width: 10, height: 10, borderRadius: 5 },
  rankLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text, width: 90 },
  rankBarTrack: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  rankBar: { height: '100%', borderRadius: 4 },
  rankCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '700', width: 24, textAlign: 'right' },
  helpedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, paddingVertical: SPACING.xs },
  helpedCheck: { fontSize: FONT_SIZES.sm, color: COLORS.successText, fontWeight: '700' },
  helpedText: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1 },
  iepCard: { backgroundColor: COLORS.blue, borderRadius: RADIUS.md, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.blueAccent, marginBottom: SPACING.md },
  iepTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  iepBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  gateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  gateEmoji: { fontSize: 56, marginBottom: SPACING.xl },
  gateTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  sessionCountBadge: { backgroundColor: COLORS.mint, borderRadius: RADIUS.pill, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.mintAccent },
  sessionCountText: { fontSize: FONT_SIZES.sm, color: COLORS.successText, fontWeight: '600' },
  gateBody: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xxl },
  gateBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl },
  gateBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
});
