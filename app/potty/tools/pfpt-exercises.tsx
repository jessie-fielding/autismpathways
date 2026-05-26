import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../../lib/theme';

const EXERCISES = [
  {
    id: 'diaphragmatic',
    emoji: '🌬️',
    title: 'Diaphragmatic Breathing',
    subtitle: 'The foundation of everything',
    color: '#e8f4fd',
    border: '#2196F3',
    why: 'The pelvic floor and diaphragm work together. When a child holds their breath while trying to have a BM, it creates tension that makes it harder. Learning to breathe out during effort is the single most important skill.',
    howTo: [
      'Have your child lie on their back with a small stuffed animal on their belly.',
      'Ask them to breathe in slowly through their nose — the animal should rise.',
      'Breathe out slowly through pursed lips (like blowing out a candle) — the animal falls.',
      'Practice 5 breaths, 2x per day. Make it a game.',
      'Once mastered lying down, practice sitting on the toilet.',
    ],
    tip: 'Say "breathe the poop out" — it sounds silly but it works. Humor reduces tension.',
  },
  {
    id: 'belly-massage',
    emoji: '🤲',
    title: 'Abdominal Massage',
    subtitle: 'Helps move things along',
    color: '#f0faf5',
    border: '#4CAF50',
    why: 'Gentle abdominal massage stimulates the colon and can help move stool toward the rectum. It\'s especially helpful in the morning before a timed sit.',
    howTo: [
      'Have your child lie on their back with knees bent.',
      'Using gentle pressure, massage in a clockwise direction (following the colon path).',
      'Start at the lower right, move up toward the ribs, across, then down the left side.',
      'Use the flat of your fingers, not fingertips. Medium pressure — not tickling, not painful.',
      'Do 10 slow circles, 1x per day (ideally before the morning timed sit).',
    ],
    tip: 'Use a small amount of lotion. Some kids enjoy this as a calming routine — others are tactile-sensitive. Adjust pressure and check in with your child.',
  },
  {
    id: 'positioning',
    emoji: '🦶',
    title: 'Squatting Position Practice',
    subtitle: 'The body\'s natural position',
    color: '#fef9e7',
    border: '#FF9800',
    why: 'The puborectalis muscle creates a kink in the rectum when we sit at 90°. Squatting straightens this angle, making elimination much easier. This is why a step stool is non-negotiable.',
    howTo: [
      'Place a step stool (Squatty Potty or similar) in front of the toilet.',
      'Feet should be flat on the stool — knees at or above hip level.',
      'Lean slightly forward with elbows resting on knees.',
      'Practice this position for 1–2 minutes even without trying to go — just getting comfortable.',
      'Some kids benefit from a visual reminder (photo of correct position on the wall).',
    ],
    tip: 'If your child is small, a taller stool may be needed. The goal is knees above hips — not just feet touching something.',
  },
  {
    id: 'bear-down',
    emoji: '🐻',
    title: '"Bear Down" Practice',
    subtitle: 'Learning to coordinate the push',
    color: '#fdf0f8',
    border: '#9C27B0',
    why: 'Many kids with encopresis have learned to tighten (not relax) their pelvic floor when trying to go. This exercise teaches the correct coordination: breathe out + bear down + relax the bottom.',
    howTo: [
      'While sitting on the toilet in correct position, take a slow breath in.',
      'As you breathe OUT, gently bear down — like you\'re trying to push something out of your belly button.',
      'At the same time, consciously relax the bottom (not squeeze — relax).',
      'Hold for 3 seconds, then release. Rest. Repeat 3 times.',
      'Never strain or hold breath. If it hurts, stop and tell a grown-up.',
    ],
    tip: 'This is hard to teach! A PFPT (pelvic floor physical therapist) can use biofeedback to show kids exactly what their muscles are doing. Ask your pediatrician for a referral.',
  },
  {
    id: 'relaxation',
    emoji: '🧘',
    title: 'Pelvic Floor Relaxation',
    subtitle: 'Releasing the tension',
    color: '#f0f8ff',
    border: '#5C6BC0',
    why: 'Kids who have experienced painful BMs often develop a protective tightening response. This exercise specifically targets relaxing the pelvic floor muscles.',
    howTo: [
      'Sit on the toilet in correct position.',
      'Imagine your bottom is like a flower opening — or a fist slowly unclenching.',
      'Take a slow breath in. As you breathe out, imagine the flower opening wider.',
      'Some kids respond to "let your bottom go squishy like a marshmallow."',
      'Practice for 30 seconds before each timed sit.',
    ],
    tip: 'Imagery matters for kids. Find the metaphor that works for your child — flower, marshmallow, melting ice cream. The sillier the better.',
  },
];

