import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

const TABS = [
  { number: 1, label: 'Overview', active: false, completed: true },
  { number: 2, label: 'Your Situation', active: false, completed: true },
  { number: 3, label: 'Denial Reason', active: true, completed: false },
  { number: 4, label: 'Next Steps', active: false, completed: false },
];

const DENIAL_REASONS = [
  {
    id: 'administrative',
    icon: '📋',
    title: 'Admin Issues',
    description: 'Missing paperwork, incomplete forms, or documentation problems',
  },
  {
    id: 'income',
    icon: '💰',
    title: 'Income Related',
    description: 'Household income was above the Medicaid threshold',
  },
  {
    id: 'unsure',
    icon: '❓',
    title: 'Not Sure',
    description: 'The letter was confusing or I\'m not certain of the reason',
  },
];

const WHAT_THIS_MEANS: Record<string, { label: string; text: string; highlight?: string }> = {
  administrative: {
    label: '📍 WHAT THIS MEANS',
    text: 'An administrative denial is often the easiest to overturn. If documents were missing or incomplete, resubmitting them with a clear cover letter explaining what\'s now included can lead to approval.',
    highlight: 'easiest to overturn',
  },
  income: {
    label: '📍 WHAT THIS MEANS',
    text: 'An income-based denial for the household does not mean your child can\'t qualify. Children with significant support needs often have a separate eligibility pathway. That\'s exactly what we\'re going to walk through.',
    highlight: 'not mean your child can\'t qualify',
  },
  unsure: {
    label: '📍 WHAT THIS MEANS',
    text: 'The first step is getting clarity on why you were denied. Call the agency and ask them to explain in plain language. This will help us determine the right next steps for your family.',
  },
};

export default function DenialReason() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    if (selected === 'income') {
      router.push('/medicaid/select-state');
    } else {
      // admin or unsure → appeal path
      router.push('/medicaid/appeal-journey');
    }
  };

  const info = selected ? WHAT_THIS_MEANS[selected] : null;

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
            A guided walkthrough based on exactly where you are right now.
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 3 of 6</Text>
          <Text style={styles.progressPercent}>50% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
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
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionLabel}>UNDERSTANDING YOUR DENIAL</Text>
          <Text style={styles.mainTitle}>What does your denial notice say?</Text>
          <Text style={styles.mainSubtitle}>
            Pick the category that best matches the reason listed on your denial letter. If you're
            not sure, start with the one that feels closest.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.content}>
          <Text style={styles.choiceLabel}>Choose one</Text>
          {DENIAL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.choiceBox,
                selected === reason.id && styles.choiceBoxActive,
              ]}
              onPress={() => setSelected(reason.id)}
            >
              <Text style={styles.choiceIcon}>{reason.icon}</Text>
              <View style={styles.choiceContent}>
                <Text style={styles.choiceTitle}>{reason.title}</Text>
                <Text style={styles.choiceDescription}>{reason.description}</Text>
              </View>
              {selected === reason.id && (
                <Text style={styles.choiceCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          {/* What This Means - dynamic */}
          {info && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoText}>{info.text}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, !selected && { opacity: 0.5 }]}
          disabled={!selected}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            That's our reason →
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
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  mainSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  choiceLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  choiceBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  choiceBoxActive: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(124, 92, 191, 0.08)',
  },
  choiceIcon: {
    fontSize: 28,
    marginRight: SPACING.lg,
    marginTop: 2,
  },
  choiceContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  choiceTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#4D96FF',
    marginBottom: 4,
  },
  choiceDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    lineHeight: 18,
  },
  choiceCheckmark: {
    fontSize: 16,
    color: COLORS.purple,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.infoText,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.infoText,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: COLORS.purple,
  },
  navButtonSecondary: {
    backgroundColor: COLORS.lavender,
  },
  navButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
  navButtonTextSecondary: {
    color: COLORS.purple,
  },
});
