import React, { useState, useCallback, useEffect } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../services/useAuth';
import { usePmipProviderStore } from '../../lib/pmip/pmipProviderStore';
import { useIsPremium } from '../../hooks/useIsPremium';

// Exact colors from your web app
const COLORS = {
  bg: '#F5F4FB',
  card: '#ECEAF8',
  navy: '#1a1f5e',
  purple: '#7c6fd4',
  purpleDk: '#4a3f8f',
  textMid: '#6b6490',
  textLight: '#a09cbf',
  border: '#d4d0ef',
  borderLt: '#ede9fc',
  white: '#ffffff',
  teal: '#3BBFA3',
  tealLt: '#e3f7f1',
  green: '#2e7d32',
  red: '#c0392b',
  redLt: '#fde8e8',
};

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  // TOP NAV
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,208,239,0.5)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navLogo: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#c4b8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  navTitlePurple: {
    color: COLORS.purple,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  navGear: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124,111,212,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGearIcon: {
    fontSize: 16,
  },
  navAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purpleDk,
  },
  // CHILD SELECTOR
  childSelector: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,208,239,0.5)',
  },
  childAv: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  childMeta: {
    fontSize: 11,
    color: COLORS.textMid,
  },
  // HERO
  hero: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: SPACING.xs,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  statPillNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  statPillNumTeal: {
    color: COLORS.teal,
  },
  statPillLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  // CONTENT
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  // SECTION HEADER
  secHeader: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  secTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.textLight,
  },
  // TRACKER CARDS
  trackerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tcTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tcTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  tcBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  tcBadgePurple: {
    backgroundColor: COLORS.card,
    color: COLORS.purpleDk,
  },
  tcBadgeTeal: {
    backgroundColor: COLORS.tealLt,
    color: '#0F6E56',
  },
  tcSteps: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: SPACING.md,
  },
  tcStep: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.card,
  },
  tcStepDone: {
    backgroundColor: COLORS.purple,
  },
  tcStepDoneTeal: {
    backgroundColor: COLORS.teal,
  },
  tcBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tcPhase: {
    fontSize: 11,
    color: COLORS.textMid,
  },
  tcNext: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.purple,
  },
  // PROFILE CARD
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  pcAv: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  pcBody: {
    flex: 1,
  },
  pcName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.xs,
  },
  pcMeta: {
    fontSize: 12,
    color: COLORS.textMid,
    marginBottom: SPACING.xs,
  },
  pcTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  pcTag: {
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  pcTagPurple: {
    backgroundColor: COLORS.card,
    color: COLORS.purpleDk,
  },
  pcTagTeal: {
    backgroundColor: COLORS.tealLt,
    color: '#0F6E56',
  },
  // PATHWAY SCROLL
  pathwayScroll: {
    marginBottom: SPACING.md,
  },
  pathwayTile: {
    minWidth: 86,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  ptIcon: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  ptName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
    lineHeight: 15,
  },
  doneBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.green,
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  // DUAL GRID
  dualGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    padding: SPACING.md,
  },
  miniTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  miniLink: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.purple,
    marginTop: SPACING.xs,
  },
  // APPEALS MINI
  amRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  amBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
  amBarRed: {
    backgroundColor: COLORS.red,
  },
  amBarTeal: {
    backgroundColor: COLORS.teal,
  },
  amName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.navy,
    flex: 1,
  },
  amSub: {
    fontSize: 9,
    color: COLORS.textMid,
  },
  // THIS WEEK
  twItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  twChk: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  twChkDone: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  twChkText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
  },
  twText: {
    fontSize: 10,
    color: COLORS.navy,
    flex: 1,
  },
  twTextDone: {
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  // TOOLS GRID
  toolsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  toolTile: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  toolName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a09cbf',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  tcCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ede9fc',
    padding: 16,
    marginBottom: 16,
  },
  tcBadgeGreen: {
    backgroundColor: '#e3f7f1',
    color: '#0A7A5A',
  },
  quizResultsCard: {
    backgroundColor: '#f0ebff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c5b8f0',
  },
  quizResultsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a3f8f',
    marginBottom: 8,
  },
  quizRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  quizLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b6490',
  },
  quizValue: {
    fontSize: 11,
    color: '#4a3f8f',
    flex: 1,
  },
  quizLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c6fd4',
    marginTop: 6,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a3f8f',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  upgradeLeft: { flex: 1 },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  upgradeSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
    marginBottom: 4,
  },
  upgradePrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c5b8f0',
  },
  upgradeArrow: {
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 12,
  },
});
// ─── Component ────────────────────────────────────────────────────────────────

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChildSwitcher from '../../components/ChildSwitcher';
import HamburgerMenu from '../../components/HamburgerMenu';
import { useActiveChild } from '../../services/childManager';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { isPremium } = useIsPremium();
  const { child, childId, key: childKey, switchChild } = useActiveChild();

  // ── State ──────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<{ childName?: string; diagnosis?: string; diagnosisLevel?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState(0);
  const [medicaidProgress, setMedicaidProgress] = useState(0);
  const [waiverProgress, setWaiverProgress] = useState(0);
  const [iepProgress, setIepProgress] = useState(0);
  const [pottyProgress, setPottyProgress] = useState(0);
  const [weeklyChecks, setWeeklyChecks] = useState<boolean[]>([false, false, false, false]);
  const [icdCodes, setIcdCodes] = useState<string[]>([]);
  const [devFlags, setDevFlags] = useState<string[]>([]);

  const DIAGNOSIS_TOTAL = 8;
  const MEDICAID_TOTAL = 6;
  const WAIVER_TOTAL = 7;
  const IEP_TOTAL = 5;
  const POTTY_TOTAL = 5;

  // ── Load data ──────────────────────────────────────────────────────────────
  // Accepts an optional explicit childId so we can call it immediately after
  // a switch before useActiveChild's internal state has had time to update.
  const loadData = useCallback(async (overrideChildId?: string) => {
    try {
      // Build a key function using the override ID if provided, else fall back
      // to the hook's current childId.
      const resolvedId = overrideChildId ?? childId;
      const ck = (base: string) => resolvedId ? `${base}_${resolvedId}` : base;

      const [
        rawProfile,
        rawDiag,      rawDiagFallback,
        rawMedicaid,  rawMedicaidFallback,
        rawWaiver,    rawWaiverFallback,
        rawIep,       rawIepFallback,
        rawWeekly,
        rawPotty,
        rawIcd,       rawIcdFallback,
        rawDev,       rawDevFallback,
      ] = await Promise.all([
        AsyncStorage.getItem('profile'),
        AsyncStorage.getItem(ck('ap_diagnosis_step')),   AsyncStorage.getItem('ap_diagnosis_step'),
        AsyncStorage.getItem(ck('ap_medicaid_progress')), AsyncStorage.getItem('ap_medicaid_progress'),
        AsyncStorage.getItem(ck('ap_waiver_progress')),  AsyncStorage.getItem('ap_waiver_progress'),
        AsyncStorage.getItem(ck('ap_iep_progress')),     AsyncStorage.getItem('ap_iep_progress'),
        AsyncStorage.getItem('ap_weekly_checks'),
        AsyncStorage.getItem('ap_potty_progress'),
        AsyncStorage.getItem(ck('ap_icd_quiz_codes')),   AsyncStorage.getItem('ap_icd_quiz_codes'),
        AsyncStorage.getItem(ck('ap_disability_quiz_results')), AsyncStorage.getItem('ap_disability_quiz_results'),
      ]);

      // Prefer child-scoped value; fall back to legacy global key
      const diagRaw     = rawDiag     ?? rawDiagFallback;
      const medicaidRaw = rawMedicaid  ?? rawMedicaidFallback;
      const waiverRaw   = rawWaiver   ?? rawWaiverFallback;
      const iepRaw      = rawIep      ?? rawIepFallback;
      const icdRaw      = rawIcd      ?? rawIcdFallback;
      const devRaw      = rawDev      ?? rawDevFallback;

      if (rawProfile) setProfile(JSON.parse(rawProfile));
      setDiagnosisStep(diagRaw     ? parseInt(diagRaw,     10) : 0);
      setMedicaidProgress(medicaidRaw ? parseInt(medicaidRaw, 10) : 0);
      setWaiverProgress(waiverRaw   ? parseInt(waiverRaw,   10) : 0);
      setIepProgress(iepRaw        ? parseInt(iepRaw,       10) : 0);
      setPottyProgress(rawPotty    ? parseInt(rawPotty,     10) : 0);
      if (rawWeekly) setWeeklyChecks(JSON.parse(rawWeekly));
      if (icdRaw) setIcdCodes(JSON.parse(icdRaw));
      if (devRaw) {
        const flags = JSON.parse(devRaw);
        setDevFlags(Array.isArray(flags) ? flags.slice(0, 3) : []);
      }
    } catch (_) {}
  }, [childId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Re-load data whenever the active child changes (e.g. after a switch)
  useEffect(() => {
    if (childId) loadData(childId);
  }, [childId]);

  const toggleWeekly = async (i: number) => {
    const updated = weeklyChecks.map((v, idx) => idx === i ? !v : v);
    setWeeklyChecks(updated);
    await AsyncStorage.setItem('ap_weekly_checks', JSON.stringify(updated));
  };

  const displayName = child?.name || profile?.childName || 'your child';
  const diagnosis = child?.diagnosis || profile?.diagnosis || '';
  const diagLevel = child?.diagnosisLevel || profile?.diagnosisLevel || '';

  const WEEKLY_TASKS = [
    'Log an observation',
    'Check upcoming appointments',
    'Review IEP goals',
    'Update service tracker',
  ];

  const PATHWAYS = [
    { icon: '🔍', name: 'Diagnosis', route: '/diagnosis', progress: diagnosisStep, total: DIAGNOSIS_TOTAL },
    { icon: '🏥', name: 'Medicaid', route: '/medicaid', progress: medicaidProgress, total: MEDICAID_TOTAL },
    { icon: '📋', name: 'Waiver', route: '/waiver', progress: waiverProgress, total: WAIVER_TOTAL },
    { icon: '🏫', name: 'IEP', route: '/iep', progress: iepProgress, total: IEP_TOTAL },
    { icon: '🚽', name: 'Potty', route: '/potty', progress: pottyProgress, total: POTTY_TOTAL },
  ];

  const TOOL_TILES = [
    { icon: '📓', name: 'Observations', route: '/observations' },
    { icon: '🩺', name: 'Provider Prep', route: '/provider-prep' },
    { icon: '🧘', name: 'Safe Space', route: '/safe-space' },
    { icon: '🧮', name: 'CCB Tool', route: '/ccb-tool' },
    { icon: '📚', name: 'Learning', route: '/(tabs)/explore' },
  ];

  return (
    <View style={styles.container}>
      {/* TOP NAV */}
      <View style={[styles.topNav, { paddingTop: insets.top + 4 }]}>
        <View style={styles.navLeft}>
          <View style={styles.navLogo}>
            <Text style={{ fontSize: 14 }}>🌈</Text>
          </View>
          <Text style={styles.navTitle}>
            Autism <Text style={styles.navTitlePurple}>Pathways</Text>
          </Text>
        </View>
        <View style={styles.navRight}>
          <ChildSwitcher onSwitch={(newId: string) => loadData(newId)} />
          <TouchableOpacity style={styles.navGear} onPress={() => setMenuOpen(true)}>
            <Text style={styles.navGearIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>

          {/* PROFILE CARD */}
          <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/settings')} activeOpacity={0.85}>
            <View style={[styles.pcAv, { backgroundColor: child?.color || '#c4b8f0' }]}>
              <Text style={{ fontSize: 20 }}>{child?.avatar ? child.avatar : '👧'}</Text>
            </View>
            <View style={styles.pcBody}>
              <Text style={styles.pcName}>{displayName}</Text>
              {diagnosis ? (
                <Text style={styles.pcMeta}>{diagnosis}{diagLevel ? ` · Level ${diagLevel}` : ''}</Text>
              ) : (
                <Text style={styles.pcMeta}>Tap to complete profile</Text>
              )}
              <View style={styles.pcTags}>
                {isPremium ? (
                  <Text style={[styles.pcTag, styles.pcTagTeal]}>⭐ Premium</Text>
                ) : (
                  <Text style={[styles.pcTag, styles.pcTagPurple]}>Free Plan</Text>
                )}
                {diagLevel ? <Text style={[styles.pcTag, styles.pcTagPurple]}>Level {diagLevel}</Text> : null}
              </View>
            </View>
          </TouchableOpacity>

          {/* QUIZ RESULTS CALLOUT */}
          {(icdCodes.length > 0 || devFlags.length > 0) && (
            <View style={styles.quizResultsCard}>
              <Text style={styles.quizResultsTitle}>📋 From Your Quizzes</Text>
              {icdCodes.length > 0 && (
                <View style={styles.quizRow}>
                  <Text style={styles.quizLabel}>ICD Codes: </Text>
                  <Text style={styles.quizValue}>{icdCodes.slice(0, 4).join(', ')}</Text>
                </View>
              )}
              {devFlags.length > 0 && (
                <View style={styles.quizRow}>
                  <Text style={styles.quizLabel}>Flagged: </Text>
                  <Text style={styles.quizValue}>{devFlags.join(', ')}</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => router.push('/talking-points')}>
                <Text style={styles.quizLink}>Use in Talking Points →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SECTION: YOUR JOURNEY */}
          <Text style={styles.sectionLabel}>YOUR JOURNEY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pathwayScroll} contentContainerStyle={{ paddingRight: SPACING.lg }}>
            {PATHWAYS.map((p) => {
              const pct = p.total > 0 ? Math.round((p.progress / p.total) * 100) : 0;
              const done = pct >= 100;
              return (
                <TouchableOpacity key={p.name} style={styles.pathwayTile} onPress={() => router.push(p.route as any)} activeOpacity={0.8}>
                  {done && <Text style={styles.doneBadge}>✓</Text>}
                  <Text style={styles.ptIcon}>{p.icon}</Text>
                  <Text style={styles.ptName}>{p.name}</Text>
                  {p.total > 0 && (
                    <Text style={{ fontSize: 9, color: COLORS.textLight, marginTop: 2 }}>{pct}%</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* TRACKER CARDS */}
          <View style={styles.dualGrid}>
            {/* Diagnosis tracker */}
            <TouchableOpacity style={styles.miniCard} onPress={() => router.push('/diagnosis')} activeOpacity={0.85}>
              <Text style={styles.miniTitle}>🔍 Diagnosis</Text>
              <View style={{ flexDirection: 'row', gap: 3, marginBottom: 6 }}>
                {Array.from({ length: DIAGNOSIS_TOTAL }).map((_, i) => (
                  <View key={i} style={[{ flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.card }, i < diagnosisStep && { backgroundColor: COLORS.purple }]} />
                ))}
              </View>
              <Text style={styles.miniLink}>Step {Math.min(diagnosisStep + 1, DIAGNOSIS_TOTAL)} of {DIAGNOSIS_TOTAL} →</Text>
            </TouchableOpacity>

            {/* Medicaid tracker */}
            <TouchableOpacity style={styles.miniCard} onPress={() => router.push('/medicaid')} activeOpacity={0.85}>
              <Text style={styles.miniTitle}>🏥 Medicaid</Text>
              <View style={{ flexDirection: 'row', gap: 3, marginBottom: 6 }}>
                {Array.from({ length: MEDICAID_TOTAL }).map((_, i) => (
                  <View key={i} style={[{ flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.card }, i < medicaidProgress && { backgroundColor: COLORS.teal }]} />
                ))}
              </View>
              <Text style={styles.miniLink}>Step {Math.min(medicaidProgress + 1, MEDICAID_TOTAL)} of {MEDICAID_TOTAL} →</Text>
            </TouchableOpacity>
          </View>

          {/* THIS WEEK */}
          <View style={styles.tcCard}>
            <View style={styles.tcTop}>
              <Text style={styles.tcTitle}>📅 This Week</Text>
              <Text style={[styles.tcBadge, styles.tcBadgePurple]}>{weeklyChecks.filter(Boolean).length}/{WEEKLY_TASKS.length} done</Text>
            </View>
            {WEEKLY_TASKS.map((task, i) => (
              <TouchableOpacity key={i} style={styles.twItem} onPress={() => toggleWeekly(i)} activeOpacity={0.7}>
                <View style={[styles.twChk, weeklyChecks[i] && styles.twChkDone]}>
                  {weeklyChecks[i] && <Text style={styles.twChkText}>✓</Text>}
                </View>
                <Text style={[styles.twText, weeklyChecks[i] && styles.twTextDone]}>{task}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TOOLS SCROLLER */}
          <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pathwayScroll} contentContainerStyle={{ paddingRight: SPACING.lg }}>
            {TOOL_TILES.map((t) => (
              <TouchableOpacity
                key={t.name}
                style={styles.pathwayTile}
                onPress={() => router.push(t.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.ptIcon}>{t.icon}</Text>
                <Text style={styles.ptName}>{t.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.pathwayTile, { backgroundColor: '#f0ebff', borderColor: '#c5b8f0', minWidth: 80 }]}
              onPress={() => router.push('/tools')}
              activeOpacity={0.8}
            >
              <Text style={styles.ptIcon}>➕</Text>
              <Text style={[styles.ptName, { color: COLORS.purple }]}>More Tools</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* UPGRADE BANNER (non-premium only) */}
          {!isPremium && (
            <TouchableOpacity style={styles.upgradeBanner} onPress={() => router.push('/paywall')} activeOpacity={0.9}>
              <View style={styles.upgradeLeft}>
                <Text style={styles.upgradeTitle}>Unlock Premium Access</Text>
                <Text style={styles.upgradeSub}>Appeal Tracker, unlimited contacts, all talking points scripts, and more.</Text>
                <Text style={styles.upgradePrice}>$4.99/mo · $39.99/yr</Text>
              </View>
              <Text style={styles.upgradeArrow}>→</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
      <HamburgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}
