import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';
import { STATE_WAIVER_DATA, StateWaiverInfo } from '../../data/stateWaivers';
import NearMeButton from '../../components/NearMeButton';

const URGENCY_CONFIG = {
  critical: { label: 'CRITICAL 10+ yrs', bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  high: { label: 'HIGH 5-10 yrs', bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  moderate: { label: 'MODERATE 2-5 yrs', bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  low: { label: 'LOW <2 yrs', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
};

function UrgencyBadge({ level }: { level: StateWaiverInfo['urgencyLevel'] }) {
  const cfg = URGENCY_CONFIG[level];
  return (
    <View style={[styles.urgencyBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.urgencyBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

export default function StateWaivers() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StateWaiverInfo | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return STATE_WAIVER_DATA;
    const q = search.toLowerCase();
    return STATE_WAIVER_DATA.filter((s) => s.state.toLowerCase().includes(q));
  }, [search]);

  const criticalCount = STATE_WAIVER_DATA.filter((s) => s.urgencyLevel === 'critical').length;

  if (selected) {
    const cfg = URGENCY_CONFIG[selected.urgencyLevel];
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{selected.state}</Text>
            <Text style={styles.headerSub}>Adult DD/ID Waiver Info</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={[styles.stateHero, { backgroundColor: COLORS.purple }]}>
            <Text style={styles.stateHeroName}>{selected.state}</Text>
            <UrgencyBadge level={selected.urgencyLevel} />
            <Text style={styles.stateHeroWaiver}>{selected.primaryWaiverName}</Text>
          </View>

          {/* Key stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>⏳ Waitlist</Text>
              <Text style={styles.statValue}>{selected.waitlistYears}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>📅 Apply By</Text>
              <Text style={styles.statValue}>{selected.recommendedApplyAge}</Text>
            </View>
          </View>

          {/* Admin agency */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>🏛️  Administering Agency</Text>
            <Text style={styles.infoValue}>{selected.adminAgency}</Text>
          </View>

          {/* How to apply */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>📝  How to Apply</Text>
            <Text style={styles.infoValue}>{selected.howToApply}</Text>
          </View>

          {/* Additional waivers */}
          {selected.additionalWaivers && selected.additionalWaivers.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>📋  Additional Waivers</Text>
              {selected.additionalWaivers.map((w, i) => (
                <Text key={i} style={styles.bulletItem}>• {w}</Text>
              ))}
            </View>
          )}

          {/* Notes */}
          {selected.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.infoLabel}>💡  Important Notes</Text>
              <Text style={styles.infoValue}>{selected.notes}</Text>
            </View>
          ) : null}

          {/* Official link */}
          <TouchableOpacity style={styles.officialBtn} onPress={() => Linking.openURL(selected.officialUrl)} activeOpacity={0.85}>
            <Text style={styles.officialBtnText}>🔗  Visit Official {selected.state} Waiver Page →</Text>
          </TouchableOpacity>

          {/* Urgency warning for critical states */}
          {selected.urgencyLevel === 'critical' && (
            <View style={styles.criticalCard}>
              <Text style={styles.criticalTitle}>⚠️  Apply Immediately</Text>
              <Text style={styles.criticalDesc}>
                {selected.state} has one of the longest waitlists in the country. Families who apply when their child is 8–10 years old have the best chance of receiving services by age 18. Do not wait.
              </Text>
            </View>
          )}

          <View style={{ height: insets.bottom + SPACING.xl }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Adult Waivers by State</Text>
          <Text style={styles.headerSub}>DD/ID Waiver Programs & Waitlists</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.sm }}>
          <NearMeButton
            onStateDetected={(code, name) => {
              const match = STATE_WAIVER_DATA.find((s) => s.state === name || s.state.toUpperCase().startsWith(code));
              if (match) setSelected(match);
              else setSearch(code);
            }}
          />
          <Text style={{ fontSize: 12, color: COLORS.textLight, fontStyle: 'italic' }}>or search below</Text>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your state..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Summary banner */}
      {!search && (
        <View style={styles.summaryBanner}>
          <Text style={styles.summaryText}>
            ⚠️  <Text style={{ fontWeight: '700' }}>{criticalCount} states</Text> have waitlists of 10+ years. Apply as early as age 8.
          </Text>
        </View>
      )}

      {/* Legend */}
      {!search && (
        <View style={styles.legend}>
          {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
            <View key={key} style={[styles.legendItem, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <Text style={[styles.legendText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }} showsVerticalScrollIndicator={false}>
        {filtered.map((state) => {
          const cfg = URGENCY_CONFIG[state.urgencyLevel];
          return (
            <TouchableOpacity key={state.state} style={styles.stateRow} onPress={() => setSelected(state)} activeOpacity={0.8}>
              <View style={[styles.stateAccent, { backgroundColor: cfg.bg, borderColor: cfg.border }]} />
              <View style={styles.stateRowContent}>
                <Text style={styles.stateName}>{state.state}</Text>
                <Text style={styles.stateWaiverName} numberOfLines={1}>{state.primaryWaiverName}</Text>
                <Text style={styles.stateApplyAge}>Apply by: {state.recommendedApplyAge}</Text>
              </View>
              <View style={styles.stateRowRight}>
                <UrgencyBadge level={state.urgencyLevel} />
                <Text style={styles.stateChevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No states found for "{search}"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, alignItems: 'flex-start' },
  backArrow: { fontSize: 22, color: COLORS.purple },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  dashText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textAlign: 'right' },
  searchContainer: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.bg },
  searchInput: { backgroundColor: '#fff', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: 10, fontSize: FONT_SIZES.sm, color: COLORS.text },
  summaryBanner: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: '#FEF3C7', borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: '#FDE68A' },
  summaryText: { fontSize: FONT_SIZES.sm, color: '#92400E' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  legendItem: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  legendText: { fontSize: 10, fontWeight: '600' },
  scroll: { flex: 1 },
  stateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: SPACING.md, marginBottom: 8, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  stateAccent: { width: 5, alignSelf: 'stretch', borderRightWidth: 1 },
  stateRowContent: { flex: 1, padding: SPACING.md },
  stateName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  stateWaiverName: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  stateApplyAge: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600', marginTop: 3 },
  stateRowRight: { alignItems: 'flex-end', paddingRight: SPACING.sm, gap: 4 },
  stateChevron: { fontSize: 20, color: COLORS.textLight },
  urgencyBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  urgencyBadgeText: { fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  // Detail view
  stateHero: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center' },
  stateHeroName: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: SPACING.sm },
  stateHeroWaiver: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: SPACING.sm },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 4 },
  statValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  infoCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  bulletItem: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginTop: 3 },
  notesCard: { backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: '#FDE68A' },
  officialBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', marginBottom: SPACING.md },
  officialBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  criticalCard: { backgroundColor: '#FDF0F0', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#FECACA', padding: SPACING.md, marginBottom: SPACING.md },
  criticalTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#991B1B', marginBottom: 4 },
  criticalDesc: { fontSize: FONT_SIZES.sm, color: '#7F1D1D', lineHeight: 19 },
  scrollContent: { padding: SPACING.md },
});
