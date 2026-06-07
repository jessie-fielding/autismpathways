/**
 * Support — Book Session Screen
 *
 * Simple form: collect name/email/state/county/discuss/format/notes,
 * then open the direct Calendly page immediately — no API, no loading.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Linking, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionFormat = 'video' | 'phone';

// Direct Calendly page URLs — no API dependency
const CALENDLY_URLS: Record<string, string> = {
  quick:   'https://calendly.com/contact-autismpathways/quick-check-in',
  deep:    'https://calendly.com/contact-autismpathways/deep-dive',
  ongoing: 'https://calendly.com/contact-autismpathways/meet-greet',
};

function BookSessionContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, price, duration, sessionId } = useLocalSearchParams<{
    title: string;
    price: string;
    duration: string;
    sessionId: string;
  }>();

  const [format, setFormat] = useState<SessionFormat>('video');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  // User profile prefill
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userState, setUserState] = useState('');
  const [userCounty, setUserCounty] = useState('');
  const [discuss, setDiscuss] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const emailRaw = await AsyncStorage.getItem('ap_user_email');
        if (emailRaw) setUserEmail(emailRaw);
        const profileRaw = await AsyncStorage.getItem('profile');
        if (profileRaw) {
          const p = JSON.parse(profileRaw);
          if (p.parentName) setUserName(p.parentName);
          if (p.state) setUserState(p.state);
          if (p.county) setUserCounty(p.county);
        }
      } catch {}
    })();
  }, []);

  const handleBook = async () => {
    setBooking(true);
    try {
      const baseUrl = CALENDLY_URLS[sessionId ?? 'deep'] ?? CALENDLY_URLS.deep;
      const params = new URLSearchParams();
      if (userName) params.set('name', userName);
      if (userEmail) params.set('email', userEmail);
      const locationNote = [userState, userCounty].filter(Boolean).join(', ');
      const fullNotes = [
        discuss.trim() ? `Topic: ${discuss.trim()}` : '',
        `Format: ${format === 'video' ? 'Video Call' : 'Phone Call'}`,
        notes.trim(),
        locationNote ? `Location: ${locationNote}` : '',
      ].filter(Boolean).join(' | ');
      if (fullNotes) params.set('a1', fullNotes.slice(0, 300));
      const queryStr = params.toString();
      const finalUrl = `${baseUrl}${queryStr ? '?' + queryStr : ''}`;
      await Linking.openURL(finalUrl);
      setTimeout(() => {
        Alert.alert(
          '📅 Almost done!',
          'After confirming your time in Calendly, you will receive an email with a secure payment link. Payment must be completed at least 1 hour before your session or it will be cancelled.\n\nPayment link: book.stripe.com/cNifZg25ccZg95e2Zc1B60a',
          [{ text: 'Got it!', style: 'default' }]
        );
      }, 1500);
    } catch {
      Alert.alert(
        'Could not open Calendly',
        'Please visit calendly.com/contact-autismpathways or email jessie@autismpathways.app.',
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Session</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>💬</Text>
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{title ?? 'Deep Dive'}</Text>
            <Text style={styles.summaryMeta}>{duration ?? '60 minutes'} · {price ?? '$85'}</Text>
            <Text style={styles.summaryWith}>with Jessie Fielding</Text>
          </View>
        </View>

        {/* Session format */}
        <Text style={styles.sectionLabel}>Session Format</Text>
        <View style={styles.formatRow}>
          <TouchableOpacity
            style={[styles.formatChip, format === 'video' && styles.formatChipSelected]}
            onPress={() => setFormat('video')}
            activeOpacity={0.85}
          >
            <View style={styles.formatChipInner}>
              <Text style={styles.formatIcon}>📹</Text>
              <View>
                <Text style={[styles.formatTitle, format === 'video' && styles.formatTitleSelected]}>Video Call</Text>
                <Text style={styles.formatSub}>Zoom link sent by email</Text>
              </View>
            </View>
            {format === 'video' && <View style={styles.formatCheck}><Text style={styles.formatCheckText}>✓</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatChip, format === 'phone' && styles.formatChipSelected]}
            onPress={() => setFormat('phone')}
            activeOpacity={0.85}
          >
            <View style={styles.formatChipInner}>
              <Text style={styles.formatIcon}>📞</Text>
              <View>
                <Text style={[styles.formatTitle, format === 'phone' && styles.formatTitleSelected]}>Phone Call</Text>
                <Text style={styles.formatSub}>We call you</Text>
              </View>
            </View>
            {format === 'phone' && <View style={styles.formatCheck}><Text style={styles.formatCheckText}>✓</Text></View>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Your Name <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="First name"
          placeholderTextColor={COLORS.textLight}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={styles.sectionLabel}>Your Email <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="you@email.com"
          placeholderTextColor={COLORS.textLight}
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />

        <Text style={styles.sectionLabel}>Your State <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="e.g. Ohio"
          placeholderTextColor={COLORS.textLight}
          value={userState}
          onChangeText={setUserState}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={styles.sectionLabel}>Your City / County <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="e.g. Franklin County or Columbus"
          placeholderTextColor={COLORS.textLight}
          value={userCounty}
          onChangeText={setUserCounty}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={styles.sectionLabel}>What would you like to discuss? <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="e.g. IEP help, diagnosis next steps, meltdowns…"
          placeholderTextColor={COLORS.textLight}
          value={discuss}
          onChangeText={setDiscuss}
          returnKeyType="next"
          maxLength={200}
        />

        <Text style={styles.sectionLabel}>Additional notes <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Anything else Jessie should know before your call."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          maxLength={500}
        />

        <TouchableOpacity
          style={[styles.confirmBtn, booking && styles.confirmBtnDisabled]}
          onPress={handleBook}
          activeOpacity={0.85}
          disabled={booking}
        >
          <Text style={styles.confirmBtnText}>
            {booking ? 'Opening Calendly…' : `Choose a Time${price ? ` — ${price}` : ''} →`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          You'll pick your time directly in Calendly. After booking, you'll receive an email with a secure payment link. Payment is required at least 1 hour before your session.
        </Text>
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function BookSessionScreen() {
  return <BookSessionContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background ?? '#F7F5FF' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: 4, minWidth: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  summaryIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.lavender, alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { fontSize: 26 },
  summaryInfo: { flex: 1 },
  summaryTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  summaryMeta: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginTop: 2 },
  summaryWith: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600', marginTop: 2 },
  loadingWrap: { alignItems: 'center', paddingVertical: 60, gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  errorWrap: { alignItems: 'center', paddingVertical: 40, gap: SPACING.md },
  errorText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl },
  retryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  sectionLabel: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.xs },
  sectionLabelOptional: { fontSize: FONT_SIZES.sm, fontWeight: '400', color: COLORS.textMid },
  optional: { fontSize: FONT_SIZES.sm, fontWeight: '400', color: COLORS.textMid },
  dateRow: { paddingBottom: SPACING.md, gap: SPACING.sm, paddingRight: SPACING.lg },
  dateChip: { alignItems: 'center', justifyContent: 'center', width: 62, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  dateChipSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  dateChipDay: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },
  dateChipMonth: { fontSize: 11, fontWeight: '600', color: COLORS.textMid, marginTop: 1 },
  dateChipNum: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  dateChipTextSelected: { color: COLORS.white },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  timeChip: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white, minWidth: 90, alignItems: 'center' },
  timeChipSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  timeChipText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  timeChipTextSelected: { color: COLORS.white },
  formatRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  formatChip: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white, padding: SPACING.md, ...SHADOWS.sm },
  formatChipSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  formatChipInner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  formatIcon: { fontSize: 22 },
  formatTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  formatTitleSelected: { color: COLORS.purple },
  formatSub: { fontSize: 11, color: COLORS.textMid, marginTop: 1 },
  formatCheck: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center' },
  formatCheckText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  fieldInput: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.md, height: 48 },
  notesInput: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text, minHeight: 90, textAlignVertical: 'top', marginBottom: SPACING.xl, lineHeight: 20 },
  confirmBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.md + 2, alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.md },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  disclaimer: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 17, marginBottom: SPACING.lg },
});
