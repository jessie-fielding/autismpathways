/**
 * NotificationPermissionPrompt
 *
 * A friendly bottom-sheet style modal that appears on first launch
 * to explain why the app wants to send notifications.
 * Shows ONCE — stores a flag in AsyncStorage after the user responds.
 *
 * Usage: Mount in app/_layout.tsx or app/index.tsx
 *   <NotificationPermissionPrompt />
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../lib/theme';
import { useNotifications } from '../hooks/useNotifications';

const KEY_PROMPT_SHOWN = 'ap_notif_prompt_shown';

const BENEFITS = [
  { icon: '⚖️', text: 'Appeal deadline reminders so you never miss a hearing' },
  { icon: '📅', text: 'Appointment reminders 24 hours in advance' },
  { icon: '✅', text: 'Weekly check-ins to keep your journey on track' },
  { icon: '🗺️', text: 'Annual waiver waitlist reminders' },
];

export default function NotificationPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const { requestPermission } = useNotifications();

  useEffect(() => {
    checkShouldShow();
  }, []);

  const checkShouldShow = async () => {
    const shown = await AsyncStorage.getItem(KEY_PROMPT_SHOWN);
    if (!shown) {
      // Small delay so the app has time to render first
      setTimeout(() => {
        setVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      }, 1500);
    }
  };

  const dismiss = async (allow: boolean) => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(async () => {
      setVisible(false);
      await AsyncStorage.setItem(KEY_PROMPT_SHOWN, 'true');
      if (allow) {
        await requestPermission();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={() => dismiss(false)}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => dismiss(false)}
      />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🔔</Text>
        </View>

        <Text style={styles.title}>Stay on top of your journey</Text>
        <Text style={styles.sub}>
          Autism Pathways can send you helpful reminders — no spam, just the things that matter.
        </Text>

        {/* Benefits list */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.allowBtn} onPress={() => dismiss(true)} activeOpacity={0.85}>
          <Text style={styles.allowBtnText}>Allow Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => dismiss(false)} activeOpacity={0.7}>
          <Text style={styles.skipBtnText}>Not now</Text>
        </TouchableOpacity>

        <Text style={styles.fine}>
          You can change this anytime in Settings → Notifications.
        </Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 40,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconEmoji: { fontSize: 34 },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  benefits: {
    width: '100%',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  benefitIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  benefitText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 19,
  },
  allowBtn: {
    width: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  allowBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  skipBtn: {
    width: '100%',
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  skipBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  fine: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 17,
  },
});
