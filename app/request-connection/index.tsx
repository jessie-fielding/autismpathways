/**
 * Request a Connection
 *
 * Parents tap "Request a Connection" on a provider card (evaluator list or
 * provider directory). They fill in:
 *   - What to share (Email / Phone / Neither)
 *   - Optional message
 *
 * The request goes into a PENDING queue. The provider must Accept or Decline
 * before any contact info is shared. No PHI is stored.
 *
 * Route params:
 *   providerId, providerName, providerSpecialty, providerCounty
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { addSentRequest } from '../../services/connections';

type ShareOption = 'email' | 'phone' | 'neither';

export default function RequestConnection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    providerId: string;
    providerName: string;
    providerSpecialty: string;
    providerCounty: string;
  }>();

  const [requesterName, setRequesterName] = useState('');
  const [shareOption, setShareOption]     = useState<ShareOption>('neither');
  const [phoneNumber, setPhoneNumber]     = useState('');
  const [emailAddress, setEmailAddress]   = useState('');
  const [insurance, setInsurance]         = useState('');
  const [hasMedicaid, setHasMedicaid]     = useState<boolean | null>(null);
  const [okOutOfPocket, setOkOutOfPocket] = useState<boolean | null>(null);
  const [message, setMessage]             = useState('');
  const [submitting, setSubmitting]       = useState(false);

  const handleSubmit = async () => {
    if (!requesterName.trim()) {
      Alert.alert('Name required', 'Please enter your name so the provider knows who is reaching out.');
      return;
    }
    setSubmitting(true);
    try {
      if (shareOption === 'phone' && !phoneNumber.trim()) {
        Alert.alert('Phone number required', 'Please enter your phone number so the provider can reach you.');
        setSubmitting(false);
        return;
      }
      if (shareOption === 'email' && !emailAddress.trim()) {
        Alert.alert('Email required', 'Please enter your email address so the provider can reach you.');
        setSubmitting(false);
        return;
      }
      await addSentRequest({
        providerId:       params.providerId ?? 'unknown',
        providerName:     params.providerName ?? 'Provider',
        providerSpecialty: params.providerSpecialty ?? '',
        providerCounty:   params.providerCounty ?? '',
        requesterName:    requesterName.trim(),
        shareEmail:       shareOption === 'email',
        sharePhone:       shareOption === 'phone',
        requesterPhone:   shareOption === 'phone' ? phoneNumber.trim() : undefined,
        senderEmail:      shareOption === 'email' ? emailAddress.trim() : undefined,
        insurance:        insurance.trim() || undefined,
        hasMedicaid:      hasMedicaid ?? undefined,
        okOutOfPocket:    okOutOfPocket ?? undefined,
        message:          message.trim(),
      });

      Alert.alert(
        'Request Sent! 🎉',
        `Your introduction request has been sent to ${params.providerName ?? 'the provider'}. They will review it and respond — you'll be notified when they do.`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('pending')) {
        Alert.alert(
          'Request Already Sent',
          `You already have a pending connection request with ${params.providerName ?? 'this provider'}. Check "My Connections" to see its status.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request a Connection</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Provider card */}
        <View style={styles.providerCard}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerAvatarText}>
              {(params.providerName ?? 'PR').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{params.providerName ?? 'Provider'}</Text>
            <View style={styles.providerTags}>
              {params.providerSpecialty ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{params.providerSpecialty}</Text>
                </View>
              ) : null}
              {params.providerCounty ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>📍 {params.providerCounty}</Text>
                </View>
              ) : null}
              <View style={[styles.tag, styles.tagOnApp]}>
                <Text style={styles.tagOnAppText}>💜 On the App!</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Your name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Name</Text>
          <Text style={styles.sectionSub}>So the provider knows who is reaching out</Text>
          <TextInput
            style={styles.input}
            value={requesterName}
            onChangeText={setRequesterName}
            placeholder="Your first name or nickname"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="words"
          />
        </View>

        {/* What to share */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to share?</Text>
          <Text style={styles.sectionSub}>Only shared after the provider accepts your request</Text>
          {([
            { id: 'email',   label: 'Email address',  icon: 'mail-outline' },
            { id: 'phone',   label: 'Phone number',   icon: 'call-outline' },
            { id: 'neither', label: 'Neither — I\'ll wait for them to reach out', icon: 'lock-closed-outline' },
          ] as { id: ShareOption; label: string; icon: string }[]).map((opt) => {
            const selected = shareOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.shareOption, selected && styles.shareOptionSelected]}
                onPress={() => setShareOption(opt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.shareIconWrap, selected && styles.shareIconWrapSelected]}>
                  <Ionicons name={opt.icon as any} size={18} color={selected ? '#fff' : COLORS.textMid} />
                </View>
                <Text style={[styles.shareLabel, selected && styles.shareLabelSelected]}>{opt.label}</Text>
                <View style={[styles.shareRadio, selected && styles.shareRadioSelected]}>
                  {selected && <View style={styles.shareRadioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        {shareOption === 'phone' && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Your phone number"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        )}
        {shareOption === 'email' && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder="Your email address"
            placeholderTextColor={COLORS.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        )}
        </View>

        {/* Insurance & payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insurance & Payment</Text>
          <Text style={styles.sectionSub}>Helps the provider know if they can serve you</Text>

          <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Insurance provider (optional)</Text>
          <TextInput
            style={styles.input}
            value={insurance}
            onChangeText={setInsurance}
            placeholder="e.g. Blue Cross Blue Shield, Aetna, Cigna…"
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Do you have Medicaid?</Text>
          <View style={styles.yesNoRow}>
            {(['Yes', 'No'] as const).map((opt) => {
              const val = opt === 'Yes';
              const sel = hasMedicaid === val;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.yesNoBtn, sel && styles.yesNoBtnSelected]}
                  onPress={() => setHasMedicaid(val)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.yesNoBtnText, sel && styles.yesNoBtnTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Are you open to out-of-pocket / private pay?</Text>
          <View style={styles.yesNoRow}>
            {(['Yes', 'No', 'Maybe'] as const).map((opt) => {
              const val = opt === 'Yes' ? true : opt === 'No' ? false : null;
              const sel = okOutOfPocket === val;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.yesNoBtn, sel && styles.yesNoBtnSelected]}
                  onPress={() => setOkOutOfPocket(val)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.yesNoBtnText, sel && styles.yesNoBtnTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Optional message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message (optional)</Text>
          <Text style={styles.sectionSub}>A brief note about what you're looking for</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="e.g. I'm looking for a BCBA who works with non-verbal kids ages 5-8 in Franklin County…"
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/300</Text>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyBox}>
          <Ionicons name="lock-closed" size={16} color={COLORS.teal} />
          <Text style={styles.privacyText}>
            No personal health information (PHI) is stored or shared. Your contact details are only revealed after the provider accepts your request. You can withdraw at any time.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'Sending…' : 'Send Introduction Request →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  // Provider card
  providerCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, ...SHADOWS.sm },
  providerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.lavender ?? '#EDE9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.purple },
  providerAvatarText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.purple },
  providerInfo: { flex: 1, gap: SPACING.xs },
  providerName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  providerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border },
  tagText: { fontSize: 11, color: COLORS.textMid, fontWeight: '500' },
  tagOnApp: { backgroundColor: '#ffe5db', borderColor: '#ffb8a0' },
  tagOnAppText: { fontSize: 11, color: '#8B3A1A', fontWeight: '700' },
  // Section
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm, ...SHADOWS.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  sectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text },
  textArea: { minHeight: 100, paddingTop: SPACING.sm },
  charCount: { fontSize: 10, color: COLORS.textLight, textAlign: 'right' },
  // Share options
  shareOption: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  shareOptionSelected: { borderColor: COLORS.purple, backgroundColor: '#F0EDFF' },
  shareIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  shareIconWrapSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  shareLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  shareLabelSelected: { color: COLORS.purple, fontWeight: '700' },
  shareRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  shareRadioSelected: { borderColor: COLORS.purple },
  shareRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.purple },
  // Insurance / payment
  fieldLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid, marginTop: SPACING.xs },
  yesNoRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  yesNoBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  yesNoBtnSelected: { borderColor: COLORS.purple, backgroundColor: '#F0EDFF' },
  yesNoBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  yesNoBtnTextSelected: { color: COLORS.purple },
  // Privacy
  privacyBox: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: '#E3F7F1', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'flex-start' },
  privacyText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#0A5A42', lineHeight: 18 },
  // Submit
  submitBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, paddingVertical: SPACING.md + 2, alignItems: 'center', ...SHADOWS.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#fff' },
});
