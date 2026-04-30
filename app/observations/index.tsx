import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';

export const OBS_KEY = 'ap_observations';
export const IEP_FLAGGED_KEY = 'ap_iep_flagged_obs';

export interface Observation {
  id: string;
  date: string;
  mood: string;
  summary: string;
  tags: string[];
  environment: string;
  triggers: string[];
  duration: string;
  intensity: string;
  support: string;
  helped: string;
  notes: string;
  iepFlag: boolean;
  savedAt: string;
}

const MOOD_COLORS: Record<string, string> = {
  'Calm': '#8DD4B5',
  'Happy': '#E6D87A',
  'Anxious': '#8EC5FF',
  'Frustrated': '#F0A0A0',
  'Dysregulated': '#F0B89A',
  'Other': '#C8C0F0',
};

const MOOD_EMOJIS: Record<string, string> = {
  'Calm': '😌',
  'Happy': '😄',
  'Anxious': '😟',
  'Frustrated': '😤',
  'Dysregulated': '🌀',
  'Other': '✏️',
};

function fmtDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function detectPatterns(entries: Observation[]): { icon: string; text: string }[] {
  if (entries.length < 3) return [];
  const insights: { icon: string; text: string }[] = [];

  // Mood pattern
  const recent5 = entries.slice(0, 5);
  const negMoods = recent5.filter((e) => e.mood === 'Frustrated' || e.mood === 'Dysregulated').length;
  if (negMoods >= 3) {
    insights.push({ icon: '⚠️', text: `Difficult days in ${negMoods} of the last 5 entries — consider tracking triggers more closely.` });
  }

  // Tag frequency
  const tagCount: Record<string, number> = {};
  entries.slice(0, 14).forEach((e) => {
    (e.tags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; });
  });
  Object.entries(tagCount)
    .filter(([, v]) => v >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([tag, count]) => {
      insights.push({ icon: '📌', text: `"${tag}" has appeared ${count} times in the last 2 weeks.` });
    });

  // Trigger frequency
  const trigCount: Record<string, number> = {};
  entries.slice(0, 14).forEach((e) => {
    (e.triggers || []).forEach((t) => { trigCount[t] = (trigCount[t] || 0) + 1; });
  });
  Object.entries(trigCount)
    .filter(([, v]) => v >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([trig, count]) => {
      insights.push({ icon: '🔍', text: `"${trig}" appears as a trigger ${count} times recently.` });
    });

  // IEP flag count
  const flagged = entries.filter((e) => e.iepFlag).length;
  if (flagged > 0) {
    insights.push({ icon: '📌', text: `${flagged} observation${flagged > 1 ? 's' : ''} flagged for your next IEP meeting.` });
  }

  return insights;
}

