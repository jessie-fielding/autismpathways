import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const CHECKLIST_ITEMS = [
  { id: '1', text: 'I have the original denial letter in hand' },
  { id: '2', text: 'I know the date the denial was issued' },
  { id: '3', text: 'I have noted the specific reason(s) listed' },
  { id: '4', text: 'I know the appeal deadline date' },
  { id: '5', text: 'I have the agency contact information from the letter' },
];

export default function Step2ReviewChecklist() {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const allChecked = checked.size === CHECKLIST_ITEMS.length;

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
          <Text style={styles.sectionLabel}>ADMIN REVIEW CHECKLIST</Text>
          <Text style={styles.mainTitle}>Review your denial letter</Text>
          <Text style={styles.mainSubtitle}>
            Before we move forward, confirm you have these things ready. Check each one off as you
            go.
          </Text>
        </View>

        <View style={styles.content}>
          {CHECKLIST_ITEMS.map((item) => (
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

          {!allChecked && (
            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>💡 TIP</Text>
              <Text style={styles.tipText}>
                If you don't have your denial letter, call the Medicaid office and ask them to
                re-send it. You can also request it in writing.
              </Text>
            </View>
          )}

          {allChecked && (
            <View style={styles.successBox}>
              <Text style={styles.successLabel}>✅ YOU'RE READY</Text>
              <Text style={styles.successText}>
                Great — you have everything you need to move forward. Let's figure out exactly what
                documents to gather.
              </Text>
            </View>
          )}
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
          onPress={() => router.push('/medicaid/appeal-journey/step-3-gather-docs')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {allChecked ? 'Continue →' : 'Skip for now →'}
          </Text>
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
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  checkItem: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.md,
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
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  successBox: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  successLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText, letterSpacing: 1, marginBottom: SPACING.sm },
  successText: { fontSize: FONT_SIZES.sm, color: COLORS.successText, lineHeight: 20 },
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
