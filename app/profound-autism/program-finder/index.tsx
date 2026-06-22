/**
 * Program Finder — Specialized programs for profound autism.
 * State dropdown + type filter chips + NCSA-sourced program cards.
 * GAP state card for states with no programs.
 */
import { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent, logScreenView } from '../../../lib/analytics';

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const TYPES = ['All', 'Residential', 'Day Program', 'Intensive ABA', 'Crisis Stabilization'];

interface Program {
  name: string;
  type: string;
  state: string;
  description: string;
  url?: string;
  waiverFunded?: boolean;
  phone?: string;
}

const PROGRAMS: Program[] = [
  {
    name: 'New England Center for Children (NECC)',
    type: 'Residential',
    state: 'MA',
    description: 'Nationally recognized residential and day school for children and young adults with autism, including those with severe behaviors. Evidence-based ABA programming.',
    url: 'https://www.necc.org',
    waiverFunded: true,
  },
  {
    name: 'Melmark',
    type: 'Residential',
    state: 'PA',
    description: 'Specialized residential and day school for individuals with autism and complex behavioral needs. Serves PA, MA, and NC.',
    url: 'https://www.melmark.org',
    waiverFunded: true,
  },
  {
    name: 'Alpine Learning Group',
    type: 'Day Program',
    state: 'NJ',
    description: 'Intensive ABA program for children and adults with autism, including those with severe behaviors. Outpatient and intensive options.',
    url: 'https://www.alpinelearninggroup.org',
    waiverFunded: true,
  },
  {
    name: 'Bancroft',
    type: 'Residential',
    state: 'NJ',
    description: 'Comprehensive residential and day programs for individuals with autism and intellectual disabilities, including those with challenging behaviors.',
    url: 'https://www.bancroft.org',
    waiverFunded: true,
  },
  {
    name: 'Kennedy Krieger Institute',
    type: 'Intensive ABA',
    state: 'MD',
    description: 'Inpatient and outpatient behavioral programs for children with severe challenging behaviors. Nationally recognized for treatment-resistant cases.',
    url: 'https://www.kennedykrieger.org',
    waiverFunded: false,
  },
  {
    name: 'Marcus Autism Center',
    type: 'Intensive ABA',
    state: 'GA',
    description: 'Intensive outpatient and day treatment for children with autism and severe behaviors. Part of Children\'s Healthcare of Atlanta.',
    url: 'https://www.marcus.org',
    waiverFunded: true,
  },
  {
    name: 'Trumpet Behavioral Health',
    type: 'Intensive ABA',
    state: 'CO',
    description: 'Intensive ABA services for children and adults with autism, including those with severe and complex behavioral needs. Multiple state locations.',
    url: 'https://www.trumpetbehavioralhealth.com',
    waiverFunded: true,
  },
  {
    name: 'Easterseals Crossroads',
    type: 'Day Program',
    state: 'IN',
    description: 'Comprehensive autism services including intensive day programs for children and adults with severe behavioral needs.',
    url: 'https://www.eastersealscrossroads.org',
    waiverFunded: true,
  },
  {
    name: 'Southwest Autism Research & Resource Center (SARRC)',
    type: 'Intensive ABA',
    state: 'AZ',
    description: 'Evidence-based intensive services for individuals with autism across the lifespan, including those with complex behavioral needs.',
    url: 'https://autismcenter.org',
    waiverFunded: true,
  },
  {
    name: 'Devereux Advanced Behavioral Health',
    type: 'Residential',
    state: 'PA',
    description: 'Residential and day programs for individuals with complex behavioral health needs, including autism with severe behaviors. Multiple state locations.',
    url: 'https://www.devereux.org',
    waiverFunded: true,
  },
];

