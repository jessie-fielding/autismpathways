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
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import {
  STATE_LTD_DATA,
  getWaitlistColor,
  getWaitlistLabel,
  type LTDProgram,
} from '../../data/longTermDisability';

const TYPE_LABELS: Record<LTDProgram['type'], string> = {
  medicaid_waiver: 'Medicaid Waiver',
  state_program: 'State Program',
  federal: 'Federal',
  housing: 'Housing',
  employment: 'Employment',
  financial: 'Financial',
};

const TYPE_COLORS: Record<LTDProgram['type'], { bg: string; border: string; text: string }> = {
  medicaid_waiver: { bg: '#E9E3FF', border: '#C5B8F0', text: '#5C3EA8' },
  state_program:   { bg: '#E3F7F1', border: '#7DD9C0', text: '#0A7A5A' },
  federal:         { bg: '#DCEEFF', border: '#A8CFFF', text: '#2C5F8A' },
  housing:         { bg: '#FFF6D8', border: '#FFD97A', text: '#7A6020' },
  employment:      { bg: '#FFE8DC', border: '#FFBB9A', text: '#8A3A1A' },
  financial:       { bg: '#E3F7F1', border: '#7DD9C0', text: '#0A7A5A' },
};

function ProgramCard({ program }: { program: LTDProgram }) {
  const [expanded, setExpanded] = useState(false);
  const typeStyle = TYPE_COLORS[program.type];

  return (
    <View style={styles.programCard}>
      <TouchableOpacity
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.8}
        style={styles.programHeader}
      >
        <View style={styles.programHeaderLeft}>
          <View style={[styles.typePill, { backgroundColor: typeStyle.bg, borderColor: typeStyle.border }]}>
            <Text style={[styles.typeText, { color: typeStyle.text }]}>
              {TYPE_LABELS[program.type]}
            </Text>
          </View>
          <Text style={styles.programName}>{program.name}</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.programBody}>
          <Text style={styles.programDesc}>{program.description}</Text>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>✅ Eligibility</Text>
            <Text style={styles.infoText}>{program.eligibility}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>📋 How to Apply</Text>
            <Text style={styles.infoText}>{program.howToApply}</Text>
          </View>

          {program.phone && (
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL(`tel:${program.phone}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.contactBtnText}>📞 Call {program.phone}</Text>
            </TouchableOpacity>
          )}

          {program.website && (
            <TouchableOpacity
              style={[styles.contactBtn, styles.webBtn]}
              onPress={() => Linking.openURL(program.website!)}
              activeOpacity={0.8}
            >
              <Text style={[styles.contactBtnText, styles.webBtnText]}>🌐 Visit Website</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function StateDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ state?: string }>();
  const stateAbbr = params.state || '';

  const stateData = STATE_LTD_DATA.find(
    s => s.abbreviation.toUpperCase() === stateAbbr.toUpperCase()
  );

  if (!stateData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>State Not Found</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>State data not available for "{stateAbbr}".</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.emptyBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const waitColor = getWaitlistColor(stateData.waitlistStatus);
  const waitLabel = getWaitlistLabel(stateData.waitlistStatus);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {stateData.state}
        </Text>
        <TouchableOpacity
          style={styles.actionPlanBtn}
          onPress={() =>
            router.push({
              pathname: '/long-term-disability/action-plan',
              params: { state: stateAbbr },
            })
          }
        >
          <Text style={styles.actionPlanBtnText}>Action Plan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Waitlist status banner */}
        <View style={[styles.waitlistBanner, { backgroundColor: waitColor + '18', borderColor: waitColor }]}>
          <View style={[styles.waitlistDot, { backgroundColor: waitColor }]} />
          <View style={styles.waitlistInfo}>
            <Text style={[styles.waitlistLabel, { color: waitColor }]}>{waitLabel}</Text>
            {stateData.waitlistNote && (
              <Text style={styles.waitlistNote}>{stateData.waitlistNote}</Text>
            )}
          </View>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>{stateData.overview}</Text>
        </View>

        {/* Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Programs ({stateData.programs.length})
          </Text>
          <Text style={styles.sectionHint}>Tap a program to expand details</Text>
          {stateData.programs.map((program, idx) => (
            <ProgramCard key={idx} program={program} />
          ))}
        </View>

        {/* Action Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Action Steps</Text>
          <Text style={styles.sectionHint}>
            What to do right now for {stateData.state}
          </Text>
          <View style={styles.actionStepsCard}>
            {stateData.actionSteps.map((step, idx) => (
              <View key={idx} style={styles.actionStep}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Federal programs link */}
        <TouchableOpacity
          style={styles.federalLink}
          onPress={() => router.push('/long-term-disability/federal-programs')}
          activeOpacity={0.8}
        >
          <Text style={styles.federalLinkEmoji}>🇺🇸</Text>
          <View>
            <Text style={styles.federalLinkTitle}>Also see Federal Programs</Text>
            <Text style={styles.federalLinkSub}>SSI, SSDI, ABLE Accounts, Section 8, Voc Rehab</Text>
          </View>
          <Text style={styles.federalLinkArrow}>›</Text>
        </TouchableOpacity>

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
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, flex: 1, textAlign: 'center' },
  actionPlanBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
  },
  actionPlanBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
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
  waitlistLabel: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  waitlistNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    marginBottom: SPACING.md,
  },
  overviewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 22,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  programCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  programHeaderLeft: { flex: 1, gap: 4 },
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  typeText: { fontSize: 10, fontWeight: '700' },
  programName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  expandIcon: { fontSize: 12, color: COLORS.textLight, marginLeft: SPACING.sm },
  programBody: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  programDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    paddingTop: SPACING.sm,
  },
  infoBlock: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    gap: 4,
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  contactBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  contactBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  webBtn: { backgroundColor: COLORS.lavender },
  webBtnText: { color: COLORS.purple },
  actionStepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  actionStep: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  stepNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepNum: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  stepText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, flex: 1 },
  federalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  federalLinkEmoji: { fontSize: 24 },
  federalLinkTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1e40af' },
  federalLinkSub: { fontSize: FONT_SIZES.xs, color: '#3b82f6', marginTop: 2 },
  federalLinkArrow: { fontSize: 20, color: '#3b82f6', fontWeight: '700', marginLeft: 'auto' },
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
