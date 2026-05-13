import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
type PathwayKey = 'encopresis' | 'bodySignals' | 'sensory' | 'regression';

const PATHWAY_META: Record<PathwayKey, {
  emoji: string;
  title: string;
  sub: string;
  bannerBg: string[];
  iconBg: string[];
  accentColor: string;
  eyebrowColor: string;
  borderColor: string;
}> = {
  encopresis: {
    emoji: '🟠',
    title: 'Encopresis &\nConstipation',
    sub: "Based on your answers, chronic constipation is likely playing a major role. This is one of the most misunderstood issues in autism potty training — and one of the most fixable.",
    bannerBg: ['#fff5ee', '#ffe8d4'],
    iconBg: ['#ffb347', '#ff8c42'],
    accentColor: '#c45a00',
    eyebrowColor: '#c45a00',
    borderColor: '#ff8c42',
  },
  bodySignals: {
    emoji: '🔵',
    title: 'Body Signal\nUnawareness',
    sub: 'Your child\'s brain may not be reliably receiving the "need to go" signal. This is an interoception difference — and it is teachable.',
    bannerBg: ['#e8f4fd', '#d0eafc'],
    iconBg: ['#74c0fc', '#4dabf7'],
    accentColor: '#1864ab',
    eyebrowColor: '#1864ab',
    borderColor: '#4dabf7',
  },
  sensory: {
    emoji: '🟣',
    title: 'Sensory &\nToilet Anxiety',
    sub: 'The bathroom itself may be the obstacle. Sensory triggers are real, specific, and very addressable once you identify them.',
    bannerBg: ['#f5e8fd', '#ead0fc'],
    iconBg: ['#da8fff', '#cc5de8'],
    accentColor: '#862e9c',
    eyebrowColor: '#862e9c',
    borderColor: '#cc5de8',
  },
  regression: {
    emoji: '🟢',
    title: 'Regression &\nTransitions',
    sub: 'Was doing well, now isn\'t? Regression has specific causes in autistic kids — and they are almost always tied to something that changed.',
    bannerBg: ['#e8fdf0', '#d0fce0'],
    iconBg: ['#8ce99a', '#51cf66'],
    accentColor: '#2f9e44',
    eyebrowColor: '#2f9e44',
    borderColor: '#51cf66',
  },
};

const SECONDARY_LABELS: Record<PathwayKey, string> = {
  encopresis: 'Encopresis & Constipation',
  bodySignals: 'Body Signal Unawareness',
  sensory: 'Sensory & Toilet Anxiety',
  regression: 'Regression & Transitions',
};

const SECONDARY_EMOJIS: Record<PathwayKey, string> = {
  encopresis: '🟠',
  bodySignals: '🔵',
  sensory: '🟣',
  regression: '🟢',
};

