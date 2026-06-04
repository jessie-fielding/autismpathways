/**
 * Support — Book Session Screen
 *
 * Apple-safe payment flow (like TikTok coins):
 *   - Shows session summary and "What's on your mind?" prep field
 *   - "Continue to Booking" opens Calendly in Safari (external browser)
 *   - Calendly handles date/time selection + Stripe payment entirely in the browser
 *   - No in-app payment = no Apple 30% cut, no IAP review issues
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Linking, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

export default function BookSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, price, duration, calendlyUrl } = useLocalSearchParams<{
    title: string;
    price: string;
    duration: string;
    calendlyUrl: string;
  }>();

  const [notes, setNotes] = useState('');

  const handleContinue = async () => {
    // Build Calendly URL with optional pre-fill notes
    let url = calendlyUrl || 'https://calendly.com/contact-autismpathways';
    if (notes.trim()) {
      // Calendly supports ?a1= for custom questions, but notes go in the name/email fields
      // We append as a utm_content param so Jessie can see it in Calendly notifications
      url += `?utm_content=${encodeURIComponent(notes.trim().slice(0, 200))}`;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Could not open browser',
        'Please visit calendly.com/autismpathways to book your session, or email jessie@autismpathways.app.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Support</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book a Session</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Session summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryEmoji}>💬</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>{title}</Text>
              <Text style={styles.summaryMeta}>{duration} · {price}</Text>
              <Text style={styles.summaryWith}>with Jessie Fielding</Text>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.howCard}>
            <Text style={styles.howTitle}>How booking works</Text>
            <View style={styles.howStep}>
              <View style={styles.howDot}><Text style={styles.howDotText}>1</Text></View>
              <Text style={styles.howText}>Tap "Continue to Booking" below</Text>
            </View>
            <View style={styles.howStep}>
              <View style={styles.howDot}><Text style={styles.howDotText}>2</Text></View>
              <Text style={styles.howText}>Choose your date and time in Calendly (opens in browser)</Text>
            </View>
            <View style={styles.howStep}>
              <View style={styles.howDot}><Text style={styles.howDotText}>3</Text></View>
              <Text style={styles.howText}>Complete secure payment via Stripe</Text>
            </View>
            <View style={styles.howStep}>
              <View style={styles.howDot}><Text style={styles.howDotText}>4</Text></View>
              <Text style={styles.howText}>Receive confirmation + Zoom/call details by email</Text>
            </View>
            <View style={[styles.howStep, { marginBottom: 0 }]}>
              <Text style={styles.howNote}>Cancel up to 24 hours before for a full refund.</Text>
            </View>
          </View>

          {/* Prep notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>What's on your mind? <Text style={styles.notesOptional}>(optional)</Text></Text>
            <Text style={styles.notesHint}>Share what you'd like to focus on. This helps Jessie prepare for your call.</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="IEP meeting coming up, waiver questions, just need to talk through something..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>Continue to Booking — {price} →</Text>
            </TouchableOpacity>
            <Text style={styles.ctaNote}>
              Secure checkout via Stripe. You will be taken to an external page to complete your booking.
            </Text>

            <TouchableOpacity
              style={styles.hardshipLink}
              onPress={() => router.push('/support/hardship' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.hardshipLinkText}>Need hardship pricing? Apply here →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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

  // Summary
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    backgroundColor: COLORS.white, margin: SPACING.lg, borderRadius: RADIUS.md,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  summaryIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.lavender, alignItems: 'center', justifyContent: 'center',
  },
  summaryEmoji: { fontSize: 26 },
  summaryInfo: { flex: 1 },
  summaryTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  summaryMeta: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: 2 },
  summaryWith: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '700' },

  // How it works
  howCard: {
    backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  howTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.sm },
  howDot: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.purple,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  howDotText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  howText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, flex: 1, lineHeight: 19 },
  howNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic', lineHeight: 17 },

  // Notes
  notesSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  notesLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  notesOptional: { color: COLORS.textLight, fontWeight: '400' },
  notesHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.sm, lineHeight: 17 },
  notesInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.sm,
    color: COLORS.text, height: 110,
  },

  // CTA
  ctaSection: { paddingHorizontal: SPACING.lg },
  ctaBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    alignItems: 'center', ...SHADOWS.lg, marginBottom: SPACING.sm,
  },
  ctaBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  ctaNote: {
    fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center',
    lineHeight: 17, marginBottom: SPACING.lg,
  },
  hardshipLink: { alignItems: 'center', paddingVertical: SPACING.sm },
  hardshipLinkText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
});
