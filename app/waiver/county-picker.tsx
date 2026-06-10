import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, FlatList, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import waiverData from '../../data/waiver-data.json';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CountyEntry = { countyDisplay: string };
type StateData = { stateName: string; counties: Record<string, CountyEntry> };

// ─── Journey Stepper ──────────────────────────────────────────────────────────
function JourneyStepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['State', 'Overview', 'County'];
  return (
    <View style={stepStyles.container}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <View key={i} style={stepStyles.stepWrap}>
            <View style={[stepStyles.circle, done && stepStyles.circleDone, active && stepStyles.circleActive]}>
              {done
                ? <Text style={stepStyles.checkmark}>✓</Text>
                : <Text style={[stepStyles.stepNum, active && stepStyles.stepNumActive]}>{num}</Text>
              }
            </View>
            <Text style={[stepStyles.label, active && stepStyles.labelActive]}>{label}</Text>
            {i < steps.length - 1 && (
              <View style={[stepStyles.line, done && stepStyles.lineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}
const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  circleDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  circleActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  stepNumActive: { color: COLORS.white },
  label: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginLeft: 4, fontWeight: '500' },
  labelActive: { color: COLORS.purple, fontWeight: '700' },
  line: { width: 32, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  lineDone: { backgroundColor: COLORS.teal },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CountyPickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string }>();
  const [stateAbbr, setStateAbbr] = useState(params.state || '');
  const [search, setSearch] = useState('');
  const [locating, setLocating] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!params.state) {
      AsyncStorage.getItem('ap_state').then(val => { if (val) setStateAbbr(val); });
    }
  }, []);

  const data = stateAbbr ? (waiverData as Record<string, StateData>)[stateAbbr] : null;

  const allCounties = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.counties)
      .map(([key, c]) => ({ key, display: c.countyDisplay }))
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allCounties;
    const q = search.toLowerCase();
    return allCounties.filter(c => c.display.toLowerCase().includes(q));
  }, [allCounties, search]);

  // Alphabetical sections
  const sections = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const c of filtered) {
      const letter = c.display[0]?.toUpperCase() || '#';
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const flatItems = useMemo(() => {
    const items: ({ type: 'header'; letter: string } | { type: 'county'; key: string; display: string })[] = [];
    for (const [letter, counties] of sections) {
      items.push({ type: 'header', letter });
      for (const c of counties) items.push({ type: 'county', ...c });
    }
    return items;
  }, [sections]);

  const letters = sections.map(([l]) => l);

  const handleNearMe = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please enable location access to use this feature.');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo?.subregion || geo?.city) {
        const countyName = (geo.subregion || geo.city || '').replace(' County', '').trim();
        setSearch(countyName);
      } else {
        Alert.alert('Could not detect county', 'Please search manually.');
      }
    } catch {
      Alert.alert('Location Error', 'Could not get your location. Please search manually.');
    }
    setLocating(false);
  };

  const handleSelect = (county: { key: string; display: string }) => {
    AsyncStorage.setItem('ap_county', county.key);
    router.push({ pathname: '/waiver/agency-card', params: { state: stateAbbr, county: county.key } });
  };

  const scrollToLetter = (letter: string) => {
    const idx = flatItems.findIndex(item => item.type === 'header' && item.letter === letter);
    if (idx >= 0) listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
          <View style={{ width: 80 }} />
        </View>
        <JourneyStepper step={3} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No county data found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Overview</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Journey Stepper */}
      <JourneyStepper step={3} />

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Find Your County Agency</Text>
        <Text style={styles.subSub}>{data.stateName} · {allCounties.length} counties</Text>
      </View>

      {/* Search + Near Me */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search county..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={[styles.nearMeBtn, locating && styles.nearMeBtnDisabled]}
          onPress={handleNearMe}
          disabled={locating}
        >
          <Text style={styles.nearMeText}>{locating ? '...' : '📍 Near Me'}</Text>
        </TouchableOpacity>
      </View>

      {/* County list with alpha index */}
      <View style={styles.listContainer}>
        <FlatList
          ref={listRef}
          data={flatItems}
          keyExtractor={(item, i) => item.type === 'header' ? `h-${item.letter}` : `c-${item.key}-${i}`}
          getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{item.letter}</Text>
                </View>
              );
            }
            return (
              <TouchableOpacity
                style={styles.countyRow}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.countyIconWrap}>
                  <Text style={styles.countyIcon}>📍</Text>
                </View>
                <Text style={styles.countyName}>{item.display}</Text>
                <Text style={styles.countyArrow}>›</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No counties match "{search}"</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
        />

        {/* Alphabetical index strip */}
        {!search && letters.length > 0 && (
          <View style={[styles.alphaIndex, { top: 0, bottom: insets.bottom + SPACING.xl }]}>
            {letters.map(letter => (
              <TouchableOpacity key={letter} onPress={() => scrollToLetter(letter)} hitSlop={{ top: 2, bottom: 2, left: 8, right: 8 }}>
                <Text style={styles.alphaLetter}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  subHeader: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  subTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  subSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.sm,
    height: 40,
  },
  searchIcon: { fontSize: 15, marginRight: 6 },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, height: 40 },
  nearMeBtn: {
    backgroundColor: COLORS.mint, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm, height: 40, justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.tealAccent,
  },
  nearMeBtnDisabled: { opacity: 0.5 },
  nearMeText: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: '700' },
  listContainer: { flex: 1, flexDirection: 'row' },
  sectionHeader: {
    height: 28, justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sectionHeaderText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.purple, letterSpacing: 0.5 },
  countyRow: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.sm,
  },
  countyIconWrap: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center',
  },
  countyIcon: { fontSize: 15 },
  countyName: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  countyArrow: { fontSize: 18, color: COLORS.textLight },
  alphaIndex: {
    position: 'absolute', right: 4,
    justifyContent: 'space-evenly', alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  alphaLetter: { fontSize: 10, fontWeight: '700', color: COLORS.purple, paddingVertical: 1 },
  emptyState: { padding: SPACING.xl, alignItems: 'center' },
  emptyStateText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, marginBottom: SPACING.md },
  backLink: { padding: SPACING.sm },
  backLinkText: { color: COLORS.purple, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
