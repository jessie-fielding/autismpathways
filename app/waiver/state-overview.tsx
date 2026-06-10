import { useEffect, useMemo, useState } from 'react';
import {
  Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import waiverData from '../../data/waiver-data.json';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveChild } from '../../services/childManager';

type WaiverEntry = { name: string; covers?: string[]; note?: string };
type CountyEntry = { countyDisplay: string };
type StateData = {
  stateName: string;
  stateOverview: { title: string; body: string } | null;
  counties: Record<string, CountyEntry>;
};

// ─── Journey Stepper ──────────────────────────────────────────────────────────
function JourneyStepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { label: 'State' },
    { label: 'Overview' },
    { label: 'County' },
  ];
  return (
    <View style={stepStyles.container}>
      {steps.map((s, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <View key={i} style={stepStyles.stepWrap}>
            <View style={[stepStyles.circle, done && stepStyles.circleDone, active && stepStyles.circleActive]}>
              {done
                ? <Text style={stepStyles.checkmark}>✓</Text>
                : <Text style={[stepStyles.stepNum, active && stepStyles.stepNumActive]}>{num}</Text>
              }
            </View>
            <Text style={[stepStyles.label, active && stepStyles.labelActive]}>{s.label}</Text>
            {i < steps.length - 1 && (
              <View style={[stepStyles.line, done && stepStyles.lineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}
const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  circleDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  circleActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  stepNumActive: { color: COLORS.white },
  label: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginLeft: 4, fontWeight: '500' },
  labelActive: { color: COLORS.purple, fontWeight: '700' },
  line: { width: 32, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  lineDone: { backgroundColor: COLORS.teal },
});

// ─── Qualification Badge ──────────────────────────────────────────────────────
type QualGrade = 'strong' | 'possible' | 'check';
function getQualGrade(waiverName: string, diagnosisLevel: string, ageYears: number): QualGrade {
  const name = waiverName.toLowerCase();
  if (name.includes('hcbs') || name.includes('idd') || name.includes('developmental') || name.includes('autism') || name.includes('home and community')) {
    if (diagnosisLevel === '2' || diagnosisLevel === '3') return 'strong';
    if (diagnosisLevel === '1') return 'possible';
  }
  if (name.includes('class') || name.includes('related condition')) {
    return (diagnosisLevel === '2' || diagnosisLevel === '3') ? 'strong' : 'possible';
  }
  if (name.includes('child') || name.includes('kids')) {
    return ageYears < 18 ? (diagnosisLevel ? 'strong' : 'possible') : 'check';
  }
  return 'possible';
}
function QualBadge({ grade }: { grade: QualGrade }) {
  const config = {
    strong: { bg: COLORS.successBg, border: COLORS.successBorder, text: COLORS.successText, label: 'Strong Match' },
    possible: { bg: COLORS.warningBg, border: COLORS.warningBorder, text: COLORS.warningText, label: 'Possible Match' },
    check: { bg: COLORS.infoBg, border: COLORS.infoBorder, text: COLORS.infoText, label: 'Verify Eligibility' },
  }[grade];
  return (
    <View style={[qualStyles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[qualStyles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}
const qualStyles = StyleSheet.create({
  badge: { borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, alignSelf: 'flex-start', marginTop: 6 },
  text: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
});

// ─── Waitlist Bar ─────────────────────────────────────────────────────────────
function WaitlistBar({ label, years }: { label: string; years: number }) {
  const max = 12;
  const pct = Math.min(years / max, 1);
  const color = years >= 8 ? COLORS.errorText : years >= 4 ? '#a07800' : COLORS.successText;
  return (
    <View style={waitStyles.row}>
      <Text style={waitStyles.label} numberOfLines={1}>{label}</Text>
      <View style={waitStyles.track}>
        <View style={[waitStyles.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[waitStyles.value, { color }]}>{years}+ yrs</Text>
    </View>
  );
}
const waitStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  label: { width: 90, fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '500' },
  track: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  value: { width: 44, fontSize: FONT_SIZES.xs, fontWeight: '700', textAlign: 'right' },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseWaivers(body: string, stateName: string): WaiverEntry[] {
  const waivers: WaiverEntry[] = [];
  const seen = new Set<string>();
  const pat = /([A-Z][A-Za-z\s\-()/]{3,60}[Ww]aiver[^.]*)\./g;
  let m;
  while ((m = pat.exec(body)) !== null) {
    const name = m[1].replace(/\.$/, '').trim();
    if (name.length > 5 && name.length < 120 && !seen.has(name)) {
      seen.add(name);
      waivers.push({ name, covers: [], note: '' });
    }
  }
  if (waivers.length === 0) {
    waivers.push({
      name: `${stateName} HCBS Waiver`,
      covers: ['residential support', 'day services', 'respite', 'behavioral support'],
      note: 'Contact your local DD agency to apply',
    });
  }
  return waivers.slice(0, 4);
}

const WAITLIST_DATA: Record<string, { waiver: string; years: number }[]> = {
  TX: [{ waiver: 'HCS', years: 10 }, { waiver: 'TxHmL', years: 7 }],
  CA: [{ waiver: 'Regional Center', years: 2 }, { waiver: 'HCBS', years: 5 }],
  FL: [{ waiver: 'iBudget', years: 8 }, { waiver: 'Medicaid Waiver', years: 6 }],
  CO: [{ waiver: 'Supported Living', years: 9 }, { waiver: "Children's Extensive", years: 5 }],
  NY: [{ waiver: 'OPWDD HCBS', years: 3 }, { waiver: 'Care at Home', years: 4 }],
  IL: [{ waiver: 'PUNS/DD Waiver', years: 10 }, { waiver: 'CILA', years: 8 }],
  PA: [{ waiver: 'ODP Waiver', years: 7 }, { waiver: 'Consolidated', years: 9 }],
  OH: [{ waiver: 'Level 1', years: 6 }, { waiver: 'SELF', years: 4 }],
  GA: [{ waiver: 'NOW', years: 10 }, { waiver: 'COMP', years: 12 }],
  NC: [{ waiver: 'CAP/C', years: 5 }, { waiver: 'Innovations', years: 8 }],
};

const STATE_FALLBACK_URLS: Record<string, string> = {
  TX: 'https://www.hhs.texas.gov/providers/long-term-care-providers/home-community-based-services-providers/hcs-program',
  CA: 'https://www.dds.ca.gov/services/home-community-based-services/',
  FL: 'https://apdcares.org/waiver/',
  CO: 'https://hcpf.colorado.gov/long-term-services-and-supports',
  NY: 'https://opwdd.ny.gov/apply-for-services',
  IL: 'https://www.dhs.state.il.us/page.aspx?item=29753',
  PA: 'https://www.dhs.pa.gov/Services/Disabilities-Special-Needs/Pages/Intellectual-Disabilities.aspx',
  OH: 'https://dodd.ohio.gov/services-and-supports/waiver-services',
  GA: 'https://dbhdd.georgia.gov/apply-services',
  NC: 'https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services',
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function StateOverviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string }>();
  const { child: activeChild } = useActiveChild();
  const [stateAbbr, setStateAbbr] = useState(params.state || '');
  const [expandedOverview, setExpandedOverview] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('ap_waiver_progress').then(cur => {
      if (parseInt(cur || '0', 10) < 2) AsyncStorage.setItem('ap_waiver_progress', '2');
    });
    if (!params.state) {
      AsyncStorage.getItem('ap_state').then(val => { if (val) setStateAbbr(val); });
    }
  }, []);

  const data = stateAbbr ? (waiverData as Record<string, StateData>)[stateAbbr] : null;
  const diagnosisLevel = (activeChild as any)?.diagnosisLevel || '';
  const ageYears = useMemo(() => {
    const dob = (activeChild as any)?.dob;
    if (!dob) return 8;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  }, [(activeChild as any)?.dob]);

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← States</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
          <View style={{ width: 80 }} />
        </View>
        <JourneyStepper step={2} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No data found for this state.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Choose a state</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const counties = Object.entries(data.counties)
    .map(([key, c]) => ({ key, display: c.countyDisplay }))
    .sort((a, b) => a.display.localeCompare(b.display));

  const overview = data.stateOverview;
  const waivers = overview ? parseWaivers(overview.body, data.stateName) : [];
  const overviewText = overview?.body || '';
  const shortOverview = overviewText.length > 280 ? overviewText.slice(0, 280) + '...' : overviewText;
  const waitlistData = WAITLIST_DATA[stateAbbr] || null;
  const fallbackUrl = STATE_FALLBACK_URLS[stateAbbr] || 'https://www.medicaid.gov/medicaid/home-community-based-services/index.html';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← States</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Journey Stepper */}
      <JourneyStepper step={2} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* State banner */}
        <View style={styles.stateBanner}>
          <View style={styles.stateAbbrBadge}>
            <Text style={styles.stateAbbrText}>{stateAbbr}</Text>
          </View>
          <Text style={styles.stateTitle}>{data.stateName}</Text>
          <Text style={styles.stateSub}>Medicaid Waiver & DD Services Overview</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}><Text style={styles.chipText}>🏛️ DD Waiver Program</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📋 {counties.length} Counties</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>⚠️ Waitlists Apply</Text></View>
          </View>
        </View>

        {/* Overview card */}
        {overview && (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>📖 STATE OVERVIEW</Text>
            <Text style={styles.cardTitle}>{overview.title}</Text>
            <Text style={styles.cardBody}>{expandedOverview ? overviewText : shortOverview}</Text>
            {overviewText.length > 280 && (
              <TouchableOpacity onPress={() => setExpandedOverview(!expandedOverview)}>
                <Text style={styles.readMore}>{expandedOverview ? 'Show less ↑' : 'Read more ↓'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Available Waivers with Qualification Match */}
        {waivers.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>AVAILABLE WAIVERS</Text>
            <Text style={styles.sectionSub}>
              {diagnosisLevel
                ? `Match grades based on ${activeChild?.name || 'your child'}'s profile (Level ${diagnosisLevel}, age ${ageYears}).`
                : 'Complete your child\'s profile for personalized match grades.'}
            </Text>
            {waivers.map((waiver, i) => {
              const grade = diagnosisLevel ? getQualGrade(waiver.name, diagnosisLevel, ageYears) : null;
              return (
                <View key={i} style={styles.waiverCard}>
                  <View style={styles.waiverHeader}>
                    <View style={styles.waiverIconWrap}>
                      <Text style={styles.waiverIcon}>📋</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.waiverName}>{waiver.name}</Text>
                      {grade && <QualBadge grade={grade} />}
                    </View>
                  </View>
                  {waiver.covers && waiver.covers.length > 0 && (
                    <View style={styles.coverChips}>
                      {waiver.covers.map(c => (
                        <View key={c} style={styles.coverChip}>
                          <Text style={styles.coverChipText}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {waiver.note ? <Text style={styles.waiverNote}>{waiver.note}</Text> : null}
                </View>
              );
            })}
          </>
        )}

        {/* Estimated Waitlist Times */}
        {waitlistData && (
          <>
            <Text style={styles.sectionHeading}>ESTIMATED WAITLIST TIME</Text>
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>⏳ BASED ON CURRENT STATE DATA</Text>
              {waitlistData.map((w, i) => (
                <WaitlistBar key={i} label={w.waiver} years={w.years} />
              ))}
              <Text style={styles.waitlistNote}>
                Waitlist times vary by county and change frequently. Apply as early as possible.
              </Text>
            </View>
          </>
        )}

        {/* Apply early callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutIcon}>⚠️</Text>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutBold}>Apply as early as possible.</Text>
            {' '}Waitlists for DD waivers can range from 2 to 10+ years. Getting on the list early is one of the most important steps you can take.
          </Text>
        </View>

        {/* Fallback / Missing County */}
        <View style={styles.fallbackCard}>
          <Text style={styles.fallbackTitle}>Don't see your county?</Text>
          <Text style={styles.fallbackBody}>
            Every family in {data.stateName} has a path forward. Use the statewide resource below to connect with your local DD agency directly.
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={() => Linking.openURL(fallbackUrl)}
          >
            <Text style={styles.fallbackBtnText}>🌐 {data.stateName} Statewide Resource →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => Linking.openURL(`mailto:contact@autismpathways.app?subject=Missing County&body=State: ${stateAbbr}%0ACounty: `)}
          >
            <Text style={styles.reportBtnText}>📩 Report a missing county</Text>
          </TouchableOpacity>
        </View>

        {/* Find My County CTA */}
        <TouchableOpacity
          style={styles.findCountyBtn}
          onPress={() => router.push({ pathname: '/waiver/county-picker', params: { state: stateAbbr } })}
          activeOpacity={0.85}
        >
          <Text style={styles.findCountyBtnText}>📍 Find My County Agency →</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Agency information is provided as a starting point. Always verify current details directly with your local office.
          </Text>
        </View>
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
  stateBanner: {
    backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl, alignItems: 'center',
  },
  stateAbbrBadge: {
    width: 56, height: 56, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.sm,
  },
  stateAbbrText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  stateTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  stateSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  chipRow: { flexDirection: 'row', marginTop: SPACING.md, gap: SPACING.xs, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  chipText: { fontSize: FONT_SIZES.xs, color: COLORS.white, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md, ...SHADOWS.sm,
  },
  cardEyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, marginBottom: 4 },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  cardBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  readMore: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: SPACING.sm },
  sectionHeading: {
    fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.8,
    marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.xs,
  },
  sectionSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, lineHeight: 18 },
  waiverCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.teal, ...SHADOWS.sm,
  },
  waiverHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  waiverIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center',
  },
  waiverIcon: { fontSize: 18 },
  waiverName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  coverChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.sm },
  coverChip: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  coverChipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  waiverNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.xs, fontStyle: 'italic' },
  waitlistNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.sm, fontStyle: 'italic', lineHeight: 16 },
  callout: {
    flexDirection: 'row', backgroundColor: COLORS.warningBg, borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md,
    gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  calloutIcon: { fontSize: 18 },
  calloutText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  calloutBold: { fontWeight: '700' },
  fallbackCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.tealAccent, ...SHADOWS.sm,
  },
  fallbackTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  fallbackBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.sm },
  fallbackBtn: {
    backgroundColor: COLORS.mint, borderRadius: RADIUS.sm,
    padding: SPACING.sm, alignItems: 'center', marginBottom: SPACING.xs,
  },
  fallbackBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.teal, fontWeight: '700' },
  reportBtn: { padding: SPACING.xs, alignItems: 'center' },
  reportBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '500' },
  findCountyBtn: {
    marginHorizontal: SPACING.md, marginTop: SPACING.lg, padding: SPACING.md + 2,
    backgroundColor: COLORS.purple, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOWS.sm,
  },
  findCountyBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  disclaimer: {
    marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md,
    backgroundColor: '#f8f8f8', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 16, textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, marginBottom: SPACING.md },
  backLink: { padding: SPACING.sm },
  backLinkText: { color: COLORS.purple, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