export default function ProgramFinder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  useEffect(() => {
    logScreenView('program_finder');
    logEvent('tool_opened', { tool: 'Program Finder' });
  }, []);

  const filteredPrograms = PROGRAMS.filter((p) => {
    const stateMatch = !selectedState || p.state === selectedState;
    const typeMatch = selectedType === 'All' || p.type === selectedType;
    return stateMatch && typeMatch;
  });

  const hasResults = filteredPrograms.length > 0;
  const hasStateSelected = selectedState !== '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Finder</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🗺️ Find Specialized Programs</Text>
          <Text style={styles.introText}>
            These are programs specifically designed for children and adults with profound autism and severe behavioral needs — not general ABA clinics. Many are waiver-funded.
          </Text>
        </View>

        {/* State selector */}
        <Text style={styles.fieldLabel}>Select Your State</Text>
        <TouchableOpacity
          style={styles.stateSelector}
          onPress={() => setShowStateDropdown(!showStateDropdown)}
          activeOpacity={0.8}
        >
          <Text style={[styles.stateSelectorText, !selectedState && styles.stateSelectorPlaceholder]}>
            {selectedState || 'Choose a state…'}
          </Text>
          <Text style={styles.chevron}>{showStateDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showStateDropdown && (
          <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setSelectedState(''); setShowStateDropdown(false); }}
              >
                <Text style={styles.dropdownItemText}>All States</Text>
              </TouchableOpacity>
              {STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.dropdownItem, selectedState === s && styles.dropdownItemSelected]}
                  onPress={() => { setSelectedState(s); setShowStateDropdown(false); }}
                >
                  <Text style={[styles.dropdownItemText, selectedState === s && styles.dropdownItemTextSelected]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Type filter */}
        <Text style={styles.fieldLabel}>Program Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <View style={styles.typeRow}>
            {TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, selectedType === type && styles.typeChipSelected]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeChipText, selectedType === type && styles.typeChipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Results */}
        {hasStateSelected && !hasResults ? (
          // GAP state card
          <View style={styles.gapCard}>
            <Text style={styles.gapEmoji}>🗺️</Text>
            <Text style={styles.gapTitle}>No specialized programs listed for {selectedState} yet</Text>
            <Text style={styles.gapText}>
              This doesn't mean there are no options — it means we haven't verified programs in your state yet. Here's what to do:
            </Text>
            <View style={styles.gapSteps}>
              <Text style={styles.gapStep}>1. Contact the National Council on Severe Autism (NCSA) — they maintain a national directory of specialized programs.</Text>
              <Text style={styles.gapStep}>2. Ask your state's IDD agency for a list of specialized ABA providers who work with severe behaviors.</Text>
              <Text style={styles.gapStep}>3. Contact your waiver coordinator — they may know of intensive programs in your state or neighboring states.</Text>
              <Text style={styles.gapStep}>4. Consider out-of-state programs — Medicaid may authorize out-of-state placement if no equivalent program exists in your state.</Text>
            </View>
            <TouchableOpacity
              style={styles.ncsaBtn}
              onPress={() => Linking.openURL('https://www.ncsautism.org')}
              activeOpacity={0.85}
            >
              <Text style={styles.ncsaBtnText}>Visit NCSA Directory →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPrograms.map((program) => (
            <View key={program.name} style={styles.programCard}>
              <View style={styles.programHeader}>
                <View style={styles.programHeaderText}>
                  <Text style={styles.programName}>{program.name}</Text>
                  <View style={styles.programTags}>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>{program.type}</Text>
                    </View>
                    <View style={styles.stateTag}>
                      <Text style={styles.stateTagText}>{program.state}</Text>
                    </View>
                    {program.waiverFunded && (
                      <View style={styles.waiverTag}>
                        <Text style={styles.waiverTagText}>💜 Waiver-Funded</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <Text style={styles.programDesc}>{program.description}</Text>
              {program.url && (
                <TouchableOpacity
                  style={styles.programLink}
                  onPress={() => Linking.openURL(program.url!)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.programLinkText}>Visit Website →</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* NCSA footer */}
        <View style={styles.ncsaFooter}>
          <Text style={styles.ncsaFooterText}>
            Program data sourced from the National Council on Severe Autism (NCSA) and verified provider directories. Always verify directly with programs before applying.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.ncsautism.org')} activeOpacity={0.8}>
            <Text style={styles.ncsaFooterLink}>ncsautism.org →</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.md },
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  introTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  introText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  stateSelectorText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '600' },
  stateSelectorPlaceholder: { color: COLORS.textLight, fontWeight: '400' },
  chevron: { fontSize: 12, color: COLORS.textLight },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    ...SHADOWS.md,
  },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemSelected: { backgroundColor: COLORS.lavender },
  dropdownItemText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  dropdownItemTextSelected: { color: COLORS.purple, fontWeight: '700' },
  typeScroll: { marginHorizontal: -SPACING.md },
  typeRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  typeChipSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  typeChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  typeChipTextSelected: { color: COLORS.purple, fontWeight: '700' },
  // GAP card
  gapCard: {
    backgroundColor: '#FFF6D8',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: '#FFE58A',
    ...SHADOWS.sm,
  },
  gapEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  gapTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#7A6020', marginBottom: SPACING.sm },
  gapText: { fontSize: FONT_SIZES.sm, color: '#7A6020', lineHeight: 20, marginBottom: SPACING.md },
  gapSteps: { gap: SPACING.sm, marginBottom: SPACING.md },
  gapStep: { fontSize: FONT_SIZES.sm, color: '#5A4010', lineHeight: 20 },
  ncsaBtn: {
    backgroundColor: '#7A6020',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
  },
  ncsaBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  // Program cards
  programCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  programHeader: { flexDirection: 'row', gap: SPACING.sm },
  programHeaderText: { flex: 1, gap: SPACING.xs },
  programName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, lineHeight: 22 },
  programTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeTag: { backgroundColor: '#F0EDFF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeTagText: { fontSize: 11, color: COLORS.purple, fontWeight: '700' },
  stateTag: { backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border },
  stateTagText: { fontSize: 11, color: COLORS.textMid, fontWeight: '600' },
  waiverTag: { backgroundColor: '#F0EDFF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  waiverTagText: { fontSize: 11, color: COLORS.purple, fontWeight: '700' },
  programDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  programLink: {
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  programLinkText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '700' },
  // Footer
  ncsaFooter: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  ncsaFooterText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18 },
  ncsaFooterLink: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
});
