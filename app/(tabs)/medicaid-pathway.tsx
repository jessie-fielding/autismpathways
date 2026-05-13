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

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 20,
    color: COLORS.purple,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  tabNav: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    lineHeight: 32,
  },
  mainSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
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
    marginTop: SPACING.xs,
  },
  choiceContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  choiceTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#4D96FF',
  },
  choiceDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  choiceCheckmark: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.purple,
  },
  whatThisMeansBox: {
    backgroundColor: 'rgba(237, 100, 166, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ED64A6',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  whatThisMeansLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#C2185B',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  whatThisMeansText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '800',
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
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#7AB5FF',
    borderColor: '#7AB5FF',
  },
  navButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
});

export default function MedicaidPathwayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const denialReasons = [
    {
      id: 'administrative',
      icon: '📋',
      title: 'Administrative or paperwork issue',
      description: 'Missing documents, incomplete application, or a processing error',
    },
    {
      id: 'income',
      icon: '💵',
      title: 'Income or eligibility issue',
      description: 'Income was above the threshold, or child wasn\'t evaluated under disability criteria',
    },
    {
      id: 'unsure',
      icon: '❓',
      title: 'I\'m not sure why we were denied',
      description: 'The letter was confusing or didn\'t clearly explain the reason',
    },
  ];

  const tabs = [
    { number: 1, label: 'Overview', completed: true },
    { number: 2, label: 'Your Situation', completed: true },
    { number: 3, label: 'Denial Reason', active: true },
  ];

  // Different messaging based on denial reason
  const denialReasonContent = {
    administrative: {
      title: 'Administrative or paperwork issue',
      description: 'Missing documents, incomplete application, or a processing error',
    },
    income: {
      title: 'Income or eligibility issue',
      description: 'Income was above the threshold, or child wasn\'t evaluated under disability criteria',
    },
    unsure: {
      title: 'I\'m not sure why we were denied',
      description: 'The letter was confusing or didn\'t clearly explain the reason',
    },
  };

  const getWhatThisMeansText = () => {
    switch (selectedReason) {
      case 'administrative':
        return 'An administrative denial is often the <Text style={styles.highlight}>easiest to overturn</Text>. If documents were missing or incomplete, resubmitting them with a clear cover letter explaining what\'s now included can lead to approval.';
      case 'income':
        return 'An income-based denial for the household does <Text style={styles.highlight}>not mean your child can\'t qualify</Text>. Children with significant support needs often have a separate eligibility pathway. That\'s exactly what we\'re going to walk through.';
      case 'unsure':
        return 'The first step is getting clarity on why you were denied. Call the agency and ask them to explain in plain language. This will help us determine the right next steps for your family.';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicaid Pathway</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabNav}
        scrollEventThrottle={16}
      >
        {tabs.map((tab) => (
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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Content Header */}
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionLabel}>UNDERSTANDING YOUR DENIAL</Text>
          <Text style={styles.mainTitle}>What does your denial notice say?</Text>
          <Text style={styles.mainSubtitle}>
            Pick the category that best matches the reason listed on your denial letter. If you're not sure, start with the one that feels closest.
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.choiceLabel}>Choose one</Text>

          {denialReasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.choiceBox,
                selectedReason === reason.id && styles.choiceBoxActive,
              ]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <Text style={styles.choiceIcon}>{reason.icon}</Text>
              <View style={styles.choiceContent}>
                <Text style={styles.choiceTitle}>{reason.title}</Text>
                <Text style={styles.choiceDescription}>{reason.description}</Text>
              </View>
              <Text style={styles.choiceCheckmark}>✓</Text>
            </TouchableOpacity>
          ))}

          {/* What This Means - Dynamic based on selection */}
          <View style={styles.whatThisMeansBox}>
            <Text style={styles.whatThisMeansLabel}>📍 WHAT THIS MEANS</Text>
            <Text style={styles.whatThisMeansText}>
              {selectedReason === 'administrative' && (
                <>An administrative denial is often the <Text style={styles.highlight}>easiest to overturn</Text>. If documents were missing or incomplete, resubmitting them with a clear cover letter explaining what's now included can lead to approval.</>
              )}
              {selectedReason === 'income' && (
                <>An income-based denial for the household does <Text style={styles.highlight}>not mean your child can't qualify</Text>. Children with significant support needs often have a separate eligibility pathway. That's exactly what we're going to walk through.</>
              )}
              {selectedReason === 'unsure' && (
                <>The first step is getting clarity on why you were denied. Call the agency and ask them to explain in plain language. This will help us determine the right next steps for your family.</>
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
    <TouchableOpacity
  style={[styles.navButton, styles.navButtonPrimary, !selectedReason && { opacity: 0.5 }]}
  disabled={!selectedReason}
  onPress={() =>
    router.push(
      selectedReason === 'income'
        ? '/medicaid/income-journey/intro'
        : '/medicaid/appeal-journey/step-0-situation'
    )
  }
>
  <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>That's our reason →</Text>
</TouchableOpacity>
      </View>
    </View>
  );
}
