import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../../lib/theme';

const ACTIVITIES = [
  {
    id: 'body-check',
    emoji: '🔍',
    title: 'Body Check-In',
    level: 'Beginner',
    levelColor: '#4CAF50',
    time: '5 min · Daily',
    description: 'Teach your child to pause and scan their body for sensations — the foundation of interoception.',
    steps: [
      'Set a timer for 2 minutes, 3x per day (morning, after lunch, before bed).',
      'Ask: "Let\'s do a body check. Close your eyes. What does your tummy feel like right now?"',
      'Offer words: "Does it feel empty? Full? Bubbly? Tight? Rumbly?"',
      'Don\'t correct — just validate whatever they say. "Oh, rumbly! That\'s good information."',
      'Over time, add: "When your tummy feels rumbly, that might mean it\'s time to try the bathroom."',
    ],
    tip: 'Kelly Mahler\'s "The Interoception Curriculum" has visual body maps that work well for this. Ask your OT about it.',
  },
  {
    id: 'hunger-fullness',
    emoji: '🍎',
    title: 'Hunger & Fullness Scale',
    level: 'Beginner',
    levelColor: '#4CAF50',
    time: '5 min · At meals',
    description: 'Hunger and fullness are the easiest interoceptive signals to start with — they\'re predictable and happen multiple times a day.',
    steps: [
      'Create a simple 1–5 scale with pictures: 1 = very empty/hungry, 5 = very full.',
      'Before and after every meal, ask your child to point to their number.',
      'Don\'t correct their answer — the goal is noticing, not accuracy.',
      'After 2 weeks, add: "What does a 2 feel like in your body? Where do you feel it?"',
      'Connect to bathroom: "Sometimes when your tummy feels a certain way after eating, your body might need the bathroom soon."',
    ],
    tip: 'The same scale can be adapted for "need to poop" — 1 = nothing, 5 = urgent. Start with hunger/fullness first since it\'s less anxiety-provoking.',
  },
  {
    id: 'sensation-sorting',
    emoji: '🎯',
    title: 'Sensation Sorting Game',
    level: 'Intermediate',
    levelColor: '#FF9800',
    time: '10 min · 2x/week',
    description: 'A game that builds the vocabulary for body sensations — making it easier to communicate bathroom needs.',
    steps: [
      'Create cards with body sensation words: tight, loose, bubbly, heavy, empty, full, warm, cold, pressure, rumbly.',
      'Take turns drawing a card and acting out or describing that sensation.',
      'Ask: "Have you ever felt that in your body? Where? When?"',
      'Gradually add bathroom-specific sensations to the deck.',
      'When your child uses a sensation word spontaneously, celebrate it: "You noticed that! That\'s amazing."',
    ],
    tip: 'This works well as a family game — when parents play too, it normalizes talking about body sensations.',
  },
  {
    id: 'bathroom-signal',
    emoji: '🚽',
    title: 'Bathroom Signal Awareness',
    level: 'Intermediate',
    levelColor: '#FF9800',
    time: '5 min · After timed sits',
    description: 'Directly connecting interoception to bathroom use — the bridge between body awareness and action.',
    steps: [
      'After each timed sit (whether successful or not), ask: "What did you notice in your body while you were sitting?"',
      'Offer options: "Did you feel any pressure? Any rumbly feeling? Nothing at all?"',
      'If they felt something: "That feeling is your body\'s bathroom signal. Your body is learning to talk to you."',
      'If they felt nothing: "That\'s okay — sometimes the signal is quiet. We\'re teaching your body to speak louder."',
      'Over time, ask BEFORE sits: "Is your body giving you any signals right now?"',
    ],
    tip: 'Some kids need 6–8 weeks before they start noticing signals. Consistency with timed sits is what builds the awareness.',
  },
  {
    id: 'mindful-movement',
    emoji: '🧘',
    title: 'Mindful Movement Check-In',
    level: 'Advanced',
    levelColor: '#9C27B0',
    time: '10 min · 3x/week',
    description: 'Movement-based interoception activities — especially helpful for kids who are more body-aware through movement than stillness.',
    steps: [
      'Do 5 jumping jacks together. Stop. Ask: "What do you notice in your body right now?"',
      'Try slow belly breathing for 1 minute. Ask: "What changed?"',
      'Squeeze hands into fists for 10 seconds, then release. Ask: "What did that feel like? What about now?"',
      'After each activity, draw or point to where they felt it on a body outline.',
      'Connect: "Your body is always sending you information. We\'re learning to listen to it."',
    ],
    tip: 'This is adapted from sensory integration therapy. If your child has an OT, share this activity and ask them to incorporate it into sessions.',
  },
];

