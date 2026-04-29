import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../../../lib/theme';

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
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  heading: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  text: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.lg },
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

export default function Apply() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Apply for LTD</Text>
      </View>

      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.heading}>How to Apply</Text>
          <Text style={styles.text}>
            You can apply for LTD through Social Security online at www.ssa.gov or visit your local Social Security office.
          </Text>
          <Text style={styles.text}>
            The application process typically takes 3-6 months. You may receive a decision letter in the mail.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => router.push('/medicaid/ltd-journey/apply-for-ltd/step-4-celebrate')}>
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
