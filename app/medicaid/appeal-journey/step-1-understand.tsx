import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../../lib/theme';

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
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  heroSection: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  heading: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  optionBox: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionBoxActive: { borderColor: COLORS.purple, backgroundColor: '#F1EBFB' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  optionText: { flex: 1 },
  optionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  optionDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 18 },
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
  buttonPrimary: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  buttonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  buttonTextWhite: { color: COLORS.white },
});

const reasons = [
  { id: 'admin', title: '📋 Admin Issues', desc: 'Missing paperwork, incomplete forms, or processing errors' },
  { id: 'income', title: '💰 Income Related', desc: 'Denied due to income limits or financial eligibility' },
  { id: 'unsure', title: '❓ Not Sure', desc: 'The denial reason is unclear or doesn\'t fit above' },
];

export default function AppealStep1() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  const handleContinue = async () => {
    if (!selected) return;
    try {
      await AsyncStorage.setItem('appeal_reason', selected);
      
      if (selected === 'admin') {
        // Admin issues go to appeal journey
        router.push('/medicaid/appeal-journey/step-2-admin-review');
      } else if (selected === 'income') {
        // Income issues go to income quiz (now direct, no intro)
        router.push('/medicaid/income-journey/intro');
      } else if (selected === 'unsure') {
        // Not sure - for now go to appeal journey (we'll build this later)
        router.push('/medicaid/appeal-journey/step-2-admin-review');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medicaid Denial</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What did your denial notice say?</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.heading}>Choose the reason that matches:</Text>
          
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[styles.optionBox, selected === reason.id && styles.optionBoxActive]}
              onPress={() => setSelected(reason.id)}
            >
              <View style={[styles.checkbox, selected === reason.id && styles.checkboxActive]}>
                {selected === reason.id && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{reason.title}</Text>
                <Text style={styles.optionDesc}>{reason.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, !selected && { opacity: 0.5 }]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
