import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  bg: '#F7F4FB',
  white: '#FFFFFF',
  text: '#1F1B2D',
  textMid: '#6B6480',
  border: '#DDD6F3',
  purple: '#7C5CBF',
};

const SPACING = {
  lg: 16,
  md: 12,
};

const FONT_SIZES = {
  sm: 14,
  lg: 20,
};

const RADIUS = {
  lg: 16,
};

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
  backButton: { fontSize: 20, color: COLORS.purple },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginLeft: SPACING.lg },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white },
  heading: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  text: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.lg },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  buttonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  buttonTextWhite: { color: COLORS.white },
});

export default function Step1Intro() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Step 1: Introduction</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.heading}>Understanding Waivers</Text>
        <Text style={styles.text}>
          Home and Community-Based Services waivers help children with disabilities receive care at home instead of institutions.
        </Text>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => router.push('/waiver-journey/step-2-ltd-check')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
