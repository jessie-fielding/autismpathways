import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePmipProviderStore } from '../../../../lib/pmip/pmipProviderStore';
import { PMIP_COLORS, PMIP_SPACING, PMIP_SIZES } from '../../../../lib/pmip/pmipStyles';
import { generateAndSharePDF } from "../../../../lib/pmip/generatePDF";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PMIP_COLORS.screenBg,
  },
  scrollContent: {
    paddingHorizontal: PMIP_SPACING.xl,
    paddingTop: PMIP_SPACING.lg,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: PMIP_COLORS.heroBg,
    borderRadius: PMIP_SIZES.hugeRadius,
    padding: PMIP_SPACING.xxl,
    alignItems: 'center',
    marginBottom: PMIP_SPACING.lg,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PMIP_COLORS.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PMIP_SPACING.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PMIP_COLORS.heroTitle,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: PMIP_COLORS.mutedText,
    textAlign: 'center',
    marginTop: PMIP_SPACING.sm,
  },
  card: {
    backgroundColor: PMIP_COLORS.cardBg,
    borderRadius: PMIP_SIZES.largeRadius,
    padding: PMIP_SPACING.lg,
    marginBottom: PMIP_SPACING.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: PMIP_COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PMIP_COLORS.heroTitle,
    marginBottom: PMIP_SPACING.sm,
  },
  cardDescription: {
    fontSize: 13,
    color: PMIP_COLORS.mutedText,
    marginBottom: PMIP_SPACING.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: PMIP_SPACING.md,
  },
  checkbox: {
    width: PMIP_SIZES.checkboxSize,
    height: PMIP_SIZES.checkboxSize,
    borderRadius: 4,
    marginRight: PMIP_SPACING.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxUnchecked: {
    borderColor: '#d1d5db',
    backgroundColor: PMIP_COLORS.cardBg,
  },
  checkboxChecked: {
    borderColor: PMIP_COLORS.primaryPurple,
    backgroundColor: PMIP_COLORS.primaryPurple,
  },
  checkboxLabel: {
    fontSize: 14,
    color: PMIP_COLORS.bodyText,
    fontWeight: '600',
    flex: 1,
  },
  checkboxSub: {
    fontSize: 12,
    color: PMIP_COLORS.mutedText,
    marginTop: PMIP_SPACING.xs,
    lineHeight: 18,
  },
  notesBullet: {
    fontSize: 13,
    color: PMIP_COLORS.mutedText,
    fontStyle: 'italic',
    marginTop: PMIP_SPACING.sm,
    lineHeight: 20,
  },
  noteLabel: {
    fontWeight: '600',
    color: PMIP_COLORS.bodyText,
    fontStyle: 'normal',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: PMIP_SPACING.md,
    marginTop: PMIP_SPACING.xl,
  },
  button: {
    flex: 1,
    paddingVertical: PMIP_SPACING.lg,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: PMIP_COLORS.primaryPurple,
  },
  secondaryButton: {
    backgroundColor: PMIP_COLORS.cardBg,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButtonText: {
    color: PMIP_COLORS.cardBg,
  },
  secondaryButtonText: {
    color: PMIP_COLORS.bodyText,
  },
});

function SummaryCard(props: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{props.title}</Text>
      {props.description ? (
        <Text style={styles.cardDescription}>{props.description}</Text>
      ) : null}
      {props.children}
    </View>
  );
}

function CheckItem(props: { checked?: boolean; label: string; sub?: string }) {
  const checked = props.checked ?? false;
  return (
    <View style={styles.checkboxRow}>
      <View
        style={[
          styles.checkbox,
          checked ? styles.checkboxChecked : styles.checkboxUnchecked,
        ]}
      >
        {checked && <Text style={{ color: PMIP_COLORS.cardBg, fontSize: 12 }}>✔</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.checkboxLabel, { fontWeight: checked ? '700' : '600' }]}>
          {props.label}
        </Text>
        {props.sub ? <Text style={styles.checkboxSub}>{props.sub}</Text> : null}
      </View>
    </View>
  );
}

