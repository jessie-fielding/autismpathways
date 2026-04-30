import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveChild } from '../../services/childManager';

const COLORS = {
  bg: '#F5F4FB', card: '#FFFFFF', navy: '#1a1f5e', purple: '#7c6fd4',
  purpleDk: '#4a3f8f', purpleLt: '#f0ebff', textMid: '#6b6490',
  textLight: '#a09cbf', border: '#d4d0ef', teal: '#3BBFA3', tealLt: '#e3f7f1',
  white: '#ffffff', orange: '#e67e22', orangeLt: '#fef3e2',
};
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

const ELIGIBILITY_ITEMS = [
  { icon: '👧', label: 'Child under 19', detail: 'Medicaid covers children up to age 19 in most states' },
  { icon: '💰', label: 'Income within limits', detail: 'CHIP/Medicaid covers families up to 200–400% of the federal poverty level depending on your state' },
  { icon: '🏠', label: 'US citizen or qualified immigrant', detail: 'Child must be a US citizen, national, or qualified immigrant' },
  { icon: '📍', label: 'State resident', detail: 'You must reside in the state where you\'re applying' },
];

const STEPS = [
  {
    number: 1, icon: '📋', title: 'Gather Your Documents',
    desc: 'Before you apply, collect the documents you\'ll need. Having these ready will speed up the process significantly.',
    docs: [
      'Child\'s birth certificate or passport',
      'Social Security numbers for child and parents',
      'Proof of income (pay stubs, tax return, or benefit letters)',
      'Proof of state residency (utility bill, lease)',
      'Child\'s diagnosis documentation (if available)',
      'Current insurance information (if any)',
    ],
    tip: 'Upload these to Document Vault as you collect them so they\'re easy to find.',
    link: { label: 'Open Document Vault', route: '/document-vault' },
  },
  {
    number: 2, icon: '🌐', title: 'Apply Online or In Person',
    desc: 'You can apply for Medicaid through your state\'s Medicaid office, through Healthcare.gov, or in person at your local Department of Human Services.',
    options: [
      { label: 'Healthcare.gov', url: 'https://www.healthcare.gov', desc: 'Apply online — works in most states' },
      { label: 'Benefits.gov', url: 'https://www.benefits.gov', desc: 'Find your state\'s specific Medicaid program' },
      { label: 'Call 1-800-318-2596', url: 'tel:18003182596', desc: 'Federal Marketplace helpline — free assistance' },
    ],
    tip: 'Many states have a separate CHIP (Children\'s Health Insurance Program) for children who don\'t qualify for Medicaid but still need coverage.',
  },
  {
    number: 3, icon: '⏳', title: 'Wait for a Decision',
    desc: 'After submitting your application, the state has 45 days to make a decision (90 days if a disability determination is needed). You\'ll receive a notice by mail.',
    actions: [
      'Keep your contact information updated with the Medicaid office',
      'Respond promptly to any requests for additional information',
      'Note your application reference number for follow-up calls',
    ],
    tip: 'If you haven\'t heard back in 30 days, call your state Medicaid office to check on the status.',
  },
  {
    number: 4, icon: '📬', title: 'Respond to Requests',
    desc: 'The Medicaid office may send you a Request for Information (RFI) asking for additional documents or clarification. You typically have 10–30 days to respond.',
    actions: [
      'Check your mail daily during the review period',
      'Submit requested documents as quickly as possible',
      'Keep copies of everything you send',
    ],
    tip: 'If you miss an RFI deadline, you can often still respond — call the office and explain the situation.',
  },
  {
    number: 5, icon: '✅', title: 'If Approved — Activate Services',
    desc: 'If approved, you\'ll receive an award letter and Medicaid card. Follow the post-approval checklist to activate services and find providers.',
    actions: [
      'Save your award letter and Medicaid ID number',
      'Choose or accept a Service Coordinator',
      'Schedule a Plan of Care meeting within 30 days',
    ],
    link: { label: 'View Post-Approval Checklist', route: '/medicaid/approved' },
  },
  {
    number: 6, icon: '⚖️', title: 'If Denied — Appeal',
    desc: 'If your application is denied, you have the right to appeal. Most states require you to file an appeal within 90 days of the denial notice.',
    actions: [
      'Read the denial notice carefully — it must state the reason',
      'File a written appeal before the deadline',
      'Request a fair hearing — you can bring an advocate',
      'Contact your state\'s Disability Rights organization for free help',
    ],
    tip: 'Many denials are overturned on appeal. Don\'t give up — the appeal process exists for a reason.',
    link: { label: 'Open Appeal Tracker', route: '/appeal-tracker' },
  },
];

