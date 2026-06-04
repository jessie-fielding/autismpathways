import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type ApartmentResource = {
  id: string;
  state: string;
  code: string;
  name: string;
  city: string;
  type: 'supported-living' | 'independent' | 'affordable-housing' | 'host-home';
  supportLevel: 'none' | 'light' | 'moderate';
  description: string;
  eligibility: string;
  fundingSource: string;
  phone?: string;
  website: string;
  howToApply: string;
  availability: 'available' | 'waitlist' | 'long-waitlist' | 'varies';
};

const APARTMENT_RESOURCES: ApartmentResource[] = [
  // National
  { id: 'nat-1', state: 'National', code: 'NAT', name: 'HUD Section 811 Housing', type: 'affordable-housing', supportLevel: 'light', city: 'All States', description: 'HUD Section 811 provides affordable housing for people with disabilities. Units are integrated into regular apartment communities with light support services available.', eligibility: 'Adults 18+ with significant disabilities. Income limits apply.', fundingSource: 'HUD Federal Program', phone: '1-800-569-4287', website: 'https://www.hud.gov/program_offices/housing/mfh/progdesc/disab811', howToApply: 'Contact your local Public Housing Authority (PHA). Apply for Section 811 housing vouchers. Waitlists are common.', availability: 'waitlist' },
  { id: 'nat-2', state: 'National', code: 'NAT', name: 'Section 8 Housing Choice Voucher', type: 'independent', supportLevel: 'none', city: 'All States', description: 'HUD Section 8 vouchers help low-income individuals pay for housing in the private market. People with disabilities may receive priority placement.', eligibility: 'Low-income adults. Disability status may provide priority.', fundingSource: 'HUD Federal Program', phone: '1-800-569-4287', website: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8', howToApply: 'Apply through your local Public Housing Authority (PHA). Waitlists can be very long — apply immediately.', availability: 'long-waitlist' },
  { id: 'nat-3', state: 'National', code: 'NAT', name: 'USDA Rural Housing Disability Program', type: 'affordable-housing', supportLevel: 'none', city: 'Rural Areas', description: 'USDA provides affordable housing assistance for people with disabilities in rural areas. Includes rental assistance and home modification grants.', eligibility: 'Adults with disabilities in rural areas. Income limits apply.', fundingSource: 'USDA Federal Program', phone: '1-800-414-1226', website: 'https://www.rd.usda.gov/programs-services/multi-family-housing-programs', howToApply: 'Contact your local USDA Rural Development office. Apply for Section 515 rental assistance.', availability: 'varies' },
  // California
  { id: 'ca-a-1', state: 'California', code: 'CA', name: 'Regional Center Supported Living Services', type: 'supported-living', supportLevel: 'moderate', city: 'Statewide, CA', description: 'CA Regional Centers fund Supported Living Services (SLS) — support staff who help adults with DD live independently in their own homes or apartments.', eligibility: 'Adults 18+ with developmental disabilities enrolled with a Regional Center.', fundingSource: 'DDS Regional Center', phone: '916-654-1987', website: 'https://www.dds.ca.gov/consumers/housing/supported-living', howToApply: 'Contact your Regional Center service coordinator. Request Supported Living Services. They will connect you with a vendored SLS agency.', availability: 'waitlist' },
  { id: 'ca-a-2', state: 'California', code: 'CA', name: 'CA Housing Is Key Program', type: 'affordable-housing', supportLevel: 'none', city: 'Statewide, CA', description: 'California state affordable housing programs including CalHFA and local housing authorities. Priority for people with disabilities.', eligibility: 'Low-income adults. Disability status may provide priority.', fundingSource: 'State of California', phone: '1-833-430-2122', website: 'https://housing.ca.gov', howToApply: 'Contact your local housing authority. Apply for affordable housing waitlists. Disability status may provide priority placement.', availability: 'long-waitlist' },
  // Texas
  { id: 'tx-a-1', state: 'Texas', code: 'TX', name: 'HHSC HCS Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, TX', description: 'TX HCS waiver funds Supported Home Living services — support staff who help adults with DD live independently.', eligibility: 'Adults with developmental disabilities enrolled in HCS waiver.', fundingSource: 'HCS Waiver', phone: '1-877-787-8999', website: 'https://www.hhs.texas.gov/providers/long-term-services-supports-providers/home-community-based-services', howToApply: 'Apply for HCS waiver through HHSC. Request Supported Home Living services. Waitlists can be very long.', availability: 'long-waitlist' },
  // Florida
  { id: 'fl-a-1', state: 'Florida', code: 'FL', name: 'APD Supported Living Services', type: 'supported-living', supportLevel: 'light', city: 'Statewide, FL', description: 'FL APD iBudget waiver funds Supported Living Coaching — support staff who help adults with DD live independently in their own homes.', eligibility: 'Adults with developmental disabilities enrolled with APD.', fundingSource: 'APD iBudget Waiver', phone: '1-866-273-2273', website: 'https://apdcares.org/consumers/housing/supported-living', howToApply: 'Contact your APD Support Coordinator. Request Supported Living Coaching services through the iBudget waiver.', availability: 'waitlist' },
  // New York
  { id: 'ny-a-1', state: 'New York', code: 'NY', name: 'OPWDD Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, NY', description: 'NY OPWDD funds Supported Living services — support staff who help adults with DD live independently in their own apartments.', eligibility: 'Adults with developmental disabilities enrolled with OPWDD.', fundingSource: 'OPWDD HCBS Waiver', phone: '1-866-946-9733', website: 'https://opwdd.ny.gov/supported-living', howToApply: 'Contact your OPWDD Care Manager. Request Supported Living services. They will help identify available apartments.', availability: 'waitlist' },
  { id: 'ny-a-2', state: 'New York', code: 'NY', name: 'NYC HPD Disability Housing', type: 'affordable-housing', supportLevel: 'none', city: 'New York City, NY', description: 'NYC Housing Preservation & Development affordable housing programs with units set aside for people with disabilities.', eligibility: 'Low-income adults with disabilities in NYC.', fundingSource: 'NYC HPD', phone: '212-863-6300', website: 'https://www.nyc.gov/site/hpd/services-and-information/housing-for-people-with-disabilities.page', howToApply: 'Apply through NYC Housing Connect. Filter for disability-accessible units. Waitlists are very long.', availability: 'long-waitlist' },
  // Pennsylvania
  { id: 'pa-a-1', state: 'Pennsylvania', code: 'PA', name: 'ODP Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, PA', description: 'PA ODP waiver funds Supported Living services — support staff who help adults with DD live independently.', eligibility: 'Adults with developmental disabilities enrolled in ODP waiver.', fundingSource: 'PA ODP Waiver', phone: '1-888-565-9435', website: 'https://www.dhs.pa.gov/Services/Disabilities-Special-Needs/Pages/ODP.aspx', howToApply: 'Contact your county MH/IDD office. Request Supported Living services through ODP. Your Support Coordinator will help.', availability: 'waitlist' },
  // Ohio
  { id: 'oh-a-1', state: 'Ohio', code: 'OH', name: 'DODD Independent Living Services', type: 'supported-living', supportLevel: 'light', city: 'Statewide, OH', description: 'Ohio DODD waiver funds Independent Living services — support staff who help adults with DD live independently.', eligibility: 'Adults with developmental disabilities enrolled with county DD board.', fundingSource: 'DODD Waiver / County Board', phone: '1-800-617-6733', website: 'https://dodd.ohio.gov/independent-living', howToApply: 'Contact your county DD board. Request Independent Living services. They will help identify available housing.', availability: 'varies' },
  // Illinois
  { id: 'il-a-1', state: 'Illinois', code: 'IL', name: 'DHS CILA Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, IL', description: 'IL DHS CILA (Community Integrated Living Arrangement) includes supported living options for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled in PUNS waiver.', fundingSource: 'PUNS Waiver', phone: '1-800-843-6154', website: 'https://www.dhs.state.il.us/page.aspx?item=29737', howToApply: 'Apply for PUNS waiver through IL DHS. Request supported living services. Your Support Coordinator will help.', availability: 'long-waitlist' },
  // Georgia
  { id: 'ga-a-1', state: 'Georgia', code: 'GA', name: 'DBHDD NOW/COMP Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, GA', description: 'GA DBHDD NOW and COMP waivers fund supported living services for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled in NOW or COMP waiver.', fundingSource: 'NOW/COMP Waiver', phone: '1-800-436-7442', website: 'https://dbhdd.georgia.gov/supported-living', howToApply: 'Apply for NOW or COMP waiver through DBHDD. Request supported living services. Your Support Coordinator will help.', availability: 'waitlist' },
  // North Carolina
  { id: 'nc-a-1', state: 'North Carolina', code: 'NC', name: 'DHHS Innovations Waiver Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, NC', description: 'NC Innovations Waiver funds supported living services for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled in Innovations Waiver.', fundingSource: 'Innovations Waiver', phone: '1-800-662-7030', website: 'https://www.ncdhhs.gov/divisions/dma/nc-medicaid/innovations-waiver', howToApply: 'Apply through your LME/MCO. Request supported living services. Waitlists are common.', availability: 'waitlist' },
  // Michigan
  { id: 'mi-a-1', state: 'Michigan', code: 'MI', name: 'CMH Supported Independent Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, MI', description: 'MI Community Mental Health agencies fund Supported Independent Living services for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled with CMH.', fundingSource: 'HCBS Waiver / CMH', phone: '1-800-642-3195', website: 'https://www.michigan.gov/mdhhs/adult-child-serv/disability/housing', howToApply: 'Contact your local CMH agency. Request Supported Independent Living services.', availability: 'varies' },
  // Virginia
  { id: 'va-a-1', state: 'Virginia', code: 'VA', name: 'DBHDS Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, VA', description: 'VA DBHDS DD waiver funds supported living services for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled in DD waiver.', fundingSource: 'DD Waiver', phone: '1-800-451-5544', website: 'https://dbhds.virginia.gov/developmental-services/housing', howToApply: 'Apply through your Community Services Board (CSB). Request supported living services. Waitlists are common.', availability: 'waitlist' },
  // Washington
  { id: 'wa-a-1', state: 'Washington', code: 'WA', name: 'DDA Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, WA', description: 'WA DDA HCBS waiver funds Supported Living services for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled with DDA.', fundingSource: 'DDA HCBS Waiver', phone: '1-800-737-0617', website: 'https://www.dshs.wa.gov/dda/supported-living', howToApply: 'Contact your local DDA office. Request Supported Living services. Your DDA Case Manager will help.', availability: 'varies' },
  // Colorado
  { id: 'co-a-1', state: 'Colorado', code: 'CO', name: 'HCBS-DD Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, CO', description: 'CO HCBS-DD waiver funds Supported Living services for adults with DD.', eligibility: 'Adults with developmental disabilities enrolled in HCBS-DD waiver.', fundingSource: 'HCBS-DD Waiver', phone: '1-303-692-2730', website: 'https://hcpf.colorado.gov/dd-waiver', howToApply: 'Apply through your Single Entry Point (SEP) agency. Request Supported Living services. Your case manager will help.', availability: 'waitlist' },
  // Massachusetts
  { id: 'ma-a-1', state: 'Massachusetts', code: 'MA', name: 'DDS Shared Living / Supported Living', type: 'supported-living', supportLevel: 'light', city: 'Statewide, MA', description: 'MA DDS funds Shared Living and Supported Living services for adults with DD. Shared Living is a host-home model; Supported Living provides staff support in own apartment.', eligibility: 'Adults with developmental disabilities enrolled with DDS.', fundingSource: 'DDS Waiver', phone: '1-617-727-5608', website: 'https://www.mass.gov/dds/housing', howToApply: 'Apply through your local DDS Area Office. Request Shared Living or Supported Living services. Waitlists are common.', availability: 'waitlist' },
];

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  'supported-living': { label: 'Supported Living', bg: '#D1FAE5', text: '#065F46', icon: '🏠' },
  'independent': { label: 'Independent', bg: '#DBEAFE', text: '#1E40AF', icon: '🔑' },
  'affordable-housing': { label: 'Affordable Housing', bg: '#EDE9FE', text: '#5B21B6', icon: '🏢' },
  'host-home': { label: 'Host Home', bg: '#FEF3C7', text: '#92400E', icon: '👨‍👩‍👧' },
};

