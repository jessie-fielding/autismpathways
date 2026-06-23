import React, { useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsPremium } from '../../hooks/useIsPremium';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { EVALUATORS, Evaluator, EvaluatorType } from '../../data/evaluators';
import NearMeButton from '../../components/NearMeButton';
import {trackPaywallViewed, trackIEPEvaluatorSearched, logScreenView, useScreenTime} from '../../../lib/analytics';

const TYPE_CONFIG: Record<EvaluatorType, { label: string; color: string; bg: string; icon: string }> = {
  inperson: { label: 'In-Person', color: '#2E6B3E', bg: '#E3F7EC', icon: '🏥' },
  telehealth: { label: 'Telehealth', color: '#1A7A8A', bg: '#DCEEFF', icon: '📡' },
  both: { label: 'Both', color: COLORS.purpleDark, bg: COLORS.lavender, icon: '🌐' },
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const EVALUATOR_LOOKUP_KEY = 'ap_iep_evaluator_lookup_count';
const FREE_LOOKUPS = 1;

export default function EvaluatorLookupScreen() {
  useScreenTime('iep_evaluator');
  useEffect(() => { logScreenView('iep_evaluator'); trackIEPEvaluatorSearched(); }, []);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [lookupCount, setLookupCount] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<EvaluatorType | 'all'>('all');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(EVALUATOR_LOOKUP_KEY).then((val) => {
      setLookupCount(val ? parseInt(val, 10) : 0);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = EVALUATORS;
    if (selectedState) list = list.filter((e) => e.state === selectedState);
    if (typeFilter !== 'all') {
      list = list.filter((e) => e.type === typeFilter || e.type === 'both');
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.detail.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [query, selectedState, typeFilter]);

  const handleShare = async (ev: Evaluator) => {
    const cfg = TYPE_CONFIG[ev.type];
    await Share.share({
      message: `Autism Evaluator: ${ev.name}\n${cfg.icon} ${cfg.label}\n\n${ev.detail}\n\nTags: ${ev.tags.join(', ')}${ev.phone ? '\nPhone: ' + ev.phone : ''}${ev.url ? '\nWebsite: ' + ev.url : ''}\n\nFound via Autism Pathways`,
    });
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Find an Evaluator</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={s.homeBtn}>
          <Text style={s.homeText}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Intro */}
      <View style={s.introBanner}>
        <Text style={s.introTitle}>🔍 Autism Evaluator Directory</Text>
        <Text style={s.introSub}>Search by state, name, or tags. Filter by in-person or telehealth.</Text>
        <TouchableOpacity style={s.submitBtn} onPress={() => router.push('/iep/submit-evaluator')}>
          <Text style={s.submitBtnText}>+ Submit an Evaluator</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={s.filtersRow}>
        <NearMeButton
          onStateDetected={(code) => { setSelectedState(code); setShowStateDropdown(false); }}
        />
        {/* State Picker */}
        <TouchableOpacity
          style={s.statePicker}
          onPress={() => setShowStateDropdown(!showStateDropdown)}
        >
          <Text style={s.statePickerText}>{selectedState || 'All States'} ▼</Text>
        </TouchableOpacity>

        {/* Type Filter */}
        {(['all', 'inperson', 'telehealth', 'both'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.typeChip, typeFilter === t && s.typeChipActive]}
            onPress={() => setTypeFilter(t)}
          >
            <Text style={[s.typeChipText, typeFilter === t && s.typeChipTextActive]}>
              {t === 'all' ? 'All' : t === 'inperson' ? '🏥 In-Person' : t === 'telehealth' ? '📡 Telehealth' : '🌐 Both'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* State Dropdown */}
      {showStateDropdown && (
        <View style={s.dropdown}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            <TouchableOpacity
              style={s.dropdownItem}
              onPress={() => { setSelectedState(null); setShowStateDropdown(false); }}
            >
              <Text style={s.dropdownItemText}>All States</Text>
            </TouchableOpacity>
            {US_STATES.map((st) => (
              <TouchableOpacity
                key={st}
                style={[s.dropdownItem, selectedState === st && s.dropdownItemActive]}
                onPress={() => { setSelectedState(st); setShowStateDropdown(false); }}
              >
                <Text style={[s.dropdownItemText, selectedState === st && s.dropdownItemTextActive]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, city, or tag..."
          placeholderTextColor={COLORS.textLight}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {/* Results count */}
      <Text style={s.resultCount}>{filtered.length} evaluator{filtered.length !== 1 ? 's' : ''} found</Text>

      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyTitle}>No evaluators found</Text>
            <Text style={s.emptySub}>Try a different state or filter, or submit one you know!</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/iep/submit-evaluator')}>
              <Text style={s.emptyBtnText}>+ Submit an Evaluator</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((ev) => {
            const cfg = TYPE_CONFIG[ev.type];
            return (
              <View key={ev.id} style={s.card}>
                <View style={s.cardHeader}>
                  <View style={[s.typeBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.typeBadgeText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleShare(ev)} style={s.shareIcon}>
                    <Text style={s.shareIconText}>📤</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.cardName}>{ev.name}</Text>
                <Text style={s.cardDetail}>{ev.detail}</Text>

                {/* Tags */}
                <View style={s.tagsRow}>
                  {ev.tags.map((tag) => (
                    <View key={tag} style={s.tag}>
                      <Text style={s.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Contact Buttons */}
                <View style={s.contactRow}>
                  {ev.phone && (
                    <TouchableOpacity
                      style={s.contactBtn}
                      onPress={async () => {
                        if (!isPremium && lookupCount >= FREE_LOOKUPS) {
                          (trackPaywallViewed('iep_evaluator'), router.push('/paywall' as any));
                          return;
                        }
                        const next = lookupCount + 1;
                        setLookupCount(next);
                        await AsyncStorage.setItem(EVALUATOR_LOOKUP_KEY, String(next));
                        Linking.openURL(`tel:${ev.phone}`);
                      }}
                    >
                      <Text style={s.contactBtnText}>📞 Call</Text>
                    </TouchableOpacity>
                  )}
                  {ev.url && (
                    <TouchableOpacity
                      style={[s.contactBtn, s.contactBtnSecondary]}
                      onPress={async () => {
                        if (!isPremium && lookupCount >= FREE_LOOKUPS) {
                          (trackPaywallViewed('iep_evaluator'), router.push('/paywall' as any));
                          return;
                        }
                        const next = lookupCount + 1;
                        setLookupCount(next);
                        await AsyncStorage.setItem(EVALUATOR_LOOKUP_KEY, String(next));
                        Linking.openURL(ev.url!);
                      }}
                    >
                      <Text style={s.contactBtnText}>🌐 Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Submit CTA at bottom */}
        <View style={s.submitCta}>
          <Text style={s.submitCtaTitle}>Know an evaluator we're missing?</Text>
          <Text style={s.submitCtaSub}>Help other families by adding them to the directory.</Text>
          <TouchableOpacity style={s.submitCtaBtn} onPress={() => router.push('/iep/submit-evaluator')}>
            <Text style={s.submitCtaBtnText}>+ Submit an Evaluator</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.sm },
  backText: { color: COLORS.purple, fontWeight: '600', fontSize: FONT_SIZES.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text },
  homeBtn: { padding: SPACING.sm },
  homeText: { fontSize: 22 },
  introBanner: { backgroundColor: '#2E6B3E', padding: SPACING.md, margin: SPACING.md, borderRadius: RADIUS.lg },
  introTitle: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md, marginBottom: 4 },
  introSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZES.sm, marginBottom: SPACING.sm },
  submitBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: FONT_SIZES.sm },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  statePicker: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  statePickerText: { color: 'white', fontWeight: '600', fontSize: FONT_SIZES.sm },
  typeChip: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.border },
  typeChipActive: { backgroundColor: COLORS.purple },
  typeChipText: { color: COLORS.textMid, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  typeChipTextActive: { color: 'white' },
  dropdown: { marginHorizontal: SPACING.md, backgroundColor: 'white', borderRadius: RADIUS.md, ...SHADOWS.md, zIndex: 100, marginBottom: SPACING.sm },
  dropdownItem: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemActive: { backgroundColor: COLORS.lavender },
  dropdownItemText: { color: COLORS.text, fontSize: FONT_SIZES.md },
  dropdownItemTextActive: { color: COLORS.purple, fontWeight: 'bold' },
  searchRow: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchInput: { backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, ...SHADOWS.sm },
  resultCount: { paddingHorizontal: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: SPACING.sm },
  list: { flex: 1, paddingHorizontal: SPACING.md },
  card: { backgroundColor: 'white', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.pill },
  typeBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  shareIcon: { padding: 4 },
  shareIconText: { fontSize: 18 },
  cardName: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  cardDetail: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.sm },
  tag: { backgroundColor: COLORS.lavender, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.pill },
  tagText: { color: COLORS.purple, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  contactRow: { flexDirection: 'row', gap: SPACING.sm },
  contactBtn: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  contactBtnSecondary: { backgroundColor: COLORS.purpleDark },
  contactBtnText: { color: 'white', fontWeight: '600', fontSize: FONT_SIZES.sm },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', marginBottom: SPACING.md },
  emptyBtn: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  emptyBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md },
  submitCta: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, alignItems: 'center' },
  submitCtaTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.purple, marginBottom: 4 },
  submitCtaSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.md, textAlign: 'center' },
  submitCtaBtn: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  submitCtaBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md },
});
