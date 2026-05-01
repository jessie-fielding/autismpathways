import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveChild } from '../../../services/childManager';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const STEPS = [
  { step: '1', title: 'Gather your paperwork', desc: 'We\'ll give you a checklist of exactly what you need' },
  { step: '2', title: 'Choose how to apply', desc: 'In person vs. over the phone — pros and cons of each' },
  { step: '3', title: 'Track your application', desc: 'Log your submission date and key details' },
  { step: '4', title: 'Follow up', desc: 'Know when and how to check in, with talking scripts' },
  { step: '5', title: 'Get your result', desc: 'Approved or denied — we\'ll walk you through what\'s next' },
];

export default function HowToApplyIntro() {
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  useEffect(() => {
    // Advance Medicaid dashboard progress to step 1
    (async () => {
      const cur = parseInt(await AsyncStorage.getItem(childKey('ap_medicaid_progress')) || '0', 10);
      if (cur < 1) await AsyncStorage.setItem(childKey('ap_medicaid_progress'), '1');
    })();
  }, []);

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
          <Text style={styles.progressLabel}>Step 1 of 5</Text>
          <Text style={styles.progressPercent}>20% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '20%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={styles.sectionLabel}>APPLYING FOR MEDICAID</Text>
          <Text style={styles.mainTitle}>Let's get your application started</Text>
          <Text style={styles.mainSubtitle}>
            Applying for Medicaid doesn't have to be overwhelming. We'll walk you through it one
            step at a time.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.introBox}>
            <Text style={styles.introIcon}>📝</Text>
            <Text style={styles.introText}>
              Even if you're not sure you'll qualify, applying is always worth it. The worst that
              can happen is a denial — and we'll be here to help you through that too.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>💡 GOOD TO KNOW</Text>
            <Text style={styles.warningText}>
              Medicaid eligibility rules vary by state. This guide covers the general process —
              your state may have specific requirements or additional steps.
            </Text>
          </View>

          <Text style={styles.stepsTitle}>WHAT WE'LL COVER</Text>
          {STEPS.map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{item.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
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
          onPress={() => router.push('/medicaid/how-to-apply/paperwork-checklist')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Start checklist →</Text>
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
  introBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
  },
  introIcon: { fontSize: 24 },
  introText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  warningBox: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  stepsTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  stepBadgeText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.xs },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  stepDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
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
