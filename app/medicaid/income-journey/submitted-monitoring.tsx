import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../../lib/MedicaidStateContext';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const CHECKLIST = [
  {
    id: 'wait5days',
    icon: '📅',
    title: 'Wait 5 business days after submitting',
    detail: 'Give the county time to forward your documents before you call.',
  },
  {
    id: 'callARG',
    icon: '📞',
    title: 'Call the Action Review Group',
    detail: 'Call 877-265-1864. Ask to speak to the reviewer assigned to your case. Have your child\'s name, date of birth, and Social Security Number ready.',
  },
  {
    id: 'checkDocs',
    icon: '📄',
    title: 'Confirm all documents were received',
    detail: 'More than half the time, the reviewer will be missing documents. If anything is missing, call the county immediately and insist they send it right away — not in a batch.',
  },
  {
    id: 'buildRapport',
    icon: '🤝',
    title: 'Build a relationship with your reviewer',
    detail: 'Be warm and friendly. Get their name, direct phone number, and email. You\'ll be talking to this person again.',
  },
  {
    id: 'askExpedited',
    icon: '⚡',
    title: 'Ask for expedited processing if your situation is urgent',
    detail: 'If your child\'s needs are serious, explain your story. Ask directly: "Is there any way to expedite our case?" Reviewers have discretion to prioritize urgent situations.',
  },
  {
    id: 'offerHelp',
    icon: '🙋',
    title: 'Offer to get any missing records yourself',
    detail: 'Ask "Is there anything else you need?" If they need medical records, offer to get them yourself. It\'s much faster than waiting for a third party.',
  },
];

export default function SubmittedMonitoring() {
  const router = useRouter();
  const { stateData } = useMedicaidState();
  const stateName = stateData?.stateName ?? null;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Income Journey</Text>
          {stateName && <Text style={styles.headerState}>📍 {stateName}</Text>}
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Active Monitoring</Text>
          <Text style={styles.progressPercent}>{Math.round((checked.size / CHECKLIST.length) * 100)}% complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(checked.size / CHECKLIST.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Content header */}
        <View style={styles.contentHeader}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>📬</Text>
          </View>
          <Text style={styles.sectionLabel}>APPLICATION SUBMITTED</Text>
          <Text style={styles.mainTitle}>Don't just wait — stay active</Text>
          <Text style={styles.mainSubtitle}>
            Submitting your application is a huge step. But the families who get approved fastest
            are the ones who stay in contact and keep things moving. Here's exactly what to do.
          </Text>
        </View>

        <View style={styles.content}>
          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>⏱ GOOD TO KNOW</Text>
            <Text style={styles.infoText}>
              There is a 90-day limit for processing these applications, but actively following up
              can cut that time significantly. Don't wait for them to come to you.
            </Text>
          </View>

          {/* Checklist */}
          <Text style={styles.checklistLabel}>YOUR ACTION CHECKLIST</Text>
          {CHECKLIST.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.checkItem, checked.has(item.id) && styles.checkItemDone]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checked.has(item.id) && styles.checkboxDone]}>
                {checked.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.checkContent}>
                <Text style={styles.checkIcon}>{item.icon}</Text>
                <View style={styles.checkText}>
                  <Text style={[styles.checkTitle, checked.has(item.id) && styles.checkTitleDone]}>
                    {item.title}
                  </Text>
                  <Text style={styles.checkDetail}>{item.detail}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Phone number callout */}
          <TouchableOpacity
            style={styles.phoneBox}
            onPress={() => Linking.openURL('tel:8772651864')}
          >
            <Text style={styles.phoneLabel}>📞 ACTION REVIEW GROUP</Text>
            <Text style={styles.phoneNumber}>877-265-1864</Text>
            <Text style={styles.phoneTap}>Tap to call</Text>
          </TouchableOpacity>

          {/* Next step */}
          <View style={styles.nextBox}>
            <Text style={styles.nextLabel}>💡 WHILE YOU WAIT</Text>
            <Text style={styles.nextText}>
              Once you've made contact, don't stop there. Use the waiting period to get a head
              start on the next phase — finding providers and preparing for your waiver application.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push('/medicaid/income-journey/work-ahead')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Work Ahead →</Text>
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
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lavender,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionNumberText: { fontSize: 20 },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5, marginBottom: SPACING.sm },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 28, marginBottom: SPACING.sm },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.infoText, letterSpacing: 1, marginBottom: SPACING.sm },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  checklistLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, letterSpacing: 1.5, marginBottom: SPACING.lg },
  checkItem: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  checkItemDone: { borderColor: COLORS.purple, backgroundColor: 'rgba(124, 92, 191, 0.05)' },
  checkContent: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, marginTop: 2, flexShrink: 0,
  },
  checkboxDone: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  checkIcon: { fontSize: 22, marginRight: SPACING.md, marginTop: 1 },
  checkText: { flex: 1 },
  checkTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4, lineHeight: 20 },
  checkTitleDone: { color: COLORS.purple },
  checkDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  phoneBox: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg, alignItems: 'center',
  },
  phoneLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1, marginBottom: SPACING.sm },
  phoneNumber: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  phoneTap: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)' },
  nextBox: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  nextLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, letterSpacing: 1, marginBottom: SPACING.sm },
  nextText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
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
