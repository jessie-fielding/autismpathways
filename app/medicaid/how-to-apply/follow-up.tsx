import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const TIMELINE = [
  { week: '2 weeks', action: 'First follow-up call', detail: 'Confirm your application was received and is being processed. Ask for an estimated decision date.' },
  { week: '4 weeks', action: 'Second follow-up if no response', detail: 'If you haven\'t heard back, call again. Ask if any additional documents are needed.' },
  { week: '6 weeks', action: 'Escalate if needed', detail: 'If still no update, ask to speak with a supervisor or file a formal inquiry.' },
  { week: '45–90 days', action: 'Decision should arrive', detail: 'Most states are required to make a decision within 45–90 days. If you haven\'t heard, contact your state\'s Medicaid ombudsman.' },
];

const SCRIPTS = [
  {
    title: 'First Follow-Up Call',
    script: '"Hi, I\'m calling to follow up on a Medicaid application I submitted on [date]. My name is [your name] and the case number is [number if you have it]. Can you confirm it was received and tell me where it is in the process?"',
  },
  {
    title: 'If They Ask for More Documents',
    script: '"Thank you for letting me know. Can you tell me exactly which documents are needed and the best way to submit them? I want to make sure this is resolved quickly."',
  },
  {
    title: 'If You\'re Getting the Runaround',
    script: '"I\'ve been waiting [X weeks] and I\'m not getting a clear answer. I\'d like to speak with a supervisor or file a formal inquiry. Can you help me with that?"',
  },
];

export default function FollowUp() {
  const router = useRouter();
  const [expandedScript, setExpandedScript] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How to Apply</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Step 5 of 5</Text>
          <Text style={styles.progressPercent}>100% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>5</Text>
          </View>
          <Text style={styles.sectionLabel}>FOLLOW UP</Text>
          <Text style={styles.mainTitle}>How and when to follow up</Text>
          <Text style={styles.mainSubtitle}>
            Following up is not being pushy — it's being an advocate for your child. Here's exactly
            when to call and what to say.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Timeline */}
          <Text style={styles.sectionTitle}>FOLLOW-UP TIMELINE</Text>
          {TIMELINE.map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot} />
                {idx < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineRight}>
                <View style={styles.weekBadge}>
                  <Text style={styles.weekText}>{item.week}</Text>
                </View>
                <Text style={styles.timelineAction}>{item.action}</Text>
                <Text style={styles.timelineDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}

          {/* Talking scripts */}
          <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>TALKING SCRIPTS</Text>
          {SCRIPTS.map((script, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.scriptCard, expandedScript === idx && styles.scriptCardActive]}
              onPress={() => setExpandedScript(expandedScript === idx ? null : idx)}
            >
              <View style={styles.scriptHeader}>
                <Text style={styles.scriptTitle}>{script.title}</Text>
                <Text style={styles.scriptArrow}>{expandedScript === idx ? '▲' : '▼'}</Text>
              </View>
              {expandedScript === idx && (
                <View style={styles.scriptBody}>
                  <Text style={styles.scriptText}>{script.script}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.warningBox}>
            <Text style={styles.warningLabel}>⚠️ KNOW YOUR RIGHTS</Text>
            <Text style={styles.warningText}>
              You have the right to a timely decision. If your state is taking too long, you can
              contact your state's Medicaid ombudsman or legal aid organization for help.
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
          onPress={() => router.push('/medicaid/how-to-apply/results')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Got a result →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingTop: 56,
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
  sectionTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  timelineItem: { flexDirection: 'row', marginBottom: SPACING.sm },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: SPACING.md },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.purple, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 4, minHeight: 20 },
  timelineRight: { flex: 1, paddingBottom: SPACING.lg },
  weekBadge: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: SPACING.xs,
  },
  weekText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple },
  timelineAction: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  timelineDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  scriptCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.border, overflow: 'hidden',
  },
  scriptCardActive: { borderColor: COLORS.purple },
  scriptHeader: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
  },
  scriptTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  scriptArrow: { fontSize: 12, color: COLORS.textMid },
  scriptBody: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  scriptText: {
    fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20,
    fontStyle: 'italic', marginTop: SPACING.md,
  },
  warningBox: {
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.yellowAccent,
  },
  warningLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText, letterSpacing: 1, marginBottom: SPACING.sm },
  warningText: { fontSize: FONT_SIZES.sm, color: COLORS.warningText, lineHeight: 20 },
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
