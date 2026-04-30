import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveChild } from '../../services/childManager';
import { useChildChanged } from '../../hooks/useChildChanged';

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

  const loadCompletedSteps = useCallback(async () => {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val) setCompletedSteps(JSON.parse(val));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCompletedSteps();
    }, [loadCompletedSteps])
  );

  useChildChanged(() => { loadCompletedSteps(); });

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
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.teal, borderRadius: 3 },
  progressPct: { fontSize: 13, fontWeight: '700', color: COLORS.teal },
  progressSub: { fontSize: 12, color: COLORS.textMid, marginTop: SPACING.sm },
  stepCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  stepCardDone: { borderColor: COLORS.teal, backgroundColor: COLORS.tealLt },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  stepNumDone: { backgroundColor: COLORS.teal },
  stepNumText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  stepTitleBlock: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepIcon: { fontSize: 18, marginRight: SPACING.xs },
  stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, flexShrink: 1 },
  stepTitleDone: { color: COLORS.teal },
  checkBtn: {
    backgroundColor: COLORS.purpleLt, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm,
    borderRadius: 12, marginLeft: SPACING.sm,
  },
  checkBtnDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal, borderWidth: 1 },
  checkBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.purpleDk },
  checkBtnTextDone: { color: COLORS.white },
  stepDesc: { fontSize: 14, color: COLORS.textMid, marginBottom: SPACING.sm },
  actionList: { marginBottom: SPACING.sm },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.xs },
  actionBullet: { fontSize: 14, color: COLORS.textMid, marginRight: SPACING.xs },
  actionText: { fontSize: 14, color: COLORS.textMid, flex: 1 },
  tipBox: { backgroundColor: COLORS.purpleLt, borderRadius: 8, padding: SPACING.sm, marginTop: SPACING.sm },
  tipText: { fontSize: 13, color: COLORS.purpleDk, fontStyle: 'italic' },
  linkBtn: {
    backgroundColor: COLORS.purple, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 8, marginTop: SPACING.md, alignItems: 'center',
  },
  linkBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  waiverCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  waiverTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: SPACING.sm },
  waiverBody: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', marginBottom: SPACING.md },
  waiverBtn: {
    backgroundColor: COLORS.orange, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 8, alignItems: 'center',
  },
  waiverBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.xl, margin: SPACING.lg,
    alignItems: 'center', width: '90%', maxWidth: 400,
  },
  modalEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  modalTitle: { fontSize: 24, fontWeight: '800', color: COLORS.green, marginBottom: SPACING.sm },
  modalSub: { fontSize: 15, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  modalDivider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  modalNextLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textLight, marginBottom: SPACING.xs },
  modalNextText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.lg },
  modalWaiverBtn: {
    backgroundColor: COLORS.purple, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: 8, alignItems: 'center', width: '100%', marginBottom: SPACING.sm,
  },
  modalWaiverBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  modalDismiss: { paddingVertical: SPACING.xs },
  modalDismissText: { fontSize: 14, color: COLORS.textMid, fontWeight: '500' },
});
