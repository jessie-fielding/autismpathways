import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../../../lib/theme';
import LottieView from 'lottie-react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg },
  confetti: { position: 'absolute', width: '100%', height: '100%' },
  content: { alignItems: 'center', zIndex: 10 },
  emoji: { fontSize: 60, marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.purple, marginBottom: SPACING.md, textAlign: 'center' },
  text: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.xl, textAlign: 'center', lineHeight: 20 },
  button: {
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xl,
  },
  buttonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
});

export default function Celebrate() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/(tabs)/medicaid-pathway');
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../../assets/confetti.json')}
        autoPlay
        loop={false}
        style={styles.confetti}
      />
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>We Got LTD!</Text>
        <Text style={styles.text}>
          Great news! You've successfully applied for Long-Term Disability. This will help with your Medicaid benefits.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to Waivers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
