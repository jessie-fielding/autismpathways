import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { PMIP_COLORS, PMIP_SPACING, PMIP_SIZES } from '../../../../lib/pmip/pmipStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PMIP_COLORS.screenBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: PMIP_SPACING.xl,
    zIndex: 10,
  },
  celebrationIcon: {
    fontSize: 80,
    marginBottom: PMIP_SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PMIP_COLORS.heroTitle,
    textAlign: 'center',
    marginBottom: PMIP_SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: PMIP_COLORS.bodyText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: PMIP_SPACING.xl,
  },
  card: {
    backgroundColor: PMIP_COLORS.cardBg,
    borderRadius: PMIP_SIZES.largeRadius,
    padding: PMIP_SPACING.xl,
    marginTop: PMIP_SPACING.xl,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: PMIP_COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PMIP_COLORS.heroTitle,
    marginBottom: PMIP_SPACING.sm,
  },
  cardText: {
    fontSize: 14,
    color: PMIP_COLORS.bodyText,
    lineHeight: 22,
    marginBottom: PMIP_SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: PMIP_SPACING.md,
    marginTop: PMIP_SPACING.xl,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: PMIP_SPACING.lg,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: PMIP_COLORS.primaryPurple,
  },
  secondaryButton: {
    backgroundColor: PMIP_COLORS.cardBg,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButtonText: {
    color: PMIP_COLORS.cardBg,
  },
  secondaryButtonText: {
    color: PMIP_COLORS.bodyText,
  },
});

export default function Step4Celebration() {
  const router = useRouter();
  const lottieRef = React.useRef<LottieView>(null);

  useEffect(() => {
    // Start confetti animation on mount
    lottieRef.current?.play();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti Animation */}
      <LottieView
        ref={lottieRef}
        source={require('../../../../assets/confetti.json')}
        autoPlay
        loop
        style={styles.confetti}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.celebrationIcon}>🎉</Text>

        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>
          Great job for being your child's best advocate. You're well-prepared for your provider visit.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's Next?</Text>
          <Text style={styles.cardText}>
            You've completed the provider preparation tool. Now you're ready to discuss your child's needs and documentation with your healthcare provider.
          </Text>
          <Text style={styles.cardText}>
            Once you have LTD determination from your provider, you can continue to explore Medicaid waiver options and long-term support planning.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => router.push('/medicaid/ltd-journey/action-plan')}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to Action Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/medicaid')}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Explore Waivers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