export default function InteroceptionActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>('body-check');

  const handleShare = async () => {
    const text = ACTIVITIES.map(a =>
      `${a.title} (${a.level} · ${a.time})\n${a.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    ).join('\n\n');
    await Share.share({
      title: 'Interoception Activities — Autism Pathways',
      message: `INTEROCEPTION AWARENESS ACTIVITIES\nAutism Pathways\n\n${text}\n\nGenerated by Autism Pathways · For personal use only`,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interoception Activities</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🧠</Text>
          <Text style={styles.introTitle}>Interoception Awareness Activities</Text>
          <Text style={styles.introBody}>
            Interoception is the sense that tells us what's happening inside our bodies — hunger, fullness, the urge to use the bathroom. Many autistic children have difficulty with this sense, which is why they may not "feel" the need to go until it's urgent or too late. These activities build that awareness over time.
          </Text>
        </View>

        <View style={styles.brittanyNote}>
          <Text style={styles.brittanyNoteText}>
            💜 <Text style={{ fontWeight: '700' }}>OT Note:</Text> These activities are adapted from Kelly Mahler's Interoception Curriculum. For deeper work, ask your OT about the full curriculum. This is one of the most evidence-based approaches for autistic children with body signal difficulties.
          </Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>What to Expect</Text>
          <View style={styles.timelineRow}>
            <Text style={styles.timelineWeek}>Weeks 1–2</Text>
            <Text style={styles.timelineText}>Building vocabulary for body sensations. No bathroom connection yet.</Text>
          </View>
          <View style={styles.timelineRow}>
            <Text style={styles.timelineWeek}>Weeks 3–4</Text>
            <Text style={styles.timelineText}>Child starts using sensation words spontaneously. Begin connecting to bathroom signals.</Text>
          </View>
          <View style={styles.timelineRow}>
            <Text style={styles.timelineWeek}>Weeks 5–8</Text>
            <Text style={styles.timelineText}>Child begins noticing bathroom signals before they become urgent. Accidents decrease.</Text>
          </View>
          <View style={[styles.timelineRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.timelineWeek}>8+ weeks</Text>
            <Text style={styles.timelineText}>Self-initiated bathroom trips increase. Continue activities to maintain awareness.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Activities by Level</Text>
        <Text style={styles.sectionSubtitle}>Start with Beginner activities and progress as your child builds awareness. There's no rush.</Text>

        {ACTIVITIES.map((act) => (
          <TouchableOpacity
            key={act.id}
            style={styles.actCard}
            onPress={() => setExpanded(expanded === act.id ? null : act.id)}
            activeOpacity={0.85}
          >
            <View style={styles.actHeader}>
              <Text style={styles.actEmoji}>{act.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.actTitleRow}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: act.levelColor + '22', borderColor: act.levelColor }]}>
                    <Text style={[styles.levelText, { color: act.levelColor }]}>{act.level}</Text>
                  </View>
                </View>
                <Text style={styles.actTime}>{act.time}</Text>
              </View>
              <Text style={styles.chevron}>{expanded === act.id ? '▲' : '▼'}</Text>
            </View>
            {expanded === act.id && (
              <View style={styles.actBody}>
                <Text style={styles.actDesc}>{act.description}</Text>
                <Text style={styles.stepsLabel}>HOW TO DO IT</Text>
                {act.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{i + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
                <View style={styles.tipBox}>
                  <Text style={styles.tipLabel}>💡 TIP</Text>
                  <Text style={styles.tipText}>{act.tip}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare}>
          <Text style={styles.shareFullBtnText}>📤 Share These Activities</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Autism Pathways · Adapted from Kelly Mahler's Interoception Curriculum · Not a substitute for OT services</Text>
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
  timelineCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.lg, ...SHADOWS.card,
  },
  timelineTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  timelineRow: {
    flexDirection: 'row', paddingBottom: SPACING.sm, marginBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  timelineWeek: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, width: 80 },
  timelineText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 18 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 18 },
  actCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  actHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  actEmoji: { fontSize: 24, marginRight: SPACING.sm, marginTop: 2 },
  actTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  actTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, borderWidth: 1 },
  levelText: { fontSize: 10, fontWeight: '700' },
  actTime: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  chevron: { fontSize: 12, color: COLORS.textSecondary, marginLeft: SPACING.sm },
  actBody: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  actDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.md, fontStyle: 'italic' },
  stepsLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  stepRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  stepNum: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple, marginRight: SPACING.xs, width: 20 },
  stepText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  tipBox: { backgroundColor: '#f8f4ff', borderLeftWidth: 3, borderLeftColor: COLORS.purple, padding: SPACING.sm, borderRadius: RADIUS.sm, marginTop: SPACING.sm },
  tipLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, marginBottom: 2 },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 18, fontStyle: 'italic' },
  shareFullBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.full, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple,
  },
  shareFullBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.md },
  footer: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
});
