import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

const TABS = [
  { number: 1, label: 'Overview', active: false, completed: true },
  { number: 2, label: 'Your Situation', active: true, completed: false },
  { number: 3, label: 'Denial Reason', active: false, completed: false },
  { number: 4, label: 'Next Steps', active: false, completed: false },
];

const OPTIONS = [
  {
    id: 'denied',
    icon: '📄',
    title: 'We were denied',
    description: 'We got a denial letter and aren\'t sure what to do next',
  },
  {
    id: 'approved',
    icon: '✅',
    title: 'We were approved',
    description: 'We have Medicaid and want to know what comes next',
    iconBg: '#4CAF50',
  },
  {
    id: 'not-applied',
    icon: '🕐',
    title: 'We haven\'t applied yet',
    description: 'We\'re not sure where to start or if we\'ll qualify',
  },
];

export default function YourSituation() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSelect = (id: string) => {
    setSelected(id);
    if (id === 'approved') {
      setShowConfetti(true);
    }
  };

  const handleNext = () => {
    if (!selected) return;
    if (selected === 'denied') {
      router.push('/medicaid/denial-reason');
    } else if (selected === 'approved') {
      router.push('/waiver-journey/step-1-intro');
    } else if (selected === 'not-applied') {
      router.push('/medicaid/how-to-apply');
    }
  };

  return (
    <View style={styles.container}>
      {/* Confetti Modal */}
      <Modal visible={showConfetti} transparent animationType="fade">
        <View style={styles.confettiOverlay}>
          <LottieView
            source={require('../../assets/confetti.json')}
            autoPlay
            loop={false}
            style={styles.confettiAnim}
            onAnimationFinish={() => setShowConfetti(false)}
          />
          <View style={styles.confettiCard}>
            <Text style={styles.confettiEmoji}>🎉</Text>
            <Text style={styles.confettiTitle}>Congratulations!</Text>
            <Text style={styles.confettiText}>
              Getting approved for Medicaid is a big deal. Now let's make sure your child gets every
              support they're entitled to.
            </Text>
            <TouchableOpacity
              style={styles.confettiButton}
              onPress={() => {
                setShowConfetti(false);
                router.push('/waiver-journey/step-1-intro');
              }}
            >
              <Text style={styles.confettiButtonText}>See what's next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <Text style={styles.progressLabel}>Step 2 of 6</Text>
          <Text style={styles.progressPercent}>33% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
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
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={styles.sectionLabel}>YOUR SITUATION</Text>
          <Text style={styles.mainTitle}>What happened with your Medicaid application?</Text>
          <Text style={styles.mainSubtitle}>
            Pick the one that fits closest. This helps the app figure out exactly which path makes
            sense for your family.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.content}>
          <Text style={styles.choiceLabel}>Choose one</Text>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.choiceBox,
                selected === option.id && styles.choiceBoxActive,
              ]}
              onPress={() => handleSelect(option.id)}
            >
              <Text style={styles.choiceIcon}>{option.icon}</Text>
              <View style={styles.choiceContent}>
                <Text style={styles.choiceTitle}>{option.title}</Text>
                <Text style={styles.choiceDescription}>{option.description}</Text>
              </View>
              {selected === option.id && (
                <Text style={styles.choiceCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          {/* How This Works */}
          <View style={styles.howBox}>
            <Text style={styles.howLabel}>💡 HOW THIS WORKS</Text>
            <Text style={styles.howText}>
              Each situation leads to a different set of next steps. The app will only show you
              what's actually relevant to where you are right now.
            </Text>
          </View>
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
            That's our situation →
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
  confettiOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiAnim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  confettiCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    marginHorizontal: SPACING.xxl,
    alignItems: 'center',
    zIndex: 10,
  },
  confettiEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  confettiTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  confettiText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  confettiButton: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  confettiButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
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
    textAlign: 'center',
  },
  choiceCheckmark: {
    fontSize: 16,
    color: COLORS.purple,
    fontWeight: '700',
  },
  howBox: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.yellowAccent,
  },
  howLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.warningText,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  howText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warningText,
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
