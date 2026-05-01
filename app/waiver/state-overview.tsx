import { useEffect, useState } from 'react';
import {
  Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import waiverData from '../../data/waiver-data.json';

type StateData = {
  stateName: string;
  stateOverview: { title: string; body: string } | null;
  counties: Record<string, { countyDisplay: string }>;
};

const WAIT_TIME_COLORS: Record<string, string> = {
  short: '#2e7d5e',
  medium: '#a07800',
  long: '#c0392b',
};

function getWaitColor(text: string): string {
  if (!text) return WAIT_TIME_COLORS.medium;
  const lower = text.toLowerCase();
  if (lower.includes('1') && !lower.includes('5') && !lower.includes('10')) return WAIT_TIME_COLORS.short;
  if (lower.includes('10') || lower.includes('8') || lower.includes('9')) return WAIT_TIME_COLORS.long;
  return WAIT_TIME_COLORS.medium;
}

// Extract waiver info from the state overview body text
function parseWaivers(body: string, stateName: string): { name: string; covers: string[]; note: string }[] {
  const waivers: { name: string; covers: string[]; note: string }[] = [];
  
  // Look for waiver names in the body text
  const waiverMatches = body.match(/([A-Z][^.]*Waiver[^.]*)\./g);
  if (waiverMatches) {
    waiverMatches.slice(0, 3).forEach(match => {
      const name = match.replace(/\.$/, '').trim();
      if (name.length > 5 && name.length < 120) {
        waivers.push({ name, covers: [], note: '' });
      }
    });
  }
  
  // If no waivers found, add a generic one
  if (waivers.length === 0) {
    waivers.push({
      name: `${stateName} HCBS Waiver`,
      covers: ['residential support', 'day services', 'respite', 'behavioral support'],
      note: 'Contact your local DD agency to apply',
    });
  }
  
  return waivers;
}

export default function StateOverviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string }>();
  const [stateAbbr, setStateAbbr] = useState(params.state || '');
  const [expandedOverview, setExpandedOverview] = useState(false);

  useEffect(() => {
    // Advance waiver progress to at least step 2 when state overview is viewed
    AsyncStorage.getItem('ap_waiver_progress').then(cur => {
      if (parseInt(cur || '0', 10) < 2) AsyncStorage.setItem('ap_waiver_progress', '2');
    });
    if (!params.state) {
      AsyncStorage.getItem('ap_state').then(val => {
        if (val) setStateAbbr(val);
      });
    }
  }, []);

  const data = stateAbbr ? (waiverData as Record<string, StateData>)[stateAbbr] : null;
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
          <Text style={styles.emptyText}>No data found for this state.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Choose a state</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const counties = Object.entries(data.counties)
    .map(([key, c]) => ({ key, display: c.countyDisplay }))
    .sort((a, b) => a.display.localeCompare(b.display));

  const overview = data.stateOverview;
  const waivers = overview ? parseWaivers(overview.body, data.stateName) : [];

  // Extract key info from overview body
  const overviewText = overview?.body || '';
  const shortOverview = overviewText.length > 300
    ? overviewText.slice(0, 300) + '...'
    : overviewText;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← States</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* State banner */}
        <View style={styles.stateBanner}>
          <View style={styles.stateAbbrBadge}>
            <Text style={styles.stateAbbrText}>{stateAbbr}</Text>
          </View>
          <Text style={styles.stateTitle}>{data.stateName}</Text>
          <Text style={styles.stateSub}>Medicaid Waiver & DD Services Overview</Text>
        </View>

        {/* Key info chips */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipEmoji}>🏛️</Text>
            <Text style={styles.chipText}>DD Waiver Program</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipEmoji}>📋</Text>
            <Text style={styles.chipText}>{counties.length} Counties</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipEmoji}>⚠️</Text>
            <Text style={styles.chipText}>Waitlists Apply</Text>
          </View>
        </View>

        {/* Overview card */}
        {overview && (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>📖 STATE OVERVIEW</Text>
            <Text style={styles.cardTitle}>{overview.title}</Text>
            <Text style={styles.cardBody}>
              {expandedOverview ? overviewText : shortOverview}
            </Text>
            {overviewText.length > 300 && (
              <TouchableOpacity onPress={() => setExpandedOverview(!expandedOverview)}>
                <Text style={styles.readMore}>
                  {expandedOverview ? 'Show less ↑' : 'Read more ↓'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Waivers */}
        {waivers.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>AVAILABLE WAIVERS</Text>
            {waivers.map((waiver, i) => (
              <View key={i} style={styles.waiverCard}>
                <View style={styles.waiverHeader}>
                  <Text style={styles.waiverEmoji}>📋</Text>
                  <Text style={styles.waiverName}>{waiver.name}</Text>
                </View>
                {waiver.covers.length > 0 && (
                  <View style={styles.coverChips}>
                    {waiver.covers.map(c => (
                      <View key={c} style={styles.coverChip}>
                        <Text style={styles.coverChipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {waiver.note ? (
                  <Text style={styles.waiverNote}>{waiver.note}</Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        {/* Important callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutIcon}>⚠️</Text>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutBold}>Apply as early as possible.</Text>
            {' '}Waitlists for DD waivers can range from 2 to 10+ years. Getting on the list early — even before your child is in crisis — is one of the most important steps you can take.
          </Text>
        </View>

        {/* County selection */}
        <Text style={styles.sectionHeading}>FIND YOUR COUNTY AGENCY</Text>
        <Text style={styles.sectionSub}>
          Select your county to get your local DD agency's phone number, website, and how to apply.
        </Text>

        {counties.slice(0, 8).map(county => (
          <TouchableOpacity
            key={county.key}
            style={styles.countyRow}
            onPress={() => {
              AsyncStorage.setItem('ap_county', county.key);
              router.push({
                pathname: '/waiver/agency-card',
                params: { state: stateAbbr, county: county.key },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.countyName}>{county.display}</Text>
            <Text style={styles.countyArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {counties.length > 8 && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => router.push({ pathname: '/waiver/county-picker', params: { state: stateAbbr } })}
          >
            <Text style={styles.viewAllText}>View all {counties.length} counties →</Text>
          </TouchableOpacity>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Agency information is provided as a starting point. Always verify current details directly with your local office.
          </Text>
        </View>

        <View style={styles.rainbowBar} />
      </ScrollView>
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

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },

  stateBanner: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  stateAbbrBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  stateAbbrText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  stateTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  stateSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: FONT_SIZES.xs, color: COLORS.text, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardEyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, marginBottom: 4 },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  cardBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  readMore: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: SPACING.sm },

  sectionHeading: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.8,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },

  waiverCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
    ...SHADOWS.sm,
  },
  waiverHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  waiverEmoji: { fontSize: 18 },
  waiverName: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  coverChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.xs },
  coverChip: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  coverChipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  waiverNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.xs, fontStyle: 'italic' },

  callout: {
    flexDirection: 'row',
    backgroundColor: '#fff8e1',
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#f0c040',
  },
  calloutIcon: { fontSize: 18 },
  calloutText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#7a5c00', lineHeight: 20 },
  calloutBold: { fontWeight: '700' },

  countyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.md,
    marginBottom: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  countyName: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  countyArrow: { fontSize: 18, color: COLORS.textLight },

  viewAllBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  viewAllText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '700' },

  disclaimer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#f8f8f8',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 16, textAlign: 'center' },

  rainbowBar: { height: 4, backgroundColor: COLORS.purple, marginTop: SPACING.lg },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, marginBottom: SPACING.md },
  backLink: { padding: SPACING.sm },
  backLinkText: { color: COLORS.purple, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
