import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveChild } from '../../../services/childManager';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const METHODS = [
  {
    id: 'inperson',
    icon: '🏢',
    title: 'In Person',
    pros: [
      'Get a date-stamped receipt immediately',
      'Can ask questions on the spot',
      'Harder for documents to get "lost"',
      'Staff can help you fill out forms',
    ],
    cons: [
      'Requires travel to the office',
      'May have long wait times',
      'Need to take time off work',
    ],
    best: 'Best if you want certainty and have flexibility in your schedule',
  },
  {
    id: 'phone',
    icon: '📞',
    title: 'Over the Phone',
    pros: [
      'No travel required',
      'Can do it from home',
      'Often faster to start',
      'Good if you have transportation challenges',
    ],
    cons: [
      'Harder to track what was submitted',
      'May need to mail documents separately',
      'Less control over the process',
    ],
    best: 'Best if you have difficulty traveling or need to start quickly',
  },
  {
    id: 'online',
    icon: '💻',
    title: 'Online Portal',
    pros: [
      'Available 24/7',
      'Can save and return to application',
      'Upload documents digitally',
      'Instant confirmation',
    ],
    cons: [
      'Not all states have a full online option',
      'May still need to mail some documents',
      'Technical issues can occur',
    ],
    best: 'Best if your state has a complete online portal and you\'re comfortable with technology',
  },
];

export default function InPersonVsPhone() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  useEffect(() => {
    // Advance Medicaid dashboard progress to step 3
    (async () => {
      const cur = parseInt(await AsyncStorage.getItem(childKey('ap_medicaid_progress')) || '0', 10);
      if (cur < 3) await AsyncStorage.setItem(childKey('ap_medicaid_progress'), '3');
    })();
  }, []);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Apply</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 3 of 5</Text>
          <Text style={styles.progressPercent}>60% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionLabel}>HOW TO APPLY</Text>
          <Text style={styles.mainTitle}>In person, by phone, or online?</Text>
          <Text style={styles.mainSubtitle}>
            There's no single right answer — it depends on your situation. Here's what you need to
            know about each option.
          </Text>
        </View>

        <View style={styles.content}>
          {METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, selected === method.id && styles.methodCardActive]}
              onPress={() => setSelected(selected === method.id ? null : method.id)}
            >
              <View style={styles.methodHeader}>
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodArrow}>{selected === method.id ? '▲' : '▼'}</Text>
              </View>

              {selected === method.id && (
                <View style={styles.methodDetails}>
                  <View style={styles.proConRow}>
                    <View style={styles.proCol}>
                      <Text style={styles.proConTitle}>✅ Pros</Text>
                      {method.pros.map((p, i) => (
                        <Text key={i} style={styles.proItem}>• {p}</Text>
                      ))}
                    </View>
                    <View style={styles.conCol}>
                      <Text style={styles.proConTitle}>⚠️ Cons</Text>
                      {method.cons.map((c, i) => (
                        <Text key={i} style={styles.conItem}>• {c}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={styles.bestBox}>
                    <Text style={styles.bestText}>💡 {method.best}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>📞 CALLING SCRIPT</Text>
            <Text style={styles.tipText}>
              When calling to apply, say:{'\n\n'}
              <Text style={styles.script}>
                "Hi, I'd like to apply for Medicaid for my family. My child has autism and we're
                interested in both household Medicaid and any disability-based programs. Can you
                walk me through the application process?"
              </Text>
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
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/how-to-apply/application-tracker')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Track application →</Text>
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
  methodCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.border, overflow: 'hidden',
  },
  methodCardActive: { borderColor: COLORS.purple },
  methodHeader: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
  },
  methodIcon: { fontSize: 24, marginRight: SPACING.md },
  methodTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  methodArrow: { fontSize: 12, color: COLORS.textMid },
  methodDetails: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  proConRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  proCol: { flex: 1 },
  conCol: { flex: 1 },
  proConTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  proItem: { fontSize: FONT_SIZES.xs, color: COLORS.successText, lineHeight: 18, marginBottom: 2 },
  conItem: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, lineHeight: 18, marginBottom: 2 },
  bestBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, padding: SPACING.md, marginTop: SPACING.md,
  },
  bestText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, lineHeight: 18 },
  tipBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  script: { fontStyle: 'italic' },
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
