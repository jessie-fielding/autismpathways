import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import CityCountyAutocomplete from '../../components/CityCountyAutocomplete';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const PRESET_TAGS = [
  'ADOS-2', 'CARS-2', 'All ages', 'Ages 2+', 'Adults only',
  'Medicaid-accepted', 'School-accepted', 'University-affiliated',
  'Hospital-based', 'Multidisciplinary', 'Research-backed',
  'Early intervention', 'Rural-friendly', 'Fast scheduling',
  'Spanish-speaking', 'Bilingual', 'Insurance-accepted',
];

type EvaluatorType = 'inperson' | 'telehealth' | 'both';

export default function SubmitEvaluatorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [detail, setDetail] = useState('');
  const [type, setType] = useState<EvaluatorType>('inperson');
  const [phone, setPhone] = useState('');
  const [url, setUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
      setCustomTag('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !state || !detail.trim()) {
      Alert.alert('Missing Info', 'Please fill in the evaluator name, state, and description.');
      return;
    }
    setSubmitting(true);
    try {
      // Save submission locally (will be synced when backend endpoint is ready)
      const submission = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        state,
        city: city.trim(),
        detail: detail.trim(),
        type,
        phone: phone.trim() || null,
        url: url.trim() || null,
        tags: selectedTags,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      const existing = await AsyncStorage.getItem('ap_evaluator_submissions');
      const submissions = existing ? JSON.parse(existing) : [];
      submissions.push(submission);
      await AsyncStorage.setItem('ap_evaluator_submissions', JSON.stringify(submissions));

      Alert.alert(
        '🎉 Thank You!',
        `Your submission for "${name.trim()}" has been saved. Our team will review it and add it to the directory soon.\n\nYou're helping other families find the support they need!`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not save your submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: COLORS.bg }, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Submit an Evaluator</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={s.homeBtn}>
          <Text style={s.homeText}>🏠</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={s.introBanner}>
          <Text style={s.introTitle}>Help Other Families Find Evaluators</Text>
          <Text style={s.introSub}>
            Know an autism evaluator who isn't in our directory? Submit them here.
            Our team reviews all submissions before adding them.
          </Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          {/* Evaluator Name */}
          <Text style={s.label}>Evaluator / Clinic Name *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Children's Hospital Autism Center"
            placeholderTextColor={COLORS.textLight}
            value={name}
            onChangeText={setName}
          />

          {/* State */}
          <Text style={s.label}>State *</Text>
          <TouchableOpacity
            style={s.statePicker}
            onPress={() => setShowStateDropdown(!showStateDropdown)}
          >
            <Text style={[s.statePickerText, !state && { color: COLORS.textLight }]}>
              {state || 'Select a state...'} ▼
            </Text>
          </TouchableOpacity>
          {showStateDropdown && (
            <View style={s.dropdown}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {US_STATES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[s.dropdownItem, state === st && s.dropdownItemActive]}
                    onPress={() => { setState(st); setShowStateDropdown(false); }}
                  >
                    <Text style={[s.dropdownItemText, state === st && s.dropdownItemTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* City */}
          <CityCountyAutocomplete
            label="City / Region"
            value={city}
            onChangeText={setCity}
            onSelect={(r) => { setCity(`${r.city}, ${r.state}`); if (!state) setState(r.state); }}
            placeholder="e.g. Denver, CO or Northern Colorado"
            style={s.input}
          />

          {/* Description */}
          <Text style={s.label}>Description *</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Brief description: what they offer, age range, specialties, wait times, etc."
            placeholderTextColor={COLORS.textLight}
            value={detail}
            onChangeText={setDetail}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Type */}
          <Text style={s.label}>Evaluation Type *</Text>
          <View style={s.typeRow}>
            {([
              { value: 'inperson', label: '🏥 In-Person' },
              { value: 'telehealth', label: '📡 Telehealth' },
              { value: 'both', label: '🌐 Both' },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.typeChip, type === opt.value && s.typeChipActive]}
                onPress={() => setType(opt.value)}
              >
                <Text style={[s.typeChipText, type === opt.value && s.typeChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phone */}
          <Text style={s.label}>Phone Number (optional)</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. 303-555-1234"
            placeholderTextColor={COLORS.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Website */}
          <Text style={s.label}>Website (optional)</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. https://www.example.com"
            placeholderTextColor={COLORS.textLight}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Tags */}
          <Text style={s.label}>Tags (select all that apply)</Text>
          <View style={s.tagsGrid}>
            {PRESET_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[s.tagChip, selectedTags.includes(tag) && s.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[s.tagChipText, selectedTags.includes(tag) && s.tagChipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Tag */}
          <View style={s.customTagRow}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Add custom tag..."
              placeholderTextColor={COLORS.textLight}
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
            />
            <TouchableOpacity style={s.addTagBtn} onPress={addCustomTag}>
              <Text style={s.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {selectedTags.length > 0 && (
            <View style={s.selectedTagsRow}>
              {selectedTags.map((tag) => (
                <TouchableOpacity key={tag} style={s.selectedTag} onPress={() => toggleTag(tag)}>
                  <Text style={s.selectedTagText}>{tag} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Disclaimer */}
          <View style={s.disclaimer}>
            <Text style={s.disclaimerText}>
              📋 Submissions are reviewed by the Autism Pathways team before being added to the
              directory. We verify that evaluators are licensed and appropriate for our community.
              Submissions are anonymous — we don't collect your name or contact info.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, submitting && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={s.submitBtnText}>{submitting ? 'Submitting...' : '🎉 Submit Evaluator'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.sm },
  backText: { color: COLORS.purple, fontWeight: '600', fontSize: FONT_SIZES.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text },
  homeBtn: { padding: SPACING.sm },
  homeText: { fontSize: 22 },
  scroll: { flex: 1 },
  introBanner: { backgroundColor: COLORS.purple, padding: SPACING.md, margin: SPACING.md, borderRadius: RADIUS.lg },
  introTitle: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md, marginBottom: 4 },
  introSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZES.sm, lineHeight: 20 },
  form: { padding: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMid, marginBottom: SPACING.sm, letterSpacing: 0.3 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, ...SHADOWS.sm },
  textArea: { minHeight: 100 },
  statePicker: { backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
  statePickerText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  dropdown: { backgroundColor: 'white', borderRadius: RADIUS.md, ...SHADOWS.md, marginBottom: SPACING.md, zIndex: 100 },
  dropdownItem: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemActive: { backgroundColor: COLORS.lavender },
  dropdownItemText: { color: COLORS.text, fontSize: FONT_SIZES.md },
  dropdownItemTextActive: { color: COLORS.purple, fontWeight: 'bold' },
  typeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  typeChip: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.border, alignItems: 'center' },
  typeChipActive: { backgroundColor: COLORS.purple },
  typeChipText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.sm },
  typeChipTextActive: { color: 'white' },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.sm },
  tagChip: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.border, borderWidth: 1, borderColor: 'transparent' },
  tagChipActive: { backgroundColor: COLORS.lavender, borderColor: COLORS.purple },
  tagChipText: { color: COLORS.textMid, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  tagChipTextActive: { color: COLORS.purple },
  customTagRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  addTagBtn: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderRadius: RADIUS.md, justifyContent: 'center' },
  addTagBtnText: { color: 'white', fontWeight: '700', fontSize: FONT_SIZES.sm },
  selectedTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  selectedTag: { backgroundColor: COLORS.lavender, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.pill },
  selectedTagText: { color: COLORS.purple, fontSize: FONT_SIZES.xs, fontWeight: '600' },
  disclaimer: { backgroundColor: COLORS.infoBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.infoBorder },
  disclaimerText: { color: COLORS.infoText, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  submitBtn: { backgroundColor: COLORS.purple, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', ...SHADOWS.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.lg },
});
