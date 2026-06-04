import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type JobResource = {
  id: string;
  state: string;
  code: string;
  name: string;
  type: 'supported-employment' | 'customized-employment' | 'job-board' | 'employer-program' | 'vocational';
  description: string;
  agesServed: string;
  phone?: string;
  website: string;
  howToAccess: string;
  tags: string[];
};

const JOB_RESOURCES: JobResource[] = [
  // National resources available to all
  { id: 'nat-1', state: 'National', code: 'NAT', name: 'Disability.gov Job Search', type: 'job-board', description: 'Federal job board with disability-specific employment resources, job listings, and employer connections.', agesServed: '18+', website: 'https://www.disability.gov/employment', howToAccess: 'Free to use. Search by location and job type. Filter for disability-friendly employers.', tags: ['Job Board', 'Federal', 'All States'] },
  { id: 'nat-2', state: 'National', code: 'NAT', name: 'AbilityJobs.com', type: 'job-board', description: 'Job board specifically for people with disabilities. Employers post positions actively seeking candidates with disabilities.', agesServed: '18+', website: 'https://www.abilityjobs.com', howToAccess: 'Free to create a profile and apply. Employers on this site are specifically seeking candidates with disabilities.', tags: ['Job Board', 'Disability-Focused', 'All States'] },
  { id: 'nat-3', state: 'National', code: 'NAT', name: 'Project SEARCH', type: 'employer-program', description: 'Internship program for young adults with significant disabilities. Partners with major employers (hospitals, hotels, businesses) for on-site job training.', agesServed: '18-21', phone: '513-636-4507', website: 'https://www.projectsearch.us', howToAccess: 'Programs are located at host businesses. Contact your VR counselor or school transition coordinator to apply. Sites exist in all 50 states.', tags: ['Internship', 'On-Site Training', 'All States'] },
  { id: 'nat-4', state: 'National', code: 'NAT', name: 'APSE (Supported Employment)', type: 'supported-employment', description: 'National association for supported employment. Find supported employment providers in your state who help people with disabilities find and keep competitive integrated employment.', agesServed: '18+', website: 'https://apse.org/find-a-provider', howToAccess: 'Use the provider directory to find supported employment agencies in your state. Services are typically funded through VR or Medicaid waivers.', tags: ['Supported Employment', 'Job Coaching', 'All States'] },
  { id: 'nat-5', state: 'National', code: 'NAT', name: 'Ticket to Work Program (SSA)', type: 'vocational', description: 'Free employment services for SSI/SSDI recipients. Connects you with Employment Networks (ENs) who provide job placement, training, and support.', agesServed: '18-64 (SSI/SSDI recipients)', phone: '1-866-968-7842', website: 'https://choosework.ssa.gov', howToAccess: 'If you receive SSI or SSDI, you automatically qualify. Call or visit the website to find an Employment Network near you.', tags: ['SSI/SSDI', 'Free Services', 'All States'] },
  // California
  { id: 'ca-j-1', state: 'California', code: 'CA', name: 'DOR Supported Employment Program', type: 'supported-employment', description: 'CA Department of Rehabilitation funds supported employment services. Job coaches help find, train, and maintain competitive integrated employment.', agesServed: '16+', phone: '1-800-952-5544', website: 'https://www.dor.ca.gov/Home/SupportedEmployment', howToAccess: 'Apply through your local DOR office. Request supported employment services. Your VR counselor will connect you with a job placement vendor.', tags: ['Job Coaching', 'VR-Funded', 'Competitive Employment'] },
  { id: 'ca-j-2', state: 'California', code: 'CA', name: 'Regional Center Supported Employment', type: 'supported-employment', description: 'CA Regional Centers fund supported employment for adults with developmental disabilities through vendored employment agencies.', agesServed: '18+', phone: '916-654-1987', website: 'https://www.dds.ca.gov/consumers/employment', howToAccess: 'Contact your Regional Center service coordinator. Request supported employment services. They will connect you with a vendored employment agency.', tags: ['DD-Funded', 'Job Coaching', 'Statewide'] },
  // Texas
  { id: 'tx-j-1', state: 'Texas', code: 'TX', name: 'TWC Supported Employment', type: 'supported-employment', description: 'Texas Workforce Commission VR funds supported employment services for Texans with significant disabilities.', agesServed: '16+', phone: '1-800-628-5115', website: 'https://twc.texas.gov/vocational-rehabilitation/supported-employment', howToAccess: 'Apply through TWC VR. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Florida
  { id: 'fl-j-1', state: 'Florida', code: 'FL', name: 'FL DVR Supported Employment', type: 'supported-employment', description: 'Florida Division of Vocational Rehabilitation funds supported employment for Floridians with significant disabilities.', agesServed: '16+', phone: '1-800-451-4327', website: 'https://www.rehabworks.org/supported-employment', howToAccess: 'Apply through FL DVR. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // New York
  { id: 'ny-j-1', state: 'New York', code: 'NY', name: 'ACCES-VR Supported Employment', type: 'supported-employment', description: 'NY ACCES-VR funds supported employment services statewide. Job coaches provide on-the-job support and training.', agesServed: '16+', phone: '1-800-222-5627', website: 'https://www.acces.nysed.gov/vr/supported-employment', howToAccess: 'Apply through ACCES-VR. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  { id: 'ny-j-2', state: 'New York', code: 'NY', name: 'OPWDD Employment First', type: 'supported-employment', description: 'NY OPWDD Employment First initiative supports competitive integrated employment for people with developmental disabilities.', agesServed: '18+', phone: '1-866-946-9733', website: 'https://opwdd.ny.gov/employment', howToAccess: 'Contact your OPWDD Care Manager. Request employment services through your waiver. They will connect you with an employment provider.', tags: ['DD-Funded', 'Employment First', 'Competitive Employment'] },
  // Pennsylvania
  { id: 'pa-j-1', state: 'Pennsylvania', code: 'PA', name: 'OVR Supported Employment', type: 'supported-employment', description: 'PA Office of Vocational Rehabilitation funds supported employment for Pennsylvanians with significant disabilities.', agesServed: '16+', phone: '1-800-442-6351', website: 'https://www.dli.pa.gov/Individuals/Disability-Services/ovr/Pages/Supported-Employment.aspx', howToAccess: 'Apply through PA OVR. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Ohio
  { id: 'oh-j-1', state: 'Ohio', code: 'OH', name: 'OOD Supported Employment', type: 'supported-employment', description: 'Ohio Opportunities for Ohioans with Disabilities funds supported employment statewide.', agesServed: '16+', phone: '1-800-282-4536', website: 'https://ood.ohio.gov/wps/portal/gov/ood/job-seekers/supported-employment', howToAccess: 'Apply through OOD. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Illinois
  { id: 'il-j-1', state: 'Illinois', code: 'IL', name: 'DRS Supported Employment', type: 'supported-employment', description: 'IL Division of Rehabilitation Services funds supported employment for Illinoisans with significant disabilities.', agesServed: '16+', phone: '1-800-843-6154', website: 'https://www.dhs.state.il.us/page.aspx?item=29737', howToAccess: 'Apply through IL DRS. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Georgia
  { id: 'ga-j-1', state: 'Georgia', code: 'GA', name: 'GVRA Supported Employment', type: 'supported-employment', description: 'Georgia Vocational Rehabilitation Agency funds supported employment for Georgians with significant disabilities.', agesServed: '16+', phone: '1-844-367-4872', website: 'https://gvra.georgia.gov/supported-employment', howToAccess: 'Apply through GVRA. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Washington
  { id: 'wa-j-1', state: 'Washington', code: 'WA', name: 'DVR Supported Employment', type: 'supported-employment', description: 'WA Division of Vocational Rehabilitation funds supported employment statewide.', agesServed: '16+', phone: '1-800-637-5627', website: 'https://www.dshs.wa.gov/dvr/supported-employment', howToAccess: 'Apply through WA DVR. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Virginia
  { id: 'va-j-1', state: 'Virginia', code: 'VA', name: 'DARS Supported Employment', type: 'supported-employment', description: 'VA Department of Aging and Rehabilitative Services funds supported employment statewide.', agesServed: '16+', phone: '1-800-552-5019', website: 'https://www.vadars.org/supported-employment', howToAccess: 'Apply through VA DARS. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // North Carolina
  { id: 'nc-j-1', state: 'North Carolina', code: 'NC', name: 'DVRS Supported Employment', type: 'supported-employment', description: 'NC Division of Vocational Rehabilitation Services funds supported employment statewide.', agesServed: '16+', phone: '1-888-234-6400', website: 'https://www.ncdhhs.gov/divisions/dvrs/supported-employment', howToAccess: 'Apply through NC DVRS. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
  // Michigan
  { id: 'mi-j-1', state: 'Michigan', code: 'MI', name: 'MRS Supported Employment', type: 'supported-employment', description: 'Michigan Rehabilitation Services funds supported employment for Michiganders with significant disabilities.', agesServed: '16+', phone: '1-800-605-6722', website: 'https://www.michigan.gov/leo/bureaus-agencies/wd/mrs/supported-employment', howToAccess: 'Apply through MRS. Request supported employment services. Your VR counselor will connect you with a job placement provider.', tags: ['VR-Funded', 'Job Coaching', 'Competitive Employment'] },
];

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  'supported-employment': { label: 'Supported Employment', bg: '#D1FAE5', text: '#065F46', icon: '🤝' },
  'customized-employment': { label: 'Customized Employment', bg: '#DBEAFE', text: '#1E40AF', icon: '🎯' },
  'job-board': { label: 'Job Board', bg: '#EDE9FE', text: '#5B21B6', icon: '📋' },
  'employer-program': { label: 'Employer Program', bg: '#FEF3C7', text: '#92400E', icon: '🏢' },
  'vocational': { label: 'Vocational Program', bg: '#FCE7F3', text: '#9D174D', icon: '🎓' },
};

export default function SpecialNeedsJobs() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<JobResource | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return JOB_RESOURCES;
    return JOB_RESOURCES.filter(
      (r) =>
        r.state.toLowerCase().includes(q) ||
        r.code.toLowerCase() === q ||
        r.name.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  if (selected) {
    const tCfg = TYPE_CONFIG[selected.type];
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Job Resource</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={s.homeBtn}>🏠</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          <View style={s.detailHero}>
            <View style={[s.typeBadge, { backgroundColor: tCfg.bg }]}>
              <Text style={[s.typeBadgeText, { color: tCfg.text }]}>{tCfg.icon} {tCfg.label}</Text>
            </View>
            <Text style={s.detailName}>{selected.name}</Text>
            <Text style={s.detailState}>{selected.state}</Text>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>📝 About</Text>
            <Text style={s.infoValue}>{selected.description}</Text>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>👤 Ages Served</Text>
            <Text style={s.infoValue}>{selected.agesServed}</Text>
          </View>

          <View style={s.tipCard}>
            <Text style={s.tipLabel}>🚀 How to Access</Text>
            <Text style={s.tipValue}>{selected.howToAccess}</Text>
          </View>

          <View style={s.tagsRow}>
            {selected.tags.map((tag) => (
              <View key={tag} style={s.tagChip}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {selected.phone && (
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${selected.phone}`)}>
              <Text style={s.callBtnText}>📞 Call {selected.phone}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.webBtn} onPress={() => Linking.openURL(selected.website)}>
            <Text style={s.webBtnText}>Visit Website →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Special Needs Jobs</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access all employment resources and supported employment programs by state.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>💼 Employment Resources</Text>
        <Text style={s.heroSub}>Find supported employment programs, job boards, and employer programs for adults with autism and disabilities.</Text>
      </View>

      <View style={s.nearMeRow}>
        <NearMeButton onStateDetected={(code) => setSearch(code)} />
        <Text style={s.orText}>or search below</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search by state, program type, or keyword..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {/* National resources always first */}
        {!search && (
          <Text style={s.sectionHeader}>🌍 Available in All States</Text>
        )}
        {filtered.map((resource) => {
          const tCfg = TYPE_CONFIG[resource.type];
          return (
            <TouchableOpacity key={resource.id} style={s.resourceCard} onPress={() => setSelected(resource)} activeOpacity={0.8}>
              <View style={s.resourceCardTop}>
                <View style={[s.typePill, { backgroundColor: tCfg.bg }]}>
                  <Text style={[s.typePillText, { color: tCfg.text }]}>{tCfg.icon} {tCfg.label}</Text>
                </View>
                <Text style={s.stateTag}>{resource.state}</Text>
              </View>
              <Text style={s.resourceName}>{resource.name}</Text>
              <Text style={s.resourceDesc} numberOfLines={2}>{resource.description}</Text>
              <Text style={s.agesText}>Ages: {resource.agesServed}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Employment services vary by location and funding availability. Contact your state VR agency for the most current information.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  homeBtn: { fontSize: 20 },

  premiumBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#FFF8E7', borderBottomWidth: 1, borderBottomColor: '#F5D87A',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  premiumIcon: { fontSize: 20 },
  premiumTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E' },
  premiumSub: { fontSize: FONT_SIZES.xs, color: '#92400E' },

  heroBanner: { backgroundColor: '#1E3A5F', padding: SPACING.lg },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)' },

  nearMeRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 4,
  },
  orText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },

  searchRow: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  searchInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: 10,
    fontSize: FONT_SIZES.sm, color: COLORS.text,
  },

  sectionHeader: {
    fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMid,
    marginBottom: SPACING.sm, marginTop: 4,
  },

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  resourceCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  resourceCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typePill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  stateTag: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600' },
  resourceName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  resourceDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginBottom: 6 },
  agesText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '500' },

  disclaimer: { paddingVertical: SPACING.lg },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },

  // Detail
  detailContent: { padding: SPACING.lg, gap: SPACING.md },
  detailHero: {
    backgroundColor: '#1E3A5F', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  typeBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 4, marginBottom: 8 },
  typeBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  detailName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', textAlign: 'center' },
  detailState: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  infoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },

  tipCard: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#92400E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipValue: { fontSize: FONT_SIZES.sm, color: '#78350F', lineHeight: 20 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  tagText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },

  callBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1E3A5F',
  },
  callBtnText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: '#1E3A5F' },

  webBtn: {
    backgroundColor: '#1E3A5F', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  webBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#fff' },
});
