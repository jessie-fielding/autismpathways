import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

export default function ParentingPathwaysEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

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
        <Text style={styles.headerTitle}>Parenting Pathways</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>⚡</Text>
          <Text style={styles.heroTitle}>In-the-Moment{'\n'}Support</Text>
          <Text style={styles.heroSubtitle}>
            Get immediate, actionable strategies for what's happening right now.
          </Text>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/parenting-pathways/quiz')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnEmoji}>🆘</Text>
          <View style={styles.primaryBtnText}>
            <Text style={styles.primaryBtnTitle}>I Need Help Right Now</Text>
            <Text style={styles.primaryBtnSub}>Answer 3 quick questions → get strategies</Text>
          </View>
          <Text style={styles.primaryBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Secondary options */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/parenting-pathways/quiz')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnEmoji}>📚</Text>
            <Text style={styles.secondaryBtnTitle}>Browse{'\n'}Strategies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, !isPremium && styles.secondaryBtnLocked]}
            onPress={() =>
              isPremium
                ? router.push('/parenting-pathways/trends')
                : router.push('/paywall')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnEmoji}>{isPremium ? '📊' : '🔒'}</Text>
            <Text style={styles.secondaryBtnTitle}>
              {isPremium ? 'View My\nTrends' : 'My Trends\n(Premium)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* What this is */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>How it works</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoStep}>1</Text>
            <Text style={styles.infoText}>Tell us what's happening in 3 taps</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoStep}>2</Text>
            <Text style={styles.infoText}>Get strategies matched to your exact situation</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoStep}>3</Text>
            <Text style={styles.infoText}>
              {isPremium
                ? 'Track what works over time in your Trends dashboard'
                : 'Upgrade to Premium to track patterns over time'}
            </Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + SPACING.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
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
  backText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.purple,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
  },
  primaryBtn: {
    backgroundColor: '#E8380D',
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    ...SHADOWS.lg,
    shadowColor: 'rgba(232, 56, 13, 0.4)',
  },
  primaryBtnEmoji: {
    fontSize: 32,
    marginRight: SPACING.lg,
  },
  primaryBtnText: {
    flex: 1,
  },
  primaryBtnTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  primaryBtnSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  primaryBtnArrow: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: '300',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginHorizontal: SPACING.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  secondaryBtnLocked: {
    opacity: 0.7,
  },
  secondaryBtnEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  secondaryBtnTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
    marginBottom: SPACING.lg,
  },
  infoCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  infoStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
});
