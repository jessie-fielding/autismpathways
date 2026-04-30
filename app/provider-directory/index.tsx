import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#F5F4FB', card: '#FFFFFF', navy: '#1a1f5e', purple: '#7c6fd4',
  purpleDk: '#4a3f8f', purpleLt: '#f0ebff', textMid: '#6b6490',
  textLight: '#a09cbf', border: '#d4d0ef', teal: '#3BBFA3', tealLt: '#e3f7f1',
  white: '#ffffff', orange: '#e67e22',
};
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

type Provider = {
  id: string;
  name: string;
  type: string;
  specialty: string;
  states: string[];
  phone?: string;
  website?: string;
  medicaidAccepted: boolean;
  waitlistNote?: string;
  description: string;
  tags: string[];
};

const SPECIALTIES = ['All', 'ABA Therapy', 'Speech', 'OT/PT', 'Psychiatry', 'Pediatrics', 'Advocacy'];

const PROVIDERS: Provider[] = [
  {
    id: '1', name: 'Autism Speaks Resource Guide', type: 'National Directory',
    specialty: 'Advocacy', states: ['ALL'],
    website: 'https://www.autismspeaks.org/resource-guide',
    medicaidAccepted: true,
    description: 'Searchable national database of autism service providers by state, specialty, and insurance type.',
    tags: ['National', 'Free Search', 'All Specialties'],
  },
  {
    id: '2', name: 'ASHA ProFind', type: 'National Directory',
    specialty: 'Speech', states: ['ALL'],
    website: 'https://www.asha.org/profind/',
    medicaidAccepted: true,
    description: 'American Speech-Language-Hearing Association\'s directory of certified speech-language pathologists and audiologists.',
    tags: ['National', 'SLP', 'Certified'],
  },
  {
    id: '3', name: 'AOTA OT Finder', type: 'National Directory',
    specialty: 'OT/PT', states: ['ALL'],
    website: 'https://www.aota.org/practice/find-ot',
    medicaidAccepted: true,
    description: 'American Occupational Therapy Association\'s directory to find occupational therapists near you.',
    tags: ['National', 'OT', 'Certified'],
  },
  {
    id: '4', name: 'Psychology Today Therapist Finder', type: 'National Directory',
    specialty: 'Psychiatry', states: ['ALL'],
    website: 'https://www.psychologytoday.com/us/therapists',
    medicaidAccepted: true,
    description: 'Filter by insurance, specialty (autism, ADHD, anxiety), and location. Includes telehealth options.',
    tags: ['National', 'Telehealth', 'Insurance Filter'],
  },
  {
    id: '5', name: 'Behavioral Health Treatment Locator', type: 'Federal Directory',
    specialty: 'ABA Therapy', states: ['ALL'],
    phone: '1-800-662-4357',
    website: 'https://findtreatment.samhsa.gov',
    medicaidAccepted: true,
    description: 'SAMHSA\'s national directory of behavioral health treatment providers. Free to search, includes Medicaid-accepting providers.',
    tags: ['Federal', 'Free', 'Medicaid'],
  },
  {
    id: '6', name: 'Kennedy Krieger Institute', type: 'Specialty Hospital',
    specialty: 'ABA Therapy', states: ['MD', 'VA', 'DC'],
    phone: '(443) 923-9200',
    website: 'https://www.kennedykrieger.org',
    medicaidAccepted: true,
    waitlistNote: '6-18 month waitlist typical',
    description: 'World-renowned autism and developmental disabilities center. Offers ABA, speech, OT, PT, psychiatry, and school programs.',
    tags: ['Medicaid', 'Comprehensive', 'Research Center'],
  },
  {
    id: '7', name: 'Marcus Autism Center', type: 'Specialty Hospital',
    specialty: 'ABA Therapy', states: ['GA'],
    phone: '(404) 785-9400',
    website: 'https://www.marcus.org',
    medicaidAccepted: true,
    waitlistNote: '3-12 month waitlist',
    description: 'One of the largest autism centers in the US. Offers diagnostic evaluations, ABA, feeding therapy, and family support.',
    tags: ['Medicaid', 'Diagnostic', 'Comprehensive'],
  },
  {
    id: '8', name: 'Children\'s Hospital Colorado Autism & Developmental Pediatrics', type: 'Specialty Hospital',
    specialty: 'Pediatrics', states: ['CO'],
    phone: '(720) 777-6200',
    website: 'https://www.childrenscolorado.org/departments-and-programs/autism/',
    medicaidAccepted: true,
    waitlistNote: '3-9 month waitlist',
    description: 'Comprehensive autism evaluation and treatment center. Accepts most insurance and Medicaid.',
    tags: ['Medicaid', 'Diagnostic', 'Colorado'],
  },
  {
    id: '9', name: 'Lurie Center for Autism (MGH)', type: 'Specialty Hospital',
    specialty: 'Psychiatry', states: ['MA'],
    phone: '(781) 860-1700',
    website: 'https://www.massgeneral.org/lurie-center',
    medicaidAccepted: true,
    waitlistNote: '6-12 month waitlist',
    description: 'Massachusetts General Hospital\'s autism center. Offers evaluation, medication management, and family support.',
    tags: ['Medicaid', 'Research', 'Massachusetts'],
  },
  {
    id: '10', name: 'PACER Center', type: 'Advocacy Organization',
    specialty: 'Advocacy', states: ['MN', 'ALL'],
    phone: '(952) 838-9000',
    website: 'https://www.pacer.org',
    medicaidAccepted: false,
    description: 'Parent Training and Information Center. Free help with IEP advocacy, disability rights, and navigating school systems.',
    tags: ['Free', 'IEP Help', 'Parent Training'],
  },
  {
    id: '11', name: 'Easterseals', type: 'Nonprofit Provider',
    specialty: 'ABA Therapy', states: ['ALL'],
    phone: '1-800-221-6827',
    website: 'https://www.easterseals.com',
    medicaidAccepted: true,
    description: 'National nonprofit providing ABA, speech, OT, and day programs for children with autism. Many locations accept Medicaid.',
    tags: ['National', 'Medicaid', 'Nonprofit'],
  },
  {
    id: '12', name: 'Autism Society of America', type: 'Advocacy Organization',
    specialty: 'Advocacy', states: ['ALL'],
    phone: '1-800-328-8476',
    website: 'https://autismsociety.org',
    medicaidAccepted: false,
    description: 'Local chapters in all 50 states. Offers support groups, resource navigation, and advocacy assistance.',
    tags: ['National', 'Free', 'Support Groups'],
  },
  {
    id: '13', name: 'Nationwide Children\'s Hospital Autism Center', type: 'Specialty Hospital',
    specialty: 'ABA Therapy', states: ['OH'],
    phone: '(614) 722-2700',
    website: 'https://www.nationwidechildrens.org/specialties/autism-center',
    medicaidAccepted: true,
    waitlistNote: '3-6 month waitlist',
    description: 'Comprehensive autism evaluation and treatment. Strong research program and Medicaid acceptance.',
    tags: ['Medicaid', 'Ohio', 'Comprehensive'],
  },
  {
    id: '14', name: 'Texas Children\'s Hospital Autism Center', type: 'Specialty Hospital',
    specialty: 'Pediatrics', states: ['TX'],
    phone: '(832) 822-3600',
    website: 'https://www.texaschildrens.org/departments/autism-center',
    medicaidAccepted: true,
    waitlistNote: '6-12 month waitlist',
    description: 'Largest children\'s hospital in the US. Offers diagnostic evaluations, ABA, and family support services.',
    tags: ['Medicaid', 'Texas', 'Diagnostic'],
  },
  {
    id: '15', name: 'UCSF Autism Center', type: 'Specialty Hospital',
    specialty: 'Psychiatry', states: ['CA'],
    phone: '(415) 476-7199',
    website: 'https://www.ucsfhealth.org/clinics/autism-center',
    medicaidAccepted: true,
    waitlistNote: '6-18 month waitlist',
    description: 'University of California San Francisco\'s autism research and clinical center. Accepts Medi-Cal.',
    tags: ['Medicaid', 'California', 'Research'],
  },
];

