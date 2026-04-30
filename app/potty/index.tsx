import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

export default function PottyIntroScreen() {
  const router = useRouter();
  const [hasSavedResult, setHasSavedResult] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('potty_result').then((v) => {
      if (v) setHasSavedResult(true);
    });
  }, []);

  const TOPICS = [
    { emoji: '🟠', title: 'Encopresis & Constipation', body: "When accidents happen and your child doesn't seem to notice — this is often a body problem, not a behavior problem." },
    { emoji: '🔵', title: 'Body Signal Unawareness', body: 'Many autistic children have interoception differences — their brain doesn\'t reliably register the "need to go" signal. This is teachable.' },
    { emoji: '🟣', title: 'Sensory & Toilet Anxiety', body: 'The toilet can be genuinely overwhelming — the sound, the cold seat, the fear of falling in. We\'ll identify your child\'s specific triggers.' },
    { emoji: '🟢', title: 'Regression & Transitions', body: 'Was doing great, now isn\'t? Regression in autistic kids is common and has specific causes — new school, stress, routine change.' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.backBtn}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>🚽</Text>
          </View>
          <Text style={styles.eyebrow}>POTTY PATHWAYS</Text>
          <Text style={styles.bannerTitle}>You're not failing.{'\n'}<Text style={styles.bannerTitlePurple}>Let's figure this out.</Text></Text>
          <Text style={styles.bannerSub}>Potty training an autistic child is genuinely different. This tool helps you understand what's really going on — and what to do about it.</Text>
        </View>

        {/* Founder note */}
        <View style={styles.warmCard}>
          <Text style={styles.warmText}>
            "I spent months frustrated with my daughter, thinking she was just refusing to cooperate. It turned out she had encopresis — chronic constipation causing overflow that she{' '}
            <Text style={styles.warmEmphasis}>genuinely couldn't feel</Text>. Nobody told me. I had to find it myself at 11pm after a really bad day.{'\n\n'}
            I built this tool so you don't have to go through that alone."
          </Text>
          <Text style={styles.warmAttr}>— From the founder of Autism Pathways</Text>
        </View>

        {/* What we'll look at */}
        <Text style={styles.sectionHeading}>WHAT WE'LL LOOK AT</Text>

        {TOPICS.map((t) => (
          <View key={t.title} style={styles.tipCard}>
            <View style={styles.tipCardTop}>
              <Text style={styles.tipIcon}>{t.emoji}</Text>
              <Text style={styles.tipTitle}>{t.title}</Text>
            </View>
            <Text style={styles.tipText}>{t.body}</Text>
          </View>
        ))}

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/potty/quiz')}>
            <Text style={styles.primaryBtnText}>Take the Quiz — Find Your Pathway →</Text>
          </TouchableOpacity>
          <Text style={styles.quizNote}>8 questions · takes about 3 minutes · free</Text>
          {hasSavedResult && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/potty/result')}>
              <Text style={styles.secondaryBtnText}>Resume where I left off →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rainbow bar */}
        <View style={styles.rainbowBar} />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  banner: {
    backgroundColor: COLORS.lavender,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.md,
  },
  bannerEmoji: { fontSize: 32 },
  eyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1.5, color: COLORS.purple, textTransform: 'uppercase' },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', lineHeight: 30 },
  bannerTitlePurple: { color: COLORS.purple },
  bannerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  warmCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.purple,
    ...SHADOWS.sm,
  },
  warmText: { fontSize: 13.5, color: '#4a4570', lineHeight: 22 },
  warmEmphasis: { color: COLORS.purple, fontWeight: '600' },
  warmAttr: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.sm, fontWeight: '500' },
  sectionHeading: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  tipCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  tipCardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  tipIcon: { fontSize: 22 },
  tipTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  tipText: { fontSize: FONT_SIZES.sm, color: '#4a4570', lineHeight: 20 },
  ctaSection: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  quizNote: { textAlign: 'center', fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  secondaryBtn: {
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  secondaryBtnText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.sm },
  rainbowBar: {
    height: 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 2,
    backgroundColor: COLORS.purple,
    opacity: 0.3,
  },
});
