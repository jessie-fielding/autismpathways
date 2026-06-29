/**
 * Claim Profile Screen
 *
 * Allows providers who already appear in the Autism Pathways directory
 * (from a caregiver submission or admin import) to claim that listing
 * and manage it from their app account.
 *
 * Flow:
 *   1. Provider searches for their practice name
 *   2. Selects their listing from results
 *   3. Submits a claim with verification info (NPI or org website)
 *   4. Admin reviews and approves — listing is then linked to their account
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';
import { AP_API_BASE } from '../services/api';
import { getValidToken } from '../services/useAuth';

interface SearchResult {
  id: string;
  name: string;
  specialty: string;
  state: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
}

export default function ClaimProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [verificationInfo, setVerificationInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${AP_API_BASE}/api/providers/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.providers || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async () => {
    if (!selected) return;
    if (!verificationInfo.trim()) {
      Alert.alert('Verification Required', 'Please enter your NPI number, EIN, or organization website so we can verify your identity.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await getValidToken();
      const email = await AsyncStorage.getItem('authUserEmail');
      const res = await fetch(`${AP_API_BASE}/api/providers/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          listingId: selected.id,
          listingName: selected.name,
          verificationInfo: verificationInfo.trim(),
          claimantEmail: email,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      setSubmitted(true);
    } catch {
      Alert.alert('Claim Failed', 'Something went wrong. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }]}>
        <View style={{ paddingTop: insets.top }} />
        <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>🔗</Text>
        <Text style={styles.successTitle}>Claim Submitted!</Text>
        <Text style={styles.successText}>
          We've received your claim for <Text style={{ fontWeight: '700' }}>{selected?.name}</Text>. The Autism Pathways team will review your verification info and link the listing to your account within 1–3 business days.
        </Text>
        <Text style={styles.successSub}>
          You'll receive an email at the address on your account when it's approved.
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Back to Dashboard →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Your Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🔗</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Already in the Directory?</Text>
            <Text style={styles.introText}>
              If a caregiver submitted your practice or you were added by our team, you can claim that listing to manage it from your account.
            </Text>
          </View>
        </View>

        {/* Search */}
        {!selected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search for Your Listing</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Practice or organization name…"
                placeholderTextColor={COLORS.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="words"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
                {searching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchBtnText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>

            {results.length === 0 && searchQuery.trim() && !searching && (
              <Text style={styles.noResults}>No listings found for "{searchQuery}". Try a shorter name or check spelling.</Text>
            )}

            {results.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.resultCard}
                onPress={() => setSelected(r)}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{r.name}</Text>
                  <Text style={styles.resultMeta}>
                    {[r.specialty, r.city, r.state].filter(Boolean).join(' · ')}
                  </Text>
                  {r.phone && <Text style={styles.resultContact}>📞 {r.phone}</Text>}
                  {r.website && <Text style={styles.resultContact}>🌐 {r.website}</Text>}
                </View>
                <Text style={styles.resultArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected listing + verification */}
        {selected && (
          <View style={styles.section}>
            <View style={styles.selectedCard}>
              <Text style={styles.selectedLabel}>Selected Listing</Text>
              <Text style={styles.selectedName}>{selected.name}</Text>
              <Text style={styles.selectedMeta}>
                {[selected.specialty, selected.city, selected.state].filter(Boolean).join(' · ')}
              </Text>
              <TouchableOpacity onPress={() => { setSelected(null); setResults([]); }} style={styles.changeBtn}>
                <Text style={styles.changeBtnText}>Change →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Verify Your Identity</Text>
            <Text style={styles.sectionSub}>
              Enter your NPI number, EIN, or organization website so we can confirm this is your listing.
            </Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="NPI: 1234567890  or  EIN: 12-3456789  or  https://yourpractice.com"
              placeholderTextColor={COLORS.textLight}
              value={verificationInfo}
              onChangeText={setVerificationInfo}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                🔒 This information is only seen by the Autism Pathways admin team and is never shared publicly.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleClaim}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Claim →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: {},
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: 80 },
  introCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F5F0FF', borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md },
  introIcon: { fontSize: 28 },
  introTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple, marginBottom: 4 },
  introText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.md, ...SHADOWS.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  sectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginTop: -SPACING.xs },
  searchRow: { flexDirection: 'row', gap: SPACING.sm },
  searchInput: { flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  searchBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  noResults: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', paddingVertical: SPACING.sm },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  resultName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  resultMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  resultContact: { fontSize: FONT_SIZES.xs, color: COLORS.purple, marginTop: 2 },
  resultArrow: { fontSize: FONT_SIZES.md, color: COLORS.purple, fontWeight: '700' },
  selectedCard: { backgroundColor: '#F5F0FF', borderRadius: RADIUS.md, padding: SPACING.md, gap: 4 },
  selectedLabel: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  selectedName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  selectedMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  changeBtn: { alignSelf: 'flex-start', marginTop: SPACING.xs },
  changeBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  input: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  privacyNote: { backgroundColor: '#F0FDF4', borderRadius: RADIUS.md, padding: SPACING.sm },
  privacyText: { fontSize: FONT_SIZES.xs, color: '#166534', lineHeight: 18 },
  submitBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '800' },
  // Success state
  successTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  successText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.sm },
  successSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg },
  doneBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
  doneBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '800' },
});
