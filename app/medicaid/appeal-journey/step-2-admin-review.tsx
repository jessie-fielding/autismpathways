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
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 24,
  },

  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.lg, lineHeight: 20 },

  checklistItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  checklistItemActive: {
    borderColor: COLORS.purple,
    backgroundColor: '#F1EBFB',
  },
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
  itemText: { flex: 1 },
  itemTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  itemDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 18 },

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

const adminReviewItems = [
  {
    id: 'application',
    title: 'Application Completeness',
    desc: 'Was your application form filled out completely? Check for blank fields.',
  },
  {
    id: 'signatures',
    title: 'Signatures & Authorization',
    desc: 'Are all required signatures present? Did you sign the right forms?',
  },
  {
    id: 'income',
    title: 'Income Documentation',
    desc: 'Did you submit recent pay stubs, tax returns, or benefit letters?',
  },
  {
    id: 'residency',
    title: 'Residency Proof',
    desc: 'Did you include proof of residency (utility bill, lease, etc.)?',
  },
  {
    id: 'identity',
    title: 'Identity Verification',
    desc: 'Did you submit ID for the child and caregiver?',
  },
  {
    id: 'medical',
    title: 'Medical Records',
    desc: 'Did you include relevant medical/evaluation documents?',
  },
  {
    id: 'dates',
    title: 'Dates & Timelines',
    desc: 'Are all dates correct? Is the timeline consistent?',
  },
];

export default function AdminReviewStep() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCheckedItems(newSet);
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('admin_reviewed_items', JSON.stringify(Array.from(checkedItems)));
      router.push('/medicaid/appeal-journey/step-3-admin-checklist');
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
        <Text style={styles.title}>Administrative Review</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Review Your Paperwork</Text>
          <Text style={styles.heroSubtitle}>
            Many denials are actually paperwork or processing errors. Let's review what you submitted.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Check Each Item</Text>
          <Text style={styles.sectionSubtitle}>
            Go through this checklist to see if any documents might be missing or incomplete:
          </Text>

          {adminReviewItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.checklistItem,
                checkedItems.has(item.id) && styles.checklistItemActive,
              ]}
              onPress={() => handleToggle(item.id)}
            >
              <View style={[styles.checkbox, checkedItems.has(item.id) && styles.checkboxActive]}>
                {checkedItems.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
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
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
