/**
 * ChildSwitcher.tsx
 * A compact header chip that navigates to the /children management screen.
 * - No children yet  → shows "+ Add Child"
 * - One child        → shows avatar + name (taps into /children to add/edit)
 * - Multiple children → shows avatar + name + ▼ chevron (taps into /children to switch)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveChild } from '../services/childManager';

const COLORS = {
  purple: '#7c6fd4', purpleDk: '#4a3f8f', purpleLt: '#f0ebff',
  textMid: '#6b6490', white: '#ffffff',
};
const SP = { xs: 4, sm: 8, md: 12 };

interface Props {
  /** Called after switching children so parent can reload data */
  onSwitch?: (childId: string) => void;
}

export default function ChildSwitcher({ onSwitch }: Props) {
  const router = useRouter();
  const { child, children } = useActiveChild();

  const handlePress = () => {
    router.push('/children');
  };

  // No children at all — show "Add Child"
  if (!child && children.length === 0) {
    return (
      <TouchableOpacity style={styles.chip} onPress={handlePress}>
        <Text style={styles.chipText}>+ Add Child</Text>
      </TouchableOpacity>
    );
  }

  // One or more children — show avatar + name + "Switch Child" label if multiple
  return (
    <TouchableOpacity
      style={[styles.chip, { borderColor: child?.color || COLORS.purple }]}
      onPress={handlePress}
    >
      <View style={[styles.avatar, { backgroundColor: child?.color || COLORS.purple }]}>
        <Text style={styles.avatarText}>{child?.avatar || '??'}</Text>
      </View>
      <Text style={styles.chipName} numberOfLines={1}>
        {children.length > 1 ? 'Switch Child' : (child?.name || 'My Child')}
      </Text>
      {children.length > 1 && <Text style={styles.chevron}>▼</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SP.xs,
    backgroundColor: COLORS.purpleLt, borderRadius: 20,
    paddingHorizontal: SP.md, paddingVertical: SP.xs,
    borderWidth: 1.5, borderColor: COLORS.purple, maxWidth: 160,
  },
  avatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  chipName: { fontSize: 13, fontWeight: '700', color: COLORS.purpleDk, flex: 1 },
  chevron: { fontSize: 9, color: COLORS.textMid },
});
