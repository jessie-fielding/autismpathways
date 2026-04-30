import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../lib/theme';

const { width } = Dimensions.get('window');

// Map route name → icon pair (filled / outline)
const ICONS: Record<string, { active: string; inactive: string; label: string }> = {
  dashboard:         { active: 'home',          inactive: 'home-outline',          label: 'Home' },
  explore:           { active: 'compass',        inactive: 'compass-outline',        label: 'Explore' },
  'diagnosis-pathway': { active: 'search',       inactive: 'search-outline',        label: 'Diagnosis' },
  'medicaid-pathway':  { active: 'document-text',inactive: 'document-text-outline', label: 'Medicaid' },
  'tools-tab':         { active: 'grid',         inactive: 'grid-outline',          label: 'Tools' },
  'settings-tab':      { active: 'settings',     inactive: 'settings-outline',      label: 'Settings' },
};

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const meta = ICONS[route.name] ?? {
            active: 'ellipse',
            inactive: 'ellipse-outline',
            label: route.name,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? meta.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Ionicons
                  name={(isFocused ? meta.active : meta.inactive) as any}
                  size={22}
                  color={isFocused ? COLORS.white : COLORS.textLight}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? COLORS.purple : COLORS.textLight },
                ]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    // transparent so the screen content shows behind the bar
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 6,
    width: width - 32,
    // shadow
    ...Platform.select({
      ios: {
        shadowColor: '#2F2F3A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.purple,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
