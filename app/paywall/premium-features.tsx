import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

const FEATURE_SECTIONS = [
  {
    emoji: '📋',
    title: 'IEP & School Tools',
    color: COLORS.lavender,
    accent: COLORS.lavenderAccent,
    textColor: '#5C3EA8',
    features: [
      'IEP Meeting Recorder with AI transcription',
      'IEP Goal Tracker (unlimited goals)',
      'District & Evaluator Lookup (all 50 states)',
      'Telehealth Provider Lookup',
      'Document Vault (unlimited storage)',
    ],
  },
  {
    emoji: '🗺️',
    title: 'Transition Planning',
    color: COLORS.mint,
    accent: COLORS.mintAccent,
    textColor: '#0A7A5A',
    features: [
      'AI-Powered Personalized Transition Guide',
      'ABLE Account Finder (all 50 states)',
      'Group Home & Housing Finder',
      'Day Program Finder',
      'Pre-ETS Tool (Pre-Employment Transition)',
      'College & Vocational Program Lookup',
      'Special Needs Jobs Finder',
      'Supported Apartment Lookup',
    ],
  },
  {
    emoji: '🏥',
    title: 'Provider Directory',
    color: COLORS.peach,
    accent: COLORS.peachAccent,
    textColor: '#8A4020',
    features: [
      '891+ curated ASD-specialized providers',
      'All 50 states · 5 specialties',
      '🏅 Caregiver Verified reviews',
      'Submit & review community providers',
      'Accepting Now & Medicaid filters',
      '"Near Me" location auto-fill',
    ],
  },
  {
    emoji: '🔔',
    title: 'Smart Reminders & Tools',
    color: COLORS.yellow,
    accent: COLORS.yellowAccent,
    textColor: '#7A6020',
    features: [
      'Services Tracker with leave-time alerts',
      'Provider Translator (unlimited translations)',
      'Provider Dictionary (saved translations)',
      'Waiver Finder & State Waivers',
      'Annual check-in reminders',
      'Transition stage deadline alerts',
    ],
  },
];

const FAQS = [
  {
    q: 'Can I try before I subscribe?',
    a: 'Yes! Start with a 7-day free trial. Cancel anytime before the trial ends and you won\'t be charged.',
  },
  {
    q: 'What if I can\'t afford the full price?',
    a: 'We believe every family deserves access. Apply for our hardship rate — we review every application personally.',
  },
  {
    q: 'Can I use the app for free?',
    a: 'Yes! Core pathways, daily observations, SOS tool, Safe Space, and basic checklists are always free.',
  },
  {
    q: 'Does premium auto-renew?',
    a: 'Yes, subscriptions auto-renew. You can cancel anytime in your App Store or Google Play settings.',
  },
];

