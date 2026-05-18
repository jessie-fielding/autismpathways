import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../../lib/theme';

const AUDIT_KEY = 'ap_potty_sensory_audit';

type Reaction = 'yes' | 'no' | 'unsure';

const CATEGORIES = [
  {
    id: 'sound',
    emoji: '🔊',
    title: 'Sound',
    color: '#e3f2fd',
    border: '#1565C0',
    triggers: [
      { id: 'toilet-flush', label: 'Toilet flushing sound' },
      { id: 'echo', label: 'Echoey / reverberant acoustics' },
      { id: 'fan', label: 'Exhaust fan noise' },
      { id: 'water-pipes', label: 'Water pipe sounds' },
      { id: 'other-sounds', label: 'Sounds from other rooms / hallway' },
    ],
    modifications: [
      'Flush after leaving the bathroom (not while sitting)',
      'Turn off exhaust fan during use',
      'Add a soft bath mat to reduce echo',
      'Use white noise machine outside the door',
      'Let child wear noise-canceling headphones during bathroom time',
    ],
  },
  {
    id: 'light',
    emoji: '💡',
    title: 'Light',
    color: '#fffde7',
    border: '#F57F17',
    triggers: [
      { id: 'bright-overhead', label: 'Bright overhead lighting' },
      { id: 'fluorescent', label: 'Fluorescent / flickering lights' },
      { id: 'no-window', label: 'No natural light (feels closed in)' },
      { id: 'harsh-contrast', label: 'Harsh contrast between light/dark areas' },
    ],
    modifications: [
      'Switch to warm LED bulbs (2700K)',
      'Add a dimmer switch',
      'Use a nightlight instead of overhead light',
      'Add a small window film for diffused natural light',
      'Let child control the light switch themselves',
    ],
  },
  {
    id: 'smell',
    emoji: '👃',
    title: 'Smell',
    color: '#f3e5f5',
    border: '#7B1FA2',
    triggers: [
      { id: 'cleaning-products', label: 'Cleaning product smells (bleach, pine)' },
      { id: 'air-freshener', label: 'Air freshener / artificial scents' },
      { id: 'general-odor', label: 'General bathroom odor' },
      { id: 'mold-mildew', label: 'Mold or mildew smell' },
    ],
    modifications: [
      'Switch to unscented cleaning products',
      'Remove all air fresheners',
      'Use a small HEPA air purifier',
      'Ensure good ventilation (fan or window)',
      'Clean more frequently with baking soda / vinegar',
    ],
  },
  {
    id: 'touch',
    emoji: '✋',
    title: 'Touch & Texture',
    color: '#e8f5e9',
    border: '#2E7D32',
    triggers: [
      { id: 'cold-seat', label: 'Cold toilet seat' },
      { id: 'toilet-paper', label: 'Toilet paper texture' },
      { id: 'wet-floor', label: 'Wet or cold floor' },
      { id: 'clothing-removal', label: 'Discomfort removing clothing' },
      { id: 'hand-washing', label: 'Hand washing sensation (water temp, soap)' },
    ],
    modifications: [
      'Add a padded or heated toilet seat cover',
      'Try different toilet paper brands (ultra-soft, unscented)',
      'Add a bath mat with preferred texture',
      'Practice clothing removal in a low-pressure setting',
      'Adjust water temperature before child washes hands',
    ],
  },
  {
    id: 'temperature',
    emoji: '🌡️',
    title: 'Temperature',
    color: '#fff3e0',
    border: '#E65100',
    triggers: [
      { id: 'cold-room', label: 'Room feels cold' },
      { id: 'cold-water', label: 'Cold water for handwashing' },
      { id: 'drafts', label: 'Drafts from vents or windows' },
    ],
    modifications: [
      'Add a small space heater (safely mounted)',
      'Pre-run warm water before child enters',
      'Add a warm towel or robe nearby',
      'Seal drafts around windows and vents',
    ],
  },
  {
    id: 'visual',
    emoji: '👁️',
    title: 'Visual Environment',
    color: '#fce4ec',
    border: '#C62828',
    triggers: [
      { id: 'cluttered', label: 'Cluttered or visually busy space' },
      { id: 'mirrors', label: 'Large mirrors (overwhelming reflection)' },
      { id: 'patterns', label: 'Busy tile patterns or wallpaper' },
      { id: 'unfamiliar', label: 'Unfamiliar bathroom (school, public)' },
    ],
    modifications: [
      'Declutter and simplify the visual space',
      'Cover or remove large mirrors temporarily',
      'Add a preferred visual (calming poster, favorite character)',
      'Create a "bathroom kit" for school/public use (familiar items)',
      'Practice visiting unfamiliar bathrooms with low pressure',
    ],
  },
];

