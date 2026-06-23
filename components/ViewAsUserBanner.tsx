/**
 * ViewAsUserBanner
 *
 * A persistent fixed bar shown at the top of every screen when the admin
 * is in "View as user" debug mode. Tapping it exits the mode and reloads.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isImpersonatingUser, setImpersonatingUser } from '../services/impersonation';
import { COLORS, FONT_SIZES, SPACING } from '../lib/theme';

export default function ViewAsUserBanner() {
  const [active, setActive] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    isImpersonatingUser().then(setActive);
  }, []);

  if (!active) return null;

  return (
    <TouchableOpacity
      style={[styles.banner, { paddingTop: insets.top + 4 }]}
      onPress={() => setImpersonatingUser(false)}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>👁 Viewing as user — Tap to exit</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: COLORS.purpleDark,
    paddingBottom: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.yellowAccent,
  },
  text: {
    color: COLORS.yellowAccent,
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
