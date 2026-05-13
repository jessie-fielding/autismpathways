import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  citationsBox: {
    marginTop: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c5cef0',
    marginBottom: SPACING.lg,
  },
  citationsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3a4a8a',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  citationItem: {
    fontSize: 11,
    color: '#3a4a8a',
    lineHeight: 17,
    marginBottom: 3,
  },
});

export default function Step3WaiverTypes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Step 3: Waiver Types</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.heading}>Types of Waivers</Text>
        <Text style={styles.text}>Different states offer different waiver programs.</Text>
        <View style={styles.citationsBox}>
          <Text style={styles.citationsLabel}>SOURCES</Text>
          <Text style={styles.citationItem}>• Medicaid.gov — Home and Community-Based Services (HCBS) Waivers, Section 1915(c)</Text>
          <Text style={styles.citationItem}>• Kaiser Family Foundation — Medicaid Home and Community-Based Services Enrollment and Spending</Text>
          <Text style={styles.citationItem}>• Autism Speaks — State Medicaid Waiver Programs for Autism Resource Guide</Text>
          <Text style={styles.citationItem}>• National Council on Disability — Home and Community-Based Services: A Guide for People with Disabilities</Text>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
