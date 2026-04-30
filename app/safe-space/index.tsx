/**
 * Safe Space — Private Journal
 *
 * Fully free. No premium gate.
 *
 * Three views:
 *  - list:   all journal entries, newest first
 *  - editor: write / edit an entry (title, body, mood, prompts)
 *  - read:   read a saved entry with edit/delete actions
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Platform, Animated, KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORE_KEY = 'ap_journal_entries';

// ── Mood metadata ─────────────────────────────────────────────────────────────
const MOODS = [
  { key: 'hard',     emoji: '😔', label: 'Hard day',    bg: '#ffe0e0', color: '#c0392b' },
  { key: 'good',     emoji: '😊', label: 'Good moment', bg: '#d4edda', color: '#2e7d32' },
  { key: 'grateful', emoji: '💛', label: 'Grateful',    bg: '#fff9c4', color: '#a07800' },
  { key: 'angry',    emoji: '😤', label: 'Angry',       bg: '#fff0e0', color: '#c45a00' },
  { key: 'scared',   emoji: '😰', label: 'Scared',      bg: '#e0f0ff', color: '#1864ab' },
  { key: 'proud',    emoji: '🌟', label: 'Proud',       cls: '#f5e8fd', color: '#862e9c' },
];

// ── Writing prompts ───────────────────────────────────────────────────────────
const PROMPTS = [
  "What's weighing on me today...",
  "Something I'm proud of...",
  "What I wish someone understood...",
  "A win, no matter how small...",
  "What I need right now...",
  "Something that surprised me...",
  "What I want to remember...",
  "A moment that was hard but...",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
}

type View = 'list' | 'editor' | 'read';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function fmtDateFull(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function getMood(key: string | null) {
  return MOODS.find(m => m.key === key) ?? null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SafeSpaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [view, setView]             = useState<View>('list');
  const [entries, setEntries]       = useState<JournalEntry[]>([]);
  const [currentId, setCurrentId]   = useState<string | null>(null);
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [mood, setMood]             = useState<string | null>(null);
  const [toast, setToast]           = useState('');
  const toastTimer = useRef<any>(null);

  useFocusEffect(useCallback(() => {
    loadEntries();
  }, []));

  // ── Storage ────────────────────────────────────────────────────────────────
  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const persistEntries = async (updated: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
      setEntries(updated);
    } catch {
      showToast('Could not save — please try again.');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goList = () => {
    setView('list');
    loadEntries();
  };

  const openNewEntry = () => {
    setCurrentId(null);
    setTitle('');
    setBody('');
    setMood(null);
    setView('editor');
  };

  const openEditEntry = (entry: JournalEntry) => {
    setCurrentId(entry.id);
    setTitle(entry.title);
    setBody(entry.body);
    setMood(entry.mood);
    setView('editor');
  };

  const openReadEntry = (entry: JournalEntry) => {
    setCurrentId(entry.id);
    setView('read');
  };

  const confirmDiscard = () => {
    if (title.trim() || body.trim()) {
      Alert.alert(
        'Discard Entry?',
        'Your writing will be lost.',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: goList },
        ]
      );
    } else {
      goList();
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveEntry = async () => {
    if (!title.trim() && !body.trim()) {
      showToast('Write something first.');
      return;
    }
    const now = new Date().toISOString();
    let updated: JournalEntry[];

    if (currentId) {
      updated = entries.map(e =>
        e.id === currentId
          ? { ...e, title: title.trim() || 'Untitled', body, mood, updatedAt: now }
          : e
      );
    } else {
      const newEntry: JournalEntry = {
        id:        `j_${Date.now()}`,
        title:     title.trim() || 'Untitled',
        body,
        mood,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newEntry, ...entries]; // newest first
    }

    await persistEntries(updated);
    showToast('Entry saved 🔒');
    goList();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteEntry = (id: string) => {
    Alert.alert(
      'Delete Entry?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = entries.filter(e => e.id !== id);
            await persistEntries(updated);
            showToast('Entry deleted.');
            goList();
          },
        },
      ]
    );
  };

  // ── Use prompt ─────────────────────────────────────────────────────────────
  const usePrompt = (prompt: string) => {
    const prefix = body.trim() ? body + '\n\n' : '';
    setBody(prefix + prompt + '\n\n');
  };

  // ── Render: List ───────────────────────────────────────────────────────────
  const renderList = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safe Space</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.rainbow} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconText}>📓</Text>
          </View>
          <Text style={styles.bannerEyebrow}>Private Journal</Text>
          <Text style={styles.bannerTitle}>Your <Text style={styles.bannerTitlePurple}>Safe Space</Text></Text>
          <Text style={styles.bannerSub}>
            This is just for you. Write anything — the hard days, the wins, the things you can't say out loud.
          </Text>
          <View style={styles.privacyBadge}>
            <Text style={styles.privacyBadgeText}>🔒 Stored only on your device</Text>
          </View>
        </View>

        {/* Section heading */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionHeadingText}>My Journal ({entries.length} total)</Text>
        </View>

        {/* New entry button */}
        <TouchableOpacity style={styles.newEntryBtn} onPress={openNewEntry} activeOpacity={0.8}>
          <Text style={styles.newEntryBtnText}>✏️ New Entry</Text>
        </TouchableOpacity>

        {/* Entries */}
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📓</Text>
            <Text style={styles.emptyTitle}>Your journal is empty</Text>
            <Text style={styles.emptySub}>
              This is a private space just for you. Write anything — the hard days, the wins, the things you can't say out loud.
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {entries.map(entry => {
              const m = getMood(entry.mood);
              const preview = entry.body.replace(/\n/g, ' ').trim();
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryCard}
                  onPress={() => openReadEntry(entry)}
                  activeOpacity={0.85}
                >
                  <View style={styles.ecTop}>
                    <Text style={styles.ecTitle} numberOfLines={2}>{entry.title || 'Untitled'}</Text>
                    <Text style={styles.ecLock}>🔒</Text>
                  </View>
                  <Text style={styles.ecDate}>{fmtDate(entry.createdAt)}</Text>
                  <Text style={styles.ecPreview} numberOfLines={2}>{preview}</Text>
                  <View style={styles.ecFooter}>
                    {m ? (
                      <View style={[styles.moodTag, { backgroundColor: m.bg }]}>
                        <Text style={[styles.moodTagText, { color: m.color }]}>{m.emoji} {m.label}</Text>
                      </View>
                    ) : <View />}
                    <Text style={styles.ecRead}>Read →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );

  // ── Render: Editor ─────────────────────────────────────────────────────────
  const renderEditor = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={confirmDiscard} style={styles.backBtn}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentId ? 'Edit Entry' : 'New Entry'}</Text>
        <TouchableOpacity style={styles.saveHeaderBtn} onPress={saveEntry}>
          <Text style={styles.saveHeaderBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rainbow} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.editorScroll}
      >
        {/* Date */}
        <Text style={styles.editorDate}>
          📅 <Text style={styles.editorDatePurple}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          {'  ·  '}
          <Text style={styles.editorPrivate}>🔒 Private</Text>
        </Text>

        {/* Title */}
        <TextInput
          style={styles.editorTitle}
          placeholder="Entry title..."
          placeholderTextColor="#c4b8f0"
          value={title}
          onChangeText={setTitle}
          multiline={false}
          returnKeyType="next"
        />

        {/* Body */}
        <TextInput
          style={styles.editorBody}
          placeholder="Write anything — this is just for you..."
          placeholderTextColor="#c4b8f0"
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />

        {/* Word count */}
        <Text style={styles.wordCount}>{wordCount(body)} words</Text>

        {/* Mood chips */}
        <View style={styles.moodSection}>
          <Text style={styles.moodLabel}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => {
              const selected = mood === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodChip,
                    selected && { backgroundColor: m.bg, borderColor: m.color },
                  ]}
                  onPress={() => setMood(selected ? null : m.key)}
                >
                  <Text style={styles.moodChipEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodChipLabel, selected && { color: m.color, fontWeight: '700' }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Writing prompts */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>Need a nudge?</Text>
          <View style={styles.promptChips}>
            {PROMPTS.map((p, i) => (
              <TouchableOpacity key={i} style={styles.promptChip} onPress={() => usePrompt(p)}>
                <Text style={styles.promptChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── Render: Read ───────────────────────────────────────────────────────────
  const renderRead = () => {
    const entry = entries.find(e => e.id === currentId);
    if (!entry) { goList(); return null; }
    const m = getMood(entry.mood);

    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={goList} style={styles.backBtn}>
            <Text style={styles.backText}>← My Journal</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Entry</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.rainbow} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.readScroll}>
          {/* Reading header */}
          <View style={styles.readingHeader}>
            <Text style={styles.readingDate}>{fmtDateFull(entry.createdAt)}</Text>
            <Text style={styles.readingTitle}>{entry.title || 'Untitled'}</Text>
            {m ? (
              <View style={[styles.moodTag, { backgroundColor: m.bg, marginTop: SPACING.sm }]}>
                <Text style={[styles.moodTagText, { color: m.color }]}>{m.emoji} {m.label}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.readingDivider} />

          {/* Body */}
          <Text style={styles.readingBody}>{entry.body}</Text>

          {/* Coming soon: share anonymously */}
          <View style={styles.shareSection}>
            <View style={styles.shareSectionHeader}>
              <Text style={styles.shareSectionTitle}>Share with the community</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
            <Text style={styles.shareSectionSub}>
              When the community forum launches, you'll be able to share entries anonymously so other parents know they're not alone. Your name is never shown.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.entryActions}>
            <TouchableOpacity
              style={styles.entryActionBtn}
              onPress={() => openEditEntry(entry)}
            >
              <Text style={styles.entryActionBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.entryActionBtn, styles.entryActionBtnDanger]}
              onPress={() => deleteEntry(entry.id)}
            >
              <Text style={[styles.entryActionBtnText, { color: COLORS.errorText }]}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {view === 'list'   && renderList()}
      {view === 'editor' && renderEditor()}
      {view === 'read'   && renderRead()}

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs, minWidth: 60 },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  saveHeaderBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  saveHeaderBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },

  rainbow: { height: 4, backgroundColor: COLORS.purple },

  // Banner
  banner: {
    backgroundColor: COLORS.lavender,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bannerIcon: {
    width: 60, height: 60,
    backgroundColor: COLORS.purpleLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  bannerIconText: { fontSize: 28 },
  bannerEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: COLORS.purple, marginBottom: 4 },
  bannerTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, marginBottom: SPACING.xs },
  bannerTitlePurple: { color: COLORS.purple },
  bannerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  privacyBadge: { marginTop: SPACING.sm },
  privacyBadgeText: { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },

  // Section heading
  sectionHeading: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionHeadingText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: COLORS.textLight },

  // New entry button
  newEntryBtn: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newEntryBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl, paddingHorizontal: SPACING.xl },
  emptyIcon: { fontSize: 40, opacity: 0.4, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 280 },

  // Entry list
  entriesList: { paddingHorizontal: SPACING.lg },
  entryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  ecTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  ecTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 21, paddingRight: SPACING.sm },
  ecLock: { fontSize: 12, color: COLORS.border },
  ecDate: { fontSize: 11, color: COLORS.textLight, fontWeight: '500', marginBottom: 6 },
  ecPreview: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  ecFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  ecRead: { fontSize: 12, fontWeight: '600', color: COLORS.purple },

  // Mood tag
  moodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  moodTagText: { fontSize: 11, fontWeight: '600' },

  // Editor
  editorScroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  editorDate: { fontSize: 12, color: COLORS.textLight, fontWeight: '500', marginBottom: SPACING.lg },
  editorDatePurple: { color: COLORS.purple, fontWeight: '600' },
  editorPrivate: { color: COLORS.textLight },
  editorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.lg,
  },
  editorBody: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 26,
    minHeight: 200,
  },
  wordCount: { fontSize: 11, color: COLORS.textLight, textAlign: 'right', marginTop: SPACING.sm, marginBottom: SPACING.xl },

  // Mood section
  moodSection: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  moodLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: COLORS.textLight, marginBottom: SPACING.md },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  moodChipEmoji: { fontSize: 14 },
  moodChipLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textMid },

  // Prompt section
  promptSection: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  promptLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: COLORS.textLight, marginBottom: SPACING.md },
  promptChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  promptChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  promptChipText: { fontSize: 12, fontWeight: '500', color: COLORS.textMid },

  // Read view
  readScroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  readingHeader: { marginBottom: SPACING.lg },
  readingDate: { fontSize: 12, color: COLORS.textLight, fontWeight: '500', marginBottom: SPACING.sm },
  readingTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, lineHeight: 30 },
  readingDivider: { height: 2, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  readingBody: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 26, marginBottom: SPACING.xl },

  // Share section (coming soon)
  shareSection: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  shareSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  shareSectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  comingSoonBadge: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  comingSoonText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  shareSectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },

  // Entry actions
  entryActions: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  entryActionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  entryActionBtnDanger: { borderColor: COLORS.errorBorder },
  entryActionBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    ...SHADOWS.md,
  },
  toastText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '600' },
});
