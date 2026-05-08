import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../lib/theme';

interface PathwayDisclaimerProps {
  type?: 'medical' | 'legal' | 'educational' | 'general';
}

const MESSAGES: Record<string, string> = {
  medical:
    'This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about your child\'s health.',
  legal:
    'This information is for educational purposes only and does not constitute legal advice. Laws and regulations vary by state and may change. Consult a qualified advocate or attorney for guidance specific to your situation.',
  educational:
    'This information is for educational purposes only. Every child\'s needs are unique. Consult your child\'s healthcare team, therapists, and educators for personalized guidance.',
  general:
    'This information is for educational purposes only. It is based on publicly available sources and may not reflect the most recent changes in law or policy. Always verify information with official sources or a qualified professional.',
};

export function PathwayDisclaimer({ type = 'general' }: PathwayDisclaimerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>ℹ️ INFORMATIONAL USE ONLY</Text>
      <Text style={styles.text}>{MESSAGES[type]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FFE082',
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#7B6000',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    color: '#5D4037',
    lineHeight: 18,
  },
});
