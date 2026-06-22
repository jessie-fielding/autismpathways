import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

const VALUE_HINTS = [
  "Less than your last Amazon impulse buy 📦",
  "Less than your weekly Starbucks run ☕",
  "Less than one therapy copay 💜",
  "Less than a tank of gas ⛽",
  "Less than your kid's last birthday party favor bag 🎉",
];

const FEATURE_SECTIONS = [
  {
    emoji: '🧠',
    title: 'Profound Autism Pathway',
    color: '#FFF0F5',
    accent: '#F9A8D4',
    textColor: '#831843',
    withPremium: [
      'SOS+ in-the-moment crisis support tool',
      'Poop Smearing Quiz with cause analysis',
      'Is It Pain? medical checklist',
      'Program Finder for residential & day programs',
      'Safety at Home equipment guide',
      'Bigger Than Me physical safety guide',
      'Medication Guide with doctor questions',
      'Waitlist Survival action plan',
      'Community & organizations directory',
      'ABC Logger for behavior data (coming soon)',
    ],
    withoutPremium: [
      'No SOS+ tool',
      'No Poop Smearing Quiz',
      'No Is It Pain? checklist',
      'No Program Finder',
      'No safety guides',
      'No Medication Guide',
      'No Waitlist Survival plan',
      'No Community directory',
      'No ABC Logger',
    ],
  },
  {
    emoji: '📋',
    title: 'IEP & School Tools',
    color: COLORS.lavender,
    accent: COLORS.lavenderAccent,
    textColor: '#5C3EA8',
    withPremium: [
      'Record IEP meetings with AI transcription',
      'Track unlimited IEP goals with progress charts',
      'Look up districts & evaluators in all 50 states',
      'Find telehealth providers who accept your insurance',
      'Store unlimited documents in your secure vault',
    ],
    withoutPremium: [
      'Manual notes only — no recording',
      'Limited to 3 IEP goals',
      'No district or evaluator lookup',
      'No provider search',
      'No document storage',
    ],
  },
  {
    emoji: '🗺️',
    title: 'Transition Planning',
    color: COLORS.mint,
    accent: COLORS.mintAccent,
    textColor: '#0A7A5A',
    withPremium: [
      'AI-powered personalized transition guide',
      'ABLE account finder for all 50 states',
      'Group home & housing finder with waitlist status',
      'Day program finder with vocational options',
      'Pre-ETS tool (available from age 14)',
      'College & vocational program lookup',
      'Special needs jobs & supported employment',
      'Supported apartment lookup',
    ],
    withoutPremium: [
      'General transition tips only',
      'No state-specific ABLE lookup',
      'No housing or group home finder',
      'No day program directory',
      'No Pre-ETS tool',
      'No college program lookup',
      'No jobs finder',
      'No apartment lookup',
    ],
  },
  {
    emoji: '🏥',
    title: 'Provider Directory',
    color: COLORS.peach,
    accent: COLORS.peachAccent,
    textColor: '#8A4020',
    withPremium: [
      '891+ curated ASD-specialized providers',
      'Search all 50 states across 5 specialties',
      '🏅 Caregiver-verified reviews',
      'Submit & review community providers',
      '"Accepting Now" and Medicaid filters',
      '"Near Me" location auto-fill',
    ],
    withoutPremium: [
      'No provider directory access',
      'No specialty or state filters',
      'No community reviews',
      'Cannot submit providers',
      'No availability filters',
      'No location search',
    ],
  },
  {
    emoji: '🔔',
    title: 'Smart Reminders & Tools',
    color: '#FFF8E7',
    accent: '#F5D87A',
    textColor: '#92400E',
    withPremium: [
      'Waiver deadline alerts & renewal reminders',
      'IEP meeting countdown notifications',
      'Services tracker with expiry alerts',
      'AI-powered behavior pattern insights',
      'Annual check-in reminders',
    ],
    withoutPremium: [
      'No waiver or deadline alerts',
      'No IEP meeting reminders',
      'No services tracker',
      'No AI insights',
      'No check-in reminders',
    ],
  },
  {
    emoji: '💬',
    title: 'Community & Support',
    color: '#F0FDF4',
    accent: '#86EFAC',
    textColor: '#166534',
    withPremium: [
      'Unlimited Safe Space journal entries',
      'Post & read community Safe Space stories',
      'Full resource library access',
      'Priority support & early feature access',
    ],
    withoutPremium: [
      'Limited to 5 journal entries',
      'Read-only community access',
      'Limited resource library',
      'Standard support only',
    ],
  },
];

