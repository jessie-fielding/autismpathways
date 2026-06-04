import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

const SPECIALTIES = ['ABA Therapy', 'Speech & OT', 'Psychiatry', 'Advocacy', 'National Directory', 'Other'];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO',
  'MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export default function SubmitProviderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [medicaid, setMedicaid] = useState(false);
  const [accepting, setAccepting] = useState(true);
  const [yourName, setYourName] = useState('');
  const [yourRelation, setYourRelation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const isValid = name.trim() && specialty && state && (phone.trim() || website.trim());

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing Info', 'Please fill in the provider name, specialty, state, and at least a phone or website.');
      return;
    }
    setSubmitting(true);
    try {
      const submissionData = {
        providerName: name.trim(),
        providerType: type.trim() || 'Provider',
        specialty,
        state,
        phone: phone.trim(),
        website: website.trim(),
        description: description.trim(),
        medicaidAccepted: medicaid,
        acceptingPatients: accepting,
        submittedBy: yourName.trim() || 'Anonymous AP Parent',
        submitterRelation: yourRelation.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      };

      // Post to forum as a provider submission for owner review
      const res = await fetch(`${API_BASE}/api/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[PROVIDER SUBMISSION] ${name.trim()} — ${state} — ${specialty}`,
          content: JSON.stringify(submissionData),
          category: 'provider_submission',
          anonymous: true,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        Alert.alert('Submission Failed', 'Please try again later.');
      }
    } catch {
      Alert.alert('Submission Failed', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }]}>
        <View style={{ paddingTop: insets.top }} />
        <Text style={styles.successEmoji}>🏅</Text>
        <Text style={styles.successTitle}>Thank You!</Text>
        <Text style={styles.successText}>
          Your provider submission has been received and is pending review. Once approved, it will appear in the directory with a Caregiver Submitted badge.
        </Text>
        <Text style={styles.successSub}>
          We review submissions within 3–5 business days. Thank you for helping other AP families!
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Back to Directory →</Text>
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
        <Text style={styles.headerTitle}>Submit a Provider</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🏅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Help Other AP Families</Text>
            <Text style={styles.introText}>
              Know a great provider? Submit them for review. Once approved, they'll appear with a Caregiver Submitted badge.
            </Text>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider Information</Text>

          <Text style={styles.label}>Provider Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sunshine ABA Therapy"
            placeholderTextColor={COLORS.textLight}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Provider Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Private Practice, Hospital, Nonprofit"
            placeholderTextColor={COLORS.textLight}
            value={type}
            onChangeText={setType}
          />

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Specialty <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerBtn]}
            onPress={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
          >
            <Text style={specialty ? styles.pickerValue : styles.pickerPlaceholder}>
              {specialty || 'Select specialty...'}
            </Text>
            <Text style={styles.pickerChevron}>{showSpecialtyPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showSpecialtyPicker && (
            <View style={styles.pickerDropdown}>
              {SPECIALTIES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pickerOption, specialty === s && styles.pickerOptionActive]}
                  onPress={() => { setSpecialty(s); setShowSpecialtyPicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, specialty === s && styles.pickerOptionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.label, { marginTop: SPACING.md }]}>State <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerBtn]}
            onPress={() => setShowStatePicker(!showStatePicker)}
          >
            <Text style={state ? styles.pickerValue : styles.pickerPlaceholder}>
              {state || 'Select state...'}
            </Text>
            <Text style={styles.pickerChevron}>{showStatePicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showStatePicker && (
            <ScrollView style={styles.stateDropdown} nestedScrollEnabled>
              {US_STATES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pickerOption, state === s && styles.pickerOptionActive]}
                  onPress={() => { setState(s); setShowStatePicker(false); }}
                >
                  <Text style={[styles.pickerOptionText, state === s && styles.pickerOptionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Info <Text style={styles.required}>*</Text></Text>
          <Text style={styles.sectionNote}>At least one of phone or website is required.</Text>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. (555) 123-4567"
            placeholderTextColor={COLORS.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Website</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. https://www.provider.com"
            placeholderTextColor={COLORS.textLight}
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What makes this provider great? What services do they offer?"
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Accepts Medicaid</Text>
              <Text style={styles.toggleSub}>To the best of your knowledge</Text>
            </View>
            <Switch
              value={medicaid}
              onValueChange={setMedicaid}
              trackColor={{ false: COLORS.border, true: COLORS.teal }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Currently Accepting Patients</Text>
              <Text style={styles.toggleSub}>No waitlist as far as you know</Text>
            </View>
            <Switch
              value={accepting}
              onValueChange={setAccepting}
              trackColor={{ false: COLORS.border, true: COLORS.teal }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* About You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About You (optional)</Text>
          <Text style={styles.sectionNote}>This helps us verify the submission. Not shown publicly.</Text>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sarah M."
            placeholderTextColor={COLORS.textLight}
            value={yourName}
            onChangeText={setYourName}
          />

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Your Relation to Provider</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Parent of current client, Former client"
            placeholderTextColor={COLORS.textLight}
            value={yourRelation}
            onChangeText={setYourRelation}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            📋 By submitting, you confirm this information is accurate to the best of your knowledge. All submissions are reviewed before appearing in the directory. We do not accept paid submissions.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!isValid || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit for Review 🏅</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scrollContent: { padding: SPACING.lg, paddingBottom: 60 },
  introCard: {
    flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start',
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  introIcon: { fontSize: 28 },
  introTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.purpleDark, marginBottom: 4 },
  introText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  section: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  sectionNote: { fontSize: 11, color: COLORS.textLight, marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: SPACING.xs },
  required: { color: COLORS.errorText },
  input: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text,
  },
  textArea: { minHeight: 72 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerValue: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  pickerPlaceholder: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  pickerChevron: { fontSize: 12, color: COLORS.textMid },
  pickerDropdown: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    marginTop: 4, overflow: 'hidden',
  },
  stateDropdown: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    marginTop: 4, maxHeight: 200,
  },
  pickerOption: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerOptionActive: { backgroundColor: COLORS.lavender },
  pickerOptionText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  pickerOptionTextActive: { color: COLORS.purple, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  toggleLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  toggleSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  disclaimer: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  disclaimerText: { fontSize: 11, color: COLORS.warningText, lineHeight: 17 },
  submitBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.xl,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.white },
  // Success state
  successEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  successTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  successText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  successSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.xl },
  doneBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.md,
  },
  doneBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.white },
});
