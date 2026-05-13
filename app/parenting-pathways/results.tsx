import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import {
  getStrategies,
  type Situation,
  type Location,
  type Intensity,
} from '../../lib/parentingStrategies';
import {
  ppAddEntry,
  ppUpdateFeedback,
  type PPLogEntry,
} from '../../lib/parentingPathwaysData';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useActiveChild } from '../../services/childManager';

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

const INTENSITY_LABELS: Record<Intensity, string> = {
  building: 'Building',
  full: 'Full intensity',
  unsafe: 'Escalating to unsafe',
};

const INTENSITY_COLORS: Record<Intensity, string> = {
  building: '#F5A623',
  full: '#E8700D',
  unsafe: '#C0392B',
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'De-escalation': { bg: '#DCEEFF', text: '#2C5F8A' },
  Sensory: { bg: '#E3F7F1', text: '#0A7A5A' },
  Safety: { bg: '#FFF0EE', text: '#C0392B' },
  Regulation: { bg: '#E9E3FF', text: '#5C3EA8' },
  Refusal: { bg: '#FFF6D8', text: '#7A6020' },
  Anxiety: { bg: '#E9E3FF', text: '#5C3EA8' },
  Shutdown: { bg: '#F0F0F8', text: '#5A5A72' },
  Transition: { bg: '#FFE8DC', text: '#A04020' },
  Public: { bg: '#DCEEFF', text: '#2C5F8A' },
  School: { bg: '#E3F7F1', text: '#0A7A5A' },
};

export default function ParentingPathwaysResults() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const { childId } = useActiveChild();
  const params = useLocalSearchParams<{
    situation: Situation;
    location: Location;
    intensity: Intensity;
  }>();

  const { situation, location, intensity } = params;
  const { primary, secondary } = getStrategies(situation, location, intensity);

  const [logEntry, setLogEntry] = useState<PPLogEntry | null>(null);
  const [feedback, setFeedback] = useState<'helped' | 'try_another' | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Log this session on mount, scoped to the active child
  useEffect(() => {
    ppAddEntry({
      timestamp: Date.now(),
      situation,
      location,
      intensity,
      primaryStrategyId: primary.id,
      feedback: null,
      childId: childId ?? undefined,
    }).then(setLogEntry);
  }, []);

  async function handleFeedback(value: 'helped' | 'try_another') {
    setFeedback(value);
    if (logEntry) {
      await ppUpdateFeedback(logEntry.id, value, childId);
    }
  }

  const intensityColor = INTENSITY_COLORS[intensity] ?? COLORS.purple;
  const tagStyle = (tag?: string) =>
    tag && TAG_COLORS[tag] ? TAG_COLORS[tag] : { bg: COLORS.lavender, text: COLORS.purple };

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
        <Text style={styles.headerTitle}>Your Strategies</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context summary */}
        <View style={styles.contextRow}>
          <View style={styles.contextPill}>
            <Text style={styles.contextPillText}>{SITUATION_LABELS[situation]}</Text>
          </View>
          <View style={[styles.contextPill, { backgroundColor: `${intensityColor}20`, borderColor: intensityColor }]}>
            <Text style={[styles.contextPillText, { color: intensityColor }]}>
              {INTENSITY_LABELS[intensity]}
            </Text>
          </View>
        </View>

        {/* Primary strategy */}
        <View style={styles.primaryCard}>
          <View style={styles.primaryCardHeader}>
            <Text style={styles.primaryLabel}>⚡ Do this first</Text>
            {primary.tag && (
              <View style={[styles.tag, { backgroundColor: tagStyle(primary.tag).bg }]}>
                <Text style={[styles.tagText, { color: tagStyle(primary.tag).text }]}>
                  {primary.tag}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.primaryTitle}>{primary.title}</Text>
          <Text style={styles.primaryBody}>{primary.body}</Text>
        </View>

        {/* Feedback */}
        {!feedback ? (
          <View style={styles.feedbackRow}>
            <Text style={styles.feedbackPrompt}>Did this help?</Text>
            <TouchableOpacity
              style={[styles.feedbackBtn, styles.feedbackBtnYes]}
              onPress={() => handleFeedback('helped')}
            >
              <Text style={styles.feedbackBtnText}>✓ Yes, helped</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackBtn, styles.feedbackBtnNo]}
              onPress={() => handleFeedback('try_another')}
            >
              <Text style={[styles.feedbackBtnText, { color: COLORS.textMid }]}>
                Try another →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.feedbackConfirm}>
            <Text style={styles.feedbackConfirmText}>
              {feedback === 'helped'
                ? '✅ Great — logged for your trends'
                : '📝 Noted — see more strategies below'}
            </Text>
          </View>
        )}

        {/* Secondary strategies */}
        {secondary.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Also try</Text>
            {(showAll ? secondary : secondary.slice(0, feedback === 'try_another' ? 3 : 2)).map(
              (s) => (
                <View key={s.id} style={styles.secondaryCard}>
                  <View style={styles.secondaryCardHeader}>
                    <Text style={styles.secondaryTitle}>{s.title}</Text>
                    {s.tag && (
                      <View style={[styles.tag, { backgroundColor: tagStyle(s.tag).bg }]}>
                        <Text style={[styles.tagText, { color: tagStyle(s.tag).text }]}>
                          {s.tag}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.secondaryBody}>{s.body}</Text>
                </View>
              ),
            )}
            {!showAll && secondary.length > 2 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAll(true)}
              >
                <Text style={styles.showMoreText}>
                  Show {secondary.length - 2} more strategies
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Premium trends upsell */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.upsellCard}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.85}
          >
            <Text style={styles.upsellEmoji}>📊</Text>
            <View style={styles.upsellText}>
              <Text style={styles.upsellTitle}>See your patterns over time</Text>
              <Text style={styles.upsellSub}>
                Premium tracks when, where, and what triggers happen most — and which strategies
                work best for your child.
              </Text>
            </View>
            <Text style={styles.upsellArrow}>›</Text>
          </TouchableOpacity>
        )}

        {isPremium && (
          <TouchableOpacity
            style={styles.trendsBtn}
            onPress={() => router.push('/parenting-pathways/trends')}
            activeOpacity={0.85}
          >
            <Text style={styles.trendsBtnText}>📊 View My Trends Dashboard</Text>
          </TouchableOpacity>
        )}

        {/* Done */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push('/(tabs)/dashboard')}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + SPACING.xxxl }} />
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  contextRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
  },
  contextPill: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.lavender,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  contextPillText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.purple,
  },

  // Primary card
  primaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.purple,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  primaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  primaryLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.purple,
  },
  primaryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  primaryBody: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 22,
  },

  // Tag badge
  tag: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },

  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
  },
  feedbackPrompt: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMid,
    marginRight: SPACING.xs,
  },
  feedbackBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
  },
  feedbackBtnYes: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  feedbackBtnNo: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  feedbackBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  feedbackConfirm: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  feedbackConfirmText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.purple,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  // Secondary cards
  secondaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  secondaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  secondaryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  secondaryBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },

  // Show more
  showMoreBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  showMoreText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.purple,
  },

  // Upsell card
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  upsellEmoji: { fontSize: 28 },
  upsellText: { flex: 1 },
  upsellTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  upsellSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 18,
  },
  upsellArrow: {
    fontSize: 20,
    color: COLORS.purple,
  },

  // Trends button (premium)
  trendsBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  trendsBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Done button
  doneBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  doneBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMid,
  },
});
