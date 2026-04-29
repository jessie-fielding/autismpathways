import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const options = [
  { id: 'autism', title: 'Autism', desc: 'Autism spectrum disorder diagnosis or related developmental evaluation.' },
  { id: 'cerebral-palsy', title: 'Cerebral Palsy', desc: 'Motor and physical support needs related to cerebral palsy.' },
  { id: 'down-syndrome', title: 'Down Syndrome', desc: 'Developmental and medical support needs associated with Down syndrome.' },
  { id: 'intellectual-disability', title: 'Intellectual Disability', desc: 'Cognitive or adaptive functioning limitations documented in evaluation records.' },
  { id: 'other', title: 'Other', desc: 'Another disability category that may still qualify for disability-based Medicaid.' },
];

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

  contentHeader: {
    backgroundColor: 'rgba(76, 175, 80, 0.10)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 32,
  },
  subText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },

  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },

  optionBox: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionBoxActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.lg,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },

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
  buttonPrimary: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buttonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  buttonTextWhite: {
    color: COLORS.white,
  },
});

export default function DisabilityQuiz1() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.replace('/medicaid/waiver-journey/intro');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Assessment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Text style={styles.mainTitle}>What is the primary disability?</Text>
          <Text style={styles.subText}>
            Select the option that best fits so we can guide you to the most relevant Medicaid or waiver pathway.
          </Text>
        </View>

        <View style={styles.content}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionBox, selected === option.id && styles.optionBoxActive]}
              onPress={() => setSelected(option.id)}
            >
              <View style={[styles.checkbox, selected === option.id && styles.checkboxActive]}>
                {selected === option.id && <Text style={styles.checkmark}>✓</Text>}
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionText}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, !selected && { opacity: 0.5 }]}
          disabled={!selected}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
