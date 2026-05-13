import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const SUPPORT_NEEDS = [
  { id: 'communication', label: 'Communication' },
  { id: 'social', label: 'Social interaction' },
  { id: 'selfcare', label: 'Self-care / ADLs' },
  { id: 'behavior', label: 'Behavioral challenges' },
  { id: 'sensory', label: 'Sensory processing' },
  { id: 'mobility', label: 'Mobility / motor skills' },
  { id: 'safety', label: 'Safety awareness' },
  { id: 'learning', label: 'Learning / academics' },
];

const DIAGNOSES = [
  { id: 'asd', label: 'Autism Spectrum Disorder' },
  { id: 'adhd', label: 'ADHD' },
  { id: 'id', label: 'Intellectual Disability' },
  { id: 'anxiety', label: 'Anxiety Disorder' },
  { id: 'spd', label: 'Sensory Processing Disorder' },
  { id: 'other', label: 'Other' },
];

export default function Step2Quiz() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Set<string>>(new Set());
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set());
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleDiagnosis = (id: string) => {
    const next = new Set(selectedDiagnoses);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedDiagnoses(next);
  };

  const toggleNeed = (id: string) => {
    const next = new Set(selectedNeeds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedNeeds(next);
  };

  const canContinue = childName.trim().length > 0 && selectedNeeds.size > 0;

  const handleNext = () => {
    router.push({
      pathname: '/medicaid/ltd-journey/step-3-summary',
      params: {
        childName,
        childAge,
        diagnoses: JSON.stringify([...selectedDiagnoses]),
        needs: JSON.stringify([...selectedNeeds]),
        notes: additionalNotes,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LTD Provider Journey</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 2 of 4</Text>
          <Text style={styles.progressPercent}>50% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={styles.sectionLabel}>ABOUT YOUR CHILD</Text>
          <Text style={styles.mainTitle}>Tell me about your child</Text>
          <Text style={styles.mainSubtitle}>
            This information will be organized into a summary you can share with your provider.
            Nothing here is sent anywhere — it stays on your device.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Child name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Child's first name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Alex"
              placeholderTextColor={COLORS.textLight}
              value={childName}
              onChangeText={setChildName}
            />
          </View>

          {/* Age */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Child's age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 7"
              placeholderTextColor={COLORS.textLight}
              value={childAge}
              onChangeText={setChildAge}
              keyboardType="numeric"
            />
          </View>

          {/* Diagnoses */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Diagnoses (select all that apply)</Text>
            <View style={styles.chipGrid}>
              {DIAGNOSES.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.chip, selectedDiagnoses.has(d.id) && styles.chipActive]}
                  onPress={() => toggleDiagnosis(d.id)}
                >
                  <Text style={[styles.chipText, selectedDiagnoses.has(d.id) && styles.chipTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Support needs */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Areas where your child needs support</Text>
            <Text style={styles.fieldHint}>Select all that apply — be thorough</Text>
            <View style={styles.chipGrid}>
              {SUPPORT_NEEDS.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.chip, selectedNeeds.has(n.id) && styles.chipActive]}
                  onPress={() => toggleNeed(n.id)}
                >
                  <Text style={[styles.chipText, selectedNeeds.has(n.id) && styles.chipTextActive]}>
                    {n.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Anything else to share with the provider?</Text>
            <Text style={styles.fieldHint}>
              Specific behaviors, daily challenges, things that are hard at home or school
            </Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="e.g., Has meltdowns when routines change, needs 1:1 support at school, cannot be left unsupervised..."
              placeholderTextColor={COLORS.textLight}
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>💡 BE SPECIFIC</Text>
            <Text style={styles.tipText}>
              The more specific you are, the better. Instead of "has trouble communicating," try
              "uses 2–3 word phrases, cannot express pain or needs verbally, uses an AAC device."
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, !canContinue && { opacity: 0.5 }]}
          disabled={!canContinue}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>See summary →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, 
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  backButton: { fontSize: 22, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressContainer: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text },
  progressPercent: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.pill },
  contentHeader: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sectionNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionNumberText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 28 },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  fieldGroup: { marginBottom: SPACING.xl },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  fieldHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.text,
  },
  inputMulti: { minHeight: 120, paddingTop: SPACING.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  chipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  chipTextActive: { color: COLORS.white },
  tipBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  navigationButtons: {
    flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  navButton: { flex: 1, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  navButtonPrimary: { backgroundColor: COLORS.purple },
  navButtonSecondary: { backgroundColor: COLORS.lavender },
  navButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  navButtonTextPrimary: { color: COLORS.white },
  navButtonTextSecondary: { color: COLORS.purple },
});
