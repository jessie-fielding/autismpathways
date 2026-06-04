/**
 * NearMeButton — reusable "📍 Near Me" button for state-picker screens.
 *
 * Usage:
 *   <NearMeButton onStateDetected={(code, name, city) => setSelectedState(code)} />
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useNearMeState } from '../hooks/useNearMeState';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../lib/theme';

type Props = {
  onStateDetected: (stateCode: string, stateName: string, city?: string) => void;
  /** Override button label. Defaults to "📍 Near Me" */
  label?: string;
  /** Show compact pill style (default) or full-width style */
  variant?: 'pill' | 'full';
};

export default function NearMeButton({
  onStateDetected,
  label = '📍 Near Me',
  variant = 'pill',
}: Props) {
  const { detectState, isDetecting, locationError } = useNearMeState();

  const handlePress = async () => {
    const result = await detectState();
    if (result) {
      onStateDetected(result.stateCode, result.stateName, result.city);
    }
  };

  return (
    <View style={variant === 'full' ? styles.wrapFull : styles.wrapPill}>
      <TouchableOpacity
        style={[
          styles.btn,
          variant === 'full' ? styles.btnFull : styles.btnPill,
          isDetecting && styles.btnDisabled,
        ]}
        onPress={handlePress}
        disabled={isDetecting}
        activeOpacity={0.8}
      >
        {isDetecting ? (
          <ActivityIndicator size="small" color={COLORS.purple} />
        ) : (
          <Text style={[styles.label, variant === 'full' && styles.labelFull]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
      {!!locationError && (
        <Text style={styles.error}>{locationError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapPill: { alignSelf: 'flex-start' },
  wrapFull: { width: '100%' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderRadius: RADIUS.pill,
  },
  btnPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minWidth: 100,
    minHeight: 34,
  },
  btnFull: {
    paddingVertical: SPACING.md,
    width: '100%',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lavender,
  },
  btnDisabled: { opacity: 0.6 },

  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.purple,
  },
  labelFull: {
    fontSize: FONT_SIZES.base,
  },

  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.errorText,
    marginTop: SPACING.xs,
    maxWidth: 260,
  },
});
