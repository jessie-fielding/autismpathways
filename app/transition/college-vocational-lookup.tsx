import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type Program = {
  id: string;
  state: string;
  code: string;
  name: string;
  institution: string;
  city: string;
  type: 'inclusive-psec' | 'vocational' | 'certificate' | 'community-college';
  credential: string;
  duration: string;
  residential: boolean;
  financialAid: boolean;
  website: string;
  phone?: string;
  description: string;
  applicationTip: string;
};

const PROGRAMS: Program[] = [
  // National resources
  { id: 'nat-tc', state: 'National', code: 'NAT', name: 'Think College Program Finder', institution: 'Think College / UMass Boston', city: 'National Directory', type: 'inclusive-psec', credential: 'Certificate / Credential', duration: 'Varies', residential: false, financialAid: true, website: 'https://thinkcollege.net/college-search', description: 'The national database of inclusive higher education programs for students with intellectual disabilities. Search by state, credential type, and residential options. Over 300 programs nationwide.', applicationTip: 'Use the Think College program finder to search by your state and preferences. Many programs accept students directly from high school with an IEP. Apply in junior year.' },
  { id: 'nat-vr', state: 'National', code: 'NAT', name: 'Vocational Rehabilitation (VR) Training', institution: 'State VR Agencies', city: 'All States', type: 'vocational', credential: 'Certificate / Training', duration: '6 months – 2 years', residential: false, financialAid: true, website: 'https://rsa.ed.gov/about/states', description: 'State VR agencies fund vocational training, certificate programs, and college for eligible individuals with disabilities. VR can pay for tuition, books, transportation, and job coaching.', applicationTip: 'Apply to your state VR agency first. If approved, VR can fund your training or education. Bring your IEP and diagnosis documentation.' },
  // California
  { id: 'ca-c-1', state: 'California', code: 'CA', name: 'REACH Program at UCLA', institution: 'UCLA', city: 'Los Angeles, CA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://www.semel.ucla.edu/reach', phone: '310-825-0170', description: 'UCLA REACH is a 2-year certificate program for young adults with intellectual and developmental disabilities. Students take UCLA classes, participate in campus life, and develop employment skills.', applicationTip: 'Apply in senior year of high school. Requires letter of recommendation, personal statement, and interview. VR funding often available.' },
  { id: 'ca-c-2', state: 'California', code: 'CA', name: 'MOSAIC Program at UC San Diego', institution: 'UC San Diego', city: 'San Diego, CA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://extension.ucsd.edu/programs-and-courses/mosaic', description: 'UCSD MOSAIC is a 2-year inclusive post-secondary program for students with intellectual and developmental disabilities. Focuses on employment, independent living, and social connections.', applicationTip: 'Apply through UCSD Extension. VR and Regional Center funding often available. Apply in senior year.' },
  { id: 'ca-c-3', state: 'California', code: 'CA', name: 'IMPACT Program at Cal Poly SLO', institution: 'Cal Poly San Luis Obispo', city: 'San Luis Obispo, CA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: true, financialAid: true, website: 'https://impact.calpoly.edu', phone: '805-756-1000', description: 'Cal Poly IMPACT is a 2-year residential inclusive post-secondary program. Students live on campus, take classes, and develop career and life skills.', applicationTip: 'Apply in senior year. Residential option available. VR and Regional Center funding often available.' },
  // Texas
  { id: 'tx-c-1', state: 'Texas', code: 'TX', name: 'PACE Program at Texas A&M', institution: 'Texas A&M University', city: 'College Station, TX', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: true, financialAid: true, website: 'https://pace.tamu.edu', phone: '979-845-1234', description: 'Texas A&M PACE is a 2-year inclusive post-secondary program for students with intellectual disabilities. Students take classes, live on campus, and develop employment skills.', applicationTip: 'Apply in senior year. Residential option available. TWC VR funding often available.' },
  { id: 'tx-c-2', state: 'Texas', code: 'TX', name: 'TRIO Program at UT Austin', institution: 'University of Texas at Austin', city: 'Austin, TX', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://www.utexas.edu/diversity/ddce/trio', description: 'UT Austin TRIO supports students with disabilities in higher education. Includes academic support, career counseling, and disability services.', applicationTip: 'Apply through UT Austin admissions. Request disability accommodations through the Services for Students with Disabilities office.' },
  // Florida
  { id: 'fl-c-1', state: 'Florida', code: 'FL', name: 'CARD Inclusive PSE Programs', institution: 'Florida CARD Network', city: 'Statewide, FL', type: 'inclusive-psec', credential: 'Certificate', duration: 'Varies', residential: false, financialAid: true, website: 'https://www.floridacard.com/transition', phone: '1-800-339-2273', description: 'Florida CARD (Centers for Autism and Related Disabilities) supports students with ASD in accessing inclusive post-secondary education across Florida.', applicationTip: 'Contact your regional CARD center. They can help identify inclusive PSE programs at Florida colleges and universities.' },
  { id: 'fl-c-2', state: 'Florida', code: 'FL', name: 'Project SEARCH at Florida Hospitals', institution: 'Multiple Hospital Sites', city: 'Statewide, FL', type: 'vocational', credential: 'Certificate of Completion', duration: '1 year', residential: false, financialAid: false, website: 'https://www.projectsearch.us/find-a-site', description: 'Project SEARCH is a 1-year internship program at hospitals and businesses for young adults with significant disabilities. High employment outcomes.', applicationTip: 'Apply through your school transition coordinator or FL DVR. Sites are located at hospitals across Florida.' },
  // New York
  { id: 'ny-c-1', state: 'New York', code: 'NY', name: 'CUNY LEADS Program', institution: 'City University of New York', city: 'New York City, NY', type: 'inclusive-psec', credential: 'Degree / Certificate', duration: 'Varies', residential: false, financialAid: true, website: 'https://www.cuny.edu/academics/academic-programs/disability-programs/leads', phone: '212-794-5300', description: 'CUNY LEADS (Linking Employment, Academics, and Disability Services) supports students with disabilities at all CUNY campuses. Includes career counseling, internships, and employer connections.', applicationTip: 'Apply to any CUNY campus. Contact the disability services office to connect with LEADS. ACCES-VR funding often available.' },
  { id: 'ny-c-2', state: 'New York', code: 'NY', name: 'Think College NY Programs', institution: 'Multiple NY Colleges', city: 'Statewide, NY', type: 'inclusive-psec', credential: 'Certificate', duration: '2-4 years', residential: false, financialAid: true, website: 'https://thinkcollege.net/college-search?state=NY', description: 'Multiple inclusive PSE programs at NY colleges including Adelphi University, Marist College, and others. Search Think College for full list.', applicationTip: 'Use Think College to find programs in NY. Apply in senior year. ACCES-VR and OPWDD funding often available.' },
  // Pennsylvania
  { id: 'pa-c-1', state: 'Pennsylvania', code: 'PA', name: 'CONNECT Program at Penn State', institution: 'Penn State University', city: 'University Park, PA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: true, financialAid: true, website: 'https://equity.psu.edu/connect', phone: '814-865-3175', description: 'Penn State CONNECT is a 2-year inclusive post-secondary program for students with intellectual disabilities. Students take classes, live on campus, and develop career skills.', applicationTip: 'Apply in senior year. Residential option available. PA OVR funding often available.' },
  // Ohio
  { id: 'oh-c-1', state: 'Ohio', code: 'OH', name: 'TOPS Program at Ohio State', institution: 'The Ohio State University', city: 'Columbus, OH', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://tops.osu.edu', phone: '614-292-3307', description: 'OSU TOPS (Transition Options in Postsecondary Settings) is a 2-year inclusive program for students with intellectual disabilities. Students take classes and develop employment skills.', applicationTip: 'Apply in senior year. OOD VR funding often available. Contact the TOPS office for application requirements.' },
  // Illinois
  { id: 'il-c-1', state: 'Illinois', code: 'IL', name: 'PACE Program at U of I', institution: 'University of Illinois Urbana-Champaign', city: 'Champaign, IL', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: true, financialAid: true, website: 'https://www.disability.illinois.edu/pace', phone: '217-333-4603', description: 'U of I PACE is a 2-year inclusive post-secondary program for students with intellectual disabilities. Students take classes, live on campus, and develop career skills.', applicationTip: 'Apply in senior year. Residential option available. IL DRS VR funding often available.' },
  // Georgia
  { id: 'ga-c-1', state: 'Georgia', code: 'GA', name: 'EXCEL Program at Georgia Tech', institution: 'Georgia Institute of Technology', city: 'Atlanta, GA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://excel.gatech.edu', phone: '404-894-2000', description: 'Georgia Tech EXCEL is a 2-year inclusive program for students with intellectual disabilities. Focuses on STEM careers, employment, and independent living.', applicationTip: 'Apply in senior year. GVRA VR funding often available. Competitive program — apply early.' },
  // North Carolina
  { id: 'nc-c-1', state: 'North Carolina', code: 'NC', name: 'CTP Program at UNC Chapel Hill', institution: 'University of North Carolina', city: 'Chapel Hill, NC', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://ctp.unc.edu', phone: '919-966-5100', description: 'UNC CTP (Carolina Transition Program) is a 2-year inclusive program for students with intellectual disabilities. Students take classes and develop employment and life skills.', applicationTip: 'Apply in senior year. NC DVRS VR funding often available.' },
  // Michigan
  { id: 'mi-c-1', state: 'Michigan', code: 'MI', name: 'BRIDGES Program at Michigan State', institution: 'Michigan State University', city: 'East Lansing, MI', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: true, financialAid: true, website: 'https://bridges.msu.edu', phone: '517-353-9642', description: 'MSU BRIDGES is a 2-year inclusive post-secondary program for students with intellectual disabilities. Students take classes, live on campus, and develop career skills.', applicationTip: 'Apply in senior year. Residential option available. MRS VR funding often available.' },
  // Virginia
  { id: 'va-c-1', state: 'Virginia', code: 'VA', name: 'IMPACT Program at George Mason', institution: 'George Mason University', city: 'Fairfax, VA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://impact.gmu.edu', phone: '703-993-1000', description: 'GMU IMPACT is a 2-year inclusive program for students with intellectual disabilities. Students take classes and develop employment and life skills.', applicationTip: 'Apply in senior year. VA DARS VR funding often available.' },
  // Washington
  { id: 'wa-c-1', state: 'Washington', code: 'WA', name: 'PASSPORT Program at UW', institution: 'University of Washington', city: 'Seattle, WA', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://depts.washington.edu/passport', phone: '206-543-2000', description: 'UW PASSPORT is a 2-year inclusive program for students with intellectual disabilities. Students take classes and develop employment and life skills.', applicationTip: 'Apply in senior year. WA DVR funding often available.' },
  // Massachusetts
  { id: 'ma-c-1', state: 'Massachusetts', code: 'MA', name: 'Think College MA Programs', institution: 'Multiple MA Colleges', city: 'Statewide, MA', type: 'inclusive-psec', credential: 'Certificate', duration: '2-4 years', residential: false, financialAid: true, website: 'https://thinkcollege.net/college-search?state=MA', description: 'Multiple inclusive PSE programs at MA colleges including Westfield State, Lesley University, and others. Search Think College for full list.', applicationTip: 'Use Think College to find programs in MA. Apply in senior year. MRC VR and DDS funding often available.' },
  // Colorado
  { id: 'co-c-1', state: 'Colorado', code: 'CO', name: 'ACHIEVE Program at CU Boulder', institution: 'University of Colorado Boulder', city: 'Boulder, CO', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://achieve.colorado.edu', phone: '303-492-1411', description: 'CU Boulder ACHIEVE is a 2-year inclusive program for students with intellectual disabilities. Students take classes and develop employment and life skills.', applicationTip: 'Apply in senior year. CO DVR funding often available.' },
  // Minnesota
  { id: 'mn-c-1', state: 'Minnesota', code: 'MN', name: 'PACES Program at U of MN', institution: 'University of Minnesota', city: 'Minneapolis, MN', type: 'inclusive-psec', credential: 'Certificate', duration: '2 years', residential: false, financialAid: true, website: 'https://paces.umn.edu', phone: '612-624-0315', description: 'U of MN PACES is a 2-year inclusive program for students with intellectual disabilities. Students take classes and develop employment and life skills.', applicationTip: 'Apply in senior year. MN VRS funding often available.' },
];

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  'inclusive-psec': { label: 'Inclusive PSE', bg: '#DBEAFE', text: '#1E40AF', icon: '🎓' },
  'vocational': { label: 'Vocational', bg: '#D1FAE5', text: '#065F46', icon: '🛠️' },
  'certificate': { label: 'Certificate', bg: '#EDE9FE', text: '#5B21B6', icon: '📜' },
  'community-college': { label: 'Community College', bg: '#FEF3C7', text: '#92400E', icon: '🏫' },
};

export default function CollegeVocationalLookup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'college' | 'vocational'>('all');
  const [selected, setSelected] = useState<Program | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let results = PROGRAMS;
    if (activeTab === 'college') results = results.filter((p) => p.type === 'inclusive-psec' || p.type === 'certificate');
    if (activeTab === 'vocational') results = results.filter((p) => p.type === 'vocational' || p.type === 'community-college');
    if (!q) return results;
    return results.filter(
      (p) =>
        p.state.toLowerCase().includes(q) ||
        p.code.toLowerCase() === q ||
        p.name.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }, [search, activeTab]);

  if (selected) {
    const tCfg = TYPE_CONFIG[selected.type];
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Program Details</Text>
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
            <Text style={s.detailInstitution}>{selected.institution}</Text>
            <Text style={s.detailCity}>{selected.city}</Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statIcon}>📅</Text>
              <Text style={s.statLabel}>Duration</Text>
              <Text style={s.statValue}>{selected.duration}</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>🏅</Text>
              <Text style={s.statLabel}>Credential</Text>
              <Text style={s.statValue}>{selected.credential}</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>{selected.residential ? '🏠' : '🚌'}</Text>
              <Text style={s.statLabel}>Housing</Text>
              <Text style={s.statValue}>{selected.residential ? 'Residential' : 'Commuter'}</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>{selected.financialAid ? '💰' : '💳'}</Text>
              <Text style={s.statLabel}>Financial Aid</Text>
              <Text style={s.statValue}>{selected.financialAid ? 'Available' : 'Self-Pay'}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>📝 About This Program</Text>
            <Text style={s.infoValue}>{selected.description}</Text>
          </View>

          <View style={s.tipCard}>
            <Text style={s.tipLabel}>💡 Application Tip</Text>
            <Text style={s.tipValue}>{selected.applicationTip}</Text>
          </View>

          {selected.phone && (
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${selected.phone}`)}>
              <Text style={s.callBtnText}>📞 Call {selected.phone}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.webBtn} onPress={() => Linking.openURL(selected.website)}>
            <Text style={s.webBtnText}>Visit Program Website →</Text>
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
        <Text style={s.headerTitle}>College & Vocational</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access all inclusive college programs and vocational training options by state.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>🎓 College & Vocational Programs</Text>
        <Text style={s.heroSub}>Find inclusive post-secondary and vocational programs for students with autism and intellectual disabilities.</Text>
      </View>

      <View style={s.tabs}>
        {(['all', 'college', 'vocational'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'all' ? 'All' : tab === 'college' ? '🎓 College' : '🛠️ Vocational'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.nearMeRow}>
        <NearMeButton onStateDetected={(code) => setSearch(code)} />
        <Text style={s.orText}>or search below</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search by state, school, or program name..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((program) => {
          const tCfg = TYPE_CONFIG[program.type];
          return (
            <TouchableOpacity key={program.id} style={s.programCard} onPress={() => setSelected(program)} activeOpacity={0.8}>
              <View style={s.programCardTop}>
                <View style={[s.typePill, { backgroundColor: tCfg.bg }]}>
                  <Text style={[s.typePillText, { color: tCfg.text }]}>{tCfg.icon} {tCfg.label}</Text>
                </View>
                <Text style={s.stateTag}>{program.state}</Text>
              </View>
              <Text style={s.programName}>{program.name}</Text>
              <Text style={s.institutionName}>{program.institution}</Text>
              <Text style={s.cityText}>{program.city}</Text>
              <View style={s.programMeta}>
                <Text style={s.metaText}>⏱ {program.duration}</Text>
                {program.residential && <Text style={s.metaText}>🏠 Residential</Text>}
                {program.financialAid && <Text style={s.metaText}>💰 Aid Available</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Program availability and requirements change. Always verify directly with the institution. Data sourced from Think College and state VR agencies.
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

  tabs: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.purple },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '600' },
  tabTextActive: { color: COLORS.purple },

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

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  programCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  programCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typePill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  stateTag: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600' },
  programName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  institutionName: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '600', marginBottom: 2 },
  cityText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 8 },
  programMeta: { flexDirection: 'row', gap: SPACING.md },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },

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
  detailInstitution: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },
  detailCity: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 2 },
  statValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, textAlign: 'center' },

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
