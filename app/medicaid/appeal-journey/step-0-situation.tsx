import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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

const situations = [
  { id: 'denied', title: '❌ We Were Denied', desc: 'We received a denial letter and need to appeal or correct information' },
  { id: 'approved', title: '✅ We Were Approved', desc: 'Great! View our medicaid benefits and next steps' },
  { id: 'not-applied', title: '📝 We Haven\'t Applied Yet', desc: 'Let\'s start the medicaid application process' },
];

export default function SituationStep() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    
    if (selected === 'approved') {
      // Go to waiver pathway
      router.push('/(tabs)/waiver-journey');
    } else if (selected === 'not-applied') {
      // Go to how to apply for medicaid
      router.push('/medicaid/how-to-apply/step-1-intro');
    } else if (selected === 'denied') {
      // Go to step 1: why were you denied
      router.push('/medicaid/appeal-journey/step-1-understand');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medicaid Pathway</Text>
      </View>

      <ScrollView>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What's your situation?</Text>
        </View>

        <View style={styles.content}>
          {situations.map((situation) => (
            <TouchableOpacity
              key={situation.id}
              style={[styles.optionBox, selected === situation.id && styles.optionBoxActive]}
              onPress={() => setSelected(situation.id)}
            >
              <View style={[styles.checkbox, selected === situation.id && styles.checkboxActive]}>
                {selected === situation.id && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{situation.title}</Text>
                <Text style={styles.optionDesc}>{situation.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, selected && styles.buttonPrimary]} 
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={[styles.buttonText, selected && styles.buttonTextWhite]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
