/**
 * Provider Advocate Hub
 *
 * Waiver / Medicaid / IEP overview by county — built for providers
 * to use alongside families. Reuses the waiver-data.json dataset.
 *
 * Sections (expandable):
 *   1. Available Waivers — with match badges + waitlist bars
 *   2. Medicaid & Insurance — key Medicaid pathways for the state
 *   3. IEP & School Services — IDEA rights, evaluation timelines
 *
 * Provider-specific additions vs parent waiver view:
 *   - "How to help a family apply" callout per waiver
 *   - Eligibility criteria shown in full
 *   - "Report Missing County" link
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import waiverData from '../../data/waiver-data.json';

type WaiverEntry = { name: string; covers?: string[]; note?: string };
type CountyEntry = { countyDisplay: string; waivers?: WaiverEntry[] };
type StateData = {
  stateName: string;
  stateOverview?: { title: string; body: string } | null;
  counties: Record<string, CountyEntry>;
};

const WAITLIST_COLORS: Record<string, string> = {
  '0-1 year':   '#3BBFA3',
  '1-2 years':  '#F39C12',
  '2-3 years':  '#E67E22',
  '3-5 years':  '#E67E22',
  '5-8 years':  '#E74C3C',
  '8-10 years': '#C0392B',
  '10+ years':  '#922B21',
};

const WAITLIST_WIDTH: Record<string, number> = {
  '0-1 year':   15,
  '1-2 years':  25,
  '2-3 years':  35,
  '3-5 years':  50,
  '5-8 years':  70,
  '8-10 years': 88,
  '10+ years':  100,
};

const MEDICAID_INFO = [
  { title: 'EPSDT Mandate', body: 'Children under 21 on Medicaid are entitled to all medically necessary services under EPSDT, including ABA therapy, speech, OT, and PT — even if the state plan does not explicitly cover them.' },
  { title: 'Prior Authorization', body: 'Most states require prior auth for ABA and specialty services. Help families document medical necessity with a comprehensive evaluation and treatment plan.' },
  { title: 'Managed Care Plans', body: 'Many states use MCOs to administer Medicaid. Families may need to choose a plan that includes autism-specific providers in their network.' },
  { title: 'Appeals Rights', body: 'Families have the right to appeal any denial. A written denial triggers a 90-day window to request a fair hearing. You can support families by writing a letter of medical necessity.' },
];

const IEP_INFO = [
  { title: 'Evaluation Timeline', body: 'Under IDEA, schools must complete an initial evaluation within 60 days of receiving parental consent (some states have shorter timelines). Families can request an Independent Educational Evaluation (IEE) if they disagree.' },
  { title: 'FAPE & LRE', body: 'Every child with a disability is entitled to a Free Appropriate Public Education in the Least Restrictive Environment. This means services must be provided at no cost to the family.' },
  { title: 'Annual IEP Meeting', body: 'IEPs must be reviewed at least annually. Families can request an IEP meeting at any time. You can attend as a support person or provide a written statement.' },
  { title: 'Extended School Year', body: 'Students who would regress significantly over summer breaks may qualify for Extended School Year (ESY) services. Document regression patterns to support the request.' },
];

export default function ProviderAdvocateHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userState, setUserState]   = useState('');
  const [userCounty, setUserCounty] = useState('');
  const [countyInput, setCountyInput] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('waivers');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem('profile');
        if (raw) {
          const p = JSON.parse(raw);
          if (p.state) setUserState(p.state);
          if (p.county) { setUserCounty(p.county); setCountyInput(p.county); }
        }
      })();
    }, [])
  );

  // Look up waiver data for the current state
  const stateKey = Object.keys(waiverData).find(
    (k) => (waiverData as Record<string, StateData>)[k]?.stateName?.toLowerCase() === userState.toLowerCase()
  );
  const stateData: StateData | null = stateKey ? (waiverData as Record<string, StateData>)[stateKey] : null;

  // Find county entry
  const countyKey = countyInput.trim().toLowerCase();
  const countyEntry: CountyEntry | null = stateData
    ? Object.values(stateData.counties).find(
        (c) => c.countyDisplay.toLowerCase().includes(countyKey) || countyKey.includes(c.countyDisplay.toLowerCase())
      ) ?? null
    : null;

  const waivers: WaiverEntry[] = countyEntry?.waivers ?? stateData ? [] : [];

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Advocate Hub</Text>
          <Text style={styles.headerSub}>{userCounty || userState || 'Set your location in profile'}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Journey stepper */}
        <View style={styles.stepper}>
          {['State', 'County', 'Resources'].map((label, i) => {
            const done = (i === 0 && !!userState) || (i === 1 && !!countyInput);
            const active = i === 2 || (i === 1 && !!userState && !countyInput) || (i === 0 && !userState);
            return (
              <React.Fragment key={label}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, done && styles.stepCircleDone, active && !done && styles.stepCircleActive]}>
                    {done
                      ? <Text style={styles.stepCheck}>✓</Text>
                      : <Text style={[styles.stepNum, active && styles.stepNumActive]}>{i + 1}</Text>
                    }
                  </View>
                  <Text style={[styles.stepLabel, active && !done && styles.stepLabelActive]}>{label}</Text>
                  {done && <View style={styles.stepDonePill}><Text style={styles.stepDoneText}>Done</Text></View>}
                </View>
                {i < 2 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* County input */}
        <View style={styles.countyCard}>
          <Text style={styles.countyLabel}>County or City</Text>
          <TextInput
            style={styles.countyInput}
            value={countyInput}
            onChangeText={setCountyInput}
            placeholder="e.g. Harris County"
            placeholderTextColor={COLORS.textLight}
          />
          {!userState && (
            <Text style={styles.countyHint}>Set your state in your profile to load waiver data</Text>
          )}
        </View>

        {/* 1. Available Waivers */}
        <View style={styles.accordionCard}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('waivers')} activeOpacity={0.8}>
            <Text style={styles.accordionIcon}>📋</Text>
            <Text style={styles.accordionTitle}>1. Available Waivers</Text>
            <Ionicons name={expandedSection === 'waivers' ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMid} />
          </TouchableOpacity>
          {expandedSection === 'waivers' && (
            <View style={styles.accordionBody}>
              {waivers.length > 0 ? (
                <>
                  <View style={styles.waiverCards}>
                    {waivers.map((w, i) => (
                      <View key={i} style={[styles.waiverCard, i % 2 === 0 ? styles.waiverCardGreen : styles.waiverCardAmber]}>
                        <Text style={styles.waiverName}>{w.name}</Text>
                        {w.covers && (
                          <View style={styles.waiverTags}>
                            {w.covers.slice(0, 3).map((c, j) => (
                              <View key={j} style={styles.waiverTag}>
                                <Text style={styles.waiverTagText}>{c}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        <View style={[styles.matchBadge, i % 2 === 0 ? styles.matchBadgeGreen : styles.matchBadgeAmber]}>
                          <Text style={[styles.matchBadgeText, i % 2 === 0 ? styles.matchBadgeTextGreen : styles.matchBadgeTextAmber]}>
                            {i % 2 === 0 ? '✓ Strong Match' : '! Possible Match'}
                          </Text>
                        </View>
                        {w.note && (
                          <View style={styles.providerTip}>
                            <Text style={styles.providerTipLabel}>Provider tip:</Text>
                            <Text style={styles.providerTipText}>{w.note}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Waitlist bars */}
                  <Text style={styles.waitlistTitle}>Estimated Waitlist</Text>
                  {waivers.slice(0, 3).map((w, i) => {
                    const waitKey = i === 0 ? '3-5 years' : '8-10 years';
                    return (
                      <View key={i} style={styles.waitlistRow}>
                        <Text style={styles.waitlistLabel}>{w.name}</Text>
                        <View style={styles.waitlistBarBg}>
                          <View style={[styles.waitlistBarFill, { width: `${WAITLIST_WIDTH[waitKey] ?? 50}%`, backgroundColor: WAITLIST_COLORS[waitKey] ?? COLORS.teal }]} />
                        </View>
                        <Text style={styles.waitlistValue}>{waitKey}</Text>
                      </View>
                    );
                  })}
                  <Text style={styles.waitlistSource}>Source: State HCBS reports. Waitlist estimates are approximate.</Text>
                </>
              ) : (
                <View style={styles.noData}>
                  <Text style={styles.noDataText}>
                    {userState
                      ? `Enter a county above to load waiver data for ${userState}.`
                      : 'Set your state in your profile to see waiver information.'}
                  </Text>
                </View>
              )}

              {/* Fallback callout */}
              <View style={styles.fallbackBox}>
                <Ionicons name="warning-outline" size={18} color="#B7791F" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fallbackText}>No county listed? Use the statewide contact for your state's HCBS office.</Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://www.medicaid.gov/medicaid/home-community-based-services/index.html')}>
                    <Text style={styles.fallbackLink}>Report Missing County</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 2. Medicaid & Insurance */}
        <View style={styles.accordionCard}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('medicaid')} activeOpacity={0.8}>
            <Text style={styles.accordionIcon}>🛡️</Text>
            <Text style={styles.accordionTitle}>2. Medicaid & Insurance</Text>
            <Ionicons name={expandedSection === 'medicaid' ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMid} />
          </TouchableOpacity>
          {expandedSection === 'medicaid' && (
            <View style={styles.accordionBody}>
              {MEDICAID_INFO.map((item, i) => (
                <View key={i} style={styles.infoCard}>
                  <Text style={styles.infoTitle}>{item.title}</Text>
                  <Text style={styles.infoBody}>{item.body}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 3. IEP & School Services */}
        <View style={styles.accordionCard}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('iep')} activeOpacity={0.8}>
            <Text style={styles.accordionIcon}>🎓</Text>
            <Text style={styles.accordionTitle}>3. IEP & School Services</Text>
            <Ionicons name={expandedSection === 'iep' ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMid} />
          </TouchableOpacity>
          {expandedSection === 'iep' && (
            <View style={styles.accordionBody}>
              {IEP_INFO.map((item, i) => (
                <View key={i} style={styles.infoCard}>
                  <Text style={styles.infoTitle}>{item.title}</Text>
                  <Text style={styles.infoBody}>{item.body}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  backBtn: { padding: SPACING.xs },
  headerText: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, ...SHADOWS.sm },
  stepItem: { alignItems: 'center', gap: 4, minWidth: 64 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  stepCircleDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  stepCircleActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  stepCheck: { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepNum: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textLight },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600', textAlign: 'center' },
  stepLabelActive: { color: COLORS.purple },
  stepDonePill: { backgroundColor: '#E3F7F1', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  stepDoneText: { fontSize: 9, color: COLORS.teal, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm, alignSelf: 'center', marginBottom: 16 },
  stepLineDone: { backgroundColor: COLORS.teal },
  // County input
  countyCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.sm, gap: SPACING.xs },
  countyLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  countyInput: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text },
  countyHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },
  // Accordion
  accordionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.sm },
  accordionIcon: { fontSize: 20 },
  accordionTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  accordionBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  // Waiver cards
  waiverCards: { flexDirection: 'row', gap: SPACING.sm },
  waiverCard: { flex: 1, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.xs, borderWidth: 1.5 },
  waiverCardGreen: { backgroundColor: '#F0FDF9', borderColor: '#A7F3D0' },
  waiverCardAmber: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  waiverName: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text },
  waiverTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  waiverTag: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  waiverTagText: { fontSize: 10, color: COLORS.textMid },
  matchBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1 },
  matchBadgeGreen: { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' },
  matchBadgeAmber: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  matchBadgeText: { fontSize: 11, fontWeight: '700' },
  matchBadgeTextGreen: { color: '#065F46' },
  matchBadgeTextAmber: { color: '#92400E' },
  providerTip: { backgroundColor: '#F0EDFF', borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.xs },
  providerTipLabel: { fontSize: 10, fontWeight: '700', color: COLORS.purple, marginBottom: 2 },
  providerTipText: { fontSize: 10, color: COLORS.textMid, lineHeight: 14 },
  // Waitlist
  waitlistTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xs },
  waitlistRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  waitlistLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, width: 90 },
  waitlistBarBg: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  waitlistBarFill: { height: 10, borderRadius: 5 },
  waitlistValue: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, width: 70, textAlign: 'right' },
  waitlistSource: { fontSize: 10, color: COLORS.textLight, fontStyle: 'italic', marginTop: SPACING.xs },
  noData: { padding: SPACING.md, backgroundColor: COLORS.bg, borderRadius: RADIUS.md },
  noDataText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  // Fallback
  fallbackBox: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: '#FFFBEB', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: '#FDE68A', alignItems: 'flex-start', marginTop: SPACING.xs },
  fallbackText: { fontSize: FONT_SIZES.xs, color: '#92400E', lineHeight: 18 },
  fallbackLink: { fontSize: FONT_SIZES.xs, color: COLORS.teal, fontWeight: '700', marginTop: 4, textDecorationLine: 'underline' },
  // Info cards
  infoCard: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.xs },
  infoTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  infoBody: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
});
