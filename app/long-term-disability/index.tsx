import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { STATE_LTD_DATA, getWaitlistColor, getWaitlistLabel } from '../../data/longTermDisability';
import { PathwayDisclaimer } from '../../components/PathwayDisclaimer';

const ALL_STATES = STATE_LTD_DATA.map(s => ({
  abbreviation: s.abbreviation,
  state: s.state,
  waitlistStatus: s.waitlistStatus,
  waitlistNote: s.waitlistNote,
})).sort((a, b) => a.state.localeCompare(b.state));

export default function LongTermDisabilityIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      s =>
        s.state.toLowerCase().includes(q) ||
        s.abbreviation.toLowerCase().includes(q)
    );
  }, [search]);

  const savedStateData = savedState
    ? ALL_STATES.find(s => s.abbreviation === savedState)
    : null;

  const handleSelect = async (abbreviation: string) => {
    await AsyncStorage.setItem('ap_state', abbreviation);
    router.push({
      pathname: '/long-term-disability/state-detail',
      params: { state: abbreviation },
    });
  };

  const renderItem = ({ item }: { item: typeof ALL_STATES[0] }) => {
    const color = getWaitlistColor(item.waitlistStatus);
    const label = getWaitlistLabel(item.waitlistStatus);
    return (
      <TouchableOpacity
        style={styles.stateRow}
        onPress={() => handleSelect(item.abbreviation)}
        activeOpacity={0.75}
      >
        <View style={styles.stateLeft}>
          <View style={[styles.abbrevBadge, { backgroundColor: COLORS.lavender }]}>
            <Text style={styles.abbrevText}>{item.abbreviation}</Text>
          </View>
          <View style={styles.stateInfo}>
            <Text style={styles.stateName}>{item.state}</Text>
            {item.waitlistNote ? (
              <Text style={styles.waitlistNote} numberOfLines={1}>
                {item.waitlistNote}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.stateRight}>
          <View style={[styles.statusPill, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[styles.statusText, { color }]}>{label}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/dashboard')}
          style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Autism <Text style={styles.headerPurple}>Pathways</Text>
        </Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>♿</Text>
        <Text style={styles.heroTitle}>Long-Term Disability{'\n'}Programs</Text>
        <Text style={styles.heroSub}>
          Medicaid waivers, federal benefits, housing, employment, and financial
          planning — for every state.
        </Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerWrap}>
        <PathwayDisclaimer />
      </View>

      {/* Federal programs shortcut */}
      <TouchableOpacity
        style={styles.federalCard}
        onPress={() => router.push('/long-term-disability/federal-programs')}
        activeOpacity={0.8}
      >
        <View style={styles.federalLeft}>
          <Text style={styles.federalEmoji}>🇺🇸</Text>
          <View>
            <Text style={styles.federalTitle}>Federal Programs</Text>
            <Text style={styles.federalSub}>SSI, SSDI, ABLE, Section 8, Voc Rehab</Text>
          </View>
        </View>
        <Text style={styles.federalArrow}>→</Text>
      </TouchableOpacity>

      {/* Saved state shortcut */}
      {savedStateData && (
        <TouchableOpacity
          style={styles.savedCard}
          onPress={() => handleSelect(savedStateData.abbreviation)}
          activeOpacity={0.8}
        >
          <View style={styles.savedLeft}>
            <Text style={styles.savedEmoji}>📍</Text>
            <View>
              <Text style={styles.savedLabel}>Your saved state</Text>
              <Text style={styles.savedName}>{savedStateData.state}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, {
            backgroundColor: getWaitlistColor(savedStateData.waitlistStatus) + '22',
            borderColor: getWaitlistColor(savedStateData.waitlistStatus),
          }]}>
            <Text style={[styles.statusText, {
              color: getWaitlistColor(savedStateData.waitlistStatus),
            }]}>
              {getWaitlistLabel(savedStateData.waitlistStatus)}
            </Text>
          </View>
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

      {/* Legend */}
      <View style={styles.legend}>
        {(['none', 'short', 'moderate', 'long', 'severe'] as const).map(s => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getWaitlistColor(s) }]} />
            <Text style={styles.legendText}>{getWaitlistLabel(s)}</Text>
          </View>
        ))}
      </View>

      {/* State list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.abbreviation}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  hero: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimerWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
  },
  federalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  federalLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  federalEmoji: { fontSize: 24 },
  federalTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1e40af' },
  federalSub: { fontSize: FONT_SIZES.xs, color: '#3b82f6', marginTop: 2 },
  federalArrow: { fontSize: 20, color: '#3b82f6', fontWeight: '700' },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lavender,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  savedLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  savedEmoji: { fontSize: 22 },
  savedLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  savedName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  clearBtn: { padding: SPACING.xs },
  clearText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: COLORS.textMid },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  stateLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  abbrevBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abbrevText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.purple },
  stateInfo: { flex: 1 },
  stateName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  waitlistNote: { fontSize: 11, color: COLORS.textMid, marginTop: 2 },
  stateRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  arrow: { fontSize: 18, color: COLORS.textLight, fontWeight: '600' },
});
