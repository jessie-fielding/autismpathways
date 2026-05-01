import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveChild } from '../../../services/childManager';
import { useRouter } from 'expo-router';
import React, { useEffect }, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const SECTIONS = [
  {
    title: 'Identity Documents',
    icon: '🪪',
    items: [
      { id: 'p1', text: 'Birth certificates for all children applying' },
      { id: 'p2', text: 'Social Security cards for all household members' },
      { id: 'p3', text: 'Photo ID for parent or guardian' },
    ],
  },
  {
    title: 'Proof of Residency',
    icon: '🏠',
    items: [
      { id: 'p4', text: 'Utility bill (electric, gas, water) — must show current address' },
      { id: 'p5', text: 'Lease or mortgage statement' },
    ],
  },
  {
    title: 'Income Verification',
    icon: '💵',
    items: [
      { id: 'p6', text: 'Pay stubs from the last 30 days (all earners in household)' },
      { id: 'p7', text: 'Most recent federal tax return (if self-employed)' },
      { id: 'p8', text: 'Unemployment or disability benefit letters (if applicable)' },
      { id: 'p9', text: 'Child support documentation (if applicable)' },
    ],
  },
  {
    title: 'Insurance Information',
    icon: '📋',
    items: [
      { id: 'p10', text: 'Current health insurance cards (if any)' },
      { id: 'p11', text: 'Employer insurance information (if offered through work)' },
    ],
  },
];

export default function PaperworkChecklist() {
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  useEffect(() => {
    // Advance Medicaid dashboard progress to step 2
    (async () => {
      const cur = parseInt(await AsyncStorage.getItem(childKey('ap_medicaid_progress')) || '0', 10);
      if (cur < 2) await AsyncStorage.setItem(childKey('ap_medicaid_progress'), '2');
    })();
  }, []);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  };

  const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const progress = Math.round((checked.size / totalItems) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Apply</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 2 of 5</Text>
          <Text style={styles.progressPercent}>40% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={styles.sectionLabel}>PAPERWORK CHECKLIST</Text>
          <Text style={styles.mainTitle}>What to collect before you apply</Text>
          <Text style={styles.mainSubtitle}>
            Having these documents ready before you start the application will save you a lot of
            time. Check them off as you gather them.
          </Text>
        </View>

        <View style={styles.docProgressBox}>
          <Text style={styles.docProgressText}>
            {checked.size} of {totalItems} documents gathered
          </Text>
          <View style={styles.docProgressBar}>
            <View style={[styles.docProgressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.content}>
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.icon} {section.title}</Text>
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
            <Text style={styles.tipLabel}>💡 MISSING SOMETHING?</Text>
            <Text style={styles.tipText}>
              Don't wait until you have everything. You can start the application and upload or bring
              missing documents later. Getting started is the most important step.
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
          onPress={() => router.push('/medicaid/how-to-apply/in-person-vs-phone')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>How to apply →</Text>
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
