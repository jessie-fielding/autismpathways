import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NEED_LABELS: Record<string, string> = {
  communication: 'Communication',
  social: 'Social interaction',
  selfcare: 'Self-care / ADLs',
  behavior: 'Behavioral challenges',
  sensory: 'Sensory processing',
  mobility: 'Mobility / motor skills',
  safety: 'Safety awareness',
  learning: 'Learning / academics',
};

const DIAGNOSIS_LABELS: Record<string, string> = {
  asd: 'Autism Spectrum Disorder',
  adhd: 'ADHD',
  id: 'Intellectual Disability',
  anxiety: 'Anxiety Disorder',
  spd: 'Sensory Processing Disorder',
  other: 'Other',
};

export default function Step3Summary() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stateData } = useMedicaidState();
  const stateName = stateData?.stateName ?? null;
  const formName = stateData?.requiredForm ?? null;
  const params = useLocalSearchParams<{
    childName: string;
    childAge: string;
    diagnoses: string;
    needs: string;
    notes: string;
  }>();

  const diagnoses: string[] = params.diagnoses ? JSON.parse(params.diagnoses) : [];
  const needs: string[] = params.needs ? JSON.parse(params.needs) : [];

  // Appointment picker state
  const [apptModal, setApptModal]         = useState(false);
  const [savedNotes, setSavedNotes]       = useState<any[]>([]);
  const [selectedAppts, setSelectedAppts] = useState<Set<number>>(new Set());
  const [linking, setLinking]             = useState(false);
  const [linked, setLinked]               = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('ap_provider_prep_saved').then((raw) => {
      if (raw) {
        try { setSavedNotes(JSON.parse(raw)); } catch (_) {}
      }
    });
    // Save LTD summary to AsyncStorage so it's available for linking later
    const ltdData = {
      childName: params.childName,
      childAge: params.childAge,
      diagnoses: diagnoses.map((d) => DIAGNOSIS_LABELS[d] || d),
      needs: needs.map((n) => NEED_LABELS[n] || n),
      notes: params.notes,
      stateName,
      formName,
      generatedAt: new Date().toISOString(),
    };
    AsyncStorage.setItem('ap_medicaid_ltd_summary', JSON.stringify(ltdData));
  }, []);

  const medicaidData = {
    childName: params.childName,
    childAge: params.childAge,
    diagnoses: diagnoses.map((d) => DIAGNOSIS_LABELS[d] || d),
    needs: needs.map((n) => NEED_LABELS[n] || n),
    notes: params.notes,
    stateName,
    formName,
    generatedAt: new Date().toISOString(),
  };

  const handleLinkToAppointments = async () => {
    setLinking(true);
    try {
      const raw = await AsyncStorage.getItem('ap_provider_prep_saved');
      const notes: any[] = raw ? JSON.parse(raw) : [];
      const updated = notes.map((n, i) =>
        selectedAppts.has(i) ? { ...n, medicaidLtd: medicaidData } : n
      );
      await AsyncStorage.setItem('ap_provider_prep_saved', JSON.stringify(updated));
      setSavedNotes(updated);
      setLinked(true);
      setApptModal(false);
      Alert.alert(
        'Added!',
        `Medicaid LTD summary added to ${selectedAppts.size} appointment report${selectedAppts.size > 1 ? 's' : ''}.`
      );
    } catch (_) {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Provider Journey</Text>
          {stateName && <Text style={styles.headerState}>📍 {stateName}</Text>}
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20 }}>🏠</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 3 of 4</Text>
          <Text style={styles.progressPercent}>75% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionLabel}>PROVIDER SUMMARY</Text>
          <Text style={styles.mainTitle}>Here's what to share with your provider</Text>
          <Text style={styles.mainSubtitle}>
            Show this screen to your provider or print it before your appointment. It gives them
            everything they need to complete the required documentation accurately.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>PROVIDER BRIEFING</Text>
              <Text style={styles.summarySubtitle}>
                {formName ? `For ${formName}` : 'For Disability-Based Medicaid Documentation'}
              </Text>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>CHILD INFORMATION</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{params.childName || '—'}</Text>
              </View>
              {params.childAge ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Age:</Text>
                  <Text style={styles.summaryValue}>{params.childAge} years old</Text>
                </View>
              ) : null}
            </View>

            {diagnoses.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>DIAGNOSES</Text>
                {diagnoses.map((d) => (
                  <Text key={d} style={styles.summaryBullet}>
                    • {DIAGNOSIS_LABELS[d] || d}
                  </Text>
                ))}
              </View>
            )}

            {needs.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>AREAS REQUIRING SUPPORT</Text>
                {needs.map((n) => (
                  <Text key={n} style={styles.summaryBullet}>
                    • {NEED_LABELS[n] || n}
                  </Text>
                ))}
              </View>
            )}

            {params.notes ? (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>ADDITIONAL NOTES</Text>
                <Text style={styles.summaryNotes}>{params.notes}</Text>
              </View>
            ) : null}

            <View style={styles.summaryFooter}>
              <Text style={styles.summaryFooterText}>
                Please complete any required state-specific documentation based on the above
                information. This child is seeking disability-based Medicaid eligibility.
              </Text>
            </View>
          </View>

          {/* Add to Appointment Report */}
          {savedNotes.length > 0 ? (
            <TouchableOpacity
              style={[styles.addApptBtn, linked && styles.addApptBtnLinked]}
              onPress={() => setApptModal(true)}
            >
              <Text style={styles.addApptIcon}>{linked ? '✅' : '📅'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.addApptTitle}>
                  {linked ? 'Added to Appointment Report' : 'Add to Appointment Report'}
                </Text>
                <Text style={styles.addApptSub}>
                  {linked
                    ? 'Tap to update which appointments include this summary'
                    : `Link this Medicaid summary to an upcoming appointment — ${savedNotes.length} available`}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addApptBtn}
              onPress={() => router.push('/provider-prep')}
            >
              <Text style={styles.addApptIcon}>📋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.addApptTitle}>Add to Appointment Report</Text>
                <Text style={styles.addApptSub}>Create an appointment first to link this summary</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>📋 AT YOUR APPOINTMENT</Text>
            <Text style={styles.tipText}>
              Show this to your provider and say:{'\n\n'}
              <Text style={styles.script}>
                "I've put together a summary of my child's needs to help you complete any required
                documentation for their disability-based Medicaid eligibility."
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
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/ltd-journey/step-3b-pmip-check')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>After the visit →</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Picker Modal */}
      <Modal visible={apptModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setApptModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Appointment</Text>
            <TouchableOpacity
              style={[styles.modalDoneBtn, selectedAppts.size === 0 && styles.modalDoneBtnDisabled]}
              disabled={selectedAppts.size === 0 || linking}
              onPress={handleLinkToAppointments}
            >
              <Text style={styles.modalDoneText}>{linking ? '...' : 'Done'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Select which upcoming appointment(s) to include this Medicaid LTD summary in.
          </Text>
          <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
            {savedNotes.map((note, i) => {
              const sel = selectedAppts.has(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.apptCard, sel && styles.apptCardSelected]}
                  onPress={() => {
                    const next = new Set(selectedAppts);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    setSelectedAppts(next);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.apptCardTitle}>{note.draft?.providerName || note.providerName || 'Provider'} — {note.draft?.apptDate || note.appointmentDate || note.date || ''}</Text>
                    <Text style={styles.apptCardMeta}>{note.draft?.visitType || note.visitType || ''}</Text>
                    {note.medicaidLtd && (
                      <Text style={styles.apptCardBadge}>✓ Medicaid summary already linked</Text>
                    )}
                  </View>
                  <View style={[styles.apptCheckbox, sel && styles.apptCheckboxSelected]}>
                    {sel && <Text style={styles.apptCheckmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  headerTextGroup: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerState: { fontSize: FONT_SIZES.xs, color: COLORS.purple, marginTop: 2 },
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
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl, gap: SPACING.lg },
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
  },
  summaryTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  summarySubtitle: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summarySection: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summarySectionTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: 'row', marginBottom: SPACING.xs },
  summaryLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid, width: 60 },
  summaryValue: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '700' },
  summaryBullet: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
  summaryNotes: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  summaryFooter: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.bg },
  summaryFooterText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, fontStyle: 'italic' },

  addApptBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#f0faf5', borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1.5, borderColor: '#2a9d8f', ...SHADOWS.sm,
  },
  addApptBtnLinked: { backgroundColor: '#e8f8f5' },
  addApptIcon: { fontSize: 28 },
  addApptTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#1a6b60' },
  addApptSub: { fontSize: FONT_SIZES.xs, color: '#2a9d8f', marginTop: 2 },

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

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  modalCancelText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  modalDoneBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: 6, minWidth: 60, alignItems: 'center',
  },
  modalDoneBtnDisabled: { opacity: 0.4 },
  modalDoneText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm, color: COLORS.textMid,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white,
  },
  apptCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  apptCardSelected: { borderColor: COLORS.purple, backgroundColor: '#f8f7ff' },
  apptCardTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  apptCardMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  apptCardBadge: { fontSize: FONT_SIZES.xs, color: '#2a9d8f', fontWeight: '600', marginTop: 4 },
  apptCheckbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.md,
  },
  apptCheckboxSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  apptCheckmark: { fontSize: 13, fontWeight: '800', color: COLORS.white },
});