export default function SensoryAuditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>('sound');
  const [showModifications, setShowModifications] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(AUDIT_KEY).then(val => {
      if (val) setReactions(JSON.parse(val));
    });
  }, []);

  const setReaction = async (triggerId: string, reaction: Reaction) => {
    const updated = { ...reactions, [triggerId]: reaction };
    setReactions(updated);
    await AsyncStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  };

  const getTriggeredCount = (cat: typeof CATEGORIES[0]) =>
    cat.triggers.filter(t => reactions[t.id] === 'yes').length;

  const handleShare = async () => {
    const triggered = CATEGORIES.flatMap(cat =>
      cat.triggers.filter(t => reactions[t.id] === 'yes').map(t => `${cat.emoji} ${t.label}`)
    );
    const text = triggered.length > 0
      ? `SENSORY AUDIT RESULTS\n\nIdentified triggers:\n${triggered.map(t => `• ${t}`).join('\n')}\n\nGenerated by Autism Pathways`
      : 'SENSORY AUDIT RESULTS\n\nNo triggers identified yet. Complete the audit to see results.';
    await Share.share({ title: 'Sensory Audit — Autism Pathways', message: text });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sensory Audit</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>📋</Text>
          <Text style={styles.introTitle}>Bathroom Sensory Audit Checklist</Text>
          <Text style={styles.introBody}>
            Go through your bathroom and mark which sensory elements bother your child. Then tap "See Modifications" for specific changes you can make. Your answers are saved automatically.
          </Text>
        </View>

        {CATEGORIES.map(cat => {
          const count = getTriggeredCount(cat);
          return (
            <View key={cat.id} style={styles.catCard}>
              <TouchableOpacity
                style={[styles.catHeader, { backgroundColor: cat.color, borderBottomColor: cat.border }]}
                onPress={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catTitle, { color: cat.border }]}>{cat.title}</Text>
                {count > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: cat.border }]}>
                    <Text style={styles.countBadgeText}>{count} trigger{count > 1 ? 's' : ''}</Text>
                  </View>
                )}
                <Text style={styles.chevron}>{expandedCategory === cat.id ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedCategory === cat.id && (
                <View style={styles.catBody}>
                  {cat.triggers.map(trigger => (
                    <View key={trigger.id} style={styles.triggerRow}>
                      <Text style={styles.triggerLabel}>{trigger.label}</Text>
                      <View style={styles.reactionBtns}>
                        {(['yes', 'no', 'unsure'] as Reaction[]).map(r => (
                          <TouchableOpacity
                            key={r}
                            style={[styles.reactionBtn, reactions[trigger.id] === r && styles.reactionBtnActive(r)]}
                            onPress={() => setReaction(trigger.id, r)}
                          >
                            <Text style={[styles.reactionBtnText, reactions[trigger.id] === r && styles.reactionBtnTextActive]}>
                              {r === 'yes' ? '✓ Yes' : r === 'no' ? '✗ No' : '? Maybe'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}

                  {count > 0 && (
                    <TouchableOpacity
                      style={[styles.modBtn, { borderColor: cat.border }]}
                      onPress={() => setShowModifications(showModifications === cat.id ? null : cat.id)}
                    >
                      <Text style={[styles.modBtnText, { color: cat.border }]}>
                        {showModifications === cat.id ? '▲ Hide' : '▼ See'} Modifications for {cat.title}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {showModifications === cat.id && (
                    <View style={[styles.modList, { borderLeftColor: cat.border }]}>
                      <Text style={[styles.modTitle, { color: cat.border }]}>Suggested Modifications</Text>
                      {cat.modifications.map((mod, i) => (
                        <Text key={i} style={styles.modItem}>• {mod}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare}>
          <Text style={styles.shareFullBtnText}>📤 Share Audit Results</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Autism Pathways · For personal use only · Not a substitute for OT evaluation</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  shareBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.purple },
  shareBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: '#f8f4ff', borderRadius: RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.lg, ...SHADOWS.card,
  },
  introEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.purple, textAlign: 'center', marginBottom: SPACING.sm },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  catCard: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOWS.card },
  catHeader: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
    borderBottomWidth: 2,
  },
  catEmoji: { fontSize: 20, marginRight: SPACING.sm },
  catTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, marginRight: SPACING.sm },
  countBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  chevron: { fontSize: 12, color: COLORS.textSecondary },
  catBody: { backgroundColor: '#fff', padding: SPACING.md },
  triggerRow: { marginBottom: SPACING.md },
  triggerLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.xs, lineHeight: 18 },
  reactionBtns: { flexDirection: 'row', gap: 6 },
  reactionBtn: {
    paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  reactionBtnActive: (r: Reaction) => ({
    borderColor: r === 'yes' ? '#e53e3e' : r === 'no' ? '#2e7d5e' : '#FF9800',
    backgroundColor: r === 'yes' ? '#fff5f5' : r === 'no' ? '#f0faf5' : '#fff8e1',
  }),
  reactionBtnText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  reactionBtnTextActive: { fontWeight: '700' },
  modBtn: {
    marginTop: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md,
    borderWidth: 1.5, alignItems: 'center',
  },
  modBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  modList: {
    marginTop: SPACING.sm, borderLeftWidth: 3, paddingLeft: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginBottom: SPACING.sm },
  modItem: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22, marginBottom: 2 },
  shareFullBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.full, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple,
  },
  shareFullBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.md },
  footer: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
});
