import { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, KeyboardAvoidingView, Platform, Modal} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { IEP_FLAGGED_KEY, OBS_KEY, type Observation } from './index';
import { useActiveChild } from '../../services/childManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// ── Data ──────────────────────────────────────────────────────────────────────

const MOODS = [
  { value: 'Calm', emoji: '😌' },
  { value: 'Happy', emoji: '😄' },
  { value: 'Anxious', emoji: '😟' },
  { value: 'Frustrated', emoji: '😤' },
  { value: 'Dysregulated', emoji: '🌀' },
  { value: 'Other', emoji: '✏️' },
];

const TAGS = [
  { value: 'Meltdown', emoji: '🌊' },
  { value: 'Transition difficulty', emoji: '🔄' },
  { value: 'Communication struggle', emoji: '💬' },
  { value: 'Sensory sensitivity', emoji: '🎧' },
  { value: 'Sleep issue', emoji: '🌙' },
  { value: 'Eating issue', emoji: '🍽️' },
  { value: 'Great day', emoji: '⭐' },
  { value: 'Social interaction', emoji: '👥' },
];

const ENVIRONMENTS = [
  { value: 'Home', emoji: '🏠' },
  { value: 'School', emoji: '🏫' },
  { value: 'Public place', emoji: '🛒' },
  { value: 'Therapy', emoji: '🧩' },
  { value: 'Other', emoji: '📍' },
];

const TRIGGERS = [
  { value: 'Loud noise', emoji: '🔊' },
  { value: 'Change in routine', emoji: '📅' },
  { value: 'Social interaction', emoji: '👥' },
  { value: 'Transition', emoji: '🚪' },
  { value: 'Hunger/thirst', emoji: '🍎' },
  { value: 'Fatigue', emoji: '😴' },
  { value: 'Unknown', emoji: '❓' },
];