const FREE_TIPS: Record<PathwayKey, { emoji: string; title: string; body: string }[]> = {
  encopresis: [
    { emoji: '💧', title: 'Increase fluids — especially water', body: 'Constipation is almost always made worse by dehydration. Aim for at least 4–6 cups of water per day for school-age kids. Juice counts but water is better.' },
    { emoji: '🥦', title: 'Add fiber gradually', body: 'Fruits, vegetables, and whole grains help. Go slowly — adding too much fiber too fast can cause cramping. Pears, prunes, and kiwi are especially effective.' },
    { emoji: '🚶', title: 'Movement helps the bowel move', body: 'Physical activity stimulates the digestive system. Even 20 minutes of active play after meals can make a real difference.' },
    { emoji: '👩‍⚕️', title: 'Talk to your pediatrician', body: "If you suspect encopresis, bring it up at your next visit. Ask specifically about a bowel cleanout protocol. Many pediatricians will recommend MiraLax — this is safe and commonly used. Don't wait for them to bring it up first." },
  ],
  bodySignals: [
    { emoji: '⏰', title: 'Timed toilet sits', body: 'Instead of waiting for your child to signal, take them to the bathroom on a schedule — every 1.5 to 2 hours. You are bypassing the unreliable signal and building the habit through routine.' },
    { emoji: '📸', title: 'Visual bathroom schedule', body: 'A visual strip showing the bathroom routine (walk in → pants down → sit → try → wipe → flush → wash hands) removes the cognitive load and makes each step predictable.' },
    { emoji: '🗣️', title: 'Name the body signals out loud', body: 'During timed sits, narrate what you are looking for: "We\'re checking if your belly feels full or your bottom feels like it needs to push." Over time this builds the vocabulary — and awareness.' },
    { emoji: '🎯', title: 'Celebrate the attempt, not just success', body: 'Reward sitting and trying — not just producing results. The goal right now is building the routine and the body awareness, not perfection.' },
  ],
  sensory: [
    { emoji: '🪑', title: 'Get a toilet insert', body: 'A child-sized insert that fits into the regular toilet seat removes the fear of falling in. A step stool that lets their feet touch something solid also helps enormously.' },
    { emoji: '🔇', title: "Don't flush while they're seated", body: "The sound of flushing is one of the most common triggers. Let them leave the bathroom before you flush. Let them control it themselves when they're ready." },
    { emoji: '🎵', title: 'White noise or music in the bathroom', body: 'A small Bluetooth speaker with familiar music or white noise can make the bathroom feel safer and more predictable. Sound sensitivity goes both ways — their own preferred sounds can be calming.' },
    { emoji: '🪜', title: 'Approach it gradually', body: 'Start with just sitting on the closed toilet lid fully clothed. Then open lid, then no pants. Each step earns a reward. Don\'t rush to "actually going" — building safety comes first.' },
  ],
  regression: [
    { emoji: '🔍', title: 'Look for what changed', body: 'Think back to when the regression started. New school year? New teacher? Move to a different home? New sibling? Illness? In autistic kids, regression is rarely random — there\'s usually a trigger.' },
    { emoji: '🔁', title: 'Go back to basics temporarily', body: 'Don\'t add new demands during a regression. Return to the timed toilet schedule that worked before. Reduce expectations and rebuild consistency. This is not starting over — it\'s bridging.' },
    { emoji: '🏫', title: 'Talk to the school', body: 'If accidents are happening at school but not at home (or vice versa), the environment is part of the problem. Ask about the bathroom — is it noisy, crowded, does it smell? Is there time pressure?' },
    { emoji: '❤️', title: "Don't shame, don't punish", body: 'This one matters more than the tactics. Shame makes regression worse. Calmness, consistency, and warmth are the conditions under which progress returns.' },
  ],
};

