import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import {
  STATE_LTD_DATA,
  FEDERAL_PROGRAMS,
  getWaitlistColor,
  getWaitlistLabel,
} from '../../data/longTermDisability';

const STORAGE_KEY = 'ap_ltd_action_plan_checked';

export default function ActionPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ state?: string }>();
  const stateAbbr = params.state || '';

  const stateData = STATE_LTD_DATA.find(
    s => s.abbreviation.toUpperCase() === stateAbbr.toUpperCase()
  );

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY + '_' + stateAbbr).then(val => {
      if (val) {
        try { setChecked(JSON.parse(val)); } catch {}
      }
    });
  }, [stateAbbr]);

  const toggleCheck = async (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    await AsyncStorage.setItem(STORAGE_KEY + '_' + stateAbbr, JSON.stringify(next));
  };

  if (!stateData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Action Plan</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No state selected. Please go back and select a state.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.emptyBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const waitColor = getWaitlistColor(stateData.waitlistStatus);
  const waitLabel = getWaitlistLabel(stateData.waitlistStatus);

  // Build combined action steps: state-specific + universal federal steps
  const stateSteps = stateData.actionSteps.map((step, i) => ({
    key: `state_${i}`,
    text: step,
    category: 'State-Specific',
    color: COLORS.purple,
  }));

  const federalSteps = [
    { key: 'fed_ssi', text: 'Apply for SSI at ssa.gov or call 1-800-772-1213', category: 'Federal', color: '#2C5F8A' },
    { key: 'fed_able', text: 'Open an ABLE Account at ablenrc.org — save without losing SSI', category: 'Federal', color: '#2C5F8A' },
    { key: 'fed_vr', text: 'Contact your state Vocational Rehabilitation agency for free job training', category: 'Federal', color: '#2C5F8A' },
    { key: 'fed_s8', text: 'Apply for Section 8 Housing Voucher through your local Public Housing Authority', category: 'Federal', color: '#2C5F8A' },
    { key: 'fed_snt', text: 'Consult a special needs attorney about establishing a Special Needs Trust', category: 'Federal', color: '#2C5F8A' },
  ];

  const allSteps = [...stateSteps, ...federalSteps];
  const completedCount = allSteps.filter(s => checked[s.key]).length;
  const pct = Math.round((completedCount / allSteps.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stateData.state} Action Plan</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={styles.progressSub}>
            {completedCount} of {allSteps.length} steps completed
          </Text>
        </View>

        {/* Waitlist status */}
        <View style={[styles.waitlistBanner, { backgroundColor: waitColor + '18', borderColor: waitColor }]}>
          <View style={[styles.waitlistDot, { backgroundColor: waitColor }]} />
          <View style={styles.waitlistInfo}>
            <Text style={[styles.waitlistLabel, { color: waitColor }]}>
              {stateData.state}: {waitLabel}
            </Text>
            {stateData.waitlistNote && (
              <Text style={styles.waitlistNote}>{stateData.waitlistNote}</Text>
            )}
          </View>
        </View>

        {/* State-specific steps */}
        <Text style={styles.sectionTitle}>📍 {stateData.state}-Specific Steps</Text>
        {stateSteps.map(step => (
          <TouchableOpacity
            key={step.key}
            style={[styles.stepCard, checked[step.key] && styles.stepCardDone]}
            onPress={() => toggleCheck(step.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, checked[step.key] && styles.checkboxDone]}>
              {checked[step.key] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.stepText, checked[step.key] && styles.stepTextDone]}>
              {step.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Federal steps */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>🇺🇸 Federal Steps (All States)</Text>
        {federalSteps.map(step => (
          <TouchableOpacity
            key={step.key}
            style={[styles.stepCard, styles.stepCardFederal, checked[step.key] && styles.stepCardDone]}
            onPress={() => toggleCheck(step.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, styles.checkboxFederal, checked[step.key] && styles.checkboxDone]}>
              {checked[step.key] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.stepText, checked[step.key] && styles.stepTextDone]}>
              {step.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Key contacts */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>📞 Key Contacts</Text>
        <View style={styles.contactsCard}>
          {stateData.programs
            .filter(p => p.phone)
            .map((p, i) => (
              <TouchableOpacity
                key={i}
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${p.phone}`)}
                activeOpacity={0.8}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{p.name}</Text>
                  <Text style={styles.contactPhone}>{p.phone}</Text>
                </View>
                <View style={styles.callBtn}>
                  <Text style={styles.callBtnText}>Call</Text>
                </View>
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:18007721213')}
            activeOpacity={0.8}
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Social Security (SSI/SSDI)</Text>
              <Text style={styles.contactPhone}>1-800-772-1213</Text>
            </View>
            <View style={styles.callBtn}>
              <Text style={styles.callBtnText}>Call</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sources */}
        <View style={styles.sourcesBox}>
          <Text style={styles.sourcesLabel}>SOURCES</Text>
          <Text style={styles.sourceItem}>• KFF 2025 HCBS Waiver Survey</Text>
          <Text style={styles.sourceItem}>• SpecialNeedsTrustByState.com — Medicaid Waiver Waitlists</Text>
          <Text style={styles.sourceItem}>• Autism Speaks — Financial Assistance Resources</Text>
          <Text style={styles.sourceItem}>• Individual state DD agency websites (2025–2026)</Text>
        </View>
      </ScrollView>
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  progressPct: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.purple },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: 4 },
  progressSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  waitlistBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  waitlistDot: { width: 12, height: 12, borderRadius: 6 },
  waitlistInfo: { flex: 1 },
  waitlistLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800' },
  waitlistNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  stepCardFederal: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
  stepCardDone: { opacity: 0.6 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxFederal: { borderColor: '#3b82f6' },
  checkboxDone: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { fontSize: 13, color: COLORS.white, fontWeight: '800' },
  stepText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, flex: 1 },
  stepTextDone: { textDecorationLine: 'line-through', color: COLORS.textMid },
  contactsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  contactPhone: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  callBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
  },
  callBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
  sourcesBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: RADIUS.xs,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#c5cef0',
  },
  sourcesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3a4a8a',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sourceItem: { fontSize: 11, color: '#3a4a8a', lineHeight: 17, marginBottom: 3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', marginBottom: SPACING.lg },
  emptyBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  emptyBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
});
