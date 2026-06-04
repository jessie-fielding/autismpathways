import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type DayProgram = {
  id: string;
  state: string;
  code: string;
  name: string;
  city: string;
  services: string[];
  ages: string;
  phone?: string;
  website?: string;
  waitlist: 'open' | 'waitlist' | 'unknown';
  fundingSource: string;
  notes: string;
};

const DAY_PROGRAMS: DayProgram[] = [
  // California
  { id: 'ca-1', state: 'California', code: 'CA', name: 'Golden Gate Regional Center Day Programs', city: 'San Francisco, CA', services: ['Life Skills', 'Vocational Training', 'Community Integration', 'Social Skills'], ages: '18+', phone: '415-546-9222', website: 'https://www.ggrc.org', waitlist: 'waitlist', fundingSource: 'DDS Regional Center', notes: 'Funded through CA Department of Developmental Services. Contact your Regional Center service coordinator to apply.' },
  { id: 'ca-2', state: 'California', code: 'CA', name: 'Westside Regional Center Adult Day Programs', city: 'Culver City, CA', services: ['Life Skills', 'Employment Support', 'Community Access', 'Recreation'], ages: '18+', phone: '310-258-4000', website: 'https://www.westsiderc.org', waitlist: 'waitlist', fundingSource: 'DDS Regional Center', notes: 'Serves the greater Los Angeles area. Waitlists common — apply early.' },
  { id: 'ca-3', state: 'California', code: 'CA', name: 'Alta California Regional Center Day Services', city: 'Sacramento, CA', services: ['Life Skills', 'Vocational Training', 'Community Integration'], ages: '18+', phone: '916-978-6400', website: 'https://www.altaregional.org', waitlist: 'open', fundingSource: 'DDS Regional Center', notes: 'Serves Sacramento region. Contact service coordinator for referral.' },
  // Texas
  { id: 'tx-1', state: 'Texas', code: 'TX', name: 'REACH of Dallas Day Habilitation', city: 'Dallas, TX', services: ['Life Skills', 'Community Integration', 'Social Skills', 'Health & Wellness'], ages: '18+', phone: '214-747-3241', website: 'https://www.reachdallas.org', waitlist: 'open', fundingSource: 'HCS Waiver / ICF', notes: 'Funded through TX HCS waiver. Contact DADS for eligibility.' },
  { id: 'tx-2', state: 'Texas', code: 'TX', name: 'SPARC Adult Day Services', city: 'San Antonio, TX', services: ['Life Skills', 'Vocational Training', 'Community Access', 'Therapeutic Activities'], ages: '18+', phone: '210-490-8600', website: 'https://www.sparcsa.org', waitlist: 'waitlist', fundingSource: 'HCS Waiver', notes: 'Waitlist common. Apply through HHSC HCS program.' },
  // Florida
  { id: 'fl-1', state: 'Florida', code: 'FL', name: 'Agency for Persons with Disabilities Day Programs', city: 'Statewide, FL', services: ['Life Skills', 'Vocational Training', 'Community Integration', 'Behavioral Support'], ages: '18+', phone: '1-866-273-2273', website: 'https://apdcares.org', waitlist: 'waitlist', fundingSource: 'APD iBudget Waiver', notes: 'FL APD administers the iBudget waiver. Contact your APD area office to apply.' },
  { id: 'fl-2', state: 'Florida', code: 'FL', name: 'Sunrise Community Adult Day Training', city: 'Miami, FL', services: ['Life Skills', 'Employment Prep', 'Community Access', 'Recreation'], ages: '18+', phone: '305-223-9550', website: 'https://www.sunrisegroup.org', waitlist: 'open', fundingSource: 'APD iBudget Waiver', notes: 'Multiple locations across South Florida.' },
  // New York
  { id: 'ny-1', state: 'New York', code: 'NY', name: 'OPWDD Day Habilitation Programs', city: 'Statewide, NY', services: ['Life Skills', 'Community Integration', 'Vocational Training', 'Health & Wellness'], ages: '18+', phone: '1-866-946-9733', website: 'https://opwdd.ny.gov', waitlist: 'waitlist', fundingSource: 'OPWDD HCBS Waiver', notes: 'NY OPWDD administers all DD day programs. Contact your OPWDD Care Manager.' },
  { id: 'ny-2', state: 'New York', code: 'NY', name: 'YAI Network Day Services', city: 'New York City, NY', services: ['Life Skills', 'Employment Support', 'Community Integration', 'Social Skills'], ages: '18+', phone: '212-273-6100', website: 'https://www.yai.org', waitlist: 'waitlist', fundingSource: 'OPWDD HCBS Waiver', notes: 'One of the largest DD service providers in NYC. Apply through OPWDD.' },
  // Pennsylvania
  { id: 'pa-1', state: 'Pennsylvania', code: 'PA', name: 'ODP Adult Day Services', city: 'Statewide, PA', services: ['Life Skills', 'Community Integration', 'Vocational Training', 'Behavioral Support'], ages: '18+', phone: '1-888-565-9435', website: 'https://www.dhs.pa.gov/Services/Disabilities-Special-Needs/Pages/ODP.aspx', waitlist: 'waitlist', fundingSource: 'PA ODP Waiver', notes: 'PA Office of Developmental Programs administers day services. Contact your county MH/IDD office.' },
  // Ohio
  { id: 'oh-1', state: 'Ohio', code: 'OH', name: 'County Board of DD Day Programs', city: 'Statewide, OH', services: ['Life Skills', 'Employment Support', 'Community Integration', 'Recreation'], ages: '18+', phone: '1-800-617-6733', website: 'https://dodd.ohio.gov', waitlist: 'open', fundingSource: 'DODD Waiver / County Board', notes: 'Ohio has 88 county DD boards. Contact your county board for local programs.' },
  // Illinois
  { id: 'il-1', state: 'Illinois', code: 'IL', name: 'DHS Division of DD Adult Day Services', city: 'Statewide, IL', services: ['Life Skills', 'Community Integration', 'Vocational Training', 'Social Skills'], ages: '18+', phone: '1-800-843-6154', website: 'https://www.dhs.state.il.us/page.aspx?item=29737', waitlist: 'waitlist', fundingSource: 'PUNS Waiver', notes: 'IL DHS administers the PUNS waiver for DD services. Apply through your local DHS office.' },
  // Georgia
  { id: 'ga-1', state: 'Georgia', code: 'GA', name: 'DBHDD NOW/COMP Waiver Day Programs', city: 'Statewide, GA', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Behavioral Support'], ages: '18+', phone: '1-800-436-7442', website: 'https://dbhdd.georgia.gov', waitlist: 'waitlist', fundingSource: 'NOW/COMP Waiver', notes: 'Georgia DBHDD administers NOW and COMP waivers. Apply through your Support Coordinator.' },
  // North Carolina
  { id: 'nc-1', state: 'North Carolina', code: 'NC', name: 'DHHS Innovations Waiver Day Programs', city: 'Statewide, NC', services: ['Life Skills', 'Community Integration', 'Vocational Training', 'Recreation'], ages: '18+', phone: '1-800-662-7030', website: 'https://www.ncdhhs.gov/divisions/dma/nc-medicaid/innovations-waiver', waitlist: 'waitlist', fundingSource: 'Innovations Waiver', notes: 'NC Innovations Waiver has a waitlist. Apply through your Local Management Entity (LME/MCO).' },
  // Michigan
  { id: 'mi-1', state: 'Michigan', code: 'MI', name: 'MDHHS Adult Day Services', city: 'Statewide, MI', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Therapeutic Activities'], ages: '18+', phone: '1-800-642-3195', website: 'https://www.michigan.gov/mdhhs/adult-child-serv/disability', waitlist: 'open', fundingSource: 'HCBS Waiver / CMH', notes: 'Funded through Community Mental Health. Contact your local CMH agency.' },
  // Virginia
  { id: 'va-1', state: 'Virginia', code: 'VA', name: 'DBHDS Day Support Services', city: 'Statewide, VA', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Social Skills'], ages: '18+', phone: '1-800-451-5544', website: 'https://dbhds.virginia.gov', waitlist: 'waitlist', fundingSource: 'DD Waiver', notes: 'VA DD waivers have significant waitlists. Apply through your Community Services Board (CSB).' },
  // Washington
  { id: 'wa-1', state: 'Washington', code: 'WA', name: 'DSHS DDA Day Programs', city: 'Statewide, WA', services: ['Life Skills', 'Community Integration', 'Vocational Training', 'Recreation'], ages: '18+', phone: '1-800-737-0617', website: 'https://www.dshs.wa.gov/dda', waitlist: 'open', fundingSource: 'DDA HCBS Waiver', notes: 'WA DDA administers day services. Contact your local DDA office for referral.' },
  // New Jersey
  { id: 'nj-1', state: 'New Jersey', code: 'NJ', name: 'DDD Community Care Program Day Services', city: 'Statewide, NJ', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Behavioral Support'], ages: '18+', phone: '1-800-832-9173', website: 'https://www.nj.gov/humanservices/ddd', waitlist: 'waitlist', fundingSource: 'DDD CCP Waiver', notes: 'NJ DDD Community Care Program. Apply through your local DDD office.' },
  // Maryland
  { id: 'md-1', state: 'Maryland', code: 'MD', name: 'DDA Community Pathways Waiver Day Services', city: 'Statewide, MD', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Recreation'], ages: '18+', phone: '1-410-767-5600', website: 'https://dda.health.maryland.gov', waitlist: 'waitlist', fundingSource: 'Community Pathways Waiver', notes: 'MD DDA administers the Community Pathways Waiver. Apply through your local DDA office.' },
  // Colorado
  { id: 'co-1', state: 'Colorado', code: 'CO', name: 'HCBS-DD Waiver Day Programs', city: 'Statewide, CO', services: ['Life Skills', 'Community Integration', 'Vocational Training', 'Social Skills'], ages: '18+', phone: '1-303-692-2730', website: 'https://hcpf.colorado.gov/dd-waiver', waitlist: 'waitlist', fundingSource: 'HCBS-DD Waiver', notes: 'CO HCBS-DD waiver has waitlists. Apply through your Single Entry Point (SEP) agency.' },
  // Massachusetts
  { id: 'ma-1', state: 'Massachusetts', code: 'MA', name: 'DDS Adult Day Services', city: 'Statewide, MA', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Recreation'], ages: '18+', phone: '1-617-727-5608', website: 'https://www.mass.gov/dds', waitlist: 'waitlist', fundingSource: 'DDS Waiver', notes: 'MA DDS administers day services. Apply through your local DDS Area Office.' },
  // Indiana
  { id: 'in-1', state: 'Indiana', code: 'IN', name: 'BDDS Community Integration and Habilitation Waiver', city: 'Statewide, IN', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Behavioral Support'], ages: '18+', phone: '1-800-545-7763', website: 'https://www.in.gov/fssa/ddrs', waitlist: 'waitlist', fundingSource: 'CIH Waiver', notes: 'IN BDDS CIH waiver. Apply through your local BDDS office.' },
  // Minnesota
  { id: 'mn-1', state: 'Minnesota', code: 'MN', name: 'DHS DD Waiver Day Services', city: 'Statewide, MN', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Recreation'], ages: '18+', phone: '1-651-431-2225', website: 'https://mn.gov/dhs/people-we-serve/adults/services/developmental-disabilities', waitlist: 'open', fundingSource: 'DD Waiver', notes: 'MN DHS administers DD waiver services. Contact your county social services.' },
  // Arizona
  { id: 'az-1', state: 'Arizona', code: 'AZ', name: 'DDD Day Programs', city: 'Statewide, AZ', services: ['Life Skills', 'Community Integration', 'Employment Support', 'Therapeutic Activities'], ages: '18+', phone: '1-602-542-0419', website: 'https://des.az.gov/services/developmental-disabilities', waitlist: 'waitlist', fundingSource: 'DDD HCBS Waiver', notes: 'AZ DDD administers day services. Apply through your DDD Support Coordinator.' },
];

const WAITLIST_CONFIG = {
  open: { label: 'Open', bg: '#D1FAE5', text: '#065F46' },
  waitlist: { label: 'Waitlist', bg: '#FEF3C7', text: '#92400E' },
  unknown: { label: 'Call to Check', bg: '#F3F4F6', text: '#374151' },
};

const SERVICE_ICONS: Record<string, string> = {
  'Life Skills': '🏠',
  'Vocational Training': '💼',
  'Community Integration': '🌍',
  'Social Skills': '🤝',
  'Employment Support': '💼',
  'Community Access': '🚌',
  'Recreation': '🎨',
  'Health & Wellness': '❤️',
  'Behavioral Support': '🧠',
  'Employment Prep': '📋',
  'Therapeutic Activities': '🌿',
};

export default function DayProgramFinder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DayProgram | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return DAY_PROGRAMS;
    return DAY_PROGRAMS.filter(
      (p) =>
        p.state.toLowerCase().includes(q) ||
        p.code.toLowerCase() === q ||
        p.city.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
    );
  }, [search]);

  if (selected) {
    const wCfg = WAITLIST_CONFIG[selected.waitlist];
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Day Program</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={s.homeBtn}>🏠</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          <View style={s.detailHero}>
            <View style={[s.waitlistBadge, { backgroundColor: wCfg.bg }]}>
              <Text style={[s.waitlistBadgeText, { color: wCfg.text }]}>{wCfg.label}</Text>
            </View>
            <Text style={s.detailName}>{selected.name}</Text>
            <Text style={s.detailCity}>{selected.city}</Text>
            <Text style={s.detailFunding}>Funded by: {selected.fundingSource}</Text>
          </View>

          <Text style={s.sectionTitle}>Services Offered</Text>
          <View style={s.servicesGrid}>
            {selected.services.map((svc) => (
              <View key={svc} style={s.serviceChip}>
                <Text style={s.serviceChipText}>{SERVICE_ICONS[svc] ?? '✅'} {svc}</Text>
              </View>
            ))}
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>👤 Ages Served</Text>
            <Text style={s.infoValue}>{selected.ages}</Text>
          </View>

          <View style={s.tipCard}>
            <Text style={s.tipLabel}>💡 How to Apply</Text>
            <Text style={s.tipValue}>{selected.notes}</Text>
          </View>

          {selected.phone && (
            <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(`tel:${selected.phone}`)}>
              <Text style={s.callBtnText}>📞 Call {selected.phone}</Text>
            </TouchableOpacity>
          )}
          {selected.website && (
            <TouchableOpacity style={s.webBtn} onPress={() => Linking.openURL(selected.website!)}>
              <Text style={s.webBtnText}>Visit Website →</Text>
            </TouchableOpacity>
          )}
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
        <Text style={s.headerTitle}>Day Program Finder</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access the full day program directory with waitlist status and application tips.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>🏢 Adult Day Program Finder</Text>
        <Text style={s.heroSub}>Find structured day programs for adults 18+ with autism and developmental disabilities by state.</Text>
      </View>

      <View style={s.nearMeRow}>
        <NearMeButton onStateDetected={(code) => setSearch(code)} />
        <Text style={s.orText}>or search below</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search by state, city, or program name..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>🔍</Text>
            <Text style={s.emptyTitle}>No programs found</Text>
            <Text style={s.emptyText}>Try a different state or contact your state's DD agency directly.</Text>
          </View>
        )}
        {filtered.map((program) => {
          const wCfg = WAITLIST_CONFIG[program.waitlist];
          return (
            <TouchableOpacity
              key={program.id}
              style={s.programCard}
              onPress={() => setSelected(program)}
              activeOpacity={0.8}
            >
              <View style={s.programCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.programName}>{program.name}</Text>
                  <Text style={s.programCity}>{program.city}</Text>
                </View>
                <View style={[s.waitlistPill, { backgroundColor: wCfg.bg }]}>
                  <Text style={[s.waitlistPillText, { color: wCfg.text }]}>{wCfg.label}</Text>
                </View>
              </View>
              <View style={s.serviceRow}>
                {program.services.slice(0, 3).map((svc) => (
                  <View key={svc} style={s.svcChip}>
                    <Text style={s.svcChipText}>{SERVICE_ICONS[svc] ?? '✅'} {svc}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.fundingText}>💰 {program.fundingSource}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Program availability changes. Always contact the program directly to confirm current openings and eligibility.
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

  heroBanner: { backgroundColor: '#2D6A4F', padding: SPACING.lg },
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

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  programCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  programCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  programName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, flex: 1 },
  programCity: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  waitlistPill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  waitlistPillText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  serviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  svcChip: { backgroundColor: '#F0FDF4', borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 3 },
  svcChipText: { fontSize: 11, color: '#2D6A4F', fontWeight: '500' },
  fundingText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },

  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', marginTop: 4 },

  disclaimer: { paddingVertical: SPACING.lg },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },

  // Detail
  detailContent: { padding: SPACING.lg, gap: SPACING.md },
  detailHero: {
    backgroundColor: '#2D6A4F', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  waitlistBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 4, marginBottom: 8 },
  waitlistBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  detailName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', textAlign: 'center' },
  detailCity: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  detailFunding: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: {
    backgroundColor: '#F0FDF4', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 6,
  },
  serviceChipText: { fontSize: FONT_SIZES.xs, color: '#2D6A4F', fontWeight: '600' },

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
    alignItems: 'center', borderWidth: 1.5, borderColor: '#2D6A4F',
  },
  callBtnText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: '#2D6A4F' },

  webBtn: {
    backgroundColor: '#2D6A4F', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  webBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#fff' },
});
