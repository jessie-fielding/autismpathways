import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { ppGetLog, computeTrends, type TrendData } from '../../lib/parentingPathwaysData';
import { STRATEGIES } from '../../lib/parentingStrategies';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useActiveChild } from '../../services/childManager';
import type { Situation, Location, Intensity } from '../../lib/parentingStrategies';

const SITUATION_LABELS: Record<Situation, string> = {
  meltdown: 'Meltdown',
  aggression: 'Aggression',
  refusal: 'Refusal',
  sensory: 'Sensory Overload',
  shutdown: 'Shutdown',
  anxiety: 'Anxiety',
  transition: 'Transition',
  other: 'Other',
};

const SITUATION_EMOJIS: Record<Situation, string> = {
  meltdown: '🌊', aggression: '💥', refusal: '🚫', sensory: '🔊',
  shutdown: '🔇', anxiety: '😰', transition: '🔄', other: '❓',
};

const LOCATION_LABELS: Record<Location, string> = {
  home: '🏠 Home', school: '🏫 School', public: '🛒 Public', car: '🚗 Car',
};

const INTENSITY_LABELS: Record<Intensity, string> = {
  building: '🟡 Building', full: '🟠 Full', unsafe: '🔴 Unsafe',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function BarChart({
  data,
  labels,
  color = COLORS.purple,
  maxBars = 7,
}: {
  data: number[];
  labels: string[];
  color?: string;
  maxBars?: number;
}) {
  const max = Math.max(...data, 1);
  const items = data.slice(0, maxBars);
  return (
    <View style={chartStyles.container}>
      {items.map((val, i) => (
        <View key={i} style={chartStyles.barCol}>
          <View style={chartStyles.barTrack}>
            <View
              style={[
                chartStyles.bar,
                { height: `${(val / max) * 100}%`, backgroundColor: color },
              ]}
            />
          </View>
          <Text style={chartStyles.barLabel}>{labels[i]}</Text>
          {val > 0 && <Text style={chartStyles.barValue}>{val}</Text>}
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 4,
    marginTop: SPACING.md,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 3,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 9,
    color: COLORS.textMid,
    fontWeight: '700',
    textAlign: 'center',
    position: 'absolute',
    top: -14,
  },
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
});

export default function ParentingPathwaysTrends() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const { childId } = useActiveChild();

  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ppGetLog(childId).then((log) => {
      setTrends(computeTrends(log));
      setLoading(false);
    });
  }, [childId]);

  if (!isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Trends</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.gateContainer}>
          <Text style={styles.gateEmoji}>📊</Text>
          <Text style={styles.gateTitle}>Trends Dashboard</Text>
          <Text style={styles.gateBody}>
            Upgrade to Premium to see when, where, and what triggers happen most — and which
            strategies work best for your child over time.
          </Text>
          <TouchableOpacity
            style={styles.gateBtn}
            onPress={() => router.push('/paywall')}
          >
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

  const noData = !trends || trends.totalEntries === 0;

  // Build sorted trigger list
  const topTriggers = Object.entries(trends?.triggerCounts ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [Situation, number][];

  const topLocations = Object.entries(trends?.locationCounts ?? {})
    .sort((a, b) => b[1] - a[1]) as [Location, number][];

  const topIntensities = Object.entries(trends?.intensityCounts ?? {})
    .sort((a, b) => b[1] - a[1]) as [Intensity, number][];

  const topStrategies = (trends?.strategyEffectiveness ?? []).slice(0, 3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Trends</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary pill */}
        <View style={styles.summaryPill}>
          <Text style={styles.summaryText}>
            {trends!.totalEntries} session{trends!.totalEntries !== 1 ? 's' : ''} logged
          </Text>
        </View>

        {noData ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyBody}>
              Use the "I Need Help Right Now" flow a few times and your patterns will appear here.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/parenting-pathways/quiz')}
            >
              <Text style={styles.emptyBtnText}>Start a session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Top triggers */}
            <StatCard title="🌊 Most common triggers">
              {topTriggers.map(([sit, count]) => (
                <View key={sit} style={styles.rankRow}>
                  <Text style={styles.rankEmoji}>{SITUATION_EMOJIS[sit]}</Text>
                  <Text style={styles.rankLabel}>{SITUATION_LABELS[sit]}</Text>
                  <View style={styles.rankBarTrack}>
                    <View
                      style={[
                        styles.rankBar,
                        {
                          width: `${(count / topTriggers[0][1]) * 100}%`,
                          backgroundColor: COLORS.lavenderAccent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankCount}>{count}</Text>
                </View>
              ))}
            </StatCard>

            {/* Location breakdown */}
            <StatCard title="📍 Where it happens">
              {topLocations.map(([loc, count]) => (
                <View key={loc} style={styles.rankRow}>
                  <Text style={styles.rankLabel}>{LOCATION_LABELS[loc]}</Text>
                  <View style={styles.rankBarTrack}>
                    <View
                      style={[
                        styles.rankBar,
                        {
                          width: `${(count / (topLocations[0]?.[1] ?? 1)) * 100}%`,
                          backgroundColor: COLORS.blueAccent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankCount}>{count}</Text>
                </View>
              ))}
            </StatCard>

            {/* Intensity breakdown */}
            <StatCard title="⚡ Intensity levels">
              {topIntensities.map(([int, count]) => (
                <View key={int} style={styles.rankRow}>
                  <Text style={styles.rankLabel}>{INTENSITY_LABELS[int]}</Text>
                  <View style={styles.rankBarTrack}>
                    <View
                      style={[
                        styles.rankBar,
                        {
                          width: `${(count / (topIntensities[0]?.[1] ?? 1)) * 100}%`,
                          backgroundColor: COLORS.peachAccent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankCount}>{count}</Text>
                </View>
              ))}
            </StatCard>

            {/* Day of week */}
            <StatCard title="📅 Day of week">
              <BarChart
                data={trends!.dayOfWeekCounts}
                labels={DAY_LABELS}
                color={COLORS.purple}
                maxBars={7}
              />
            </StatCard>

            {/* Time of day */}
            <StatCard title="🕐 Time of day">
              <BarChart
                data={[
                  trends!.hourCounts.slice(6, 9).reduce((a, b) => a + b, 0),
                  trends!.hourCounts.slice(9, 12).reduce((a, b) => a + b, 0),
                  trends!.hourCounts.slice(12, 15).reduce((a, b) => a + b, 0),
                  trends!.hourCounts.slice(15, 18).reduce((a, b) => a + b, 0),
                  trends!.hourCounts.slice(18, 21).reduce((a, b) => a + b, 0),
                  trends!.hourCounts.slice(21, 24).reduce((a, b) => a + b, 0),
                ]}
                labels={['6–9am', '9–12', '12–3', '3–6pm', '6–9pm', '9pm+']}
                color={COLORS.mintAccent}
                maxBars={6}
              />
            </StatCard>

            {/* Strategy effectiveness */}
            {topStrategies.length > 0 && (
              <StatCard title="✅ What works best">
                {topStrategies.map((s) => {
                  const strat = STRATEGIES[s.strategyId];
                  if (!strat) return null;
                  const pct = s.total > 0 ? Math.round((s.helped / s.total) * 100) : 0;
                  return (
                    <View key={s.strategyId} style={styles.stratRow}>
                      <View style={styles.stratText}>
                        <Text style={styles.stratTitle}>{strat.title}</Text>
                        <Text style={styles.stratMeta}>
                          {s.helped}/{s.total} sessions helped
                        </Text>
                      </View>
                      <View style={styles.stratPct}>
                        <Text style={styles.stratPctText}>{pct}%</Text>
                      </View>
                    </View>
                  );
                })}
              </StatCard>
            )}

            {/* Insight callout */}
            {topTriggers.length > 0 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightTitle}>💡 Insight</Text>
                <Text style={styles.insightBody}>
                  Your most common trigger is{' '}
                  <Text style={{ fontWeight: '700' }}>
                    {SITUATION_LABELS[topTriggers[0][0]]}
                  </Text>
                  {topLocations.length > 0 && (
                    <>
                      {' '}and it happens most often{' '}
                      <Text style={{ fontWeight: '700' }}>
                        {LOCATION_LABELS[topLocations[0][0]].toLowerCase()}
                      </Text>
                    </>
                  )}
                  . Sharing this pattern with your child's therapist or school team can help them
                  build a proactive support plan.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  loadingText: { fontSize: FONT_SIZES.md, color: COLORS.textMid },

  summaryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  summaryText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  emptyBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },

  // Rank rows
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  rankEmoji: { fontSize: 16, width: 22 },
  rankLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, width: 110 },
  rankBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rankBar: { height: '100%', borderRadius: 4 },
  rankCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    width: 24,
    textAlign: 'right',
  },

  // Strategy effectiveness
  stratRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  stratText: { flex: 1 },
  stratTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  stratMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  stratPct: {
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.pill,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
  },
  stratPctText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText },

  // Insight
  insightCard: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.yellowAccent,
    marginBottom: SPACING.md,
  },
  insightTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  insightBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },

  // Gate (non-premium)
  gateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  gateEmoji: { fontSize: 56, marginBottom: SPACING.xl },
  gateTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  gateBody: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  gateBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    ...SHADOWS.md,
  },
  gateBtnText: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.lg },
});