const DURATIONS = ['Under 5 min', '5–15 min', '15–30 min', '30+ min'];
const INTENSITIES = ['Mild', 'Moderate', 'High'];
const SUPPORTS = ['Minimal', 'Moderate', 'Full support'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewEntryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { childId } = useActiveChild();

  const [date, setDate] = useState(todayISO());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInput, setDateInput] = useState(todayISO());
  const [mood, setMood] = useState('');
  const [summary, setSummary] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [environment, setEnvironment] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('');
  const [support, setSupport] = useState('');
  const [helped, setHelped] = useState('');
  const [notes, setNotes] = useState('');
  const [iepFlag, setIepFlag] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleMulti = (val: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const handleSave = async () => {
    if (!summary.trim()) {
      Alert.alert('Please add a short description before saving.');
      return;
    }
    setSaving(true);
    try {
      const entry: Observation = {
        id: uid(),
        date,
        mood,
        summary: summary.trim(),
        whatWorked: whatWorked.trim(),
        tags,
        environment,
        triggers,
        duration,
        intensity,
        support,
        helped: helped.trim(),
        notes: notes.trim(),
        iepFlag,
        savedAt: new Date().toISOString(),
      };

      const obsKey = childId ? `${OBS_KEY}_${childId}` : OBS_KEY;
      const raw = await AsyncStorage.getItem(obsKey);
      const existing: Observation[] = raw ? JSON.parse(raw) : [];
      const updated = [entry, ...existing];
      await AsyncStorage.setItem(obsKey, JSON.stringify(updated));

      if (iepFlag) {
        const flagged = updated.filter((e) => e.iepFlag);
        await AsyncStorage.setItem(IEP_FLAGGED_KEY, JSON.stringify(flagged));
      }

      router.back();
    } catch (e) {
      Alert.alert('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Autism <Text style={styles.headerPurple}>Pathways</Text>
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Title card */}
        <View style={styles.titleCard}>
          <View style={styles.titleAccent} />
          <Text style={styles.cardLabel}>Quick Log</Text>
          <Text style={styles.cardTitle}>What happened today?</Text>
          <Text style={styles.cardDesc}>
            This takes about 30 seconds. All fields except the description are optional.
          </Text>
        </View>

        {/* Date — tappable to change for retroactive logging */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.dateDisplay}
            onPress={() => { setDateInput(date); setShowDatePicker(true); }}
            activeOpacity={0.75}
          >
            <Text style={styles.dateText}>
              {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </Text>
            <Text style={styles.dateEditHint}>✏️ tap to change</Text>
          </TouchableOpacity>
        </View>

        {/* Date picker modal */}
        <Modal transparent animationType="fade" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)} />
          <View style={styles.datePickerSheet}>
            <Text style={styles.datePickerTitle}>Change date</Text>
            <Text style={styles.datePickerHint}>Enter the date this happened (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.datePickerInput}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              autoFocus
            />
            <View style={styles.datePickerBtns}>
              <TouchableOpacity style={styles.datePickerCancel} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerConfirm}
                onPress={() => {
                  // Validate YYYY-MM-DD format
                  const valid = /^\d{4}-\d{2}-\d{2}$/.test(dateInput) && !isNaN(new Date(dateInput + 'T12:00:00').getTime());
                  if (!valid) {
                    Alert.alert('Invalid date', 'Please enter a date in YYYY-MM-DD format, e.g. 2025-06-15');
                    return;
                  }
                  setDate(dateInput);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerConfirmText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Mood */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>How was your child today?</Text>
          <Text style={styles.hint}>Pick the one that fits best — or skip it.</Text>
          <View style={styles.chipRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.chip, mood === m.value && styles.chipSelected]}
                onPress={() => setMood(mood === m.value ? '' : m.value)}
              >
                <Text style={styles.chipText}>{m.emoji} {m.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>What happened? <Text style={styles.required}>*</Text></Text>
          <Text style={styles.hint}>A few words is enough — write in your own voice.</Text>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={3}
            placeholder="e.g. She had a hard time leaving school today…"
            placeholderTextColor={COLORS.textLight}
            value={summary}
            onChangeText={setSummary}
          />
        </View>

        {/* What worked today */}
        <View style={[styles.field, styles.whatWorkedField]}>
          <View style={styles.whatWorkedHeader}>
            <Text style={styles.whatWorkedIcon}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.whatWorkedLabel}>What worked today? <Text style={styles.optional}>(optional)</Text></Text>
              <Text style={styles.whatWorkedHint}>A strategy, reward, or approach that helped — great to share with therapists.</Text>
            </View>
          </View>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={2}
            placeholder="e.g. Used a reward chart — she cleaned her room without reminders!"
            placeholderTextColor={COLORS.textLight}
            value={whatWorked}
            onChangeText={setWhatWorked}
          />
        </View>

        {/* Tags */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tags <Text style={styles.optional}>(optional)</Text></Text>
          <View style={styles.chipRow}>
            {TAGS.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, tags.includes(t.value) && styles.chipSelected]}
                onPress={() => toggleMulti(t.value, tags, setTags)}
              >
                <Text style={styles.chipText}>{t.emoji} {t.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Environment */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Where did this happen? <Text style={styles.optional}>(optional)</Text></Text>
          <View style={styles.chipRow}>
            {ENVIRONMENTS.map((e) => (
              <TouchableOpacity
                key={e.value}
                style={[styles.chip, environment === e.value && styles.chipSelected]}
                onPress={() => setEnvironment(environment === e.value ? '' : e.value)}
              >
                <Text style={styles.chipText}>{e.emoji} {e.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* More detail toggle */}
        <TouchableOpacity style={styles.detailsToggle} onPress={() => setShowDetails(!showDetails)}>
          <View>
            <Text style={styles.detailsTitle}>More detail</Text>
            <Text style={styles.detailsBadge}>optional</Text>
          </View>
          <Text style={styles.detailsChevron}>{showDetails ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.detailsBody}>
            {/* Triggers */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>What may have triggered this?</Text>
              <View style={styles.chipRow}>
                {TRIGGERS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, triggers.includes(t.value) && styles.chipSelected]}
                    onPress={() => toggleMulti(t.value, triggers, setTriggers)}
                  >
                    <Text style={styles.chipText}>{t.emoji} {t.value}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>How long did it last?</Text>
              <View style={styles.ratingRow}>
                {DURATIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.ratingBtn, duration === d && styles.ratingBtnSelected]}
                    onPress={() => setDuration(duration === d ? '' : d)}
                  >
                    <Text style={[styles.ratingBtnText, duration === d && styles.ratingBtnTextSelected]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Intensity */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>How intense was it?</Text>
              <View style={styles.ratingRow}>
                {INTENSITIES.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.ratingBtn, intensity === v && styles.ratingBtnSelected]}
                    onPress={() => setIntensity(intensity === v ? '' : v)}
                  >
                    <Text style={[styles.ratingBtnText, intensity === v && styles.ratingBtnTextSelected]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Support */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>How much support was needed?</Text>
              <View style={styles.ratingRow}>
                {SUPPORTS.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.ratingBtn, support === v && styles.ratingBtnSelected]}
                    onPress={() => setSupport(support === v ? '' : v)}
                  >
                    <Text style={[styles.ratingBtnText, support === v && styles.ratingBtnTextSelected]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* What helped */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>What helped?</Text>
              <TextInput
                style={styles.textarea}
                multiline
                numberOfLines={2}
                placeholder="e.g. Quiet time, deep pressure, a preferred snack…"
                placeholderTextColor={COLORS.textLight}
                value={helped}
                onChangeText={setHelped}
              />
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Anything else you want to remember?</Text>
          <Text style={styles.hint}>This is just for you.</Text>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={3}
            placeholder="Add any other thoughts or context…"
            placeholderTextColor={COLORS.textLight}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* IEP Flag toggle */}
        <TouchableOpacity
          style={[styles.iepToggle, iepFlag && styles.iepToggleActive]}
          onPress={() => setIepFlag(!iepFlag)}
          activeOpacity={0.8}
        >
          <View style={styles.iepToggleLeft}>
            <Text style={styles.iepToggleIcon}>📌</Text>
            <View>
              <Text style={[styles.iepToggleTitle, iepFlag && styles.iepToggleTitleActive]}>
                Save to IEP Pathway
              </Text>
              <Text style={styles.iepToggleSub}>
                Flag this observation for your next IEP meeting prep
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, iepFlag && styles.toggleOn]}>
            <View style={[styles.toggleThumb, iepFlag && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : '✨ Save Observation'}</Text>
        </TouchableOpacity>

        <View style={styles.rainbowBar} />
      </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  dashText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  // Title card
  titleCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  titleAccent: { height: 4, backgroundColor: COLORS.blueAccent },
  cardLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  cardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },

  // Fields
  field: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  hint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: SPACING.sm },
  required: { color: COLORS.errorText },
  optional: { fontWeight: '400', color: COLORS.textLight },

  // Date display
  dateDisplay: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dateText: { fontSize: FONT_SIZES.base, color: COLORS.text },
  dateEditHint: { fontSize: FONT_SIZES.xs, color: COLORS.purple, marginTop: 4, fontWeight: '500' },

  // Date picker modal
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  datePickerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 40,
    ...SHADOWS.lg,
  },
  datePickerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  datePickerHint: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.md },
  datePickerInput: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  datePickerBtns: { flexDirection: 'row', gap: SPACING.md },
  datePickerCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  datePickerCancelText: { fontSize: FONT_SIZES.base, color: COLORS.textMid, fontWeight: '600' },
  datePickerConfirm: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
  },
  datePickerConfirmText: { fontSize: FONT_SIZES.base, color: COLORS.white, fontWeight: '700' },

  // What worked field
  whatWorkedField: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#E8D87A',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  whatWorkedHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  whatWorkedIcon: { fontSize: 22, marginTop: 1 },
  whatWorkedLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  whatWorkedHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2, lineHeight: 17 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipSelected: { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },

  // Textarea
  textarea: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 72,
  },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md, marginVertical: SPACING.md },

  // Details toggle
  detailsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  detailsTitle: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.text },
  detailsBadge: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  detailsChevron: { fontSize: 14, color: COLORS.textLight },
  detailsBody: { paddingTop: SPACING.sm },

  // Rating buttons
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  ratingBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  ratingBtnSelected: { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent },
  ratingBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '500' },
  ratingBtnTextSelected: { color: COLORS.purpleDark, fontWeight: '700' },

  // IEP toggle
  iepToggle: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  iepToggleActive: { backgroundColor: COLORS.mint, borderColor: COLORS.mintAccent },
  iepToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  iepToggleIcon: { fontSize: 22 },
  iepToggleTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  iepToggleTitleActive: { color: COLORS.successText },
  iepToggleSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: COLORS.mintAccent },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white, ...SHADOWS.sm },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Save button
  saveBtn: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },

  rainbowBar: {
    height: 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 2,
    backgroundColor: COLORS.purple,
    opacity: 0.3,
  },
});
