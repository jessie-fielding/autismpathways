/**
 * ABC Logger — Coming Soon placeholder.
 * Antecedent-Behavior-Consequence data collection for BCBA.
 */
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent, logScreenView } from '../../../lib/analytics';

const PLANNED_FEATURES = [
  { emoji: '📋', title: 'Quick ABC Log', body: 'Log antecedent, behavior, and consequence in under 30 seconds with tappable options.' },
  { emoji: '📊', title: 'Pattern Analysis', body: 'See which antecedents and consequences are most associated with target behaviors.' },
  { emoji: '📤', title: 'BCBA Export', body: 'Export your ABC data as a formatted PDF or CSV to share with your behavior analyst.' },
  { emoji: '🔔', title: 'Behavior Alerts', body: 'Set up alerts for high-frequency behaviors so you never miss a data point.' },
];

export default function ABCLogger() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logScreenView('abc_logger');
    logEvent('tool_opened', { tool: 'ABC Logger (Coming Soon)' });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ABC Logger</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming soon banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>📋</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>
          <Text style={styles.bannerTitle}>ABC Logger</Text>
          <Text style={styles.bannerSub}>
            Antecedent-Behavior-Consequence data collection designed for families managing extreme behaviors.
          </Text>
        </View>

        {/* What it will do */}
        <Text style={styles.sectionLabel}>WHAT'S COMING</Text>
        {PLANNED_FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureBody}>{feature.body}</Text>
            </View>
          </View>
        ))}

        {/* Why it matters */}
        <View style={styles.whyCard}>
          <Text style={styles.whyTitle}>Why ABC Data Matters</Text>
          <Text style={styles.whyText}>
            ABC (Antecedent-Behavior-Consequence) data is the foundation of Applied Behavior Analysis. It helps your BCBA identify the function of a behavior — what triggers it and what maintains it. Without this data, behavior intervention plans are guesses.{'\n\n'}
            Most families struggle to collect ABC data consistently because the current tools are designed for clinicians, not parents in the middle of a crisis. This tool is being built differently.
          </Text>
        </View>

        {/* In the meantime */}
        <View style={styles.meanwhileCard}>
          <Text style={styles.meanwhileTitle}>In the Meantime</Text>
          <Text style={styles.meanwhileText}>
            Use the Smear Tracker for poop smearing incidents, and the SOS+ tool for in-the-moment support. For general ABC logging, a simple notes app with date, time, antecedent, behavior, and consequence is a good temporary solution.
          </Text>
        </View>
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
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { gap: SPACING.md },
  banner: {
    backgroundColor: '#2D2D2D',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bannerEmoji: { fontSize: 48 },
  comingSoonBadge: {
    backgroundColor: COLORS.textLight,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  comingSoonText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  bannerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: '#fff', textAlign: 'center' },
  bannerSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
  },
  featureCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  featureEmoji: { fontSize: 24 },
  featureText: { flex: 1, gap: SPACING.xs },
  featureTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  featureBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 18 },
  whyCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  whyTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  whyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  meanwhileCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: '#F0EDFF',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  meanwhileTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.purple, marginBottom: SPACING.sm },
  meanwhileText: { fontSize: FONT_SIZES.sm, color: '#4C1D95', lineHeight: 20 },
});
