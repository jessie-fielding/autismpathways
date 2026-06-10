/**
 * Tell Us About Your Family / Tell Us About You
 *
 * Optional onboarding screen — collects parent/provider info.
 * When "Provider" is selected as role, the form dynamically switches to
 * provider-specific fields (specialty chips, "What brings you here?" chips)
 * and hides the family/child sections.
 * All fields are optional. Skippable. Warm, low-pressure tone.
 *
 * Flow: create-account → profile-setup → onboarding
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, Image, Alert,
  Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';
import { storage } from '../services/storage';
import { addChild, setActiveChildId, loadChildren } from '../services/childManager';

const AVATAR_EMOJIS = [
  '🦋', '🌈', '🦄', '🐻',
  '⭐', '🎨', '🚀', '🦁',
  '🐬', '🌸', '🎯', '⚡',
];

// Journey / concern options — drive dashboard personalisation (parent/caregiver)
const JOURNEY_OPTIONS = [
  { id: 'diagnosis',   icon: '🔍', label: 'Getting a Diagnosis',      sub: 'Evaluations, waitlists & next steps' },
  { id: 'medicaid',   icon: '💳', label: 'Medicaid / Insurance',       sub: 'Applying, appealing, or understanding coverage' },
  { id: 'waivers',    icon: '🛡️', label: 'Waiver Programs',            sub: 'HCBS, DD waivers, and state programs' },
  { id: 'school',     icon: '🏫', label: 'IEP / School Support',       sub: 'IEP meetings, 504 plans, and school rights' },
  { id: 'behavior',   icon: '🧠', label: 'Behavior & Daily Life',      sub: 'Meltdowns, routines, sensory needs' },
  { id: 'speech',     icon: '🗣️', label: 'Speech & Communication',     sub: 'AAC, speech therapy, and language goals' },
  { id: 'sensory',    icon: '🌊', label: 'Sensory Processing',         sub: 'OT, sensory diets, and environment' },
  { id: 'sleep',      icon: '🌙', label: 'Sleep Challenges',           sub: 'Sleep studies, melatonin, bedtime routines' },
  { id: 'transition', icon: '🎓', label: 'Transition to Adulthood',    sub: 'Adult services, employment, housing' },
  { id: 'family',     icon: '❤️', label: 'Family & Self-Care',         sub: 'Sibling support, caregiver burnout, community' },
];

// Provider "What brings you here?" options
const PROVIDER_REASONS = [
  { id: 'resources',     label: 'Finding resources for patients' },
  { id: 'research',      label: 'Staying current on research' },
  { id: 'connecting',    label: 'Connecting with families' },
  { id: 'iep',           label: 'IEP & school advocacy' },
  { id: 'waivers',       label: 'Waiver navigation' },
  { id: 'professional',  label: 'Professional development' },
];

// Provider specialty chips
const PROVIDER_SPECIALTIES = [
  'Pediatrician', 'BCBA', 'Speech Therapist', 'Psychologist',
  'OT / PT', 'Social Worker', 'Educator', 'Other',
];

const RELATIONSHIPS = [
  'Parent', 'Guardian', 'Caregiver', 'Grandparent',
  'Foster Parent', 'Provider', 'Therapist', 'Teacher', 'Other',
];

const STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

interface ChildForm {
  name: string;
  age: string;
  emoji: string;
  photoUri: string | null;
}

function makeChild(): ChildForm {
  return { name: '', age: '', emoji: '', photoUri: null };
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Parent / user info
  const [parentName, setParentName]       = useState('');
  const [relationship, setRelationship]   = useState('');
  const [state, setState]                 = useState('');
  const [county, setCounty]               = useState('');

  // Provider-specific
  const [providerSpecialty, setProviderSpecialty] = useState('');
  const [providerReasons, setProviderReasons]     = useState<string[]>([]);
  const toggleProviderReason = (id: string) => {
    setProviderReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // Journey / priorities (parent mode)
  const [selectedJourneys, setSelectedJourneys] = useState<string[]>([]);
  const toggleJourney = (id: string) => {
    setSelectedJourneys((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  // Dynamic children (parent mode)
  const [childCount, setChildCount]       = useState(1);
  const [children, setChildren]           = useState<ChildForm[]>([makeChild()]);

  const [loading, setLoading]             = useState(false);
  const [showRelPicker, setShowRelPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCountyPicker, setShowCountyPicker] = useState(false);
  const [countySearch, setCountySearch] = useState('');

  // Derived: is this a provider?
  const isProvider = relationship === 'Provider';

  // County list derived from selected state (uses waiver-data.json)
  const countyOptions = React.useMemo(() => {
    if (!state) return [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const waiverData = require('../data/waiver-data.json') as Record<string, { counties: Record<string, { countyDisplay: string }> }>;
      const stateData = waiverData[state];
      if (!stateData?.counties) return [];
      return Object.values(stateData.counties)
        .map((c) => c.countyDisplay)
        .sort((a, b) => a.localeCompare(b));
    } catch { return []; }
  }, [state]);

  const filteredCounties = React.useMemo(() => {
    if (!countySearch.trim()) return countyOptions;
    return countyOptions.filter((c) => c.toLowerCase().includes(countySearch.toLowerCase()));
  }, [countyOptions, countySearch]);

  // Adjust children array when count changes
  const handleChildCountChange = (count: number) => {
    setChildCount(count);
    setChildren((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, makeChild)];
      }
      return prev.slice(0, count);
    });
  };

  const updateChild = useCallback((index: number, patch: Partial<ChildForm>) => {
    setChildren((prev) => prev.map((c, i) => i === index ? { ...c, ...patch } : c));
  }, []);

  const pickPhoto = useCallback(async (index: number) => {
    Alert.alert(
      "Child's Photo",
      'Choose how to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera access is required to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
            if (!result.canceled && result.assets[0]) {
              updateChild(index, { photoUri: result.assets[0].uri, emoji: '' });
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Photo library access is required.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
            if (!result.canceled && result.assets[0]) {
              updateChild(index, { photoUri: result.assets[0].uri, emoji: '' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [updateChild]);

  const seedDefaults = async () => {
    await storage.setPathway('medicaid', { title: 'Medicaid Pathway', currentStep: 1, totalSteps: 8, progress: 12.5 });
    await storage.setPathway('diagnosis', { title: 'Diagnosis Pathway', currentStep: 1, totalSteps: 6, progress: 16.7 });
    await storage.setTasks([
      { id: 1, title: 'Verify contact info with waiver office', completed: false },
      { id: 2, title: 'Submit annual waiver check-in', completed: false },
      { id: 3, title: 'Complete the ICD support quiz', completed: false },
    ]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isProvider) {
        // Save provider profile
        await storage.setProfile({
          parentName: parentName.trim() || null,
          relationship: 'Provider',
          state: state || null,
          county: county.trim() || null,
          isProvider: true,
          providerSpecialty: providerSpecialty || null,
          providerReasons: providerReasons.length > 0 ? providerReasons : null,
          createdAt: new Date().toISOString(),
        });
        // Store provider flag for routing
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('ap_is_provider', 'true');
        router.replace('/onboarding');
      } else {
        // Save parent profile using first child's info for legacy compat
        const firstChild = children[0];
        await storage.setProfile({
          parentName: parentName.trim() || null,
          relationship: relationship || null,
          state: state || null,
          county: county.trim() || null,
          childName: firstChild.name.trim() || null,
          childAge: firstChild.age ? parseInt(firstChild.age) : null,
          concerns: selectedJourneys.length > 0 ? selectedJourneys : null,
          isProvider: false,
          createdAt: new Date().toISOString(),
        });

        // Add all children to the child manager
        const existingChildren = await loadChildren();
        if (existingChildren.length === 0) {
          let firstChildId: string | null = null;
          for (let i = 0; i < children.length; i++) {
            const c = children[i];
            const name = c.name.trim() || `Child ${i + 1}`;
            const avatarValue = c.photoUri || c.emoji || name.slice(0, 2).toUpperCase();
            const newChild = await addChild({ name, avatar: avatarValue });
            if (i === 0) firstChildId = newChild.id;
          }
          if (firstChildId) await setActiveChildId(firstChildId);
        }

        await seedDefaults();
        router.replace('/onboarding');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try { await seedDefaults(); } catch {}
    router.replace('/onboarding');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.headerTitle}>
          {isProvider ? 'Tell Us About You' : 'Tell Us About Your Family'}
        </Text>
        <Text style={styles.headerSub}>Everything here is optional — share only what you're comfortable with 💜</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* About You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About You</Text>
          <Text style={styles.sectionSub}>We'll use this to personalise your experience</Text>
          <Text style={styles.label}>Your Name or Nickname</Text>
          <TextInput style={styles.input} placeholder="Whatever you'd like us to call you" placeholderTextColor={COLORS.textLight} value={parentName} onChangeText={setParentName} autoCapitalize="words" />
          <Text style={styles.label}>Your Role</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowRelPicker(true)} activeOpacity={0.8}>
            <Text style={[styles.pickerText, !relationship && styles.pickerPlaceholder]}>{relationship || 'Parent, Guardian, Caregiver…'}</Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
          <Text style={styles.label}>State</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowStatePicker(true)} activeOpacity={0.8}>
            <Text style={[styles.pickerText, !state && styles.pickerPlaceholder]}>{state || 'Select your state'}</Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
          <Text style={styles.label}>City / County</Text>
          {countyOptions.length > 0 ? (
            <TouchableOpacity style={styles.picker} onPress={() => { setCountySearch(''); setShowCountyPicker(true); }} activeOpacity={0.8}>
              <Text style={[styles.pickerText, !county && styles.pickerPlaceholder]}>{county || 'Select your county'}</Text>
              <Text style={styles.pickerChevron}>›</Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.input}
              value={county}
              onChangeText={setCounty}
              placeholder="e.g. Franklin County or Columbus"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="words"
            />
          )}
        </View>

        {/* ── PROVIDER MODE: Specialty + Reasons ── */}
        {isProvider && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Specialty</Text>
              <Text style={styles.sectionSub}>Helps us show the most relevant resources</Text>
              <View style={styles.chipWrap}>
                {PROVIDER_SPECIALTIES.map((spec) => {
                  const selected = providerSpecialty === spec;
                  return (
                    <TouchableOpacity
                      key={spec}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setProviderSpecialty(selected ? '' : spec)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{spec}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What brings you here? 🗺️</Text>
              <Text style={styles.sectionSub}>Select all that apply</Text>
              <View style={styles.chipWrap}>
                {PROVIDER_REASONS.map((opt) => {
                  const selected = providerReasons.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleProviderReason(opt.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* ── PARENT/CAREGIVER MODE: Kids + Journey ── */}
        {!isProvider && (
          <>
            {/* How many kids */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How many kids are on this journey?</Text>
              <Text style={styles.sectionSub}>You can always add more children later in Settings</Text>
              <View style={styles.countRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.countBtn, childCount === n && styles.countBtnSelected]}
                    onPress={() => handleChildCountChange(n)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.countBtnText, childCount === n && styles.countBtnTextSelected]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Child profile blocks */}
            {children.map((child, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {childCount === 1 ? 'About Your Child' : `Child ${index + 1}`}
                </Text>
                <Text style={styles.sectionSub}>You can always update this later in Settings</Text>
                <Text style={styles.label}>Photo or Avatar</Text>
                <View style={styles.avatarRow}>
                  <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(index)} activeOpacity={0.8}>
                    {child.photoUri ? (
                      <Image source={{ uri: child.photoUri }} style={styles.photoPreview} />
                    ) : (
                      <View style={styles.photoBtnInner}>
                        <Text style={styles.photoBtnIcon}>📷</Text>
                        <Text style={styles.photoBtnText}>Add Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.emojiGrid}>
                    {AVATAR_EMOJIS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[styles.emojiBtn, child.emoji === emoji && styles.emojiBtnSelected]}
                        onPress={() => updateChild(index, { emoji, photoUri: null })}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First name or nickname"
                  placeholderTextColor={COLORS.textLight}
                  value={child.name}
                  onChangeText={(v) => updateChild(index, { name: v })}
                  autoCapitalize="words"
                />
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Age in years"
                  placeholderTextColor={COLORS.textLight}
                  value={child.age}
                  onChangeText={(v) => updateChild(index, { age: v })}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            ))}

            {/* What journey are you on? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What journey are you on? 🗺️</Text>
              <Text style={styles.sectionSub}>Pick all that apply — this personalises your dashboard and pathways</Text>
              {JOURNEY_OPTIONS.map((opt) => {
                const selected = selectedJourneys.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.journeyRow, selected && styles.journeyRowSelected]}
                    onPress={() => toggleJourney(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.journeyIconWrap, selected && styles.journeyIconWrapSelected]}>
                      <Text style={styles.journeyIcon}>{opt.icon}</Text>
                    </View>
                    <View style={styles.journeyBody}>
                      <Text style={[styles.journeyLabel, selected && styles.journeyLabelSelected]}>{opt.label}</Text>
                      <Text style={styles.journeySub}>{opt.sub}</Text>
                    </View>
                    <View style={[styles.journeyCheck, selected && styles.journeyCheckSelected]}>
                      {selected && <Text style={styles.journeyCheckText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving…' : "Let's Get Started →"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipBtnText}>Skip for now — I'll fill this in later</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Role picker */}
      <Modal visible={showRelPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRelPicker(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Your Role</Text>
            {RELATIONSHIPS.map((r) => (
              <TouchableOpacity key={r} style={[styles.modalOption, relationship === r && styles.modalOptionSelected]} onPress={() => { setRelationship(r); setShowRelPicker(false); }}>
                <Text style={[styles.modalOptionText, relationship === r && styles.modalOptionTextSelected]}>{r}</Text>
                {relationship === r && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* State picker */}
      <Modal visible={showStatePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowStatePicker(false)}>
          <View style={[styles.modalSheet, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Select Your State</Text>
            <FlatList
              data={STATES}
              keyExtractor={(s) => s}
              renderItem={({ item: s }) => (
                <TouchableOpacity style={[styles.modalOption, state === s && styles.modalOptionSelected]} onPress={() => { setState(s); setShowStatePicker(false); }}>
                  <Text style={[styles.modalOptionText, state === s && styles.modalOptionTextSelected]}>{s}</Text>
                  {state === s && <Text style={styles.modalCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* County Picker Modal */}
      <Modal visible={showCountyPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCountyPicker(false)}>
          <View style={[styles.modalSheet, { maxHeight: '75%' }]}>
            <Text style={styles.modalTitle}>Select Your County</Text>
            <TextInput
              style={[styles.input, { marginHorizontal: SPACING.md, marginBottom: SPACING.sm }]}
              placeholder="Search counties..."
              placeholderTextColor={COLORS.textLight}
              value={countySearch}
              onChangeText={setCountySearch}
              autoCapitalize="none"
            />
            <FlatList
              data={filteredCounties}
              keyExtractor={(c) => c}
              renderItem={({ item: c }) => (
                <TouchableOpacity
                  style={[styles.modalOption, county === c && styles.modalOptionSelected]}
                  onPress={() => { setCounty(c); setShowCountyPicker(false); }}
                >
                  <Text style={[styles.modalOptionText, county === c && styles.modalOptionTextSelected]}>{c}</Text>
                  {county === c && <Text style={styles.modalCheck}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: COLORS.textLight, padding: SPACING.lg }}>
                  No counties found. Try a different search.
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#fff', marginBottom: SPACING.xs },
  headerSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  content: { padding: SPACING.lg, gap: SPACING.md },
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm, ...SHADOWS.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  sectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: SPACING.sm },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginTop: SPACING.xs },
  input: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text },
  picker: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1 },
  pickerPlaceholder: { color: COLORS.textLight },
  pickerChevron: { fontSize: 18, color: COLORS.textLight },
  // Provider chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.xs },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  chipSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender ?? '#EDE9FF' },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '500' },
  chipTextSelected: { color: COLORS.purple, fontWeight: '700' },
  // Child count stepper
  countRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  countBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  countBtnSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender ?? '#EDE9FF' },
  countBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textMid },
  countBtnTextSelected: { color: COLORS.purple },
  // Avatar
  avatarRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  photoBtn: { width: 80, height: 80, borderRadius: RADIUS.lg, backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photoPreview: { width: 80, height: 80, borderRadius: RADIUS.lg },
  photoBtnInner: { alignItems: 'center', gap: 4 },
  photoBtnIcon: { fontSize: 22 },
  photoBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center' },
  emojiGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  emojiBtnSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender ?? '#EDE9FF' },
  emojiText: { fontSize: 18 },
  // Buttons
  saveBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, ...SHADOWS.md },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  skipBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textDecorationLine: 'underline' },
  // Journey selector
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.sm, marginBottom: 6 },
  journeyRowSelected: { borderColor: COLORS.purple, backgroundColor: '#F0EDFF' },
  journeyIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  journeyIconWrapSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  journeyIcon: { fontSize: 20 },
  journeyBody: { flex: 1 },
  journeyLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  journeyLabelSelected: { color: COLORS.purple },
  journeySub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 1 },
  journeyCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  journeyCheckSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  journeyCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxxl, paddingHorizontal: SPACING.lg, maxHeight: '50%' },
  modalTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalOptionSelected: { backgroundColor: COLORS.lavender ?? '#EDE9FF', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm },
  modalOptionText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  modalOptionTextSelected: { color: COLORS.purple, fontWeight: '600' },
  modalCheck: { fontSize: 16, color: COLORS.purple, fontWeight: '700' },
});