export default function Step3Summary() {
  const router = useRouter();
  const {
    childNickname,
    childAge,
    autismDxStatus,
    additionalDx,
    communicationNotes,
    sensoryNotes,
    dailyNotes,
    motorLearningNotes,
    providerDocNotes,
    providerFocusAreas,
  } = usePmipProviderStore();

  const displayName = childNickname?.trim() || 'your child';

  const headlineBits: string[] = [];
  if (childAge) headlineBits.push(`${childAge}-year-old`);
  if (autismDxStatus === 'yes') headlineBits.push('autistic');
  if (autismDxStatus === 'in_progress') headlineBits.push('in autism evaluation');
  if (autismDxStatus === 'suspected') headlineBits.push('autism suspected');
  const headline =
    headlineBits.length > 0 ? headlineBits.join(' • ') : 'Child details and diagnosis history';

  const dxLabels = additionalDx.length
    ? additionalDx
        .map((k) => {
          switch (k) {
            case 'adhd':
              return 'ADHD';
            case 'anxiety':
              return 'Anxiety';
            case 'id':
              return 'Intellectual disability';
            case 'dev_delay':
              return 'Developmental delay';
            case 'speech_delay':
              return 'Speech/language delay';
            case 'sensory':
              return 'Sensory processing differences';
            case 'epilepsy':
              return 'Epilepsy/seizures';
            case 'sleep':
              return 'Sleep disorder/concerns';
            case 'gi_feeding':
              return 'Feeding/GI issues';
            case 'other':
              return 'Other mental health or medical diagnoses';
            default:
              return null;
          }
        })
        .filter(Boolean)
        .join(', ')
    : '';

  const hasHistoryNotes =
    !!communicationNotes || !!sensoryNotes || !!dailyNotes || !!motorLearningNotes || !!providerDocNotes;

  const isFocus = (key: string) => providerFocusAreas.includes(key);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.successIcon}>
            <Text style={{ fontSize: 28 }}>✓</Text>
          </View>
          <Text style={styles.heroTitle}>You're better prepared</Text>
          <Text style={styles.heroSubtitle}>
            Here's a quick overview of your child's needs and the areas to review with your provider.
          </Text>
        </View>

        <SummaryCard
          title="How your child is doing"
          description="You can share this quick snapshot out loud or show your provider this screen."
        >
          <Text style={{ fontSize: 14, color: PMIP_COLORS.bodyText }}>
            {displayName} is {headline}.
          </Text>
          {dxLabels ? (
            <Text style={{ fontSize: 13, color: PMIP_COLORS.mutedText, marginTop: PMIP_SPACING.sm }}>
              Other diagnoses or concerns noted: {dxLabels}.
            </Text>
          ) : null}
        </SummaryCard>

        <SummaryCard
          title="Areas to discuss and document"
          description='These are common "boxes to check" in the chart when providers support Medicaid or disability paperwork.'
        >
          <CheckItem
            checked={isFocus('diagnoses_icd')}
            label="Diagnoses and ICD codes that match my child's profile"
            sub="Clear diagnoses and accurate codes that reflect autism and any co-occurring conditions."
          />
          <CheckItem
            checked={isFocus('daily_living')}
            label="Daily living and self-care needs"
            sub="How much support your child needs with toileting, feeding, hygiene, and daily routines."
          />
          <CheckItem
            checked={isFocus('safety')}
            label="Safety risks, elopement, and supervision"
            sub="If your child wanders, runs off, or cannot be safely left alone."
          />
          <CheckItem
            checked={isFocus('sensory_reg')}
            label="Sensory and regulation challenges"
            sub="Meltdowns, shutdowns, sensory overload, and what helps or makes things worse."
          />
          <CheckItem
            checked={isFocus('motor_learning')}
            label="Motor, coordination, and learning differences"
            sub="Fine/gross motor skills, processing speed, and attention/learning needs."
          />
          <CheckItem
            checked={isFocus('school_docs')}
            label="School and therapy reports"
            sub="IEPs, 504 plans, behavior plans, and therapy notes that support disability documentation."
          />
          <CheckItem
            checked={isFocus('letters_forms')}
            label="Letters, forms, or supporting documents"
            sub="What you might need for Medicaid, waivers, or disability benefits applications."
          />
          <CheckItem
            checked={isFocus('next_evals')}
            label="Next evaluations or testing"
            sub="Any additional assessments (adaptive skills, cognitive testing, updated autism evals) that may strengthen documentation."
          />
          <CheckItem
            checked={isFocus('not_sure')}
            label="I'm not sure what needs to be in the chart"
            sub="Ask your provider to walk through what Medicaid or disability programs usually look for."
          />
        </SummaryCard>

        <SummaryCard
          title="Notes that might help your provider"
          description="These are pulled from what you shared. You can point to any section that feels most important."
        >
          {hasHistoryNotes ? (
            <>
              {communicationNotes ? (
                <Text style={styles.notesBullet}>
                  <Text style={styles.noteLabel}>Communication & social: </Text>
                  {communicationNotes}
                </Text>
              ) : null}
              {sensoryNotes ? (
                <Text style={styles.notesBullet}>
                  <Text style={styles.noteLabel}>Sensory & regulation: </Text>
                  {sensoryNotes}
                </Text>
              ) : null}
              {dailyNotes ? (
                <Text style={styles.notesBullet}>
                  <Text style={styles.noteLabel}>Daily living & safety: </Text>
                  {dailyNotes}
                </Text>
              ) : null}
              {motorLearningNotes ? (
                <Text style={styles.notesBullet}>
                  <Text style={styles.noteLabel}>Motor & learning: </Text>
                  {motorLearningNotes}
                </Text>
              ) : null}
              {providerDocNotes ? (
                <Text style={styles.notesBullet}>
                  <Text style={styles.noteLabel}>Provider paperwork focus: </Text>
                  {providerDocNotes}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.cardDescription}>
              If you add notes in earlier sections, they'll appear here as quick talking points.
            </Text>
          )}
        </SummaryCard>

        <View style={[styles.card, { backgroundColor: "#fef3c7", borderColor: "#f59e0b", borderLeftWidth: 4, borderLeftColor: "#f59e0b" }]}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400e' }}>✨ Premium Feature</Text>
          <Text style={{ fontSize: 13, color: '#78350f', marginTop: 8, lineHeight: 20 }}>
            Unlock in-app tracking, custom alerts, and enhanced provider reports with Autism Pathways Premium.
          </Text>
          <Text style={{ fontSize: 12, color: '#b45309', marginTop: 8, fontStyle: 'italic' }}>
            PDF download is free for all users
          </Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            try {
              await generateAndSharePDF({
                childNickname,
                childAge,
                autismDxStatus,
                additionalDx,
                communicationNotes,
                sensoryNotes,
                dailyNotes,
                motorLearningNotes,
                providerDocNotes,
                providerFocusAreas,
              });
            } catch (error) {
              console.error('Failed to generate PDF:', error);
              alert('Failed to generate PDF. Please try again.');
            }
          }}
          style={[styles.button, { backgroundColor: "#16a34a", marginBottom: 12 }]}
        >
          <Text style={[styles.buttonText]}>📥 Download as PDF (Free)</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => router.push('/medicaid/ltd-journey/pmip-provider-journey/step-2-quiz')}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Edit Answers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/medicaid/ltd-journey/action-plan')}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Continue to LTD</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
