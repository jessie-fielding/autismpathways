import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { FEDERAL_PROGRAMS, type LTDProgram } from '../../data/longTermDisability';

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

function FederalProgramCard({ program }: { program: LTDProgram }) {
  const [expanded, setExpanded] = useState(false);
  const typeStyle = TYPE_COLORS[program.type];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.typePill, { backgroundColor: typeStyle.bg, borderColor: typeStyle.border }]}>
            <Text style={[styles.typeText, { color: typeStyle.text }]}>
              {TYPE_LABELS[program.type]}
            </Text>
          </View>
          <Text style={styles.cardTitle}>{program.name}</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <Text style={styles.cardDesc}>{program.description}</Text>

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

export default function FederalProgramsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Federal Programs</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🇺🇸</Text>
          <Text style={styles.heroTitle}>Federal Disability Programs</Text>
          <Text style={styles.heroSub}>
            These programs are available in every state. Most are the foundation of
            long-term disability planning for individuals with autism.
          </Text>
        </View>

        {/* Key tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Start Here</Text>
          <Text style={styles.tipText}>
            Apply for <Text style={styles.bold}>SSI first</Text> — it automatically
            establishes Medicaid eligibility in most states, which is required for
            waiver services. Then open an <Text style={styles.bold}>ABLE Account</Text>{' '}
            to save without losing SSI benefits.
          </Text>
        </View>

        {/* Programs */}
        <Text style={styles.sectionTitle}>
          All Federal Programs ({FEDERAL_PROGRAMS.length})
        </Text>
        <Text style={styles.sectionHint}>Tap a program to expand details</Text>

        {FEDERAL_PROGRAMS.map((program, idx) => (
          <FederalProgramCard key={idx} program={program} />
        ))}

        {/* Priority order */}
        <View style={styles.priorityCard}>
          <Text style={styles.priorityTitle}>📋 Recommended Application Order</Text>
          {[
            { num: '1', text: 'Apply for SSI — establishes Medicaid in most states' },
            { num: '2', text: 'Apply for Medicaid — required for waiver services' },
            { num: '3', text: 'Get on your state\'s DD waiver waitlist — the earlier the better' },
            { num: '4', text: 'Open an ABLE Account — save without losing SSI' },
            { num: '5', text: 'Apply for Section 8 Housing Voucher — long waitlists, apply early' },
            { num: '6', text: 'Contact Vocational Rehabilitation — free job training and support' },
            { num: '7', text: 'Consult a special needs attorney about a Special Needs Trust' },
          ].map(item => (
            <View key={item.num} style={styles.priorityStep}>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityNum}>{item.num}</Text>
              </View>
              <Text style={styles.priorityText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Sources */}
        <View style={styles.sourcesBox}>
          <Text style={styles.sourcesLabel}>SOURCES</Text>
          <Text style={styles.sourceItem}>• Social Security Administration — SSI and SSDI Program Guidelines</Text>
          <Text style={styles.sourceItem}>• ABLE National Resource Center — ablenrc.org</Text>
          <Text style={styles.sourceItem}>• HUD — Housing Choice Voucher Program (Section 8)</Text>
          <Text style={styles.sourceItem}>• RSA — State Vocational Rehabilitation Agencies</Text>
          <Text style={styles.sourceItem}>• Autism Speaks — Special Needs Financial Planning Tool Kit</Text>
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
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
  hero: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  heroEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#1e40af', textAlign: 'center', marginBottom: SPACING.sm },
  heroSub: { fontSize: FONT_SIZES.sm, color: '#3b82f6', textAlign: 'center', lineHeight: 20 },
  tipBox: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.yellowAccent,
  },
  tipTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#7A6020', marginBottom: 6 },
  tipText: { fontSize: FONT_SIZES.sm, color: '#7A6020', lineHeight: 20 },
  bold: { fontWeight: '700' },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  cardHeaderLeft: { flex: 1, gap: 4 },
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  typeText: { fontSize: 10, fontWeight: '700' },
  cardTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  expandIcon: { fontSize: 12, color: COLORS.textLight, marginLeft: SPACING.sm },
  cardBody: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  cardDesc: {
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
  priorityCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  priorityTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  priorityStep: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  priorityNum: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  priorityText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, flex: 1 },
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
});