const FAQ = [
  { q: "Can I try before I subscribe?", a: "Yes! Every plan starts with a 7-day free trial. Cancel anytime before it ends and you won't be charged a thing." },
  { q: "What if I can't afford it?", a: "We offer a hardship waiver for families who qualify. Tap \"Apply for Hardship Waiver\" below — no judgment, ever." },
  { q: "Can I use the app for free?", a: "Yes! Core pathways, daily observations, SOS tool, Safe Space (limited), and basic checklists are always free." },
  { q: "Does premium auto-renew?", a: "Yes, subscriptions auto-renew. You can cancel anytime in your App Store or Google Play settings." },
];

export default function PremiumFeaturesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const hintIndex = Math.floor(Date.now() / 86_400_000) % VALUE_HINTS.length;

  const goToPurchase = () => router.push('/paywall');

  if (isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnStandalone}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.alreadyPremium}>
          <Text style={styles.alreadyIcon}>⭐</Text>
          <Text style={styles.alreadyTitle}>You're already Premium!</Text>
          <Text style={styles.alreadySub}>You have full access to every feature. Thank you for supporting Autism Pathways — it means the world to families like ours.</Text>
          <TouchableOpacity style={styles.backToDashBtn} onPress={() => router.back()}>
            <Text style={styles.backToDashText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Unlock Premium Access</Text>
          <Text style={styles.heroSub}>Everything your family needs — in one place.</Text>
          <View style={styles.valueHint}>
            <Text style={styles.valueHintText}>{VALUE_HINTS[hintIndex]}</Text>
          </View>
          <View style={styles.trialPill}>
            <Text style={styles.trialPillText}>🎁 7-day free trial · Cancel anytime · No commitment</Text>
          </View>
        </View>

        {/* Feature sections with comparison */}
        {FEATURE_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionWrap}>
            <View style={[styles.sectionHeader, { backgroundColor: section.color, borderLeftColor: section.accent }]}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <Text style={[styles.sectionTitle, { color: section.textColor }]}>{section.title}</Text>
            </View>

            <View style={styles.comparisonRow}>
              <View style={[styles.comparisonCol, styles.comparisonColPremium]}>
                <Text style={styles.comparisonColHeaderText}>✅ With Premium</Text>
                {section.withPremium.map((item, i) => (
                  <View key={i} style={styles.comparisonItem}>
                    <Text style={styles.comparisonCheck}>✓</Text>
                    <Text style={styles.comparisonItemText}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.comparisonCol, styles.comparisonColFree]}>
                <Text style={styles.comparisonColHeaderTextFree}>🔒 Without</Text>
                {section.withoutPremium.map((item, i) => (
                  <View key={i} style={styles.comparisonItem}>
                    <Text style={styles.comparisonX}>✗</Text>
                    <Text style={styles.comparisonItemTextFree}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.sectionCta} onPress={goToPurchase} activeOpacity={0.85}>
              <Text style={styles.sectionCtaText}>Start Free Trial →</Text>
              <Text style={styles.sectionCtaHint}>Try free for 7 days · No commitment</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Hardship waiver */}
        <View style={styles.hardshipCard}>
          <Text style={styles.hardshipEmoji}>💜</Text>
          <Text style={styles.hardshipTitle}>Can't afford it right now?</Text>
          <Text style={styles.hardshipSub}>We offer a hardship waiver for families who need it. No judgment — just support.</Text>
          <TouchableOpacity
            style={styles.hardshipBtn}
            onPress={() => router.push('/paywall/hardship-application' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.hardshipBtnText}>Apply for Hardship Waiver</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Common Questions</Text>
          {FAQ.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqCard}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              activeOpacity={0.8}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Text style={styles.faqChevron}>{expandedFaq === i ? '▲' : '▼'}</Text>
              </View>
              {expandedFaq === i && <Text style={styles.faqA}>{item.a}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <TouchableOpacity style={styles.trialBtnBottom} onPress={goToPurchase} activeOpacity={0.85}>
            <Text style={styles.trialBtnText}>⭐ Start Free Trial</Text>
            <Text style={styles.trialBtnSub}>7 days free · then less than your weekly coffee ☕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.skipBtn}>
            <Text style={styles.skipText}>Maybe later</Text>
          </TouchableOpacity>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://autismpathways.app/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://autismpathways.app/terms')}>
              <Text style={styles.legalLink}>Terms of Use</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: insets.bottom + SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  backBtn: { paddingVertical: SPACING.sm },
  backBtnStandalone: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  scroll: { paddingBottom: SPACING.xl },

  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  heroSub: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  valueHint: {
    backgroundColor: '#FFF8E7',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F5D87A',
    marginBottom: SPACING.sm,
  },
  valueHintText: { fontSize: FONT_SIZES.sm, color: '#92400E', fontWeight: '600', textAlign: 'center' },
  trialPill: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  trialPillText: { fontSize: FONT_SIZES.sm, color: COLORS.purpleDark, fontWeight: '700', textAlign: 'center' },

  sectionWrap: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderLeftWidth: 4,
  },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800' },

  comparisonRow: { flexDirection: 'row' },
  comparisonCol: { flex: 1, padding: SPACING.md },
  comparisonColPremium: { borderRightWidth: 1, borderRightColor: COLORS.border, backgroundColor: '#FAFFFE' },
  comparisonColFree: { backgroundColor: '#FAFAFA' },
  comparisonColHeaderText: { fontSize: 11, fontWeight: '800', color: '#0A7A5A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  comparisonColHeaderTextFree: { fontSize: 11, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  comparisonItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 6 },
  comparisonCheck: { fontSize: 11, color: '#0A7A5A', fontWeight: '700', marginTop: 2 },
  comparisonX: { fontSize: 11, color: '#DC2626', fontWeight: '700', marginTop: 2 },
  comparisonItemText: { flex: 1, fontSize: 11, color: COLORS.text, lineHeight: 16 },
  comparisonItemTextFree: { flex: 1, fontSize: 11, color: COLORS.textLight, lineHeight: 16 },

  sectionCta: {
    backgroundColor: COLORS.purple,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  sectionCtaText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '800' },
  sectionCtaHint: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },

  hardshipCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
    ...SHADOWS.sm,
  },
  hardshipEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  hardshipTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  hardshipSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 19, marginBottom: SPACING.lg },
  hardshipBtn: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  hardshipBtnText: { color: COLORS.purpleDark, fontSize: FONT_SIZES.sm, fontWeight: '700' },

  faqSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  faqTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  faqCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.sm },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqQ: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginRight: SPACING.sm },
  faqChevron: { fontSize: 10, color: COLORS.textLight, marginTop: 3 },
  faqA: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19, marginTop: SPACING.sm },

  bottomCta: { paddingHorizontal: SPACING.lg, alignItems: 'center' },
  trialBtnBottom: {
    width: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.lg, marginBottom: SPACING.md,
  },
  trialBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  trialBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 3 },
  skipBtn: { paddingVertical: SPACING.md },
  skipText: { color: COLORS.textMid, fontSize: FONT_SIZES.sm },
  legalLinks: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginTop: SPACING.md },
  legalLink: { fontSize: 11, color: COLORS.purple, fontWeight: '600' },
  legalSep: { fontSize: 11, color: COLORS.textLight },

  alreadyPremium: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  alreadyIcon: { fontSize: 56, marginBottom: SPACING.lg },
  alreadyTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  alreadySub: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  backToDashBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.lg, ...SHADOWS.md },
  backToDashText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
