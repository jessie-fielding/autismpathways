/**
 * Poop Smearing — Entry Screen
 * Matches potty/index.tsx style: banner, founder note, topic cards, CTA.
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent, logScreenView } from '../../../lib/analytics';
import { PathwayDisclaimer } from '../../../components/PathwayDisclaimer';

const TOPICS = [
  {
    emoji: '🔍',
    title: 'Find the Cause',
    body: 'A 3-question quiz identifies the most likely driver — sensory seeking, GI discomfort, communication, boredom, or nighttime pattern.',
  },
  {
    emoji: '🛡️',
    title: 'Not Intentional',
    body: 'Fecal smearing is almost never defiance. Understanding the "why" reduces shame and opens the door to real solutions.',
  },
  {
    emoji: '📋',
    title: 'Smear Tracker',
    body: 'Log incidents with time, location, antecedents, and bowel movement data. Bring this to your BCBA or doctor.',
  },
  {
    emoji: '🩺',
    title: 'GI & Medical',
    body: 'Constipation and incomplete evacuation are extremely common triggers. We\'ll help you know when to escalate to a GI specialist.',
  },
];

export default function PoopSmearingIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logScreenView('poop_smearing_entry');
    logEvent('tool_opened', { tool: 'Poop Smearing' });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerPurple}>Poop</Text> Smearing
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>💩</Text>
          </View>
          <Text style={styles.eyebrow}>PROFOUND AUTISM PATHWAY</Text>
          <Text style={styles.bannerTitle}>
            <Text style={styles.bannerTitlePurple}>Poop Smearing</Text>{'\n'}
            Guide + Tracker
          </Text>
          <Text style={styles.bannerSub}>
            One of the most common and least-talked-about challenges in profound autism. You are not alone — and there are real solutions.
          </Text>
        </View>

        {/* Jessie's note */}
        <View style={styles.warmCard}>
          <Text style={styles.warmText}>
            "This is one of the questions I get most often, and one of the hardest to talk about. I want you to know: this is{' '}
            <Text style={styles.warmEmphasis}>not a reflection of your parenting</Text>. It is almost never intentional. Understanding the cause changes everything — and that's exactly what this tool is designed to help you do."
          </Text>
          <Text style={styles.warmAttr}>— Jessie, Founder of Autism Pathways</Text>
        </View>

        {/* Topics */}
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
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/profound-autism/poop-smearing/quiz')}
          >
            <Text style={styles.primaryBtnText}>Take the Quiz — Find the Cause →</Text>
          </TouchableOpacity>
          <Text style={styles.quizNote}>3 questions · takes about 1 minute · free</Text>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/profound-autism/poop-smearing/tracker')}
          >
            <Text style={styles.secondaryBtnText}>📋 Open Smear Tracker →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rainbowBar} />
        <PathwayDisclaimer type="medical" />
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
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: '#8B5E3C' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  banner: {
    backgroundColor: '#3D2010',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.md,
  },
  bannerEmoji: { fontSize: 32 },
  eyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1.5, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 30 },
  bannerTitlePurple: { color: '#F4A261' },
  bannerSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  warmCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5E3C',
    ...SHADOWS.sm,
  },
  warmText: { fontSize: 13.5, color: '#4a4570', lineHeight: 22 },
  warmEmphasis: { color: '#8B5E3C', fontWeight: '600' },
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
  ctaSection: { padding: SPACING.lg, gap: SPACING.sm },
  primaryBtn: {
    backgroundColor: '#8B5E3C',
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
    backgroundColor: '#8B5E3C',
    opacity: 0.3,
  },
});
