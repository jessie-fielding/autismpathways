import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert, Modal,
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
  green: '#2e7d32', greenLt: '#e8f5e9', orange: '#e67e22', orangeLt: '#fef3e2',
  white: '#ffffff',
};
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

const STEPS = [
  {
    number: 1, icon: '📬', title: 'Receive Your Award Letter',
    desc: 'You should receive an official Medicaid award letter in the mail. Keep this — it confirms your child\'s coverage start date, coverage type, and any spend-down requirements.',
    actions: ['Save the award letter in your Document Vault', 'Note your child\'s Medicaid ID number', 'Confirm the effective date of coverage'],
    tip: 'Take a photo of the award letter and upload it to Document Vault immediately.',
  },
  {
    number: 2, icon: '👩‍⚕️', title: 'Choose a Service Coordinator',
    desc: 'Your state will assign or let you choose a Service Coordinator (also called a Case Manager). This person is your main point of contact for all Medicaid services and waiver programs.',
    actions: ['Request a specific coordinator if you have a preference', 'Schedule an initial meeting within 30 days', 'Ask about their caseload and response time'],
    tip: 'You have the right to request a different coordinator if you\'re not satisfied with the one assigned.',
  },
  {
    number: 3, icon: '📋', title: 'Complete the Plan of Care',
    desc: 'Work with your Service Coordinator to develop an Individual Service Plan (ISP) or Plan of Care. This document determines what services your child can receive and for how long.',
    actions: ['List all therapies and services your child needs', 'Include ABA, OT, PT, speech, personal care', 'Review and sign the plan — you can negotiate'],
    tip: 'The Plan of Care is negotiable. Don\'t sign until it includes everything your child needs.',
  },
  {
    number: 4, icon: '🏥', title: 'Find Medicaid Providers',
    desc: 'Not all providers accept Medicaid. You\'ll need to find in-network providers for each service in your child\'s Plan of Care.',
    actions: ['Ask your Service Coordinator for a provider list', 'Verify each provider is actively accepting Medicaid', 'Check wait times — some providers have 6-12 month waits'],
    tip: 'Use the Primary Care Directory in the Tools section to find autism-friendly providers in your area.',
  },
  {
    number: 5, icon: '📝', title: 'Complete the PMIP Form',
    desc: 'The Physician Medical Information Program (PMIP) form is completed by your child\'s doctor and submitted to Medicaid. It authorizes specific services like ABA therapy.',
    actions: ['Schedule a PMIP appointment with your pediatrician', 'Bring your ICD-10 code list from the ICD Quiz', 'Ensure all diagnoses and service needs are documented'],
    tip: 'Use the ICD Support Quiz in Tools to prepare a list of codes to discuss with your doctor.',
    link: { label: 'Take ICD Support Quiz', route: '/icd-quiz' },
  },
  {
    number: 6, icon: '🔄', title: 'Understand Renewals & Reviews',
    desc: 'Medicaid eligibility must be renewed annually. Your child\'s Plan of Care is also reviewed regularly. Missing renewal deadlines can cause a gap in coverage.',
    actions: ['Set a reminder 90 days before your renewal date', 'Keep income documentation updated', 'Request a review if your child\'s needs change significantly'],
    tip: 'Enable renewal reminders in Settings → Notifications so you never miss a deadline.',
  },
];

const STORAGE_KEY = 'ap_medicaid_approved_steps';

