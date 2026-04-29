import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },

  warningBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  warningTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },

  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNumber: {
    backgroundColor: '#FF9800',
    color: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  actionButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FF9800',
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
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
  buttonPrimary: { backgroundColor: '#FF9800', borderColor: '#FF9800' },
  buttonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  buttonTextWhite: { color: COLORS.white },
});

const commonReasons = [
  {
    reason: 'Missing Income Documentation',
    check: 'Did you send recent pay stubs (last 30 days) or tax returns?',
    call: 'Medicaid Office - Ask for document deadline',
    say: '"I received a denial for missing income verification. What documents do you need and by what date?"',
  },
  {
    reason: 'Incomplete Application',
    check: 'Were there blank fields in your application?',
    call: 'Medicaid Office - Request corrected form',
    say: '"I want to correct my application. Can you tell me which fields were incomplete?"',
  },
  {
    reason: 'Signature Missing',
    check: 'Did you sign and date every required page?',
    call: 'Medicaid Office - Ask what needs signing',
    say: '"My application was denied for missing signatures. Can you tell me exactly which pages need my signature?"',
  },
  {
    reason: 'Identity Not Verified',
    check: 'Did you submit ID for the child and caregiver?',
    call: 'Medicaid Office - Ask what ID is acceptable',
    say: '"What form of ID do you accept for identity verification?"',
  },
];

export default function AdminChecklistStep() {
  const router = useRouter();

  const handleDownloadChecklist = () => {
    Alert.alert('Download', 'Checklist saved to your device for printing');
  };

  const handleContinue = () => {
    router.push('/medicaid/appeal-journey/step-4-action');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Common Issues & Actions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What to Check & Who to Call</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⏱️ DEADLINE REMINDER</Text>
            <Text style={styles.warningText}>
              If you have missing documents, you typically have 10-30 days to submit them. Check your denial letter for the exact deadline.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Most Common Administrative Denials</Text>

          {commonReasons.map((item, idx) => (
            <View key={idx} style={styles.stepCard}>
              <Text style={styles.stepNumber}>{idx + 1}</Text>
              <Text style={styles.stepTitle}>{item.reason}</Text>
              
              <Text style={[styles.stepTitle, { marginTop: SPACING.md, fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#666' }]}>
                ✓ Check:
              </Text>
              <Text style={styles.stepText}>{item.check}</Text>

              <Text style={[styles.stepTitle, { marginTop: SPACING.md, fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#666' }]}>
                📞 Call:
              </Text>
              <Text style={styles.stepText}>{item.call}</Text>

              <Text style={[styles.stepTitle, { marginTop: SPACING.md, fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#666' }]}>
                💬 Say:
              </Text>
              <Text style={[styles.stepText, { fontStyle: 'italic' }]}>{item.say}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.actionButton} onPress={handleDownloadChecklist}>
            <Text style={styles.actionButtonText}>📥 Download Printable Checklist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
