import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsPremium } from '../../hooks/useIsPremium';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const DIARY_KEY = 'ap_potty_diary';

type BMValue = 'yes' | 'no' | 'acc';
type BristolIndex = 0 | 1 | 2 | 3 | 4;

interface DiaryEntry {
  bm: BMValue;
  bristol: BristolIndex | null;
  savedAt: string;
}

type DiaryData = Record<string, DiaryEntry>;

// Draft state for a day being edited
interface DraftEntry {
  bm: BMValue | null;
  bristol: BristolIndex | null;
}

const BRISTOL_ITEMS: { emoji: string; label: string }[] = [
  { emoji: '🪨', label: 'Very hard' },
  { emoji: '🌰', label: 'Hard lumpy' },
  { emoji: '🌭', label: 'Normal' },
  { emoji: '🍌', label: 'Soft' },
  { emoji: '💧', label: 'Liquid' },
];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtFull(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLast14Days(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  return days;
}

function PremiumEyebrow() {
  const { isPremium } = useIsPremium();
  return isPremium
    ? <Text style={styles.premiumEyebrow}>✓ BETA — FULLY UNLOCKED</Text>
    : <Text style={styles.premiumEyebrow}>⭐ PREMIUM FEATURE</Text>;
}

export default function BowelDiaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [diary, setDiary] = useState<DiaryData>({});
  // Which day key is currently open for editing (null = none)
  const [editingKey, setEditingKey] = useState<string | null>(null);
  // Draft values for the day being edited
  const [draft, setDraft] = useState<DraftEntry>({ bm: null, bristol: null });
  const [weekLabel, setWeekLabel] = useState('');

  const today = dateKey(new Date());
  const days = getLast14Days();

  // Load diary from AsyncStorage on mount
  useEffect(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    setWeekLabel(`THIS WEEK — ${fmtShort(weekStart).toUpperCase()}–${fmtShort(weekEnd).toUpperCase()}`);

    AsyncStorage.getItem(DIARY_KEY).then((raw) => {
      if (raw) {
        try {
          setDiary(JSON.parse(raw));
        } catch (_) {}
      }
    });

    // Auto-open today for editing on first load
    setEditingKey(dateKey(new Date()));
    setDraft({ bm: null, bristol: null });
  }, []);

  // Open a day for editing — pre-populate draft from existing entry if present
  const openDay = (key: string) => {
    if (editingKey === key) {
      // Tapping the same day collapses it
      setEditingKey(null);
      return;
    }
    const existing = diary[key];
    setDraft({
      bm: existing ? existing.bm : null,
      bristol: existing ? existing.bristol : null,
    });
    setEditingKey(key);
  };

  // Save the draft for the currently editing day
  const saveDay = async (key: string) => {
    if (!draft.bm) {
      Alert.alert('Please select Yes, No, or Accident before saving.');
      return;
    }
    const entry: DiaryEntry = {
      bm: draft.bm,
      bristol: draft.bm === 'no' ? null : draft.bristol,
      savedAt: new Date().toISOString(),
    };
    const updated: DiaryData = { ...diary, [key]: entry };
    // Persist to AsyncStorage
    await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(updated));
    setDiary(updated);
    setEditingKey(null);
    setDraft({ bm: null, bristol: null });
    // Advance potty progress based on diary entry count (steps 2-5)
    const entryCount = Object.keys(updated).length;
    const newScore = entryCount >= 14 ? 5 : entryCount >= 7 ? 4 : entryCount >= 3 ? 3 : 2;
    const curScore = parseInt(await AsyncStorage.getItem('ap_potty_progress') || '0', 10);
    if (newScore > curScore) await AsyncStorage.setItem('ap_potty_progress', String(newScore));
  };

  const getInsight = () => {
    const values = Object.values(diary);
    const total = values.length;
    if (total < 2) return null;
    const noBM = values.filter((e) => e.bm === 'no').length;
    const accidents = values.filter((e) => e.bm === 'acc').length;
    const hardCount = values.filter(
      (e) => e.bristol !== null && e.bristol !== undefined && e.bristol <= 1
    ).length;

    if (noBM >= 2 || hardCount >= 2) {
      return {
        label: `📊 Pattern after ${total} days`,
        title: 'Possible constipation pattern',
        text: `No BM on ${noBM} of the last ${total} days. This may indicate chronic constipation. Consider sharing this diary with your pediatrician.`,
      };
    }
    if (accidents >= 2) {
      return {
        label: `📊 Pattern after ${total} days`,
        title: 'Frequent accidents noted',
        text: `Accidents logged on ${accidents} of the last ${total} days. Keep tracking — this information will be valuable for your child's doctor.`,
      };
    }
    return null;
  };

  const insight = getInsight();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Autism <Text style={styles.headerPurple}>Pathways</Text>
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/dashboard')}
          style={styles.dashBtn}
        >
          <Text style={styles.dashText}>← Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>📊</Text>
          </View>
          <PremiumEyebrow />
          <Text style={styles.bannerTitle}>
            Bowel <Text style={styles.bannerTitlePurple}>Diary</Text>
          </Text>
          <Text style={styles.bannerSub}>
            Track 2 weeks of bowel movements to understand your child's pattern — and have
            something real to show your pediatrician.
          </Text>
        </View>

        {/* Why 2 weeks callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutIcon}>💡</Text>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutBold}>Why 2 weeks?</Text> Pediatric GI doctors and
            pelvic floor PTs almost always ask for a 2-week bowel diary before they can assess
            what's going on. This gives you that — already organized.
          </Text>
        </View>

        {/* Week label */}
        <Text style={styles.sectionHeading}>{weekLabel}</Text>

        {/* Diary entries */}
        {days.map((d) => {
          const key = dateKey(d);
          const entry = diary[key] || null;
          const isToday = key === today;
          const isEditing = editingKey === key;

          return (
            <View
              key={key}
              style={[
                styles.dayCard,
                isToday && styles.dayCardToday,
                isEditing && styles.dayCardEditing,
              ]}
            >
              {/* Day header row — always tappable to open/close */}
              <TouchableOpacity
                style={styles.dayHeader}
                onPress={() => openDay(key)}
                activeOpacity={0.7}
              >
                <Text style={styles.dayTitle}>
                  {isToday ? 'Today — ' : ''}
                  {fmtFull(d)}
                  {isToday ? ' ✏️' : ''}
                </Text>
                <Text
                  style={[
                    styles.dayStatus,
                    isToday && styles.dayStatusToday,
                    isEditing && styles.dayStatusEditing,
                  ]}
                >
                  {isEditing ? 'Editing ▲' : entry ? 'Saved ✓' : 'Tap to fill in'}
                </Text>
              </TouchableOpacity>

              {/* Collapsed view — show saved entry summary */}
              {!isEditing && entry && (
                <View style={styles.entryRow}>
                  <Text style={styles.entryBM}>
                    {entry.bm === 'yes'
                      ? '✅ BM'
                      : entry.bm === 'acc'
                      ? '⚠️ Accident'
                      : '❌ No BM'}
                  </Text>
                  {entry.bristol !== null &&
                    entry.bristol !== undefined &&
                    entry.bm !== 'no' && (
                      <Text style={styles.entryBristol}>
                        {BRISTOL_ITEMS[entry.bristol]?.emoji}{' '}
                        <Text style={styles.entryBristolLabel}>
                          {BRISTOL_ITEMS[entry.bristol]?.label}
                        </Text>
                      </Text>
                    )}
                </View>
              )}

              {!isEditing && !entry && (
                <Text style={styles.noEntry}>No entry — tap to fill in.</Text>
              )}

              {/* Expanded edit form */}
              {isEditing && (
                <View style={styles.editForm}>
                  <Text style={styles.diaryLabel}>Did they have a BM?</Text>
                  <View style={styles.diaryChipRow}>
                    {(['yes', 'no', 'acc'] as BMValue[]).map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.diaryChip,
                          draft.bm === val &&
                            (val === 'yes'
                              ? styles.chipYes
                              : val === 'no'
                              ? styles.chipNo
                              : styles.chipAcc),
                        ]}
                        onPress={() => {
                          setDraft((prev) => ({
                            bm: val,
                            bristol: val === 'no' ? null : prev.bristol,
                          }));
                        }}
                      >
                        <Text style={styles.diaryChipText}>
                          {val === 'yes' ? '✅ Yes' : val === 'no' ? '❌ No' : '⚠️ Accident'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {(draft.bm === 'yes' || draft.bm === 'acc') && (
                    <>
                      <Text style={[styles.diaryLabel, { marginTop: SPACING.sm }]}>
                        Consistency (tap to select)
                      </Text>
                      <View style={styles.bristolRow}>
                        {BRISTOL_ITEMS.map((item, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.bristolItem,
                              draft.bristol === idx && styles.bristolItemSelected,
                            ]}
                            onPress={() =>
                              setDraft((prev) => ({ ...prev, bristol: idx as BristolIndex }))
                            }
                          >
                            <Text style={styles.bristolEmoji}>{item.emoji}</Text>
                            <Text style={styles.bristolLabel}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.saveEntryBtn}
                    onPress={() => saveDay(key)}
                  >
                    <Text style={styles.saveEntryBtnText}>Save Entry ✓</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Insight */}
        {insight && (
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>{insight.label}</Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightText}>{insight.text}</Text>
          </View>
        )}

        {/* Bottom buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              Alert.alert(
                'Export',
                '2-week summary export coming soon! This will generate a PDF you can share with your pediatrician.'
              )
            }
          >
            <Text style={styles.secondaryBtnText}>📤 Export 2-Week Summary for Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.secondaryBtnText}>← Back to My Pathway</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rainbowBar} />
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
  backBtn: { width: 60 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  dashBtn: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dashText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  banner: {
    backgroundColor: '#fffbea',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#e8a800',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.md,
  },
  bannerEmoji: { fontSize: 32 },
  premiumEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#a07800',
    textTransform: 'uppercase',
  },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  bannerTitlePurple: { color: COLORS.purple },
  bannerSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  callout: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  calloutIcon: { fontSize: 18 },
  calloutText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  calloutBold: { fontWeight: '700' },
  sectionHeading: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  dayCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  dayCardToday: {
    borderColor: COLORS.purple,
    borderWidth: 2,
  },
  dayCardEditing: {
    borderColor: COLORS.purple,
    borderWidth: 2,
    backgroundColor: '#faf9ff',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  dayStatus: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  dayStatusToday: { color: COLORS.purple, fontWeight: '700' },
  dayStatusEditing: { color: COLORS.purple, fontWeight: '700' },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  entryBM: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  entryBristol: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  entryBristolLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  noEntry: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  editForm: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  diaryLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  diaryChipRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  diaryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  chipYes: { backgroundColor: '#e8fdf0', borderColor: '#51cf66' },
  chipNo: { backgroundColor: '#fdf0f0', borderColor: '#ff6b6b' },
  chipAcc: { backgroundColor: '#fff8e8', borderColor: '#f0c040' },
  diaryChipText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  bristolRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap' },
  bristolItem: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    minWidth: 56,
  },
  bristolItemSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  bristolEmoji: { fontSize: 22 },
  bristolLabel: { fontSize: 10, color: COLORS.textMid, marginTop: 2, textAlign: 'center' },
  saveEntryBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
    ...SHADOWS.sm,
  },
  saveEntryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  insightCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  insightLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.infoText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.infoText },
  insightText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  ctaSection: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  secondaryBtn: {
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  secondaryBtnText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.sm },
  rainbowBar: {
    height: 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 2,
    backgroundColor: COLORS.purple,
    opacity: 0.3,
  },
});
