import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function AppealComplete() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeal Journey</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🎯</Text>
          <Text style={styles.heroTitle}>You've completed the appeal process</Text>
          <Text style={styles.heroSubtitle}>
            You've done everything right. The ball is now in the agency's court.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>WHAT YOU'VE ACCOMPLISHED</Text>
            {[
              'Reviewed your denial letter',
              'Gathered your supporting documents',
              'Created a clear action plan',
              'Submitted your corrected application',
            ].map((item, idx) => (
              <View key={idx} style={styles.summaryItem}>
                <Text style={styles.summaryCheck}>✓</Text>
                <Text style={styles.summaryText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.nextBox}>
            <Text style={styles.nextTitle}>WHAT HAPPENS NEXT</Text>
            <Text style={styles.nextText}>
              The agency will review your resubmission. Processing times vary by state — typically
              30–45 days. You should receive written notice of the decision.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>📞 FOLLOW UP IN 2 WEEKS</Text>
            <Text style={styles.warningText}>
              If you haven't heard anything in 2 weeks, call the agency and ask for a status update.
              Reference your submission date.
            </Text>
          </View>

          <View style={styles.outcomeBox}>
            <Text style={styles.outcomeTitle}>WHEN YOU GET A DECISION</Text>
            <TouchableOpacity
              style={styles.outcomeOption}
              onPress={() => router.push('/waiver-journey/step-1-intro')}
            >
              <Text style={styles.outcomeIcon}>✅</Text>
              <View style={styles.outcomeInfo}>
                <Text style={styles.outcomeLabel}>If approved</Text>
                <Text style={styles.outcomeDesc}>Go to the Waiver Journey to explore next steps</Text>
              </View>
              <Text style={styles.outcomeArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outcomeOption}
              onPress={() => router.push('/medicaid/income-journey')}
            >
              <Text style={styles.outcomeIcon}>📄</Text>
              <View style={styles.outcomeInfo}>
                <Text style={styles.outcomeLabel}>If denied again</Text>
                <Text style={styles.outcomeDesc}>Explore income-based pathways for your child</Text>
              </View>
              <Text style={styles.outcomeArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, 
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  backButton: { fontSize: 22, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scrollContent: { paddingBottom: SPACING.xxl },
  heroSection: {
    backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xxxl,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.lg },
  heroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.md, lineHeight: 32 },
  heroSubtitle: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  summaryBox: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.lg },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  summaryCheck: { fontSize: 16, color: '#4CAF50', fontWeight: '700', marginRight: SPACING.md },
  summaryText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  nextBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  nextTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  nextText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  warningBox: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
  outcomeBox: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  outcomeTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  outcomeOption: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  outcomeIcon: { fontSize: 24, marginRight: SPACING.md },
  outcomeInfo: { flex: 1 },
  outcomeLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  outcomeDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  outcomeArrow: { fontSize: 18, color: COLORS.purple },
  navigationButtons: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  navButton: { borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  navButtonPrimary: { backgroundColor: COLORS.purple },
  navButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  navButtonTextPrimary: { color: COLORS.white },
});
