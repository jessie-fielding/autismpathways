import { useMemo, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import waiverData from '../../data/waiver-data.json';

type StateData = {
  stateName: string;
  counties: Record<string, { countyDisplay: string }>;
};

export default function CountyPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string }>();
  const stateAbbr = params.state || '';
  const [search, setSearch] = useState('');

  const data = stateAbbr ? (waiverData as Record<string, StateData>)[stateAbbr] : null;

  const counties = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.counties)
      .map(([key, c]) => ({ key, display: c.countyDisplay }))
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return counties;
    return counties.filter(c => c.display.toLowerCase().includes(q));
  }, [counties, search]);

  const handleSelect = async (countyKey: string) => {
    await AsyncStorage.setItem('ap_county', countyKey);
    router.push({ pathname: '/waiver/agency-card', params: { state: stateAbbr, county: countyKey } });
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>State not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {stateAbbr}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>Select Your County</Text>
        <Text style={styles.subHeaderSub}>{data.stateName} · {counties.length} counties</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search county..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* County list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.countyRow}
            onPress={() => handleSelect(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.countyIcon}>
              <Text style={styles.countyIconText}>📍</Text>
            </View>
            <Text style={styles.countyName}>{item.display}</Text>
            <Text style={styles.countyArrow}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No counties match "{search}"</Text>
          </View>
        }
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
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },

  subHeader: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  subHeaderTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  subHeaderSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

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
  searchIcon: { fontSize: 16, marginRight: 6 },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  clearText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, padding: SPACING.xs },

  listContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  countyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  countyIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countyIconText: { fontSize: 16 },
  countyName: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  countyArrow: { fontSize: 18, color: COLORS.textLight },
  separator: { height: 1, backgroundColor: COLORS.border },

  emptyState: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textLight, fontSize: FONT_SIZES.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
});