const PREMIUM_UPSELL: Record<PathwayKey, { header: string; items: { emoji: string; title: string; body: string }[] }> = {
  encopresis: {
    header: 'Premium unlocks the full bowel retraining protocol, PFPT exercises, and the Bowel Diary tracker.',
    items: [
      { emoji: '📋', title: 'Full Bowel Retraining Schedule', body: "A day-by-day protocol for resetting your child's bowel habits after a cleanout — including timed sits, positioning, and what to watch for." },
      { emoji: '🧘', title: 'Pelvic Floor PT Exercises for Kids', body: 'Adapted from pediatric PFPT resources — breathing techniques, belly massage, and positioning that help a stretched colon recover.' },
      { emoji: '📊', title: 'Bowel Diary — 2-Week Tracker', body: 'Track BMs, consistency, accidents, and fluids. Gives you something concrete to bring to your pediatrician or GI specialist.' },
    ],
  },
  bodySignals: {
    header: 'Premium unlocks interoception activities, a customizable visual schedule builder, and body signal awareness exercises.',
    items: [
      { emoji: '🧠', title: 'Interoception Awareness Activities', body: "Adapted from Kelly Mahler's interoception curriculum — games and activities that help your child tune into their body signals over time." },
      { emoji: '🖼️', title: 'Visual Schedule Builder', body: 'Build a custom bathroom visual schedule for your child — choose icons, steps, and timing that match your routine.' },
    ],
  },
  sensory: {
    header: 'Premium unlocks a full sensory audit checklist, OT-informed desensitization sequence, and step-by-step toilet approach plan.',
    items: [
      { emoji: '📋', title: 'Sensory Audit Checklist', body: 'Identify every sensory trigger in your bathroom — sound, light, temperature, texture, smell — with specific modifications for each.' },
      { emoji: '🧩', title: 'OT-Informed Desensitization Sequence', body: 'A step-by-step tolerance-building plan based on occupational therapy principles — starting from just entering the bathroom and working up to independent use.' },
    ],
  },
  regression: {
    header: 'Premium unlocks a school bathroom plan template, regression response protocol, and environment-specific strategies.',
    items: [
      { emoji: '🏫', title: 'School Bathroom Plan Template', body: "A ready-to-send document you can give your child's teacher and aide — covering schedule, signals, privacy, and what to do if there's an accident at school." },
      { emoji: '📋', title: 'Regression Response Protocol', body: 'A step-by-step guide for the first 2 weeks of a regression — what to do each day, what to avoid, and when to consider bringing in outside support.' },
    ],
  },
};

function EncopresisMsgCard() {
  return (
    <View style={encStyles.card}>
      <Text style={encStyles.label}>⚠️ PLEASE READ THIS — IT CHANGES EVERYTHING</Text>
      <Text style={encStyles.title}>Your child is not doing this on purpose.</Text>
      <Text style={encStyles.text}>
        When a child is chronically constipated, the colon stretches over time. Liquid stool can then leak around the blockage — and here is the part that no one tells you:{' '}
        <Text style={encStyles.emphasis}>the child genuinely cannot feel it coming.</Text>
        {'\n\n'}
        The nerves in the stretched colon stop sending the "need to go" signal reliably. So when your child has an accident and looks at you blankly, or denies it happened —{' '}
        <Text style={encStyles.bold}>they are not lying. They did not feel it.</Text>
        {'\n\n'}
        This is called encopresis, and it affects a significant number of autistic children. It looks like a behavior problem. It is a body problem. And once you treat the constipation, the accidents often stop — sometimes within weeks.
      </Text>
    </View>
  );
}

function BodySignalsMsgCard() {
  return (
    <View style={warmCardStyles.card}>
      <Text style={warmCardStyles.text}>
        Interoception is the sense that tells us what is happening{' '}
        <Text style={warmCardStyles.emphasis}>inside</Text>{' '}
        our body — hunger, thirst, pain, and yes, needing to use the bathroom. Many autistic children have differences in this sense. It is not stubbornness. It is a neurological difference that responds really well to the right approach.
      </Text>
    </View>
  );
}

function SensoryMsgCard() {
  return (
    <View style={warmCardStyles.card}>
      <Text style={warmCardStyles.text}>
        For some autistic children, the bathroom is genuinely scary — not defiant, not manipulative. The sound of flushing, the cold seat, the echoing acoustics, the fear of falling in. These are real sensory experiences. The goal is to make the bathroom feel safe{' '}
        <Text style={warmCardStyles.emphasis}>before</Text>{' '}
        expecting them to use it.
      </Text>
    </View>
  );
}

function RegressionMsgCard() {
  return (
    <View style={warmCardStyles.card}>
      <Text style={warmCardStyles.text}>
        Regression after progress is one of the most demoralizing things a parent can experience. But in autistic children it almost always has a{' '}
        <Text style={warmCardStyles.emphasis}>reason</Text>{' '}
        — a new school, a change in routine, a sensory shift, an illness. Finding the trigger is the first step. You haven't lost the progress. It's still in there.
      </Text>
    </View>
  );
}

