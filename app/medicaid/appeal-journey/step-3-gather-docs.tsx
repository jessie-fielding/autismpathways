import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const DOC_SECTIONS = [
  {
    title: 'Identity & Household',
    icon: '🪪',
    items: [
      { id: 'd1', text: 'Birth certificate for your child' },
      { id: 'd2', text: 'Social Security cards for all household members' },
      { id: 'd3', text: 'Proof of address (utility bill, lease, etc.)' },
    ],
  },
  {
    title: 'Income & Financial',
    icon: '💵',
    items: [
      { id: 'd4', text: 'Most recent pay stubs (last 30 days)' },
      { id: 'd5', text: 'Most recent tax return (if self-employed)' },
      { id: 'd6', text: 'Bank statements (last 2–3 months)' },
    ],
  },
  {
    title: 'Medical & Disability',
    icon: '🏥',
    items: [
      { id: 'd7', text: 'Autism diagnosis documentation' },
      { id: 'd8', text: 'Recent evaluation reports (psychological, developmental)' },
      { id: 'd9', text: 'Letters from treating physicians or therapists' },
    ],
  },
  {
    title: 'Application Documents',
    icon: '📋',
    items: [
      { id: 'd10', text: 'Copy of original application submitted' },
      { id: 'd11', text: 'Original denial letter' },
      { id: 'd12', text: 'Any prior correspondence with the agency' },
    ],
  },
];

export default function Step3GatherDocs() {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const totalItems = DOC_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const progress = Math.round((checked.size / totalItems) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeal Journey</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 3 of 5</Text>
          <Text style={styles.progressPercent}>60% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionLabel}>ADMIN CHECKLIST</Text>
          <Text style={styles.mainTitle}>What to gather before you reapply</Text>
          <Text style={styles.mainSubtitle}>
            Check off each document as you collect it. You don't need everything perfect — just get
            as complete as possible.
          </Text>
        </View>

        {/* Doc progress */}
        <View style={styles.docProgressBox}>
          <Text style={styles.docProgressText}>
            {checked.size} of {totalItems} documents gathered
          </Text>
          <View style={styles.docProgressBar}>
            <View style={[styles.docProgressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.content}>
          {DOC_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {section.icon} {section.title}
              </Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkItem, checked.has(item.id) && styles.checkItemDone]}
                  onPress={() => toggle(item.id)}
                >
                  <View style={[styles.checkbox, checked.has(item.id) && styles.checkboxDone]}>
                    {checked.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkText, checked.has(item.id) && styles.checkTextDone]}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>💡 DON'T HAVE EVERYTHING?</Text>
            <Text style={styles.tipText}>
              That's okay. Submit what you have and include a note explaining what's still coming.
              Agencies often prefer a partial submission with a follow-up over waiting for everything
              to be perfect.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/appeal-journey/step-4-action-plan')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Action plan →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingTop: 56,
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  backButton: { fontSize: 22, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressContainer: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text },
  progressPercent: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.pill },
  contentHeader: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sectionNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionNumberText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 28 },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  docProgressBox: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  docProgressText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid, marginBottom: SPACING.sm },
  docProgressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  docProgressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: RADIUS.pill },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  checkItem: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm,
    borderWidth: 2, borderColor: COLORS.border,
  },
  checkItemDone: { borderColor: COLORS.purple, backgroundColor: 'rgba(124,92,191,0.06)' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, marginTop: 1,
  },
  checkboxDone: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  checkText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  checkTextDone: { color: COLORS.text, fontWeight: '600' },
  tipBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  navigationButtons: {
    flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  navButton: { flex: 1, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  navButtonPrimary: { backgroundColor: COLORS.purple },
  navButtonSecondary: { backgroundColor: COLORS.lavender },
  navButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  navButtonTextPrimary: { color: COLORS.white },
  navButtonTextSecondary: { color: COLORS.purple },
});