const STORAGE_KEY = 'ap_medicaid_not_applied_steps';

export default function MedicaidNotAppliedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key: childKey } = useActiveChild();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [eligibilityExpanded, setEligibilityExpanded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then((val) => {
        if (val) setCompletedSteps(JSON.parse(val));
      });
    }, [])
  );

  const toggleStep = async (num: number) => {
    const updated = completedSteps.includes(num)
      ? completedSteps.filter((s) => s !== num)
      : [...completedSteps, num];
    setCompletedSteps(updated);
    // Save the checklist state
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Also sync the count to the child-scoped progress key so Dashboard tracker updates
    await AsyncStorage.setItem(childKey('ap_medicaid_progress'), String(updated.length));
  };

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Medicaid</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏥</Text>
          <Text style={styles.heroTitle}>Let's Get Started</Text>
          <Text style={styles.heroSub}>Medicaid provides free or low-cost health coverage for children with disabilities. This guide walks you through every step of the application process.</Text>
        </View>

        {/* ELIGIBILITY */}
        <TouchableOpacity
          style={styles.eligibilityCard}
          onPress={() => setEligibilityExpanded(!eligibilityExpanded)}
          activeOpacity={0.85}
        >
          <View style={styles.eligibilityHeader}>
            <Text style={styles.eligibilityTitle}>✅ Am I eligible?</Text>
            <Text style={styles.eligibilityChevron}>{eligibilityExpanded ? '▲' : '▼'}</Text>
          </View>
          {eligibilityExpanded && (
            <View style={styles.eligibilityBody}>
              {ELIGIBILITY_ITEMS.map((item, i) => (
                <View key={i} style={styles.eligibilityRow}>
                  <Text style={styles.eligibilityIcon}>{item.icon}</Text>
                  <View style={styles.eligibilityText}>
                    <Text style={styles.eligibilityLabel}>{item.label}</Text>
                    <Text style={styles.eligibilityDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.eligibilityNote}>
                Children with disabilities often qualify even if family income is above the standard limit through special Medicaid waivers. If you\'re unsure, apply anyway — the office will determine eligibility.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* PROGRESS */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Application Checklist</Text>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSub}>{completedSteps.length} of {STEPS.length} steps complete</Text>
        </View>

        {/* STEPS */}
        {STEPS.map((step) => {
          const done = completedSteps.includes(step.number);
          return (
            <View key={step.number} style={[styles.stepCard, done && styles.stepCardDone]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNum, done && styles.stepNumDone]}>
                  <Text style={styles.stepNumText}>{done ? '✓' : step.number}</Text>
                </View>
                <View style={styles.stepTitleBlock}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.title}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleStep(step.number)} style={[styles.checkBtn, done && styles.checkBtnDone]}>
                  <Text style={[styles.checkBtnText, done && styles.checkBtnTextDone]}>{done ? '✓ Done' : 'Mark done'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.stepDesc}>{step.desc}</Text>

              {step.docs && (
                <View style={styles.docList}>
                  {step.docs.map((doc, i) => (
                    <View key={i} style={styles.docRow}>
                      <Text style={styles.docBullet}>📄</Text>
                      <Text style={styles.docText}>{doc}</Text>
                    </View>
                  ))}
                </View>
              )}

              {step.actions && (
                <View style={styles.actionList}>
                  {step.actions.map((action, i) => (
                    <View key={i} style={styles.actionRow}>
                      <Text style={styles.actionBullet}>•</Text>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              )}

              {step.options && (
                <View style={styles.optionList}>
                  {step.options.map((opt, i) => (
                    <TouchableOpacity key={i} style={styles.optionRow} onPress={() => Linking.openURL(opt.url)}>
                      <View style={styles.optionLeft}>
                        <Text style={styles.optionLabel}>{opt.label}</Text>
                        <Text style={styles.optionDesc}>{opt.desc}</Text>
                      </View>
                      <Text style={styles.optionArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {step.tip && (
                <View style={styles.tipBox}>
                  <Text style={styles.tipText}>💡 {step.tip}</Text>
                </View>
              )}

              {step.link && (
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => router.push(step.link!.route as any)}
                >
                  <Text style={styles.linkBtnText}>{step.link.label} →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* HELP CALLOUT */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>🤝 Need Help Applying?</Text>
          <Text style={styles.helpBody}>Disability Rights organizations in every state offer free help with Medicaid applications and appeals. They are legally required to assist you at no cost.</Text>
          <TouchableOpacity style={styles.helpBtn} onPress={() => Linking.openURL('https://www.ndrn.org/find-your-agency/')}>
            <Text style={styles.helpBtnText}>Find Your Disability Rights Org →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: SPACING.xs },
  backText: { fontSize: 14, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  hero: {
    backgroundColor: COLORS.purpleLt, borderRadius: 16, padding: SPACING.xl,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#c5b8f0',
  },
  heroEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.purpleDk, marginBottom: SPACING.sm },
  heroSub: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 20 },
  eligibilityCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  eligibilityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eligibilityTitle: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  eligibilityChevron: { fontSize: 12, color: COLORS.textMid },
  eligibilityBody: { marginTop: SPACING.md },
  eligibilityRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md, alignItems: 'flex-start' },
  eligibilityIcon: { fontSize: 20 },
  eligibilityText: { flex: 1 },
  eligibilityLabel: { fontSize: 13, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  eligibilityDetail: { fontSize: 12, color: COLORS.textMid, lineHeight: 16 },
  eligibilityNote: {
    fontSize: 12, color: COLORS.purple, lineHeight: 18,
    backgroundColor: COLORS.purpleLt, borderRadius: 8, padding: SPACING.md, marginTop: SPACING.sm,
  },
  progressCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  progressPct: { fontSize: 13, fontWeight: '700', color: COLORS.purple },
  progressBar: { height: 8, backgroundColor: '#ede9fc', borderRadius: 4, marginBottom: SPACING.xs },
  progressFill: { height: 8, backgroundColor: COLORS.purple, borderRadius: 4 },
  progressSub: { fontSize: 11, color: COLORS.textMid },
  stepCard: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  stepCardDone: { borderColor: COLORS.teal, backgroundColor: '#f8fffd' },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md, gap: SPACING.sm },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.purpleLt,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumDone: { backgroundColor: COLORS.teal },
  stepNumText: { fontSize: 12, fontWeight: '700', color: COLORS.purpleDk },
  stepTitleBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  stepIcon: { fontSize: 18 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy, flex: 1 },
  stepTitleDone: { color: COLORS.textMid },
  checkBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border,
  },
  checkBtnDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  checkBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },
  checkBtnTextDone: { color: COLORS.white },
  stepDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.md },
  docList: { marginBottom: SPACING.md },
  docRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xs, alignItems: 'flex-start' },
  docBullet: { fontSize: 12 },
  docText: { fontSize: 13, color: COLORS.navy, flex: 1, lineHeight: 18 },
  actionList: { marginBottom: SPACING.md },
  actionRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xs },
  actionBullet: { fontSize: 13, color: COLORS.purple, fontWeight: '700', marginTop: 1 },
  actionText: { fontSize: 13, color: COLORS.navy, flex: 1, lineHeight: 18 },
  optionList: { marginBottom: SPACING.md, gap: SPACING.sm },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.purpleLt,
    borderRadius: 10, padding: SPACING.md, gap: SPACING.md,
  },
  optionLeft: { flex: 1 },
  optionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.purpleDk },
  optionDesc: { fontSize: 11, color: COLORS.textMid },
  optionArrow: { fontSize: 16, color: COLORS.purple },
  tipBox: {
    backgroundColor: '#fffbeb', borderRadius: 8, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: '#f59e0b', marginBottom: SPACING.sm,
  },
  tipText: { fontSize: 12, color: '#92400e', lineHeight: 18 },
  linkBtn: {
    backgroundColor: COLORS.purpleLt, borderRadius: 8, padding: SPACING.md,
    alignItems: 'center', marginTop: SPACING.xs,
  },
  linkBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.purpleDk },
  helpCard: {
    backgroundColor: '#e8f5e9', borderRadius: 14, padding: SPACING.xl,
    borderWidth: 1, borderColor: '#c8e6c9', marginTop: SPACING.sm,
  },
  helpTitle: { fontSize: 15, fontWeight: '800', color: '#1b5e20', marginBottom: SPACING.sm },
  helpBody: { fontSize: 13, color: '#2e7d32', lineHeight: 20, marginBottom: SPACING.md },
  helpBtn: {
    backgroundColor: '#2e7d32', borderRadius: 10, padding: SPACING.md, alignItems: 'center',
  },
  helpBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
});
