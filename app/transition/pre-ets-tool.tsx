import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type PreEtsState = {
  state: string;
  code: string;
  vrAgency: string;
  vrPhone: string;
  vrWebsite: string;
  applyAge: string;
  services: string[];
  eligibilityNote: string;
  applicationTip: string;
  waitlistNote?: string;
};

const PREETS_DATA: PreEtsState[] = [
  { state: 'Alabama', code: 'AL', vrAgency: 'Alabama Department of Rehabilitation Services', vrPhone: '1-800-441-7607', vrWebsite: 'https://www.rehab.alabama.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Must be a student with a disability age 14-21 who is eligible or potentially eligible for VR services.', applicationTip: 'Apply early — Pre-ETS services can begin before formal VR eligibility determination. Bring your IEP.', waitlistNote: 'Some areas have waitlists. Apply at 14 to get ahead.' },
  { state: 'Alaska', code: 'AK', vrAgency: 'Alaska Division of Vocational Rehabilitation', vrPhone: '1-800-478-2815', vrWebsite: 'https://labor.alaska.gov/dvr', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Available to students with disabilities ages 14-21 in secondary education.', applicationTip: 'Alaska VR has strong relationships with school districts. Ask your IEP team to refer you directly.', },
  { state: 'Arizona', code: 'AZ', vrAgency: 'Arizona Rehabilitation Services Administration', vrPhone: '1-800-563-1221', vrWebsite: 'https://des.az.gov/services/employment/rehabilitation', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education ages 14-21.', applicationTip: 'AZ RSA partners with schools. Request a Pre-ETS referral at your next IEP meeting.', },
  { state: 'Arkansas', code: 'AR', vrAgency: 'Arkansas Rehabilitation Services', vrPhone: '1-800-330-0632', vrWebsite: 'https://ars.arkansas.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Must be a student with a disability in secondary school, age 14-21.', applicationTip: 'ARS has school-based VR counselors in many districts. Ask your special ed coordinator.', },
  { state: 'California', code: 'CA', vrAgency: 'California Department of Rehabilitation', vrPhone: '1-800-952-5544', vrWebsite: 'https://www.dor.ca.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning Experiences', 'Counseling on Post-Secondary Education Options', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Available to students with disabilities ages 14-21 in secondary education. No formal VR eligibility required to start Pre-ETS.', applicationTip: 'CA DOR has dedicated Student Services Coordinators. Contact your local DOR office and ask specifically for Pre-ETS services. Bring your IEP or 504 plan.', waitlistNote: 'High demand in urban areas. Apply at 14.' },
  { state: 'Colorado', code: 'CO', vrAgency: 'Colorado Division of Vocational Rehabilitation', vrPhone: '1-888-480-4861', vrWebsite: 'https://dvr.colorado.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'CO DVR has strong school partnerships. Ask your IEP team to initiate a VR referral at age 14.', },
  { state: 'Connecticut', code: 'CT', vrAgency: 'Bureau of Rehabilitation Services', vrPhone: '1-800-537-2549', vrWebsite: 'https://portal.ct.gov/brs', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'CT BRS has transition specialists. Request a referral through your school\'s special education department.', },
  { state: 'Delaware', code: 'DE', vrAgency: 'Delaware Division of Vocational Rehabilitation', vrPhone: '302-761-8275', vrWebsite: 'https://dvr.delawareworks.com', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'Delaware is small — DVR counselors often attend IEP meetings. Ask your school to invite them.', },
  { state: 'Florida', code: 'FL', vrAgency: 'Florida Division of Vocational Rehabilitation', vrPhone: '1-800-451-4327', vrWebsite: 'https://www.rehabworks.org', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'FL DVR has school-based VR counselors in many districts. Ask your IEP coordinator for a referral.', waitlistNote: 'Order of Selection may apply. Apply early.' },
  { state: 'Georgia', code: 'GA', vrAgency: 'Georgia Vocational Rehabilitation Agency', vrPhone: '1-844-367-4872', vrWebsite: 'https://gvra.georgia.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'GVRA has transition specialists. Request a referral through your school\'s special education team.', },
  { state: 'Illinois', code: 'IL', vrAgency: 'Illinois Division of Rehabilitation Services', vrPhone: '1-800-843-6154', vrWebsite: 'https://www.dhs.state.il.us/page.aspx?item=29737', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'IL DRS has school-based counselors. Ask your IEP team to initiate a referral at age 14.', },
  { state: 'Indiana', code: 'IN', vrAgency: 'Indiana Vocational Rehabilitation Services', vrPhone: '1-800-545-7763', vrWebsite: 'https://www.in.gov/fssa/ddrs/5451.htm', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'IN VR has strong school partnerships. Request a Pre-ETS referral at your IEP meeting.', },
  { state: 'Iowa', code: 'IA', vrAgency: 'Iowa Vocational Rehabilitation Services', vrPhone: '1-800-532-1486', vrWebsite: 'https://ivrs.iowa.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'Iowa VRS has transition specialists in most school districts. Ask your IEP team.', },
  { state: 'Kansas', code: 'KS', vrAgency: 'Kansas Vocational Rehabilitation Services', vrPhone: '1-888-369-4777', vrWebsite: 'https://www.dcf.ks.gov/services/RS/Pages/VocationalRehabilitation.aspx', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'Request a VR referral through your school\'s special education coordinator.', },
  { state: 'Kentucky', code: 'KY', vrAgency: 'Kentucky Office of Vocational Rehabilitation', vrPhone: '1-800-372-7172', vrWebsite: 'https://ovr.ky.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'KY OVR has school-based counselors. Ask your IEP team to invite them to your transition meeting.', },
  { state: 'Maryland', code: 'MD', vrAgency: 'Maryland Division of Rehabilitation Services (DORS)', vrPhone: '1-888-554-0334', vrWebsite: 'https://dors.maryland.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'MD DORS has school-based VR counselors. Ask your IEP team to initiate a referral.', },
  { state: 'Massachusetts', code: 'MA', vrAgency: 'Massachusetts Rehabilitation Commission', vrPhone: '1-800-245-6543', vrWebsite: 'https://www.mass.gov/mrc', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'MRC has strong school partnerships. Request a referral at your IEP meeting at age 14.', },
  { state: 'Michigan', code: 'MI', vrAgency: 'Michigan Rehabilitation Services', vrPhone: '1-800-605-6722', vrWebsite: 'https://www.michigan.gov/leo/bureaus-agencies/wd/mrs', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'MRS has school-based counselors. Ask your IEP team to initiate a Pre-ETS referral.', },
  { state: 'Minnesota', code: 'MN', vrAgency: 'Minnesota Vocational Rehabilitation Services', vrPhone: '1-800-328-9095', vrWebsite: 'https://mn.gov/deed/job-seekers/disabilities/vrs', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'MN VRS has strong school partnerships. Request a referral through your IEP team.', },
  { state: 'New Jersey', code: 'NJ', vrAgency: 'New Jersey Division of Vocational Rehabilitation Services', vrPhone: '1-609-292-5987', vrWebsite: 'https://www.nj.gov/labor/career-services/special-services/vocational-rehabilitation', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'NJ DVRS has school-based counselors. Ask your IEP team to initiate a referral at age 14.', },
  { state: 'New York', code: 'NY', vrAgency: 'New York State Office of Adult Career and Continuing Education Services (ACCES-VR)', vrPhone: '1-800-222-JOBS', vrWebsite: 'https://www.acces.nysed.gov/vr', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'NY ACCES-VR has district offices statewide. Request a referral through your school\'s special education coordinator.', waitlistNote: 'High demand in NYC metro. Apply at 14.' },
  { state: 'North Carolina', code: 'NC', vrAgency: 'North Carolina Division of Vocational Rehabilitation Services', vrPhone: '1-888-234-6400', vrWebsite: 'https://www.ncdhhs.gov/divisions/dvrs', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'NC DVRS has school-based counselors. Ask your IEP team to initiate a referral.', },
  { state: 'Ohio', code: 'OH', vrAgency: 'Ohio Opportunities for Ohioans with Disabilities (OOD)', vrPhone: '1-800-282-4536', vrWebsite: 'https://ood.ohio.gov', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'OOD has school-based counselors in many districts. Ask your IEP team to initiate a Pre-ETS referral at age 14.', },
  { state: 'Pennsylvania', code: 'PA', vrAgency: 'Pennsylvania Office of Vocational Rehabilitation', vrPhone: '1-800-442-6351', vrWebsite: 'https://www.dli.pa.gov/Individuals/Disability-Services/ovr', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'PA OVR has school-based counselors. Ask your IEP team to initiate a referral at age 14.', },
  { state: 'Texas', code: 'TX', vrAgency: 'Texas Workforce Commission Vocational Rehabilitation', vrPhone: '1-800-628-5115', vrWebsite: 'https://twc.texas.gov/vocational-rehabilitation', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'TX VR has school-based counselors statewide. Ask your IEP team to initiate a Pre-ETS referral.', waitlistNote: 'Order of Selection may apply. Apply at 14.' },
  { state: 'Virginia', code: 'VA', vrAgency: 'Virginia Department of Aging and Rehabilitative Services (DARS)', vrPhone: '1-800-552-5019', vrWebsite: 'https://www.vadars.org', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities in secondary education, ages 14-21.', applicationTip: 'VA DARS has school-based counselors. Ask your IEP team to initiate a referral at age 14.', },
  { state: 'Washington', code: 'WA', vrAgency: 'Washington Division of Vocational Rehabilitation', vrPhone: '1-800-637-5627', vrWebsite: 'https://www.dshs.wa.gov/dvr', applyAge: '14+', services: ['Job Exploration Counseling', 'Work-Based Learning', 'Counseling on Post-Secondary Education', 'Workplace Readiness Training', 'Self-Advocacy Instruction'], eligibilityNote: 'Students with disabilities ages 14-21 in secondary education.', applicationTip: 'WA DVR has school-based counselors. Request a referral through your IEP team.', },
];

const SERVICE_ICONS: Record<string, string> = {
  'Job Exploration Counseling': '🔍',
  'Work-Based Learning': '💼',
  'Work-Based Learning Experiences': '💼',
  'Counseling on Post-Secondary Education': '🎓',
  'Counseling on Post-Secondary Education Options': '🎓',
  'Workplace Readiness Training': '🛠️',
  'Self-Advocacy Instruction': '📣',
};

export default function PreEtsTool() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PreEtsState | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PREETS_DATA;
    return PREETS_DATA.filter(
      (s) => s.state.toLowerCase().includes(q) || s.code.toLowerCase() === q
    );
  }, [search]);

  if (selected) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Pre-ETS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={s.homeBtn}>🏠</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          <View style={s.detailHero}>
            <Text style={s.detailState}>{selected.state}</Text>
            <Text style={s.detailAgency}>{selected.vrAgency}</Text>
            <View style={s.ageBadge}>
              <Text style={s.ageBadgeText}>Apply at {selected.applyAge}</Text>
            </View>
          </View>

          {selected.waitlistNote && (
            <View style={s.warningCard}>
              <Text style={s.warningText}>⚠️ {selected.waitlistNote}</Text>
            </View>
          )}

          <Text style={s.sectionTitle}>5 Required Pre-ETS Services</Text>
          {selected.services.map((svc) => (
            <View key={svc} style={s.serviceCard}>
              <Text style={s.serviceIcon}>{SERVICE_ICONS[svc] ?? '✅'}</Text>
              <Text style={s.serviceText}>{svc}</Text>
            </View>
          ))}

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>✅ Who Qualifies</Text>
            <Text style={s.infoValue}>{selected.eligibilityNote}</Text>
          </View>

          <View style={s.tipCard}>
            <Text style={s.tipLabel}>💡 Application Tip</Text>
            <Text style={s.tipValue}>{selected.applicationTip}</Text>
          </View>

          <TouchableOpacity
            style={s.vrBtn}
            onPress={() => Linking.openURL(selected.vrWebsite)}
          >
            <Text style={s.vrBtnText}>Visit {selected.vrAgency.split(' ').slice(0, 3).join(' ')} →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL(`tel:${selected.vrPhone}`)}
          >
            <Text style={s.callBtnText}>📞 Call {selected.vrPhone}</Text>
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
        <Text style={s.headerTitle}>Pre-ETS Tool</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access all state VR agencies and Pre-ETS application tips.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>🎓 Pre-Employment Transition Services</Text>
        <Text style={s.heroSub}>Free services for students with disabilities ages 14–21. Find your state's VR agency and how to apply.</Text>
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoBoxText}>
          Pre-ETS are <Text style={{ fontWeight: '700' }}>5 required services</Text> funded by the Rehabilitation Act. Your state's Vocational Rehabilitation (VR) agency must provide them — at no cost — to any student with a disability in secondary school.
        </Text>
      </View>

      <View style={s.nearMeRow}>
        <NearMeButton onStateDetected={(code) => {
          const match = PREETS_DATA.find((s) => s.code === code);
          if (match) setSelected(match);
          else setSearch(code);
        }} />
        <Text style={s.orText}>or search below</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search your state..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </View>

      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.code}
            style={s.stateCard}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <View style={s.stateCardLeft}>
              <View style={s.codeChip}>
                <Text style={s.codeText}>{item.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stateName}>{item.state}</Text>
                <Text style={s.agencyName} numberOfLines={1}>{item.vrAgency}</Text>
              </View>
            </View>
            <View style={s.stateCardRight}>
              {item.waitlistNote && <Text style={s.waitlistBadge}>⚠️ Waitlist</Text>}
              <Text style={s.applyAge}>Apply at {item.applyAge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
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

  heroBanner: {
    backgroundColor: '#1A7A8A', padding: SPACING.lg,
  },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)' },

  infoBox: {
    backgroundColor: '#DCEEFF', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: '#BFDBFE',
  },
  infoBoxText: { fontSize: FONT_SIZES.sm, color: '#1E40AF', lineHeight: 20 },

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
  stateCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  stateCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  codeChip: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: '#DCEEFF', alignItems: 'center', justifyContent: 'center',
  },
  codeText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1A7A8A' },
  stateName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  agencyName: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  stateCardRight: { alignItems: 'flex-end', gap: 4 },
  waitlistBadge: { fontSize: FONT_SIZES.xs, color: '#92400E' },
  applyAge: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#1A7A8A' },

  // Detail view
  detailContent: { padding: SPACING.lg, gap: SPACING.md },
  detailHero: {
    backgroundColor: '#1A7A8A', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  detailState: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: '#fff' },
  detailAgency: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  ageBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: 4, marginTop: 8,
  },
  ageBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },

  warningCard: {
    backgroundColor: '#FEF3C7', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  warningText: { fontSize: FONT_SIZES.sm, color: '#92400E' },

  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  serviceIcon: { fontSize: 20 },
  serviceText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, flex: 1 },

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

  vrBtn: {
    backgroundColor: '#1A7A8A', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center',
  },
  vrBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#fff' },

  callBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#1A7A8A',
  },
  callBtnText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: '#1A7A8A' },
});
