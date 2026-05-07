import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

const TABS = [
  { number: 1, label: 'Overview', active: true, completed: false },
  { number: 2, label: 'Your Situation', active: false, completed: false },
  { number: 3, label: 'Denial Reason', active: false, completed: false },
  { number: 4, label: 'Next Steps', active: false, completed: false },
];

const PATHWAY_STEPS = [
  {
    number: 1,
    color: COLORS.purple,
    title: 'Apply for Medicaid for the Whole Family',
    description:
      'The starting point for most families — even if you\'re unsure whether you\'ll qualify.',
  },
  {
    number: 2,
    color: '#4D96FF',
    title: 'If Approved — Explore Child-Specific Supports',
    description:
      'Medicaid approval opens the door to waivers and disability-related services.',
  },
  {
    number: 3,
    color: '#FF6B6B',
    title: 'If Denied — This Is Not the End',
    description:
      'A denial for household income does not close the door for your child. There are disability-based pathways.',
  },
];

export default function MedicaidIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Medicaid Pathway</Text>
          <Text style={styles.headerSubtitle}>
            A guided walkthrough based on exactly where you are right now — not a wall of information.
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20 }}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 1 of 6</Text>
          <Text style={styles.progressPercent}>17% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '17%' }]} />
        </View>
      </View>

      {/* Tab Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabNav}
        contentContainerStyle={styles.tabNavContent}
      >
        {TABS.map((tab) => (
          <View
            key={tab.number}
            style={[
              styles.tab,
              tab.active && styles.tabActive,
              tab.completed && styles.tabCompleted,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                (tab.active || tab.completed) && styles.tabTextActive,
              ]}
            >
              {tab.completed ? '✓' : tab.number} {tab.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Content Header */}
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={styles.sectionLabel}>BEFORE WE START</Text>
          <Text style={styles.mainTitle}>Here's how the Medicaid pathway works</Text>
        </View>

        {/* Warm intro box */}
        <View style={styles.content}>
          <View style={styles.introBox}>
            <Text style={styles.introIcon}>👋</Text>
            <Text style={styles.introText}>
              Getting denied is more common than you think — and it is not the final word. I want to
              walk you through exactly what this means and what comes next. You're not behind. You're
              still moving forward.
            </Text>
          </View>

          {/* Important to know */}
          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>⚡ IMPORTANT TO KNOW</Text>
            <Text style={styles.warningText}>
              Being denied for household Medicaid based on income does{' '}
              <Text style={styles.bold}>not</Text> necessarily mean your child will never qualify.
              There may be a disability-based pathway — but it usually requires a separate process.
            </Text>
          </View>

          {/* Pathway at a glance */}
          <Text style={styles.glanceTitle}>THE FULL PATHWAY AT A GLANCE</Text>
          {PATHWAY_STEPS.map((step, idx) => (
            <View key={step.number} style={styles.pathwayStep}>
              <View style={styles.pathwayLeft}>
                <View style={[styles.stepDot, { backgroundColor: step.color }]}>
                  <Text style={styles.stepDotText}>{step.number}</Text>
                </View>
                {idx < PATHWAY_STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.pathwayRight}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/your-situation')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            Let's get started →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    fontSize: 22,
    color: COLORS.purple,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 19,
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
  },
  tabNav: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabNavContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tabActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  tabCompleted: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMid,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  contentHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionNumberText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 28,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  introBox: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  introIcon: {
    fontSize: 24,
  },
  introText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.yellowAccent,
  },
  warningLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.warningText,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warningText,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '800',
  },
  glanceTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1.5,
    marginBottom: SPACING.lg,
  },
  pathwayStep: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  pathwayLeft: {
    alignItems: 'center',
    width: 40,
    marginRight: SPACING.md,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xs,
    minHeight: 20,
  },
  pathwayRight: {
    flex: 1,
    paddingBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  stepDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 19,
  },
  navigationButtons: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: COLORS.purple,
  },
  navButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
});
