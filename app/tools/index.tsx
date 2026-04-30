import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

type Tool = {
  icon: string;
  title: string;
  description: string;
  cta: string;
  route?: string;
  premium?: boolean;
  soon?: boolean;
  accentColor: string;
};

const SECTIONS: { label: string; tools: Tool[] }[] = [
  {
    label: 'CORE PATHWAYS',
    tools: [
      {
        icon: '🚀',
        title: 'Start Here',
        description: "Enter your child's information to personalize your experience.",
        cta: 'Open',
        route: '/(tabs)/start-here',
        accentColor: COLORS.lavenderAccent,
      },
      {
        icon: '🧠',
        title: 'Diagnosis Pathway',
        description: 'Step-by-step guide from referral to official diagnosis.',
        cta: 'Start',
        route: '/diagnosis',
        accentColor: COLORS.lavenderAccent,
      },
      {
        icon: '💳',
        title: 'Medicaid Pathway',
        description: 'How to apply, what to do if denied, and what\'s covered.',
        cta: 'Explore',
        route: '/medicaid',
        accentColor: COLORS.mintAccent,
      },
      {
        icon: '🛡️',
        title: 'Waivers Pathway',
        description: 'Understand waivers, waitlists, and how to stay on track.',
        cta: 'Explore',
        route: '/waiver',
        accentColor: COLORS.mintAccent,
      },
      {
        icon: '🏫',
        title: 'IEP Pathway',
        description: 'Know your rights, prep for meetings, and track goals.',
        cta: 'Open',
        route: '/iep',
        accentColor: COLORS.blueAccent,
      },
      {
        icon: '🚽',
        title: 'Potty Pathway',
        description: 'Personalized toilet training plan based on your child\'s profile.',
        cta: 'Start',
        route: '/potty',
        accentColor: COLORS.peachAccent,
      },
    ],
  },
  {
    label: 'APPOINTMENT TOOLS',
    tools: [
      {
        icon: '👁️',
        title: 'Observations',
        description: 'Log daily behaviors so you have clear notes for appointments.',
        cta: 'Log now',
        route: '/observations',
        accentColor: COLORS.blueAccent,
      },
      {
        icon: '🩺',
        title: 'Provider Prep',
        description: 'Build a focused agenda so nothing gets missed at appointments.',
        cta: 'Prepare',
        route: '/provider-prep',
        accentColor: COLORS.peachAccent,
      },
      {
        icon: '🗣️',
        title: 'Talking Points',
        description: 'Scripts for calling Medicaid, schools, and providers — with pushback responses.',
        cta: 'Open',
        route: '/talking-points',
        accentColor: COLORS.lavenderAccent,
      },
      {
        icon: '⚖️',
        title: 'Appeal Tracker',
        description: 'Track deadlines, documents, and hearing dates for every appeal.',
        cta: 'Open',
        route: '/appeal-tracker',
        premium: true,
        accentColor: COLORS.yellowAccent,
      },
    ],
  },
  {
    label: 'ORGANIZATION',
    tools: [
      {
        icon: '📁',
        title: 'Document Vault',
        description: 'Track the 12 documents your family needs for Medicaid, school, and benefits.',
        cta: 'Open Vault',
        soon: true,
        premium: true,
        accentColor: COLORS.yellowAccent,
      },
      {
        icon: '📒',
        title: 'My Contacts',
        description: "Save and organize your child's care team in one place.",
        cta: 'Open',
        route: '/contacts',
        accentColor: COLORS.mintAccent,
      },
      {
        icon: '📓',
        title: 'Safe Space',
        description: 'A private journal just for you — write anything, no judgment.',
        cta: 'Open',
        route: '/safe-space',
        accentColor: COLORS.peachAccent,
      },
      {
        icon: '📝',
        title: 'Provider Report',
        description: 'Generate a shareable summary of observations and concerns for any provider.',
        cta: 'Coming soon',
        soon: true,
        accentColor: COLORS.peachAccent,
      },
      {
        icon: '🔔',
        title: 'Reminders',
        description: 'Push notifications for appeal deadlines, waitlist check-ins, and renewals.',
        cta: 'Coming soon',
        soon: true,
        accentColor: COLORS.blueAccent,
      },
    ],
  },
  {
    label: 'REFERENCE',
    tools: [
      {
        icon: '🧩',
        title: 'Developmental Quiz',
        description: "Answer guided questions to better understand your child's developmental profile.",
        cta: 'Take quiz',
        soon: true,
        accentColor: COLORS.mintAccent,
      },
      {
        icon: '🔍',
        title: 'ICD Support Quiz',
        description: 'Identify which ICD-10 codes may be relevant when talking with providers.',
        cta: 'Explore',
        soon: true,
        accentColor: COLORS.yellowAccent,
      },
    ],
  },
];

export default function AllToolsScreen() {
  const router = useRouter();
  const { isPremium } = useIsPremium();

  const handlePress = (tool: Tool) => {
    if (tool.soon) return;
    if (tool.route) router.push(tool.route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🧰</Text>
          <Text style={styles.heroTitle}>All Tools</Text>
          <Text style={styles.heroSub}>
            Everything you need to navigate the autism journey — from diagnosis to waivers to appointments.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.label} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            <View style={styles.grid}>
              {section.tools.map((tool) => {
                const isLocked = tool.premium && !isPremium;
                const isSoon = tool.soon;
                return (
                  <TouchableOpacity
                    key={tool.title}
                    style={[
                      styles.card,
                      { borderTopColor: tool.accentColor },
                      (isLocked || isSoon) && styles.cardDimmed,
                    ]}
                    onPress={() => handlePress(tool)}
                    activeOpacity={isSoon ? 1 : 0.75}
                  >
                    {/* Badge */}
                    {isLocked && !isSoon && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
                      </View>
                    )}
                    {isSoon && (
                      <View style={styles.soonBadge}>
                        <Text style={styles.soonBadgeText}>⏳ Soon</Text>
                      </View>
                    )}

                    <Text style={styles.cardIcon}>{tool.icon}</Text>
                    <Text style={styles.cardTitle}>{tool.title}</Text>
                    <Text style={styles.cardDesc}>{tool.description}</Text>
                    <Text style={[
                      styles.cardCta,
                      { color: isSoon ? COLORS.textLight : COLORS.purple },
                    ]}>
                      {isSoon ? 'Coming soon' : `${tool.cta} →`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  scroll: { paddingHorizontal: SPACING.lg },
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xxl,
  },
  heroIcon: { fontSize: 40, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.purpleDark,
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.xl,
  },
  section: { marginBottom: SPACING.xxl },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    width: '47.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 4,
    position: 'relative',
    ...SHADOWS.sm,
  },
  cardDimmed: { opacity: 0.72 },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#FFF3CD',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumBadgeText: { fontSize: 10, fontWeight: '700', color: '#8B6914' },
  soonBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soonBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.purpleDark },
  cardIcon: { fontSize: 28, marginBottom: SPACING.sm },
  cardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    lineHeight: 17,
    marginBottom: SPACING.md,
    flexGrow: 1,
  },
  cardCta: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