export default function PfptExercisesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>('diaphragmatic');

  const handleShare = async () => {
    const text = EXERCISES.map(e =>
      `${e.title}\n${e.howTo.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    ).join('\n\n');
    await Share.share({
      title: 'Pelvic Floor PT Exercises — Autism Pathways',
      message: `PELVIC FLOOR PT EXERCISES FOR KIDS\nAutism Pathways\n\n${text}\n\nGenerated by Autism Pathways · For personal use only`,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>PFPT Exercises</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}><Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>🏠 Dashboard</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🧘</Text>
          <Text style={styles.introTitle}>Pelvic Floor PT Exercises for Kids</Text>
          <Text style={styles.introBody}>
            These exercises are adapted from pediatric pelvic floor physical therapy (PFPT) resources. They help children with encopresis learn to relax and coordinate the muscles needed for comfortable BMs. They work best alongside the Bowel Retraining Schedule.
          </Text>
        </View>

        <View style={styles.brittanyNote}>
          <Text style={styles.brittanyNoteText}>
            💜 <Text style={{ fontWeight: '700' }}>OT Note:</Text> These exercises will be reviewed by our occupational therapist. For children with significant pelvic floor dysfunction, a referral to a pediatric PFPT is strongly recommended — ask your pediatrician.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>5 Key Exercises</Text>
        <Text style={styles.sectionSubtitle}>Tap each exercise to expand the full instructions. Start with breathing — it's the foundation for everything else.</Text>

        {EXERCISES.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            style={[styles.exCard, { borderLeftColor: ex.border, backgroundColor: ex.color }]}
            onPress={() => setExpanded(expanded === ex.id ? null : ex.id)}
            activeOpacity={0.85}
          >
            <View style={styles.exHeader}>
              <Text style={styles.exEmoji}>{ex.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exTitle, { color: ex.border }]}>{ex.title}</Text>
                <Text style={styles.exSubtitle}>{ex.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>{expanded === ex.id ? '▲' : '▼'}</Text>
            </View>
            {expanded === ex.id && (
              <View style={styles.exBody}>
                <Text style={styles.whyLabel}>WHY THIS MATTERS</Text>
                <Text style={styles.whyText}>{ex.why}</Text>
                <Text style={styles.howLabel}>HOW TO DO IT</Text>
                {ex.howTo.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={[styles.stepNum, { color: ex.border }]}>{i + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
                <View style={[styles.tipBox, { borderLeftColor: ex.border }]}>
                  <Text style={styles.tipLabel}>💡 TIP</Text>
                  <Text style={styles.tipText}>{ex.tip}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>When to Ask for a PFPT Referral</Text>
          {[
            'Child continues to withhold despite 4+ weeks of the retraining schedule',
            'Child reports pain during BMs consistently',
            'Encopresis persists after 2 rounds of cleanout',
            'Child has significant anxiety around toileting',
          ].map((item, i) => (
            <Text key={i} style={styles.referralItem}>• {item}</Text>
          ))}
          <Text style={styles.referralNote}>
            Pediatric PFPT is covered by most insurance when medically necessary. Your pediatrician or GI specialist can write the referral.
          </Text>
        </View>

        <TouchableOpacity style={styles.diaryBtn} onPress={() => router.push('/potty/bowel-diary')}>
          <Text style={styles.diaryBtnText}>📊 Track Progress in Bowel Diary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare}>
          <Text style={styles.shareFullBtnText}>📤 Share These Exercises</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Autism Pathways · For personal use only · Not a substitute for medical advice</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  shareBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.purple },
  shareBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: '#f8f4ff', borderRadius: RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.card,
  },
  introEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.purple, textAlign: 'center', marginBottom: SPACING.sm },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  brittanyNote: {
    backgroundColor: '#fdf4ff', borderRadius: RADIUS.md, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.purple, marginBottom: SPACING.lg,
  },
  brittanyNoteText: { fontSize: FONT_SIZES.sm, color: '#5a3e8c', lineHeight: 18 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 18 },
  exCard: {
    borderRadius: RADIUS.lg, borderLeftWidth: 4, padding: SPACING.md,
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  exHeader: { flexDirection: 'row', alignItems: 'center' },
  exEmoji: { fontSize: 24, marginRight: SPACING.sm },
  exTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  exSubtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  chevron: { fontSize: 12, color: COLORS.textSecondary },
  exBody: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: SPACING.md },
  whyLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  whyText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.md },
  howLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  stepRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  stepNum: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginRight: SPACING.xs, width: 20 },
  stepText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  tipBox: { backgroundColor: 'rgba(255,255,255,0.6)', borderLeftWidth: 3, padding: SPACING.sm, borderRadius: RADIUS.sm, marginTop: SPACING.sm },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 18, fontStyle: 'italic' },
  referralCard: {
    backgroundColor: '#fff8e1', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: '#FF9800', marginBottom: SPACING.lg, marginTop: SPACING.sm,
  },
  referralTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#e65100', marginBottom: SPACING.sm },
  referralItem: { fontSize: FONT_SIZES.sm, color: '#bf360c', lineHeight: 22, marginBottom: 2 },
  referralNote: { fontSize: FONT_SIZES.sm, color: '#5d4037', marginTop: SPACING.sm, lineHeight: 18, fontStyle: 'italic' },
  diaryBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.full, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.md,
  },
  diaryBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.md },
  shareFullBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.full, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple,
  },
  shareFullBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.md },
  footer: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
});
