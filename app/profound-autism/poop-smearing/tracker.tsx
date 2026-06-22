/**
 * Smear Tracker — Log incidents with time, location, antecedents, mood, BM.
 * Free: log entries. Premium: pattern analysis + export.
 */
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent } from '../../../lib/analytics';
import { useIsPremium } from '../../../hooks/useIsPremium';

const TRACKER_KEY = 'ap_smear_tracker_entries';

interface TrackerEntry {
  id: string;
  timestamp: string;
  location: string;
  timeOfDay: string;
  antecedents: string[];
  mood: string;
  bowelMovement: string;
  notes: string;
}

const LOCATIONS = ['Bedroom', 'Bathroom', 'Living room', 'Other'];
const TIMES_OF_DAY = ['Middle of night', 'Early morning', 'Morning', 'Afternoon', 'Evening', 'After bath/diaper change'];
const ANTECEDENTS = [
  'Woke up alone',
  'Quiet/unstructured time',
  'After bowel movement',
  'During bath/diaper change',
  'Seemed upset or distressed',
  'Transition/change in routine',
  'Unknown',
];
const MOODS = ['Calm/content', 'Distressed', 'Hard to tell'];
const BM_OPTIONS = [
  'Yes – normal',
  'Yes – hard/constipated',
  'Yes – loose/runny',
  'Not yet today',
  'Unknown',
];

export default function SmearTracker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  // Form state
  const [location, setLocation] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [antecedents, setAntecedents] = useState<string[]>([]);
  const [mood, setMood] = useState('');
  const [bowelMovement, setBowelMovement] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadEntries();
    logEvent('tool_opened', { tool: 'Smear Tracker' });
  }, []);

  const loadEntries = async () => {
    const raw = await AsyncStorage.getItem(TRACKER_KEY);
    if (raw) setEntries(JSON.parse(raw));
  };

  const toggleAntecedent = (item: string) => {
    setAntecedents((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    if (!location || !timeOfDay || !mood || !bowelMovement) {
      Alert.alert('Missing fields', 'Please fill in location, time of day, mood, and bowel movement.');
      return;
    }
    const entry: TrackerEntry = {
      id: `smear_${Date.now()}`,
      timestamp: new Date().toISOString(),
      location,
      timeOfDay,
      antecedents,
      mood,
      bowelMovement,
      notes,
    };
    const updated = [entry, ...entries];
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
    setEntries(updated);
    logEvent('smear_tracker_entry_saved');
    // Reset form
    setLocation('');
    setTimeOfDay('');
    setAntecedents([]);
    setMood('');
    setBowelMovement('');
    setNotes('');
    setShowForm(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smear Tracker</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(!showForm)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Log'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Log Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Log an Incident</Text>
            <Text style={styles.formTimestamp}>📅 {new Date().toLocaleString()}</Text>

            <Text style={styles.fieldLabel}>Where did it happen?</Text>
            <View style={styles.chipRow}>
              {LOCATIONS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, location === l && styles.chipSelected]}
                  onPress={() => setLocation(l)}
                >
                  <Text style={[styles.chipText, location === l && styles.chipTextSelected]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>When in the day?</Text>
            <View style={styles.chipRow}>
              {TIMES_OF_DAY.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, timeOfDay === t && styles.chipSelected]}
                  onPress={() => setTimeOfDay(t)}
                >
                  <Text style={[styles.chipText, timeOfDay === t && styles.chipTextSelected]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>What was happening right before? (select all)</Text>
            <View style={styles.chipRow}>
              {ANTECEDENTS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.chip, antecedents.includes(a) && styles.chipSelected]}
                  onPress={() => toggleAntecedent(a)}
                >
                  <Text style={[styles.chipText, antecedents.includes(a) && styles.chipTextSelected]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>How did they seem?</Text>
            <View style={styles.chipRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, mood === m && styles.chipSelected]}
                  onPress={() => setMood(m)}
                >
                  <Text style={[styles.chipText, mood === m && styles.chipTextSelected]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Bowel movement today?</Text>
            <View style={styles.chipRow}>
              {BM_OPTIONS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, bowelMovement === b && styles.chipSelected]}
                  onPress={() => setBowelMovement(b)}
                >
                  <Text style={[styles.chipText, bowelMovement === b && styles.chipTextSelected]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any other observations…"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save Entry →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Premium patterns card */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => {
              logEvent('paywall_nudge_tapped', { location: 'smear_tracker_trends' });
              router.push('/paywall');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.premiumLock}>🔒</Text>
            <Text style={styles.premiumTitle}>My Trends — Premium</Text>
            <Text style={styles.premiumSub}>
              Pattern highlights, bowel movement correlation, and PDF export for your BCBA or doctor.
            </Text>
            <View style={styles.premiumBtn}>
              <Text style={styles.premiumBtnText}>Unlock with Premium →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Entry list */}
        {entries.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySub}>
              Tap "+ Log" to record your first incident. Consistent tracking helps identify patterns.
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <Text style={styles.entryDate}>{formatDate(entry.timestamp)}</Text>
              <View style={styles.entryRow}>
                <Text style={styles.entryLabel}>📍 Location:</Text>
                <Text style={styles.entryValue}>{entry.location}</Text>
              </View>
              <View style={styles.entryRow}>
                <Text style={styles.entryLabel}>🕐 Time:</Text>
                <Text style={styles.entryValue}>{entry.timeOfDay}</Text>
              </View>
              <View style={styles.entryRow}>
                <Text style={styles.entryLabel}>😊 Mood:</Text>
                <Text style={styles.entryValue}>{entry.mood}</Text>
              </View>
              <View style={styles.entryRow}>
                <Text style={styles.entryLabel}>💩 BM:</Text>
                <Text style={styles.entryValue}>{entry.bowelMovement}</Text>
              </View>
              {entry.antecedents.length > 0 && (
                <View style={styles.entryRow}>
                  <Text style={styles.entryLabel}>Before:</Text>
                  <Text style={styles.entryValue}>{entry.antecedents.join(', ')}</Text>
                </View>
              )}
              {entry.notes ? (
                <Text style={styles.entryNotes}>{entry.notes}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  addBtn: {
    backgroundColor: '#8B5E3C',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.md },
  // Form
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  formTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  formTimestamp: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  chipSelected: { borderColor: '#8B5E3C', backgroundColor: '#FDF3E7' },
  chipText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '600' },
  chipTextSelected: { color: '#8B5E3C', fontWeight: '700' },
  notesInput: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    minHeight: 80,
  },
  saveBtn: {
    backgroundColor: '#8B5E3C',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
    ...SHADOWS.sm,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
  // Premium card
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  premiumLock: { fontSize: 28 },
  premiumTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  premiumSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20 },
  premiumBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  premiumBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 40, gap: SPACING.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: SPACING.xl },
  // Entry cards
  entryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  entryDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600', marginBottom: SPACING.xs },
  entryRow: { flexDirection: 'row', gap: SPACING.xs },
  entryLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600', width: 70 },
  entryValue: { fontSize: FONT_SIZES.xs, color: COLORS.text, flex: 1 },
  entryNotes: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontStyle: 'italic', marginTop: SPACING.xs },
});