const AVAILABILITY_CONFIG = {
  available: { label: 'Available', bg: '#D1FAE5', text: '#065F46' },
  waitlist: { label: 'Waitlist', bg: '#FEF3C7', text: '#92400E' },
  'long-waitlist': { label: 'Long Waitlist', bg: '#FEE2E2', text: '#991B1B' },
  varies: { label: 'Varies', bg: '#F3F4F6', text: '#374151' },
};

export default function ApartmentLookup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApartmentResource | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return APARTMENT_RESOURCES;
    return APARTMENT_RESOURCES.filter(
      (r) =>
        r.state.toLowerCase().includes(q) ||
        r.code.toLowerCase() === q ||
        r.city.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
    );
  }, [search]);

  if (selected) {
    const tCfg = TYPE_CONFIG[selected.type];
    const aCfg = AVAILABILITY_CONFIG[selected.availability];
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Housing Resource</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={s.homeBtn}>🏠</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          <View style={s.detailHero}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={[s.badge, { backgroundColor: tCfg.bg }]}>
                <Text style={[s.badgeText, { color: tCfg.text }]}>{tCfg.icon} {tCfg.label}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: aCfg.bg }]}>
                <Text style={[s.badgeText, { color: aCfg.text }]}>{aCfg.label}</Text>
              </View>
            </View>
            <Text style={s.detailName}>{selected.name}</Text>
            <Text style={s.detailCity}>{selected.city}</Text>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>📝 About</Text>
            <Text style={s.infoValue}>{selected.description}</Text>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>✅ Eligibility</Text>
            <Text style={s.infoValue}>{selected.eligibility}</Text>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>💰 Funding Source</Text>
            <Text style={s.infoValue}>{selected.fundingSource}</Text>
          </View>

          <View style={s.tipCard}>
            <Text style={s.tipLabel}>📋 How to Apply</Text>
            <Text style={s.tipValue}>{selected.howToApply}</Text>
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
        <Text style={s.headerTitle}>Apartment & Housing Finder</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access all supported housing and apartment resources by state.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>🏠 Housing & Apartment Finder</Text>
        <Text style={s.heroSub}>Find supported living, affordable housing, and independent living options for adults with autism and disabilities.</Text>
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
        {filtered.map((resource) => {
          const tCfg = TYPE_CONFIG[resource.type];
          const aCfg = AVAILABILITY_CONFIG[resource.availability];
          return (
            <TouchableOpacity key={resource.id} style={s.resourceCard} onPress={() => setSelected(resource)} activeOpacity={0.8}>
              <View style={s.resourceCardTop}>
                <View style={[s.typePill, { backgroundColor: tCfg.bg }]}>
                  <Text style={[s.typePillText, { color: tCfg.text }]}>{tCfg.icon} {tCfg.label}</Text>
                </View>
                <View style={[s.availPill, { backgroundColor: aCfg.bg }]}>
                  <Text style={[s.availPillText, { color: aCfg.text }]}>{aCfg.label}</Text>
                </View>
              </View>
              <Text style={s.resourceName}>{resource.name}</Text>
              <Text style={s.resourceCity}>{resource.city}</Text>
              <Text style={s.fundingText}>💰 {resource.fundingSource}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Housing availability changes frequently. Always contact the agency directly to confirm current openings and eligibility requirements.
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

  heroBanner: { backgroundColor: '#1A3C34', padding: SPACING.lg },
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
  resourceCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  resourceCardTop: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typePill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  availPill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  availPillText: { fontSize: 11, fontWeight: '700' },
  resourceName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  resourceCity: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 6 },
  fundingText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },

  disclaimer: { paddingVertical: SPACING.lg },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },

  // Detail
  detailContent: { padding: SPACING.lg, gap: SPACING.md },
  detailHero: {
    backgroundColor: '#1A3C34', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  badge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  detailName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', textAlign: 'center' },
  detailCity: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

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
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1A3C34',
  },
  callBtnText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: '#1A3C34' },

  webBtn: {
    backgroundColor: '#1A3C34', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  webBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#fff' },
});
