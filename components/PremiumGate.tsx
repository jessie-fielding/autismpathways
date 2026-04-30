/**
 * PremiumGate
 *
 * Wraps premium-only content. If the user is not premium, shows an upgrade
 * prompt instead of the children.
 *
 * Usage:
 *   <PremiumGate feature="Bowel Diary">
 *     <BowelDiaryContent />
 *   </PremiumGate>
 *
 * During beta (BETA_MODE = true), children are always shown.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../lib/theme';
import { useIsPremium } from '../hooks/useIsPremium';

type Props = {
  feature?: string;
  children: React.ReactNode;
};

export default function PremiumGate({ feature, children }: Props) {
  const router = useRouter();
  const { isPremium, loading } = useIsPremium();

  if (loading) return null;

  if (isPremium) return <>{children}</>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>Premium Feature</Text>
        {feature && (
          <Text style={styles.featureName}>{feature}</Text>
        )}
        <Text style={styles.sub}>
          Unlock all features with Autism Pathways Premium — everything you need to navigate the system, in one place.
        </Text>
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.85}
        >
          <Text style={styles.upgradeBtnText}>Unlock Premium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.learnMoreBtn}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.7}
        >
          <Text style={styles.learnMoreText}>See what's included →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.bg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
    ...SHADOWS.md,
  },
  lockIcon: { fontSize: 40, marginBottom: SPACING.md },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  featureName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.purple,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  sub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  upgradeBtn: {
    width: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  upgradeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  learnMoreBtn: {
    paddingVertical: SPACING.sm,
  },
  learnMoreText: {
    color: COLORS.purple,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