export default function PottyResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ primary?: string; secondary?: string }>();
  const [primary, setPrimary] = useState<PathwayKey>('encopresis');
  const [secondary, setSecondary] = useState<PathwayKey | null>(null);
  const { isPremium } = useIsPremium();

  useEffect(() => {
    async function load() {
      // Prefer params, fall back to AsyncStorage
      if (params.primary) {
        setPrimary(params.primary as PathwayKey);
        setSecondary(params.secondary ? (params.secondary as PathwayKey) : null);
      } else {
        const raw = await AsyncStorage.getItem('potty_result');
        if (raw) {
          const saved = JSON.parse(raw);
          setPrimary(saved.primary as PathwayKey);
          setSecondary(saved.secondary as PathwayKey | null);
        }
      }
    }
    load();
  }, []);

  const meta = PATHWAY_META[primary];
  const freeTips = FREE_TIPS[primary];
  const premium = PREMIUM_UPSELL[primary];

  const IntroCard =
    primary === 'encopresis' ? EncopresisMsgCard :
    primary === 'bodySignals' ? BodySignalsMsgCard :
    primary === 'sensory' ? SensoryMsgCard :
    RegressionMsgCard;

  const introSectionLabel =
    primary === 'encopresis' ? 'FIRST, THE MOST IMPORTANT THING' : 'WHAT YOU SHOULD KNOW';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pathway banner */}
        <View style={[styles.pathwayBanner, { backgroundColor: meta.bannerBg[0] }]}>
          <View style={[styles.pathwayIcon, { backgroundColor: meta.iconBg[1] }]}>
            <Text style={styles.pathwayEmoji}>{meta.emoji}</Text>
          </View>
          <Text style={[styles.pathwayEyebrow, { color: meta.eyebrowColor }]}>YOUR PRIMARY PATHWAY</Text>
          <Text style={styles.pathwayTitle}>{meta.title}</Text>
          <Text style={styles.pathwaySub}>{meta.sub}</Text>
        </View>

        {/* Secondary pathway badge */}
        {secondary && secondary !== primary && (
          <View style={styles.secondaryBadge}>
            <Text style={styles.secondaryEmoji}>{SECONDARY_EMOJIS[secondary]}</Text>
            <Text style={styles.secondaryText}>
              <Text style={styles.secondaryBold}>Secondary pathway also detected:</Text>{' '}
              {SECONDARY_LABELS[secondary]}. Your child may also have difficulty recognizing the "need to go" signal. We'll cover both.
            </Text>
          </View>
        )}

        {/* Intro section */}
        <Text style={styles.sectionHeading}>{introSectionLabel}</Text>
        <IntroCard />

        {/* Free tips */}
        <Text style={styles.sectionHeading}>WHAT YOU CAN DO NOW — FREE</Text>
        {freeTips.map((tip) => (
          <View key={tip.title} style={styles.tipCard}>
            <View style={styles.tipCardTop}>
              <Text style={styles.tipIcon}>{tip.emoji}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
            </View>
            <Text style={styles.tipText}>{tip.body}</Text>
          </View>
        ))}

        {/* Premium upsell header */}
        <View style={styles.premiumHeader}>
          <Text style={styles.premiumHeaderIcon}>⭐</Text>
          <Text style={styles.premiumHeaderText}>{premium.header}</Text>
        </View>

        {/* Premium locked cards */}
        {premium.items.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.premiumCard, styles.premiumCardLocked]}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <View style={styles.tipCardTop}>
              <Text style={styles.tipIcon}>{item.emoji}</Text>
              <Text style={styles.tipTitle}>{item.title}</Text>
            </View>
            <Text style={[styles.tipText, { opacity: 0.5 }]}>{item.body}</Text>
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedBadgeText}>🔒 Premium — Tap to Unlock</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* CTA buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.premiumBtn} onPress={() => router.push('/potty/bowel-diary')}>
            <Text style={styles.premiumBtnText}>📊 Open Bowel Diary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/potty/quiz')}>
            <Text style={styles.secondaryBtnText}>↩ Retake Quiz</Text>
          </TouchableOpacity>
        </View>

         {/* Medical disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ⚠️ Educational information only — not a substitute for professional medical advice. Always consult your child's pediatrician or a qualified healthcare provider before starting any treatment. Content is informed by published guidelines from the American Academy of Pediatrics (AAP) and NASPGHAN.
          </Text>
        </View>
        {/* Citations */}
        <View style={styles.citationsBox}>
          <Text style={styles.citationsLabel}>SOURCES</Text>
          <Text style={styles.citationItem}>• American Academy of Pediatrics (AAP) — Toilet Training Guidelines for Children with Developmental Disabilities</Text>
          <Text style={styles.citationItem}>• NASPGHAN — Clinical Practice Guidelines for Functional Constipation in Children</Text>
          <Text style={styles.citationItem}>• Mahler, K. — Interoception: The Eighth Sensory System (2017)</Text>
          <Text style={styles.citationItem}>• AOTA — Occupational Therapy Practice Framework: Sensory Integration and Toilet Training</Text>
          <Text style={styles.citationItem}>• CDC — Autism Spectrum Disorder: Data and Statistics (ADDM Network)</Text>
        </View>
        <View style={styles.rainbowBar} />
      </ScrollView>
    </View>
  );
}