export default function ObservationsHomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<Observation[]>([]);

  const loadEntries = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(OBS_KEY);
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadEntries(); }, [loadEntries]));

  const toggleIepFlag = async (savedAt: string) => {
    const updated = entries.map((e) =>
      e.savedAt === savedAt ? { ...e, iepFlag: !e.iepFlag } : e
    );
    await AsyncStorage.setItem(OBS_KEY, JSON.stringify(updated));
    const flagged = updated.filter((e) => e.iepFlag);
    await AsyncStorage.setItem(IEP_FLAGGED_KEY, JSON.stringify(flagged));
    setEntries(updated);
  };

  const deleteEntry = async (savedAt: string) => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = entries.filter((e) => e.savedAt !== savedAt);
          await AsyncStorage.setItem(OBS_KEY, JSON.stringify(updated));
          setEntries(updated);
        },
      },
    ]);
  };

  const patterns = detectPatterns(entries);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.backBtn}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Autism <Text style={styles.headerPurple}>Pathways</Text>
        </Text>
        <View style={{ width: 90 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroAccent} />
          <Text style={styles.heroEyebrow}>Daily Log</Text>
          <Text style={styles.heroTitle}>Observations</Text>
          <Text style={styles.heroSub}>
            Track patterns, behaviors, and daily moments to better understand your child's needs — at your own pace, in your own words.
          </Text>
          <View style={styles.heroHint}>
            <Text style={styles.heroHintText}>💡 You don't need to fill everything out — just capture what feels important.</Text>
          </View>
        </View>

        {/* Log Today CTA */}
        <TouchableOpacity style={styles.logBtn} onPress={() => router.push('/observations/new-entry')} activeOpacity={0.85}>
          <Text style={styles.logBtnText}>✨ Log an Observation</Text>
        </TouchableOpacity>

        {/* Provider Prep link */}
        <TouchableOpacity style={styles.prepBtn} onPress={() => router.push('/provider-prep')} activeOpacity={0.85}>
          <Text style={styles.prepBtnText}>🩺 Provider Prep →</Text>
        </TouchableOpacity>

        {/* Pattern insights */}
        {patterns.length > 0 && (
          <View style={styles.patternCard}>
            <Text style={styles.patternHeading}>🧠 Patterns Detected</Text>
            {patterns.map((p, i) => (
              <View key={i} style={[styles.patternRow, i < patterns.length - 1 && styles.patternRowBorder]}>
                <Text style={styles.patternIcon}>{p.icon}</Text>
                <Text style={styles.patternText}>{p.text}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push('/provider-prep')}>
              <Text style={styles.patternLink}>📌 Add to IEP meeting prep →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent entries */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionAccentMint} />
          <Text style={styles.sectionEyebrow}>History</Text>
          <Text style={styles.sectionTitle}>Recent Observations</Text>
          <Text style={styles.sectionDesc}>Your last few entries — helpful for spotting patterns over time.</Text>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No observations logged yet.</Text>
              <Text style={styles.emptySubtext}>Your saved entries will appear here.</Text>
            </View>
          ) : (
            entries.slice(0, 8).map((entry) => (
              <View key={entry.savedAt} style={styles.entryCard}>
                <View style={[styles.entryDot, { backgroundColor: MOOD_COLORS[entry.mood] || MOOD_COLORS['Other'] }]} />
                <View style={styles.entryContent}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{fmtDate(entry.date)}</Text>
                    {entry.mood ? (
                      <View style={styles.entryMoodBadge}>
                        <Text style={styles.entryMoodText}>{MOOD_EMOJIS[entry.mood] || ''} {entry.mood}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.entryText} numberOfLines={2}>
                    {entry.summary || <Text style={{ fontStyle: 'italic', color: COLORS.textLight }}>No description</Text>}
                  </Text>
                  {entry.tags.length > 0 && (
                    <View style={styles.entryTags}>
                      {entry.tags.map((tag) => (
                        <View key={tag} style={styles.entryTag}>
                          <Text style={styles.entryTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={[styles.iepBtn, entry.iepFlag && styles.iepBtnActive]}
                      onPress={() => toggleIepFlag(entry.savedAt)}
                    >
                      <Text style={[styles.iepBtnText, entry.iepFlag && styles.iepBtnTextActive]}>
                        📌 {entry.iepFlag ? 'Flagged for IEP' : 'Flag for IEP'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteEntry(entry.savedAt)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
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
    paddingTop: 56,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 90 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  // Hero
  heroCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  heroAccent: {
    height: 4,
    backgroundColor: COLORS.lavenderAccent,
    // rainbow gradient simulation via multiple views would be complex; use lavender accent
  },
  heroEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  heroHint: {
    margin: SPACING.lg,
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.yellowAccent,
  },
  heroHintText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 18 },

  // CTAs
  logBtn: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  logBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  prepBtn: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.mintAccent,
  },
  prepBtnText: { color: COLORS.successText, fontWeight: '700', fontSize: FONT_SIZES.sm },

  // Patterns
  patternCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  patternHeading: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  patternRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  patternRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lavenderAccent },
  patternIcon: { fontSize: 14 },
  patternText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 19 },
  patternLink: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple, marginTop: SPACING.sm },

  // Section card
  sectionCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionAccentMint: { height: 4, backgroundColor: COLORS.mintAccent },
  sectionEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  sectionDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg },
  emptyIcon: { fontSize: 32, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.base, color: COLORS.textMid, fontWeight: '600' },
  emptySubtext: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: SPACING.xs },

  // Entry cards
  entryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  entryDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, flexShrink: 0 },
  entryContent: { flex: 1 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.xs },
  entryDate: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  entryMoodBadge: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  entryMoodText: { fontSize: 11, fontWeight: '600', color: COLORS.purpleDark },
  entryText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 19 },
  entryTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },
  entryTag: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  entryTagText: { fontSize: 11, color: COLORS.textMid },
  entryActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  iepBtn: {
    backgroundColor: COLORS.bg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
  },
  iepBtnActive: { backgroundColor: COLORS.mint, borderColor: COLORS.mintAccent },
  iepBtnText: { fontSize: 11, fontWeight: '600', color: COLORS.textLight },
  iepBtnTextActive: { color: COLORS.successText },
  deleteBtn: { padding: SPACING.xs },
  deleteBtnText: { fontSize: 16 },

  rainbowBar: {
    height: 4,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 2,
    backgroundColor: COLORS.purple,
    opacity: 0.3,
  },
});
