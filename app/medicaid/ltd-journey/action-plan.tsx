import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, SafeAreaView } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },

  hero: {
    backgroundColor: 'rgba(139, 114, 231, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(139, 114, 231, 0.18)',
    borderRadius: 999,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  mainSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 24,
  },
  
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  celebrationContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    maxWidth: '85%',
    zIndex: 2,
  },
  celebrationIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  celebrationButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  celebrationButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationPrimaryButton: {
    backgroundColor: COLORS.purple,
  },
  celebrationSecondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  celebrationButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  celebrationPrimaryButtonText: {
    color: COLORS.white,
  },
  celebrationSecondaryButtonText: {
    color: COLORS.text,
  },

  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  sectionText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 24, marginBottom: SPACING.md },
  ctaButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 50,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  ctaButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});

export default function ActionPlan() {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const lottieRef = React.useRef<LottieView>(null);

  const handleLTDDetermination = () => {
    setShowCelebration(true);
    setTimeout(() => {
      lottieRef.current?.play();
    }, 100);
  };

  const handleProceedToWaivers = () => {
    setShowCelebration(false);
    router.push('/medicaid/waiver-journey');
  };

  const handleNotYet = () => {
    setShowCelebration(false);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Action Plan</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xl }}>
          <View style={styles.hero}>
            <Text style={styles.badge}>LTD DETERMINATION</Text>
            <Text style={styles.mainTitle}>You've prepared for your provider visit</Text>
            <Text style={styles.mainSubtitle}>
              Once your provider confirms Long-Term Disability, you'll be ready to explore Medicaid waiver options.
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Next Steps:</Text>
              <Text style={styles.sectionText}>
                • Schedule a visit with your child's healthcare provider{'\n'}
                • Bring your completed provider prep quiz{'\n'}
                • Discuss long-term support and disability documentation needs
              </Text>
            </View>

            <TouchableOpacity onPress={handleLTDDetermination} style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>✓ I Have LTD Determination</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.celebrationOverlay}>
          <LottieView
            ref={lottieRef}
            source={require('../../../assets/confetti.json')}
            autoPlay={false}
            loop={true}
            style={styles.confetti}
          />
          
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationIcon}>🎉</Text>
            <Text style={styles.celebrationTitle}>Congratulations!</Text>
            <Text style={styles.celebrationSubtitle}>
              Great job being your child's best advocate. You're ready to explore Medicaid waiver options.
            </Text>

            <View style={styles.celebrationButtons}>
              <TouchableOpacity
                onPress={handleNotYet}
                style={[styles.celebrationButton, styles.celebrationSecondaryButton]}
              >
                <Text style={[styles.celebrationButtonText, styles.celebrationSecondaryButtonText]}>
                  Not Yet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleProceedToWaivers}
                style={[styles.celebrationButton, styles.celebrationPrimaryButton]}
              >
                <Text style={[styles.celebrationButtonText, styles.celebrationPrimaryButtonText]}>
                  Explore Waivers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Quick debug - remove after testing
console.log('ActionPlan component mounted');
