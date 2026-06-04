import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type GroupHome = {
  id: string;
  state: string;
  code: string;
  name: string;
  city: string;
  capacity: string;
  supportLevel: 'low' | 'moderate' | 'high' | 'intensive';
  services: string[];
  waitlist: 'open' | 'waitlist' | 'long-waitlist' | 'unknown';
  fundingSource: string;
  phone?: string;
  website?: string;
  howToApply: string;
};

const GROUP_HOMES: GroupHome[] = [
  // California
  { id: 'ca-gh-1', state: 'California', code: 'CA', name: 'CA Community Care Facilities (CCF)', city: 'Statewide, CA', capacity: '6 residents max', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Medication Management', 'Life Skills', 'Community Access'], waitlist: 'long-waitlist', fundingSource: 'DDS Regional Center', phone: '916-654-1987', website: 'https://www.cdss.ca.gov/inforesources/community-care-licensing', howToApply: 'Contact your Regional Center service coordinator. Request placement on the Residential Placement waiting list. Waitlists in CA can be 5-10+ years — apply immediately.' },
  { id: 'ca-gh-2', state: 'California', code: 'CA', name: 'Inland Regional Center Residential Services', city: 'San Bernardino, CA', capacity: 'Varies by home', supportLevel: 'high', services: ['24/7 Support Staff', 'Behavioral Support', 'Medication Management', 'Life Skills'], waitlist: 'long-waitlist', fundingSource: 'DDS Regional Center', phone: '909-890-3000', website: 'https://www.inlandrc.org', howToApply: 'Contact your IRC service coordinator. Request residential placement. Be on the waitlist as early as possible.' },
  // Texas
  { id: 'tx-gh-1', state: 'Texas', code: 'TX', name: 'HHSC HCS Program Group Homes', city: 'Statewide, TX', capacity: '4 residents max', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Medication Management', 'Life Skills', 'Community Integration'], waitlist: 'long-waitlist', fundingSource: 'HCS Waiver', phone: '1-877-787-8999', website: 'https://www.hhs.texas.gov/providers/long-term-services-supports-providers/home-community-based-services', howToApply: 'Apply through HHSC for HCS waiver. Waitlists in TX can be 10+ years. Apply immediately and check status annually.' },
  // Florida
  { id: 'fl-gh-1', state: 'Florida', code: 'FL', name: 'APD Group Home Services', city: 'Statewide, FL', capacity: '6 residents max', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Behavioral Support'], waitlist: 'waitlist', fundingSource: 'APD iBudget Waiver', phone: '1-866-273-2273', website: 'https://apdcares.org/consumers/housing', howToApply: 'Contact your APD area office. Request residential services through the iBudget waiver. Your Support Coordinator will help identify available homes.' },
  // New York
  { id: 'ny-gh-1', state: 'New York', code: 'NY', name: 'OPWDD Individualized Residential Alternative (IRA)', city: 'Statewide, NY', capacity: 'Varies (typically 4-8)', supportLevel: 'high', services: ['24/7 Support Staff', 'Medication Management', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'OPWDD HCBS Waiver', phone: '1-866-946-9733', website: 'https://opwdd.ny.gov/residential-services', howToApply: 'Contact your OPWDD Care Manager. Request placement on the residential waiting list. NY IRA waitlists can be very long — apply at 18.' },
  // Pennsylvania
  { id: 'pa-gh-1', state: 'Pennsylvania', code: 'PA', name: 'ODP Community Homes', city: 'Statewide, PA', capacity: '4-6 residents', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Medication Management'], waitlist: 'waitlist', fundingSource: 'PA ODP Waiver', phone: '1-888-565-9435', website: 'https://www.dhs.pa.gov/Services/Disabilities-Special-Needs/Pages/ODP.aspx', howToApply: 'Contact your county MH/IDD office. Request residential services through ODP. Your Support Coordinator will help identify homes.' },
  // Ohio
  { id: 'oh-gh-1', state: 'Ohio', code: 'OH', name: 'County Board of DD Residential Services', city: 'Statewide, OH', capacity: 'Varies by home', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Health Support'], waitlist: 'open', fundingSource: 'DODD Waiver / County Board', phone: '1-800-617-6733', website: 'https://dodd.ohio.gov/residential-services', howToApply: 'Contact your county DD board. Ohio has 88 county boards — each manages local residential placements.' },
  // Illinois
  { id: 'il-gh-1', state: 'Illinois', code: 'IL', name: 'DHS CILA (Community Integrated Living Arrangement)', city: 'Statewide, IL', capacity: '8 residents max', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Medication Management'], waitlist: 'long-waitlist', fundingSource: 'PUNS Waiver', phone: '1-800-843-6154', website: 'https://www.dhs.state.il.us/page.aspx?item=29737', howToApply: 'Apply for PUNS waiver through IL DHS. CILA waitlists can be very long. Apply immediately and update your PUNS application annually.' },
  // Georgia
  { id: 'ga-gh-1', state: 'Georgia', code: 'GA', name: 'DBHDD Host Home / Group Home Services', city: 'Statewide, GA', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'NOW/COMP Waiver', phone: '1-800-436-7442', website: 'https://dbhdd.georgia.gov/residential-services', howToApply: 'Apply for NOW or COMP waiver through DBHDD. Contact your Support Coordinator for residential placement.' },
  // North Carolina
  { id: 'nc-gh-1', state: 'North Carolina', code: 'NC', name: 'DHHS Innovations Waiver Residential Services', city: 'Statewide, NC', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'Innovations Waiver', phone: '1-800-662-7030', website: 'https://www.ncdhhs.gov/divisions/dma/nc-medicaid/innovations-waiver', howToApply: 'Apply through your Local Management Entity (LME/MCO). NC Innovations Waiver has significant waitlists.' },
  // Michigan
  { id: 'mi-gh-1', state: 'Michigan', code: 'MI', name: 'CMH Residential Services', city: 'Statewide, MI', capacity: 'Varies by home', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Health Support'], waitlist: 'waitlist', fundingSource: 'HCBS Waiver / CMH', phone: '1-800-642-3195', website: 'https://www.michigan.gov/mdhhs/adult-child-serv/disability/residential-services', howToApply: 'Contact your local Community Mental Health (CMH) agency. They manage residential placements in your county.' },
  // Virginia
  { id: 'va-gh-1', state: 'Virginia', code: 'VA', name: 'DBHDS Sponsored Residential / Group Home', city: 'Statewide, VA', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'DD Waiver', phone: '1-800-451-5544', website: 'https://dbhds.virginia.gov/developmental-services/residential-services', howToApply: 'Apply through your Community Services Board (CSB). VA DD waiver residential waitlists can be very long.' },
  // Washington
  { id: 'wa-gh-1', state: 'Washington', code: 'WA', name: 'DDA Residential Services', city: 'Statewide, WA', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Health Support'], waitlist: 'waitlist', fundingSource: 'DDA HCBS Waiver', phone: '1-800-737-0617', website: 'https://www.dshs.wa.gov/dda/residential-services', howToApply: 'Contact your local DDA office. Request residential services through your DDA Case Manager.' },
  // New Jersey
  { id: 'nj-gh-1', state: 'New Jersey', code: 'NJ', name: 'DDD Community Residences', city: 'Statewide, NJ', capacity: '4-8 residents', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'DDD CCP Waiver', phone: '1-800-832-9173', website: 'https://www.nj.gov/humanservices/ddd/home/residential', howToApply: 'Apply through NJ DDD. Community residence waitlists in NJ can be very long. Apply as early as possible.' },
  // Maryland
  { id: 'md-gh-1', state: 'Maryland', code: 'MD', name: 'DDA Residential Services', city: 'Statewide, MD', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Medication Management'], waitlist: 'long-waitlist', fundingSource: 'Community Pathways Waiver', phone: '1-410-767-5600', website: 'https://dda.health.maryland.gov/Pages/Residential_Services.aspx', howToApply: 'Apply through your local DDA office. MD residential waitlists can be very long.' },
  // Colorado
  { id: 'co-gh-1', state: 'Colorado', code: 'CO', name: 'HCBS-DD Residential Services', city: 'Statewide, CO', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'waitlist', fundingSource: 'HCBS-DD Waiver', phone: '1-303-692-2730', website: 'https://hcpf.colorado.gov/dd-waiver', howToApply: 'Apply through your Single Entry Point (SEP) agency. Contact your case manager for residential options.' },
  // Massachusetts
  { id: 'ma-gh-1', state: 'Massachusetts', code: 'MA', name: 'DDS Residential Services', city: 'Statewide, MA', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Access', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'DDS Waiver', phone: '1-617-727-5608', website: 'https://www.mass.gov/dds/residential-services', howToApply: 'Apply through your local DDS Area Office. MA residential waitlists can be very long. Apply at 18.' },
  // Minnesota
  { id: 'mn-gh-1', state: 'Minnesota', code: 'MN', name: 'DHS DD Waiver Residential Services', city: 'Statewide, MN', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Health Support'], waitlist: 'waitlist', fundingSource: 'DD Waiver', phone: '1-651-431-2225', website: 'https://mn.gov/dhs/people-we-serve/adults/services/developmental-disabilities/programs-services/residential-services.jsp', howToApply: 'Contact your county social services. Request residential services through the DD waiver.' },
  // Indiana
  { id: 'in-gh-1', state: 'Indiana', code: 'IN', name: 'BDDS Community Residential Facility', city: 'Statewide, IN', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'waitlist', fundingSource: 'CIH Waiver', phone: '1-800-545-7763', website: 'https://www.in.gov/fssa/ddrs/residential-services', howToApply: 'Apply through your local BDDS office. Request residential placement through your Support Coordinator.' },
  // Arizona
  { id: 'az-gh-1', state: 'Arizona', code: 'AZ', name: 'DDD Group Home Services', city: 'Statewide, AZ', capacity: 'Varies', supportLevel: 'moderate', services: ['24/7 Support Staff', 'Life Skills', 'Community Integration', 'Behavioral Support'], waitlist: 'long-waitlist', fundingSource: 'DDD HCBS Waiver', phone: '1-602-542-0419', website: 'https://des.az.gov/services/developmental-disabilities/residential-services', howToApply: 'Apply through AZ DDD. Contact your Support Coordinator for residential placement options.' },
];

const WAITLIST_CONFIG = {
  open: { label: 'Open', bg: '#D1FAE5', text: '#065F46' },
  waitlist: { label: 'Waitlist', bg: '#FEF3C7', text: '#92400E' },
  'long-waitlist': { label: 'Long Waitlist', bg: '#FEE2E2', text: '#991B1B' },
  unknown: { label: 'Call to Check', bg: '#F3F4F6', text: '#374151' },
};

const SUPPORT_CONFIG = {
  low: { label: 'Low Support', color: '#065F46' },
  moderate: { label: 'Moderate Support', color: '#92400E' },
  high: { label: 'High Support', color: '#1E40AF' },
  intensive: { label: 'Intensive Support', color: '#6B21A8' },
};

export default function GroupHomeFinder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GroupHome | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return GROUP_HOMES;
    return GROUP_HOMES.filter(
      (h) =>
        h.state.toLowerCase().includes(q) ||
        h.code.toLowerCase() === q ||
        h.city.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q)
    );
  }, [search]);

  if (selected) {
    const wCfg = WAITLIST_CONFIG[selected.waitlist];
    const sCfg = SUPPORT_CONFIG[selected.supportLevel];
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Group Home</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={s.homeBtn}>🏠</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          <View style={s.detailHero}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={[s.badge, { backgroundColor: wCfg.bg }]}>
                <Text style={[s.badgeText, { color: wCfg.text }]}>{wCfg.label}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[s.badgeText, { color: sCfg.color }]}>{sCfg.label}</Text>
              </View>
            </View>
            <Text style={s.detailName}>{selected.name}</Text>
            <Text style={s.detailCity}>{selected.city}</Text>
            <Text style={s.detailCapacity}>Capacity: {selected.capacity}</Text>
          </View>

          {selected.waitlist === 'long-waitlist' && (
            <View style={s.warningCard}>
              <Text style={s.warningText}>⚠️ Long waitlists are common for group homes. Apply as early as possible — ideally at age 18 or when your child turns 14. Contact the agency annually to confirm your spot.</Text>
            </View>
          )}

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>🏠 Services Included</Text>
            <View style={s.servicesGrid}>
              {selected.services.map((svc) => (
                <View key={svc} style={s.serviceChip}>
                  <Text style={s.serviceChipText}>{svc}</Text>
                </View>
              ))}
            </View>
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
        <Text style={s.headerTitle}>Group Home Finder</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access group home listings with waitlist status and application guidance.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>🏡 Group Home Finder</Text>
        <Text style={s.heroSub}>Find state-funded group homes for adults with autism and developmental disabilities. Apply early — waitlists can be years long.</Text>
      </View>

      <View style={s.urgencyBanner}>
        <Text style={s.urgencyText}>⏰ Apply as early as age 18. Many states have 5–15 year waitlists for residential placement.</Text>
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
            <Text style={s.emptyTitle}>No results found</Text>
            <Text style={s.emptyText}>Try a different state or contact your state's DD agency directly.</Text>
          </View>
        )}
        {filtered.map((home) => {
          const wCfg = WAITLIST_CONFIG[home.waitlist];
          return (
            <TouchableOpacity
              key={home.id}
              style={s.homeCard}
              onPress={() => setSelected(home)}
              activeOpacity={0.8}
            >
              <View style={s.homeCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.homeName}>{home.name}</Text>
                  <Text style={s.homeCity}>{home.city}</Text>
                </View>
                <View style={[s.waitlistPill, { backgroundColor: wCfg.bg }]}>
                  <Text style={[s.waitlistPillText, { color: wCfg.text }]}>{wCfg.label}</Text>
                </View>
              </View>
              <View style={s.homeCardBottom}>
                <Text style={s.capacityText}>👥 {home.capacity}</Text>
                <Text style={s.fundingText}>💰 {home.fundingSource}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Availability changes frequently. Always contact the agency directly to confirm current openings and waitlist status.
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

  heroBanner: { backgroundColor: '#4A1942', padding: SPACING.lg },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)' },

  urgencyBanner: {
    backgroundColor: '#FEF3C7', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: '#FDE68A',
  },
  urgencyText: { fontSize: FONT_SIZES.sm, color: '#92400E', fontWeight: '600' },

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
  homeCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  homeCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: 8 },
  homeName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  homeCity: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  waitlistPill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  waitlistPillText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  homeCardBottom: { flexDirection: 'row', gap: SPACING.lg },
  capacityText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  fundingText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },

  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', marginTop: 4 },

  disclaimer: { paddingVertical: SPACING.lg },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },

  // Detail
  detailContent: { padding: SPACING.lg, gap: SPACING.md },
  detailHero: {
    backgroundColor: '#4A1942', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  badge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  detailName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', textAlign: 'center' },
  detailCity: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  detailCapacity: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  warningCard: {
    backgroundColor: '#FEF3C7', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  warningText: { fontSize: FONT_SIZES.sm, color: '#92400E', lineHeight: 20 },

  infoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: {
    backgroundColor: '#F5F3FF', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  serviceChipText: { fontSize: FONT_SIZES.xs, color: '#4A1942', fontWeight: '500' },

  tipCard: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#92400E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipValue: { fontSize: FONT_SIZES.sm, color: '#78350F', lineHeight: 20 },

  callBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#4A1942',
  },
  callBtnText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: '#4A1942' },

  webBtn: {
    backgroundColor: '#4A1942', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  webBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#fff' },
});
