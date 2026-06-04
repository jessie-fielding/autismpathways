/**
 * 1:1 Support — Browse Screen
 * Three session tiers + hardship option.
 * Tapping "Book" opens the Calendly booking screen (WebView).
 * Payment is Apple-safe: Stripe checkout opens in Safari (external browser).
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

// ── Session types ─────────────────────────────────────────────────────────────
const SESSIONS = [
  {
    id: 'quick',
    emoji: '🌱',
    title: 'Quick Check-In',
    duration: '30 min',
    durationColor: COLORS.teal,
    description: 'A specific question or gut-check. Great for first-timers.',
    price: '$45',
    priceColor: COLORS.teal,
    priceBg: '#E3F7F1',
    borderColor: COLORS.tealAccent,
    buttonStyle: 'outline' as const,
    buttonColor: COLORS.teal,
    // Replace with your actual Calendly links per session type
    calendlyUrl: 'https://calendly.com/autismpathways/quick-check-in',
  },
  {
    id: 'deep',
    emoji: '💬',
    title: 'Deep Dive',
    duration: '60 min',
    durationColor: COLORS.purple,
    description: 'Work through an IEP, waiver, or anything weighing on you. Leave with a plan.',
    price: '$85',
    priceColor: COLORS.purple,
    priceBg: COLORS.lavender,
    borderColor: COLORS.lavenderAccent,
    popular: true,
    buttonStyle: 'filled' as const,
    buttonColor: COLORS.purple,
    calendlyUrl: 'https://calendly.com/autismpathways/deep-dive',
  },
  {
    id: 'ongoing',
    emoji: '🗺️',
    title: 'Ongoing Support',
    duration: '3 sessions',
    durationColor: '#D4702A',
    description: 'For families in the thick of it. 3 sessions to use however you need.',
    price: '$199',
    priceColor: '#D4702A',
    priceBg: COLORS.peach,
    borderColor: COLORS.peachAccent,
    buttonStyle: 'outline' as const,
    buttonColor: '#D4702A',
    calendlyUrl: 'https://calendly.com/autismpathways/ongoing-support',
  },
];

export default function SupportIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBook = (session: typeof SESSIONS[0]) => {
    router.push({
      pathname: '/support/book',
      params: {
        title: session.title,
        price: session.price,
        duration: session.duration,
        calendlyUrl: session.calendlyUrl,
      },
    } as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>1:1 Support</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Talk to Me Directly</Text>
            <Text style={styles.heroBody}>
              Sometimes you just need someone who gets it. Not a hotline, not a therapist, not a Google search. I am here if you need an ear, a second opinion, or guidance from a parent who has lived this and researched it deeply.
            </Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>📞 Phone Call</Text></View>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>📹 Video Chat</Text></View>
            </View>
          </View>
          <View style={styles.heroPhotoWrap}>
            <Image
              source={{ uri: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663518290110/VRxcangGsn9CzPF6Gyu8F3/jessie_photo_b68040f6.png' }}
              style={styles.heroPhoto}
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionHeading}>Choose a Session</Text>

          {SESSIONS.map((s) => (
            <View
              key={s.id}
              style={[
                styles.sessionCard,
                { borderTopColor: s.borderColor },
                s.popular && styles.sessionCardPopular,
              ]}
            >
              {s.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.sessionRow}>
                {/* Icon */}
                <View style={[styles.sessionIcon, { backgroundColor: s.priceBg }]}>
                  <Text style={styles.sessionEmoji}>{s.emoji}</Text>
                </View>
                {/* Info */}
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{s.title}</Text>
                  <Text style={[styles.sessionDuration, { color: s.durationColor }]}>{s.duration}</Text>
                  <Text style={styles.sessionDesc}>{s.description}</Text>
                </View>
                {/* Price + Book */}
                <View style={styles.sessionActions}>
                  <View style={[styles.pricePill, { backgroundColor: s.priceBg }]}>
                    <Text style={[styles.priceText, { color: s.priceColor }]}>{s.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.bookBtn,
                      s.buttonStyle === 'filled'
                        ? { backgroundColor: s.buttonColor, borderColor: s.buttonColor }
                        : { backgroundColor: 'transparent', borderColor: s.buttonColor },
                    ]}
                    onPress={() => handleBook(s)}
                    activeOpacity={0.85}
                  >
                    <Text style={[
                      styles.bookBtnText,
                      { color: s.buttonStyle === 'filled' ? COLORS.white : s.buttonColor },
                    ]}>
                      Book →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Hardship tip */}
          <View style={styles.hardshipCard}>
            <Text style={styles.hardshipEmoji}>💜</Text>
            <View style={styles.hardshipText}>
              <Text style={styles.hardshipTitle}>Need help with the cost?</Text>
              <Text style={styles.hardshipBody}>
                Hardship pricing is available because I know what it is like to be desperate for answers and be handed an expensive invoice instead.
              </Text>
              <TouchableOpacity onPress={() => router.push('/support/hardship' as any)} activeOpacity={0.8}>
                <Text style={styles.hardshipLink}>Apply for hardship pricing →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            All sessions are confidential. I am a parent advocate, not a licensed therapist.
          </Text>
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: 4, minWidth: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },

  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.purple, margin: SPACING.lg,
    borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md,
    gap: SPACING.md,
  },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.sm, lineHeight: 26 },
  heroBody: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.9)', lineHeight: 19, marginBottom: SPACING.md },
  heroBadges: { flexDirection: 'row', gap: SPACING.sm },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill,
    paddingVertical: 4, paddingHorizontal: SPACING.md,
  },
  heroBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.white, fontWeight: '600' },
  heroPhotoWrap: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden', alignSelf: 'center',
    ...SHADOWS.sm,
  },
  heroPhoto: { width: '100%', height: '100%' },

  // Content
  content: { paddingHorizontal: SPACING.lg },
  sectionHeading: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },

  // Session cards
  sessionCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 4,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
    overflow: 'hidden',
  },
  sessionCardPopular: { ...SHADOWS.md },
  popularBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: COLORS.purple, borderBottomLeftRadius: RADIUS.xs,
    paddingVertical: 4, paddingHorizontal: SPACING.md,
  },
  popularBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  sessionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  sessionIcon: {
    width: 48, height: 48, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sessionEmoji: { fontSize: 22 },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  sessionDuration: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginBottom: 4 },
  sessionDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17 },
  sessionActions: { alignItems: 'center', gap: SPACING.sm, flexShrink: 0 },
  pricePill: {
    borderRadius: RADIUS.pill, paddingVertical: 4, paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  priceText: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  bookBtn: {
    borderRadius: RADIUS.pill, borderWidth: 1.5,
    paddingVertical: 6, paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  bookBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  // Hardship
  hardshipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: '#EEF9F0', borderRadius: RADIUS.sm, padding: SPACING.lg,
    borderWidth: 1, borderColor: '#A8DFB0', marginBottom: SPACING.lg,
  },
  hardshipEmoji: { fontSize: 28, marginTop: 2 },
  hardshipText: { flex: 1 },
  hardshipTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  hardshipBody: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, marginBottom: SPACING.sm },
  hardshipLink: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '700', textDecorationLine: 'underline' },

  disclaimer: {
    fontSize: FONT_SIZES.xs, color: COLORS.textLight,
    textAlign: 'center', lineHeight: 17, marginBottom: SPACING.xl,
  },
});