export default function MedicaidApprovedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key: childKey } = useActiveChild();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);

  useEffect(() => {
    if (completedSteps.length === STEPS.length && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
    }
  }, [completedSteps]);

  return (
    <View style={styles.container}>
      {/* CELEBRATION MODAL */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>You did it!</Text>
            <Text style={styles.modalSub}>You've completed every step of the Medicaid post-approval checklist. Your child's coverage is fully activated!</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalNextLabel}>READY FOR YOUR NEXT STEP?</Text>
            <Text style={styles.modalNextText}>Apply for an HCBS Waiver to unlock additional services like respite care, behavioral support, and community integration. Waitlists can be years long — apply now.</Text>
            <TouchableOpacity
              style={styles.modalWaiverBtn}
              onPress={() => { setShowCelebration(false); router.push('/waiver' as any); }}
            >
              <Text style={styles.modalWaiverBtnText}>Start Waiver Pathway 🌟</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowCelebration(false)}>
              <Text style={styles.modalDismissText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicaid Approved</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎉</Text>
          <Text style={styles.heroTitle}>Congratulations!</Text>
          <Text style={styles.heroSub}>Your child has been approved for Medicaid. Here's what to do next to activate services and make the most of your coverage.</Text>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Post-Approval Checklist</Text>
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
              <View style={styles.actionList}>
                {step.actions.map((action, i) => (
                  <View key={i} style={styles.actionRow}>
                    <Text style={styles.actionBullet}>•</Text>
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 {step.tip}</Text>
              </View>
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

        {/* WAIVER CALLOUT */}
        <View style={styles.waiverCard}>
          <Text style={styles.waiverTitle}>🌟 Next Step: Apply for a Waiver</Text>
          <Text style={styles.waiverBody}>
            Medicaid covers medical care, but Home and Community Based Services (HCBS) waivers fund additional support like respite care, behavioral therapy, and community integration. Apply early — waitlists can be years long.
          </Text>
          <TouchableOpacity style={styles.waiverBtn} onPress={() => router.push('/waiver' as any)}>
            <Text style={styles.waiverBtnText}>Start Waiver Pathway →</Text>
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
    backgroundColor: COLORS.greenLt, borderRadius: 16, padding: SPACING.xl,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#c8e6c9',
  },
  heroEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.green, marginBottom: SPACING.sm },
  heroSub: { fontSize: 14, color: '#2e7d32', textAlign: 'center', lineHeight: 20 },
  progressCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  progressPct: { fontSize: 13, fontWeight: '700', color: COLORS.purple },
  progressBar: { height: 8, backgroundColor: '#ede9fc', borderRadius: 4, marginBottom: SPACING.xs },
  progressFill: { height: 8, backgroundColor: COLORS.teal, borderRadius: 4 },
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
  actionList: { marginBottom: SPACING.md },
  actionRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xs },
  actionBullet: { fontSize: 13, color: COLORS.purple, fontWeight: '700', marginTop: 1 },
  actionText: { fontSize: 13, color: COLORS.navy, flex: 1, lineHeight: 18 },
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
  waiverCard: {
    backgroundColor: '#fff8e1', borderRadius: 14, padding: SPACING.xl,
    borderWidth: 1, borderColor: '#ffe082', marginTop: SPACING.sm,
  },
  waiverTitle: { fontSize: 15, fontWeight: '800', color: '#e65100', marginBottom: SPACING.sm },
  waiverBody: { fontSize: 13, color: '#bf360c', lineHeight: 20, marginBottom: SPACING.md },
  waiverBtn: {
    backgroundColor: '#e65100', borderRadius: 10, padding: SPACING.md, alignItems: 'center',
  },
  waiverBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  // Celebration modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: SPACING.xxl,
    width: '100%', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8,
  },
  modalEmoji: { fontSize: 52, marginBottom: SPACING.md },
  modalTitle: { fontSize: 24, fontWeight: '800', color: COLORS.navy, marginBottom: SPACING.sm, textAlign: 'center' },
  modalSub: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 21, marginBottom: SPACING.lg },
  modalDivider: { height: 1, backgroundColor: COLORS.border, width: '100%', marginBottom: SPACING.lg },
  modalNextLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.purple, letterSpacing: 1,
    marginBottom: SPACING.sm, textAlign: 'center',
  },
  modalNextText: { fontSize: 13, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  modalWaiverBtn: {
    backgroundColor: COLORS.purple, borderRadius: 50, paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl, alignItems: 'center', width: '100%', marginBottom: SPACING.md,
  },
  modalWaiverBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  modalDismiss: { paddingVertical: SPACING.sm, alignItems: 'center' },
  modalDismissText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
});
