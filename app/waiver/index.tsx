import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import waiverData from '../../data/waiver-data.json';
import { PathwayDisclaimer } from '../../components/PathwayDisclaimer';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const ALL_STATES = Object.entries(waiverData as Record<string, { stateName: string }>)
  .map(([abbr, data]) => ({ abbr, name: data.stateName }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function WaiverStatePickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [savedState, setSavedState] = useState<string | null>(null);
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem('ap_state').then(val => {
      if (val) setSavedState(val);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_STATES;
    return ALL_STATES.filter(
      s => s.name.toLowerCase().includes(q) || s.abbr.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = async (abbr: string) => {
    await AsyncStorage.setItem('ap_state', abbr);
    // Advance waiver progress to at least step 1 (state selected)
    const cur = parseInt(await AsyncStorage.getItem('ap_waiver_progress') || '0', 10);
    if (cur < 1) await AsyncStorage.setItem('ap_waiver_progress', '1');
    router.push({ pathname: '/waiver/state-overview', params: { state: abbr } });
  };

  const savedStateName = savedState
    ? ALL_STATES.find(s => s.abbr === savedState)?.name
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Autism <Text style={styles.headerPurple}>Pathways</Text>
        </Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🗺️</Text>
        <Text style={styles.heroTitle}>Waiver & Community{'\n'}Connector</Text>
        <Text style={styles.heroSub}>
          Find your local DD agency, understand available waivers, and get the right phone number — by state and county.
        </Text>
      </View>

      {/* Saved state shortcut */}
      {savedState && savedStateName && (
        <TouchableOpacity style={styles.savedCard} onPress={() => handleSelect(savedState)}>
          <View style={styles.savedLeft}>
            <Text style={styles.savedEmoji}>📍</Text>
            <View>
              <Text style={styles.savedLabel}>Your saved state</Text>
              <Text style={styles.savedName}>{savedStateName}</Text>
            </View>
          </View>
          <Text style={styles.savedArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          ref={searchRef}
          style={styles.searchInput}
          placeholder="Search state..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* State list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.abbr}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.stateRow, item.abbr === savedState && styles.stateRowSaved]}
            onPress={() => handleSelect(item.abbr)}
            activeOpacity={0.7}
          >
            <View style={styles.stateAbbr}>
              <Text style={styles.stateAbbrText}>{item.abbr}</Text>
            </View>
            <Text style={styles.stateName}>{item.name}</Text>
            {item.abbr === savedState && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>saved</Text>
              </View>
            )}
            <Text style={styles.stateArrow}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No states match "{search}"</Text>
          </View>
        }
        ListFooterComponent={<PathwayDisclaimer type="legal" />}
      />

      <View style={styles.rainbowBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },

  hero: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },

  savedCard: {
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
    borderWidth: 1.5,
    borderColor: COLORS.lavender,
  },
  savedLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  savedEmoji: { fontSize: 22 },
  savedLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  savedName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  savedArrow: { fontSize: 20, color: COLORS.purple, fontWeight: '700' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  clearBtn: { padding: SPACING.xs },
  clearText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },

  listContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  stateRowSaved: { backgroundColor: '#f5f0ff' },
  stateAbbr: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateAbbrText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.purple },
  stateName: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  savedBadge: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  savedBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '700' },
  stateArrow: { fontSize: 18, color: COLORS.textLight },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.xs },

  emptyState: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textLight, fontSize: FONT_SIZES.md },

  rainbowBar: {
    height: 4,
    backgroundColor: COLORS.purple,
  },
});
