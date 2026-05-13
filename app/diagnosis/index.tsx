import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { storage } from '../../services/storage';
import { useActiveChild } from '../../services/childManager';
import { useChildChanged } from '../../hooks/useChildChanged';
import { PathwayDisclaimer } from '../../components/PathwayDisclaimer';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const TOTAL_STEPS = 6;
const CURRENT_STEP = 1;

export default function DiagnosisIntroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { key: childKey, child } = useActiveChild();
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = useCallback(async () => {
    const p = await storage.getProfile();
    setProfile(p);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Re-load when active child changes (uses ref-based hook to avoid stale closures)
  useChildChanged(() => loadProfile());

  const childName = child?.name || profile?.childName || null;
  const state = profile?.state || null;
  const diagnosisStatus = profile?.diagnosis || null;
  const concerns = profile?.concerns || [];

  const concernLabels: Record<string, string> = {
    speech: 'Speech or communication delays',
    social: 'Social interaction differences',
    sensory: 'Sensory sensitivities',
    meltdowns: 'Meltdowns or emotional regulation',
    school: 'School or learning concerns',
    provider: 'A provider suggested evaluation',
    family: 'Family member already diagnosed',
    sleep: 'Sleep difficulties',
    feeding: 'Feeding or picky eating',
    motor: 'Motor skill concerns',
    gut: 'A gut feeling something is different',
  };

  const hasProfile = childName || state || diagnosisStatus;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism Pathways</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < CURRENT_STEP ? styles.progressSegmentActive : styles.progressSegmentInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>Step {CURRENT_STEP} of {TOTAL_STEPS}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>💛</Text>
          <Text style={styles.welcomeTitle}>
            {childName ? `Let's figure out ${childName}'s next step together.` : "Let's figure out your next step together."}
          </Text>
          <Text style={styles.welcomeBody}>
            Getting a diagnosis can feel like a maze — especially when you don't know where to start. This pathway will walk you through it one step at a time, no jargon, no pressure.
          </Text>
        </View>

        {/* What we know so far */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardHeader}>
            <Text style={styles.profileCardIcon}>📋</Text>
            <Text style={styles.profileCardLabel}>WHAT WE KNOW SO FAR</Text>
          </View>
          <Text style={styles.profileCardTitle}>
            {hasProfile ? "Here's what you've already told us" : "Tell us about your child"}
          </Text>
          <Text style={styles.profileCardSubtitle}>
            {hasProfile
              ? "We pulled this from your profile. You can update anything at any time in Start Here."
              : "Complete Start Here to personalize this pathway for your family."}
          </Text>

          {hasProfile ? (
            <View style={styles.profileDataBox}>
              {childName && (
                <View style={styles.profileRow}>
                  <Text style={styles.profileRowLabel}>Child</Text>
                  <Text style={styles.profileRowValue}>{childName}</Text>
                </View>
              )}
              {state && (
                <View style={styles.profileRow}>
                  <Text style={styles.profileRowLabel}>State</Text>
                  <Text style={styles.profileRowValue}>{state}</Text>
                </View>
              )}
              {diagnosisStatus && (
                <View style={styles.profileRow}>
                  <Text style={styles.profileRowLabel}>Diagnosis status</Text>
                  <Text style={styles.profileRowValue}>{diagnosisStatus}</Text>
                </View>
              )}
              {concerns.length > 0 && (
                <View style={styles.profileRow}>
                  <Text style={styles.profileRowLabel}>Concerns noted</Text>
                  <View style={styles.concernChips}>
                    {concerns.slice(0, 3).map((c: string) => (
                      <View key={c} style={styles.concernChip}>
                        <Text style={styles.concernChipText}>{concernLabels[c] || c}</Text>
                      </View>
                    ))}
                    {concerns.length > 3 && (
                      <View style={styles.concernChip}>
                        <Text style={styles.concernChipText}>+{concerns.length - 3} more</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noProfileBox}>
              <Text style={styles.noProfileText}>
                No profile saved yet.{' '}
                <Text style={styles.noProfileLink} onPress={() => router.push('/(tabs)/start-here')}>
                  Complete Start Here
                </Text>
                {' '}to personalize this page.
              </Text>
            </View>
          )}
        </View>

        {/* What this pathway covers */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>THE DIAGNOSIS PATHWAY AT A GLANCE</Text>
          {[
            { num: 1, title: 'Why you are seeking a diagnosis', desc: 'Helps us point you to the right evaluators and talking points.' },
            { num: 2, title: 'Choose your evaluation type', desc: 'Telehealth, in-person, or we help you decide.' },
            { num: 3, title: 'Find an evaluator', desc: 'A filtered list of providers that match your situation.' },
            { num: 4, title: 'Schedule your appointment', desc: 'Track your date so nothing falls through the cracks.' },
            { num: 5, title: 'Get your results', desc: 'We walk you through what comes next — either way.' },
          ].map((item) => (
            <View key={item.num} style={styles.overviewRow}>
              <View style={styles.overviewNumBubble}>
                <Text style={styles.overviewNum}>{item.num}</Text>
              </View>
              <View style={styles.overviewText}>
                <Text style={styles.overviewItemTitle}>{item.title}</Text>
                <Text style={styles.overviewItemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>


        <PathwayDisclaimer type="medical" />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={async () => {
          // Mark step 1 reached so Dashboard tracker shows progress
          await AsyncStorage.setItem(childKey('ap_diagnosis_step'), '1');
          router.push('/diagnosis/why-diagnosis');
        }}>
          <Text style={styles.primaryBtnText}>Let's get started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBarRow: { flexDirection: 'row', gap: 4, marginBottom: SPACING.xs },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressSegmentActive: { backgroundColor: COLORS.purple },
  progressSegmentInactive: { backgroundColor: COLORS.border },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  welcomeCard: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  welcomeEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  welcomeTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  welcomeBody: { fontSize: FONT_SIZES.base, color: COLORS.textMid, lineHeight: 22 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  profileCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  profileCardIcon: { fontSize: 16, marginRight: SPACING.xs },
  profileCardLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 1,
  },
  profileCardTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  profileCardSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.md },
  profileDataBox: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  profileRowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, width: 120 },
  profileRowValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600', flex: 1 },
  concernChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  concernChip: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  concernChipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple },
  noProfileBox: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  noProfileText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  noProfileLink: { color: COLORS.purple, fontWeight: '600' },
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  overviewTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  overviewRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg, gap: SPACING.md },
  overviewNumBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  overviewNum: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  overviewText: { flex: 1 },
  overviewItemTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  overviewItemDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.lg },
});