export default function PremiumFeaturesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.alreadyPremium}>
          <Text style={styles.alreadyIcon}>⭐</Text>
          <Text style={styles.alreadyTitle}>You're a Premium Member!</Text>
          <Text style={styles.alreadySub}>Thank you for supporting Autism Pathways. You have access to every tool and feature.</Text>
          <TouchableOpacity style={styles.backToDashBtn} onPress={() => router.back()}>
            <Text style={styles.backToDashText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => router.back()} style={styles.heroBack}>
            <Text style={styles.heroBackText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroIcon}>⭐</Text>
          <Text style={styles.heroTitle}>Autism Pathways Premium</Text>
          <Text style={styles.heroSub}>
            Everything you need, organized in one place —{'\n'}for less than your weekly coffee run
          </Text>
        </View>

        {/* Pricing Toggle */}
        <View style={styles.pricingCard}>
          <View style={styles.planToggle}>
            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionActive]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.planLabel, selectedPlan === 'monthly' && styles.planLabelActive]}>Monthly</Text>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>$14.99</Text>
              <Text style={[styles.planPer, selectedPlan === 'monthly' && styles.planPerActive]}>per month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'yearly' && styles.planOptionActive]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.8}
            >
              <View style={styles.saveBadgeRow}>
                <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>SAVE 33%</Text></View>
              </View>
              <Text style={[styles.planLabel, selectedPlan === 'yearly' && styles.planLabelActive]}>Yearly</Text>
              <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceActive]}>$119.99</Text>
              <Text style={[styles.planPer, selectedPlan === 'yearly' && styles.planPerActive]}>per year · ~$10/mo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.trialBtn}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.85}
          >
            <Text style={styles.trialBtnText}>⭐ Start 7-Day Free Trial</Text>
          </TouchableOpacity>
          <Text style={styles.trialNote}>Cancel anytime · No commitment · Restore purchase</Text>
        </View>

        {/* Feature Sections */}
        <View style={styles.sectionsWrap}>
          {FEATURE_SECTIONS.map((section) => (
            <View key={section.title} style={[styles.featureSection, { backgroundColor: section.color, borderLeftColor: section.accent }]}>
              <View style={styles.featureSectionHeader}>
                <Text style={styles.featureSectionEmoji}>{section.emoji}</Text>
                <Text style={[styles.featureSectionTitle, { color: section.textColor }]}>{section.title}</Text>
              </View>
              {section.features.map((f) => (
                <View key={f} style={styles.featureItem}>
                  <Text style={[styles.featureCheck, { color: section.textColor }]}>✓</Text>
                  <Text style={[styles.featureItemText, { color: section.textColor }]}>{f}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Hardship Application */}
        <View style={styles.hardshipCard}>
          <Text style={styles.hardshipEmoji}>💜</Text>
          <Text style={styles.hardshipTitle}>Can't afford the full price?</Text>
          <Text style={styles.hardshipSub}>
            We believe every family deserves access to these tools. Apply for our hardship rate — we review every application personally.
          </Text>
          <TouchableOpacity
            style={styles.hardshipBtn}
            onPress={() => router.push('/paywall/hardship-application' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.hardshipBtnText}>Apply for Hardship Rate →</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Common Questions</Text>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqCard}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              activeOpacity={0.8}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqChevron}>{expandedFaq === i ? '▲' : '▼'}</Text>
              </View>
              {expandedFaq === i && (
                <Text style={styles.faqA}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <TouchableOpacity
            style={styles.trialBtnBottom}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.85}
          >
            <Text style={styles.trialBtnText}>Start Free Trial →</Text>
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

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { paddingVertical: 4 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },

  // Hero
  hero: { backgroundColor: COLORS.purpleDark, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.xxxl, alignItems: 'center' },
  heroBack: { alignSelf: 'flex-start', paddingVertical: 4, marginBottom: SPACING.lg },
  heroBackText: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  heroIcon: { fontSize: 48, marginBottom: SPACING.md },
  heroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 20 },

  // Pricing card
  pricingCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginTop: -SPACING.xl, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md },
  planToggle: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  planOption: { flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  planOptionActive: { backgroundColor: COLORS.lavender, borderColor: COLORS.purple },
  saveBadgeRow: { marginBottom: 2 },
  saveBadge: { backgroundColor: '#22c55e', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  saveBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
  planLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMid, marginBottom: 2 },
  planLabelActive: { color: COLORS.purpleDark },
  planPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  planPriceActive: { color: COLORS.purpleDark },
  planPer: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  planPerActive: { color: COLORS.purple },
  trialBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.lg },
  trialBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  trialNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.sm },

  // Feature sections
  sectionsWrap: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, gap: SPACING.md },
  featureSection: { borderRadius: RADIUS.sm, padding: SPACING.lg, borderLeftWidth: 4 },
  featureSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  featureSectionEmoji: { fontSize: 22 },
  featureSectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  featureCheck: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginTop: 1 },
  featureItemText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 19 },

  // Hardship
  hardshipCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginTop: SPACING.xl, borderRadius: RADIUS.sm, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.lavenderAccent, ...SHADOWS.sm },
  hardshipEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  hardshipTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  hardshipSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 19, marginBottom: SPACING.lg },
  hardshipBtn: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  hardshipBtnText: { color: COLORS.purpleDark, fontSize: FONT_SIZES.sm, fontWeight: '700' },

  // FAQ
  faqSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  faqTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  faqCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.sm },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqQ: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginRight: SPACING.sm },
  faqChevron: { fontSize: 10, color: COLORS.textLight, marginTop: 3 },
  faqA: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19, marginTop: SPACING.sm },

  // Bottom CTA
  bottomCta: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, alignItems: 'center' },
  trialBtnBottom: { width: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.lg, marginBottom: SPACING.md },
  skipBtn: { paddingVertical: SPACING.md },
  skipText: { color: COLORS.textMid, fontSize: FONT_SIZES.sm },
  legalLinks: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginTop: SPACING.md },
  legalLink: { fontSize: 11, color: COLORS.purple, fontWeight: '600' },
  legalSep: { fontSize: 11, color: COLORS.textLight },

  // Already premium
  alreadyPremium: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  alreadyIcon: { fontSize: 56, marginBottom: SPACING.lg },
  alreadyTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  alreadySub: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  backToDashBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.lg, ...SHADOWS.md },
  backToDashText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
