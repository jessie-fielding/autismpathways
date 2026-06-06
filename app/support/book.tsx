/**
 * Support — Book Session Screen
 *
 * Native booking UI backed by Calendly API:
 *  1. Fetches real available time slots for the selected event type
 *  2. User picks date → time → session format → adds notes
 *  3. "Confirm Booking" creates a scheduling link and opens it in Safari
 *     (Calendly handles the final confirmation + Stripe payment in browser)
 *
 * Apple-safe: payment happens in external browser, not in-app.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Linking, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import CityCountyAutocomplete from '../../components/CityCountyAutocomplete';
import {
  fetchAvailability, createSchedulingLink, formatDateLabel, formatTimeLabel,
  EVENT_TYPE_URIS, DaySlots, TimeSlot,
} from '../../services/calendly';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionFormat = 'video' | 'phone';

function BookSessionContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, price, duration, sessionId } = useLocalSearchParams<{
    title: string;
    price: string;
    duration: string;
    sessionId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [daySlots, setDaySlots] = useState<DaySlots[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [format, setFormat] = useState<SessionFormat>('video');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User profile for Calendly prefill
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

  const eventTypeUri = EVENT_TYPE_URIS[sessionId ?? 'deep'] ?? EVENT_TYPE_URIS.deep;

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const slots = await fetchAvailability(eventTypeUri);
      setDaySlots(slots);
      if (slots.length > 0) {
        setSelectedDate(slots[0].date);
      }
    } catch {
      setError('Could not load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [eventTypeUri]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const currentDaySlots = daySlots.find((d) => d.date === selectedDate)?.slots ?? [];

  const handleConfirm = async () => {
    if (!selectedSlot) {
      Alert.alert('Select a time', 'Please choose a date and time before confirming.');
      return;
    }
    setBooking(true);
    try {
      const bookingUrl = await createSchedulingLink(eventTypeUri);
      if (!bookingUrl) throw new Error('Could not generate booking link');

      // Build prefill params: name, email, state+county in notes, discuss topic
      const params = new URLSearchParams();
      if (userName) params.set('name', userName);
      if (userEmail) params.set('email', userEmail);
      // Combine discuss topic + notes + location context for Jessie
      const locationNote = [userState, userCounty].filter(Boolean).join(', ');
      const fullNotes = [
        discuss.trim() ? `Topic: ${discuss.trim()}` : '',
        notes.trim(),
        locationNote ? `Location: ${locationNote}` : '',
      ].filter(Boolean).join(' | ');
      if (fullNotes) params.set('a1', fullNotes.slice(0, 300));

      const queryStr = params.toString();
      const finalUrl = `${bookingUrl}${queryStr ? '?' + queryStr : ''}`;

      const supported = await Linking.canOpenURL(finalUrl);
      await Linking.openURL(supported ? finalUrl : 'https://calendly.com/contact-autismpathways');

      // Show payment reminder after opening Calendly
      setTimeout(() => {
        Alert.alert(
          '📅 Almost done!',
          'After confirming your time in Calendly, you will receive an email with a secure payment link. Payment must be completed at least 1 hour before your session or it will be cancelled.\n\nPayment link: book.stripe.com/cNifZg25ccZg95e2Zc1B60a',
          [{ text: 'Got it!', style: 'default' }]
        );
      }, 1500);
    } catch {
      Alert.alert(
        'Booking error',
        'Something went wrong. Please visit calendly.com/contact-autismpathways or email jessie@autismpathways.app.',
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

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loadingText}>Loading availability…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadAvailability}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : daySlots.length === 0 ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>No availability in the next 14 days.</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => Linking.openURL('https://calendly.com/contact-autismpathways')}
            >
              <Text style={styles.retryBtnText}>Open Calendly →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Choose a Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateRow}
            >
              {daySlots.map((d) => {
                const label = formatDateLabel(d.date);
                const parts = label.split(', ');
                const dayOfWeek = parts[0];
                const monthDay = parts[1] ?? '';
                const [month, day] = monthDay.split(' ');
                const isSelected = selectedDate === d.date;
                return (
                  <TouchableOpacity
                    key={d.date}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => { setSelectedDate(d.date); setSelectedSlot(null); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>{dayOfWeek}</Text>
                    <Text style={[styles.dateChipMonth, isSelected && styles.dateChipTextSelected]}>{month}</Text>
                    <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionLabel}>Available Times</Text>
            <View style={styles.timeGrid}>
              {currentDaySlots.map((slot) => {
                const isSelected = selectedSlot?.start_time === slot.start_time;
                return (
                  <TouchableOpacity
                    key={slot.start_time}
                    style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                    onPress={() => setSelectedSlot(slot)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                      {formatTimeLabel(slot.start_time)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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

            {/* ── LOCATION FIELDS ──────────────────────────────────────────── */}
            <Text style={styles.sectionLabel}>Your State</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Ohio"
              placeholderTextColor={COLORS.textLight}
              value={userState}
              onChangeText={setUserState}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <CityCountyAutocomplete
              label="Your City / County"
              value={userCounty}
              onChangeText={setUserCounty}
              onSelect={(r) => { setUserCounty(r.county); if (!userState) setUserState(r.state); }}
              placeholder="e.g. Franklin County or Columbus, OH"
              style={styles.fieldInput}
            />

            <Text style={styles.sectionLabel}>
              What would you like to discuss?{' '}
              <Text style={styles.sectionLabelOptional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. IEP help, diagnosis next steps, meltdowns…"
              placeholderTextColor={COLORS.textLight}
              value={discuss}
              onChangeText={setDiscuss}
              returnKeyType="next"
              maxLength={200}
            />

            <Text style={styles.sectionLabel}>
              Additional notes{' '}
              <Text style={styles.sectionLabelOptional}>(optional)</Text>
            </Text>
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
              style={[styles.confirmBtn, (!selectedSlot || booking) && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={!selectedSlot || booking}
            >
              {booking
                ? <ActivityIndicator color={COLORS.white} size="small" />
                : <Text style={styles.confirmBtnText}>Confirm Booking{price ? ` — ${price}` : ''} →</Text>
              }
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              After booking, you'll receive an email with a secure payment link. Payment is required at least 1 hour before your session. Cancel up to 24 hours before for a full refund.
            </Text>
          </>
        )}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function BookSessionScreen() {
  return <BookSessionContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
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
