/**
 * PremiumLockSheet — bottom sheet modal shown when a user taps a locked (premium) item.
 * Shows what the feature does + upgrade CTA.
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  TouchableWithoutFeedback, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  featureTitle: string;
  featureDesc: string;
  featureEmoji?: string;
}

export default function PremiumLockSheet({
  visible, onClose, featureTitle, featureDesc, featureEmoji = '⭐',
}: Props) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    setTimeout(() => router.push('/paywall' as any), 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Lock badge */}
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        {/* Feature info */}
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{featureEmoji}</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{featureTitle}</Text>
            <Text style={styles.featureDesc}>{featureDesc}</Text>
          </View>
        </View>

        {/* Premium badge */}
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumBannerEmoji}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumBannerTitle}>Premium Feature</Text>
            <Text style={styles.premiumBannerSub}>
              Unlock this and 20+ more features with Autism Pathways Premium
            </Text>
          </View>
        </View>

        {/* What's included teaser */}
        <View style={styles.teaserRow}>
          {['📋 IEP Tools', '🗺️ All 50 States', '✨ AI Guide', '🏠 Housing Finder', '💼 Jobs Finder'].map((item) => (
            <View key={item} style={styles.teaserChip}>
              <Text style={styles.teaserChipText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
          <Text style={styles.upgradeBtnText}>⭐ Upgrade to Premium →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.dismissBtnText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
    ...SHADOWS.lg,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  lockBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 32,
    width: 56, height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: '#F5D87A',
  },
  lockIcon: { fontSize: 26 },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.lavender ?? '#EDE9FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  featureEmoji: { fontSize: 28, marginTop: 2 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  featureDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 18 },

  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#F5D87A',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  premiumBannerEmoji: { fontSize: 22 },
  premiumBannerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E' },
  premiumBannerSub: { fontSize: FONT_SIZES.xs, color: '#92400E', marginTop: 2, lineHeight: 16 },

  teaserRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  teaserChip: {
    backgroundColor: COLORS.lavender ?? '#EDE9FF',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  teaserChipText: { fontSize: 11, fontWeight: '600', color: COLORS.purple },

  upgradeBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  upgradeBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '800' },

  dismissBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dismissBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
});
