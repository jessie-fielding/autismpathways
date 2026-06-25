/**
 * ViewAsUserBanner
 *
 * A persistent fixed bar shown at the top of every screen when the admin
 * is in "View as user" debug mode. Tapping it exits the mode.
 * Uses AppState listener to re-check the flag whenever the app comes
 * to the foreground (e.g. after navigating back from admin dashboard).
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState, AppStateStatus, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isImpersonatingUser, setImpersonatingUser, IMPERSONATE_KEY } from '../services/impersonation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, SPACING } from '../lib/theme';

export default function ViewAsUserBanner() {
  const [active, setActive] = useState(false);
  const insets = useSafeAreaInsets();
  const appState = useRef(AppState.currentState);

  const checkFlag = useCallback(async () => {
    const val = await isImpersonatingUser();
    setActive(val);
  }, []);

  useEffect(() => {
    // Check on mount
    checkFlag();

    // Re-check whenever app comes back to foreground
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkFlag();
      }
      appState.current = nextState;
    });

    // Also poll every 2 seconds while active (catches in-app navigation)
    const interval = setInterval(checkFlag, 2000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [checkFlag]);

  const handleExit = async () => {
    Alert.alert(
      '✅ Back to Admin Mode',
      'View as user mode is OFF. Your admin access is restored.',
      [{
        text: 'Got it',
        onPress: async () => {
          await setImpersonatingUser(false);
          setActive(false);
        }
      }]
    );
  };

  if (!active) return null;

  return (
    <TouchableOpacity
      style={[styles.banner, { paddingTop: insets.top + 4 }]}
      onPress={handleExit}
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
