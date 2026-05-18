import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  // Appointment picker modal state
  const [apptModal, setApptModal]         = useState(false);
  const [savedNotes, setSavedNotes]       = useState<any[]>([]);
  const [selectedAppts, setSelectedAppts] = useState<Set<number>>(new Set());
  const [linking, setLinking]             = useState(false);
  const [linked, setLinked]               = useState(false);

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
        try { setDiary(JSON.parse(raw)); } catch (_) {}
      }
    });
    AsyncStorage.getItem('ap_provider_prep_saved').then((raw) => {
      if (raw) {
        try { setSavedNotes(JSON.parse(raw)); } catch (_) {}
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
          {savedNotes.length > 0 ? (
            <TouchableOpacity
              style={[styles.exportApptBtn, linked && styles.exportApptBtnLinked]}
              onPress={() => setApptModal(true)}
            >
              <Text style={styles.exportApptIcon}>{linked ? '✅' : '📅'}</Text>
              <View>
                <Text style={styles.exportApptTitle}>
                  {linked ? 'Added to Appointment Report' : 'Add Diary to Appointment Report'}
                </Text>
                <Text style={styles.exportApptSub}>
                  {linked ? 'Tap to update' : `${savedNotes.length} appointment${savedNotes.length > 1 ? 's' : ''} available`}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push('/provider-prep')}
            >
              <Text style={styles.secondaryBtnText}>📋 Create Appointment to Link Diary</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.secondaryBtnText}>← Back to My Pathway</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rainbowBar} />
      </ScrollView>

      {/* Appointment Picker Modal */}
      <Modal visible={apptModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setApptModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Appointment</Text>
            <TouchableOpacity
              style={[styles.modalDoneBtn, selectedAppts.size === 0 && styles.modalDoneBtnDisabled]}
              disabled={selectedAppts.size === 0 || linking}
              onPress={async () => {
                setLinking(true);
                try {
                  const values = Object.values(diary);
                  const total = values.length;
                  const bmDays = values.filter((e) => e.bm === 'yes').length;
                  const accDays = values.filter((e) => e.bm === 'acc').length;
                  const noBmDays = values.filter((e) => e.bm === 'no').length;
                  const bristolScores = values.filter((e) => e.bristol !== null).map((e) => e.bristol as number);
                  const avgBristol = bristolScores.length
                    ? (bristolScores.reduce((a, b) => a + b, 0) / bristolScores.length).toFixed(1)
                    : null;
                  const BRISTOL_LABELS = ['Very hard', 'Hard lumpy', 'Normal', 'Soft', 'Liquid'];
                  const bowelDiarySummary = {
                    totalDays: total,
                    bmDays,
                    accidentDays: accDays,
                    noBmDays,
                    avgBristolLabel: avgBristol !== null ? BRISTOL_LABELS[Math.round(parseFloat(avgBristol))] : null,
                    avgBristolScore: avgBristol,
                    generatedAt: new Date().toISOString(),
                  };
                  const raw = await AsyncStorage.getItem('ap_provider_prep_saved');
                  const notes: any[] = raw ? JSON.parse(raw) : [];
                  const updated = notes.map((n, i) =>
                    selectedAppts.has(i) ? { ...n, bowelDiarySummary } : n
                  );
                  await AsyncStorage.setItem('ap_provider_prep_saved', JSON.stringify(updated));
                  setSavedNotes(updated);
                  setLinked(true);
                  setApptModal(false);
                  Alert.alert('Added!', `Bowel diary summary added to ${selectedAppts.size} appointment report${selectedAppts.size > 1 ? 's' : ''}.`);
                } catch (e) {
                  Alert.alert('Error', 'Could not save. Please try again.');
                } finally {
                  setLinking(false);
                }
              }}
            >
              <Text style={styles.modalDoneText}>{linking ? '...' : 'Done'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Select which upcoming appointment(s) to include your 14-day bowel diary summary in.
          </Text>
          <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: SPACING.lg }}>
            {savedNotes.map((note, i) => {
              const sel = selectedAppts.has(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.apptCard, sel && styles.apptCardSelected]}
                  onPress={() => {
                    const next = new Set(selectedAppts);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    setSelectedAppts(next);
                  }}
                >
                  <View style={styles.apptCardLeft}>
                    <Text style={styles.apptCardTitle}>{note.providerName || 'Provider'} — {note.appointmentDate || ''}</Text>
                    <Text style={styles.apptCardMeta}>{note.visitType || ''}</Text>
                    {note.bowelDiarySummary && (
                      <Text style={styles.apptCardBadge}>✓ Diary already linked</Text>
                    )}
                  </View>
                  <View style={[styles.apptCheckbox, sel && styles.apptCheckboxSelected]}>
                    {sel && <Text style={styles.apptCheckmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  exportApptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#f0faf5',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#2a9d8f',
    ...SHADOWS.sm,
  },
  exportApptBtnLinked: { backgroundColor: '#e8f8f5', borderColor: '#2a9d8f' },
  exportApptIcon: { fontSize: 28 },
  exportApptTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#1a6b60' },
  exportApptSub: { fontSize: FONT_SIZES.xs, color: '#2a9d8f', marginTop: 2 },
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  modalCancelBtn: { minWidth: 60 },
  modalCancelText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  modalDoneBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: 6, minWidth: 60, alignItems: 'center',
  },
  modalDoneBtnDisabled: { opacity: 0.4 },
  modalDoneText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm, color: COLORS.textMid,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white,
  },
  modalScroll: { flex: 1 },
  apptCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  apptCardSelected: { borderColor: COLORS.purple, backgroundColor: '#f8f7ff' },
  apptCardLeft: { flex: 1 },
  apptCardTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  apptCardMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  apptCardBadge: { fontSize: FONT_SIZES.xs, color: '#2a9d8f', fontWeight: '600', marginTop: 4 },
  apptCheckbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.md,
  },
  apptCheckboxSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  apptCheckmark: { fontSize: 13, fontWeight: '800', color: COLORS.white },
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