const US_STATES = [
  'All States', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI',
  'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA',
  'WA', 'WV', 'WI', 'WY', 'DC',
];

export default function ProviderDirectoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [statePickerOpen, setStatePickerOpen] = useState(false);

  const filtered = PROVIDERS.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchState = selectedState === 'All States' || p.states.includes('ALL') || p.states.includes(selectedState);
    const matchSpecialty = selectedSpecialty === 'All' || p.specialty === selectedSpecialty;
    const matchMedicaid = !medicaidOnly || p.medicaidAccepted;
    return matchSearch && matchState && matchSpecialty && matchMedicaid;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Directory</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search providers..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FILTERS */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.stateBtn}
          onPress={() => setStatePickerOpen(!statePickerOpen)}
        >
          <Text style={styles.stateBtnText}>📍 {selectedState}</Text>
          <Text style={styles.stateBtnChevron}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.medicaidToggle, medicaidOnly && styles.medicaidToggleOn]}
          onPress={() => setMedicaidOnly(!medicaidOnly)}
        >
          <Text style={[styles.medicaidToggleText, medicaidOnly && styles.medicaidToggleTextOn]}>
            Medicaid Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* STATE PICKER */}
      {statePickerOpen && (
        <View style={styles.statePicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statePickerContent}>
            {US_STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.stateChip, selectedState === s && styles.stateChipActive]}
                onPress={() => { setSelectedState(s); setStatePickerOpen(false); }}
              >
                <Text style={[styles.stateChipText, selectedState === s && styles.stateChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* SPECIALTY CHIPS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll} contentContainerStyle={styles.specialtyContent}>
        {SPECIALTIES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.specialtyChip, selectedSpecialty === s && styles.specialtyChipActive]}
            onPress={() => setSelectedSpecialty(s)}
          >
            <Text style={[styles.specialtyChipText, selectedSpecialty === s && styles.specialtyChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* RESULTS */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.resultCount}>{filtered.length} provider{filtered.length !== 1 ? 's' : ''} found</Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No providers found</Text>
            <Text style={styles.emptySub}>Try changing your filters or searching for a different specialty.</Text>
          </View>
        ) : (
          filtered.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerAvatarText}>
                    {provider.specialty === 'ABA Therapy' ? '🧩' :
                     provider.specialty === 'Speech' ? '🗣️' :
                     provider.specialty === 'OT/PT' ? '🤸' :
                     provider.specialty === 'Psychiatry' ? '🧠' :
                     provider.specialty === 'Pediatrics' ? '👶' : '🤝'}
                  </Text>
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerType}>{provider.type}</Text>
                </View>
                {provider.medicaidAccepted && (
                  <View style={styles.medicaidBadge}>
                    <Text style={styles.medicaidBadgeText}>Medicaid</Text>
                  </View>
                )}
              </View>

              <Text style={styles.providerDesc}>{provider.description}</Text>

              {provider.waitlistNote && (
                <View style={styles.waitlistNote}>
                  <Text style={styles.waitlistText}>⏳ {provider.waitlistNote}</Text>
                </View>
              )}

              <View style={styles.tagRow}>
                {provider.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionRow}>
                {provider.phone && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Linking.openURL(`tel:${provider.phone!.replace(/[^0-9]/g, '')}`)}
                  >
                    <Text style={styles.actionBtnText}>📞 Call</Text>
                  </TouchableOpacity>
                )}
                {provider.website && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={() => Linking.openURL(provider.website!)}
                  >
                    <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>🌐 Visit Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* FOOTER NOTE */}
        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            📋 This directory is curated by the Autism Pathways team and updated regularly. Provider availability and Medicaid acceptance can change — always verify directly with the provider.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: SPACING.xs },
  backText: { fontSize: 14, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.sm,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.navy },
  clearBtn: { fontSize: 14, color: COLORS.textLight, padding: SPACING.xs },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  stateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  stateBtnText: { fontSize: 13, color: COLORS.navy, fontWeight: '600' },
  stateBtnChevron: { fontSize: 10, color: COLORS.textMid },
  medicaidToggle: {
    backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  medicaidToggleOn: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  medicaidToggleText: { fontSize: 13, color: COLORS.textMid, fontWeight: '600' },
  medicaidToggleTextOn: { color: COLORS.white },
  statePicker: {
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  statePickerContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  stateChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: 16, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  stateChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  stateChipText: { fontSize: 12, color: COLORS.textMid, fontWeight: '600' },
  stateChipTextActive: { color: COLORS.white },
  specialtyScroll: { maxHeight: 44 },
  specialtyContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingVertical: SPACING.sm },
  specialtyChip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs,
    borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  specialtyChipActive: { backgroundColor: COLORS.purpleDk, borderColor: COLORS.purpleDk },
  specialtyChipText: { fontSize: 13, color: COLORS.textMid, fontWeight: '600' },
  specialtyChipTextActive: { color: COLORS.white },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  resultCount: { fontSize: 12, color: COLORS.textMid, marginBottom: SPACING.md, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: SPACING.sm },
  emptySub: { fontSize: 13, color: COLORS.textMid, textAlign: 'center' },
  providerCard: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  providerHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md, gap: SPACING.md },
  providerAvatar: {
    width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.purpleLt,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  providerAvatarText: { fontSize: 22 },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 14, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  providerType: { fontSize: 12, color: COLORS.textMid },
  medicaidBadge: {
    backgroundColor: COLORS.tealLt, borderRadius: 6, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: COLORS.teal,
  },
  medicaidBadgeText: { fontSize: 10, fontWeight: '700', color: '#0A7A5A' },
  providerDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 19, marginBottom: SPACING.sm },
  waitlistNote: {
    backgroundColor: '#fff8e1', borderRadius: 6, padding: SPACING.sm,
    marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: '#f59e0b',
  },
  waitlistText: { fontSize: 12, color: '#92400e' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  tag: {
    backgroundColor: COLORS.purpleLt, borderRadius: 6, paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  tagText: { fontSize: 11, color: COLORS.purpleDk, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  actionBtnPrimary: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.textMid },
  actionBtnTextPrimary: { color: COLORS.white },
  footerNote: {
    backgroundColor: COLORS.purpleLt, borderRadius: 10, padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  footerNoteText: { fontSize: 11, color: COLORS.textMid, lineHeight: 17 },
});