const encStyles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: '#fff8f0',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#ff8c42',
    ...SHADOWS.sm,
  },
  label: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1, color: '#c45a00', marginBottom: SPACING.xs, textTransform: 'uppercase' },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, lineHeight: 24 },
  text: { fontSize: FONT_SIZES.sm, color: '#4a3530', lineHeight: 22 },
  emphasis: { color: '#c45a00', fontWeight: '700' },
  bold: { color: COLORS.text, fontWeight: '700' },
});

const warmCardStyles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.purple,
    ...SHADOWS.sm,
  },
  text: { fontSize: 13.5, color: '#4a4570', lineHeight: 22 },
  emphasis: { color: COLORS.purple, fontWeight: '600', fontStyle: 'normal' },
});

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
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  pathwayBanner: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pathwayIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.md,
  },
  pathwayEmoji: { fontSize: 32 },
  pathwayEyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  pathwayTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', lineHeight: 30 },
  pathwaySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  secondaryBadge: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  secondaryEmoji: { fontSize: 22 },
  secondaryText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#4a4570', lineHeight: 20 },
  secondaryBold: { fontWeight: '700', color: COLORS.text },
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
  premiumHeader: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#fffbea',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#f0c040',
  },
  premiumHeaderIcon: { fontSize: 16 },
  premiumHeaderText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#a07800', fontWeight: '600', lineHeight: 18 },
  premiumCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    opacity: 0.6,
    position: 'relative',
  },
  premiumCardUnlocked: {
    opacity: 1,
    borderColor: '#a8ddc9',
  },
  unlockedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#e8f8f0',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#a8ddc9',
  },
  unlockedBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#2e7d5e' },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#fffbea',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#f0c040',
  },
  premiumBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#a07800' },
  premiumCardLocked: {
    opacity: 0.85,
    borderColor: '#c5b8f0',
  },
  lockedBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f0ebff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c5b8f0',
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5a4fcf',
  },
  ctaSection: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  premiumBtn: {
    backgroundColor: '#f0c040',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  premiumBtnText: { color: '#5a3e00', fontWeight: '700', fontSize: FONT_SIZES.md },
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
  disclaimerCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: '#fffbea',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#f0c040',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#7a6200',
    lineHeight: 16,
  },
  citationsBox: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: '#f0f4ff',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#c5cef0',
  },
  citationsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3a4a8a',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  citationItem: {
    fontSize: 11,
    color: '#3a4a8a',
    lineHeight: 17,
    marginBottom: 3,
  },
});
