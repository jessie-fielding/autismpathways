import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const TIMELINE = [
  {
    phase: 'Immediately',
    emoji: '📬',
    color: '#7C5CBF',
    title: 'Confirmation letter arrives',
    body: 'You should receive written confirmation of your waitlist application within 2–4 weeks. This letter contains your application date — keep it forever.',
  },
  {
    phase: '3–6 months',
    emoji: '📋',
    color: '#2e7d5e',
    title: 'Annual renewal notices begin',
    body: 'Most states send annual letters asking you to confirm you still want to remain on the waitlist. Respond to every one — missing a renewal removes you from the list.',
  },
  {
    phase: '1–3 years',
    emoji: '🔔',
    color: '#1565c0',
    title: 'Priority status review',
    body: 'Some states move families up the list based on changes in circumstances (crisis situations, caregiver health issues, aging out of school services). Ask your agency what qualifies.',
  },
  {
    phase: '2–10+ years',
    emoji: '🎉',
    color: '#e65100',
    title: 'Your number comes up',
    body: 'The agency will contact you when funding becomes available. You\'ll have a limited window to respond (often 30–60 days). Make sure your contact info stays current.',
  },
];

const TIPS = [
  { emoji: '📱', text: 'Update your phone number and address with the agency every time they change.' },
  { emoji: '📂', text: 'Keep a folder with all waiver correspondence — confirmation letters, renewal notices, assessments.' },
  { emoji: '👩‍⚕️', text: 'Continue getting annual evaluations — you\'ll need current documentation when your number comes up.' },
  { emoji: '🏫', text: 'When your child turns 18, ask about transitioning to adult waiver services — the process is different.' },
  { emoji: '💬', text: 'Join your state\'s parent advocacy group — they often have insider knowledge about waitlist timelines.' },
];

export default function WaiverWhatToExpectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What to Expect</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>⏳</Text>
          <Text style={styles.heroTitle}>The waiting is the hardest part</Text>
          <Text style={styles.heroBody}>
            Waiver waitlists are long — but they do move. Here's what to expect at each stage so you're never caught off guard.
          </Text>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionLabel}>WAITLIST TIMELINE</Text>
        {TIMELINE.map((item, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: item.color }]}>
                <Text style={styles.timelineDotEmoji}>{item.emoji}</Text>
              </View>
              {i < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelinePhase, { color: item.color }]}>{item.phase}</Text>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineBody}>{item.body}</Text>
            </View>
          </View>
        ))}

        {/* Tips */}
        <Text style={styles.sectionLabel}>STAYING ON TOP OF IT</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}

        {/* Crisis pathway note */}
        <View style={styles.crisisCard}>
          <Text style={styles.crisisTitle}>🚨 If you're in crisis</Text>
          <Text style={styles.crisisBody}>
            If your family situation has changed significantly (caregiver health crisis, child safety concerns, loss of housing), contact your agency immediately. Many states have emergency or crisis pathways that can accelerate waiver access.
          </Text>
        </View>

        {/* Next: Waiver tracker */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.push('/waiver/tracker')}
        >
          <Text style={styles.nextBtnText}>Open Waitlist Tracker →</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.purple,
  },
  backBtn: { padding: SPACING.xs },
  backText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  scroll: { paddingBottom: SPACING.xl },
  heroCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  heroBody: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: 0,
    gap: SPACING.sm,
  },
  timelineLeft: { alignItems: 'center', width: 44 },
  timelineDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotEmoji: { fontSize: 20 },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  timelinePhase: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 0.5 },
  timelineTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  timelineBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginTop: 4 },
  tipCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  tipEmoji: { fontSize: 20 },
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  crisisCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#fff3e0',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#ff9800',
    gap: SPACING.xs,
  },
  crisisTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#e65100' },
  crisisBody: { fontSize: FONT_SIZES.sm, color: '#7a3a00', lineHeight: 20 },
  nextBtn: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
