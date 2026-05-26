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
      { id: 'auto-toilet', label: 'Automatic toilet activating unexpectedly' },
      { id: 'hand-dryer', label: 'Hand dryer noise' },
      { id: 'echo', label: 'Echoey / reverberant acoustics' },
      { id: 'fan', label: 'Exhaust fan noise' },
      { id: 'water-pipes', label: 'Water pipe / gurgling sounds' },
      { id: 'multiple-sounds', label: 'Multiple bathroom sounds happening at once' },
      { id: 'other-sounds', label: 'Sounds from other rooms / hallway' },
    ],
    modifications: [
      'Use noise-cancelling headphones during bathroom time',
      'Use a white noise machine outside the door',
      'Allow the child to leave before flushing',
      'Play calming music or running water sounds to mask other noises',
      'Use a sticky note to cover the sensor on automatic toilets',
      'Bring paper towels or wipes instead of using hand dryers',
      'Warn child before flushing — never surprise them',
      'Practice flushing from a distance to reduce fear',
      'Let child flush using foot or tissue if fearful of the handle',
      'Use social stories or videos about public bathrooms to prepare',
      'Visit bathrooms during quieter times (avoid peak hours)',
      'Let child control flushing from a distance using a long object or string',
      'Keep bathroom fan off if the sound is distressing',
      'Turn off exhaust fan during use',
      'Add a soft bath mat to reduce echo',
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
      'Switch to scent-free bathroom products and unscented cleaners',
      'Remove all air fresheners',
      'Use ventilation fans or open the bathroom door/window',
      'Use essential oils or a preferred wall plug-in instead of sprays',
      'Wear a mask during bowel movements if odor is distressing',
      'Use toilet spray before bowel movements (e.g., Poo-Pourri)',
      'Flush during bowel movement if tolerated to reduce odor',
      'Keep trash emptied frequently',
      'Let child choose their preferred bathroom scent',
      'Use a small HEPA air purifier',
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
      { id: 'cold-seat', label: 'Cold or hard toilet seat' },
      { id: 'wiping', label: 'Discomfort or distress with wiping' },
      { id: 'urine-stool-skin', label: 'Feeling urine/stool on skin intensely' },
      { id: 'splash', label: 'Fear of splash from bowel movements' },
      { id: 'avoids-sitting', label: 'Avoids sitting fully on toilet' },
      { id: 'excessive-wiping', label: 'Excessive wiping or refusal to wipe' },
      { id: 'toilet-paper', label: 'Toilet paper texture' },
      { id: 'wet-floor', label: 'Wet or cold floor' },
      { id: 'clothing-removal', label: 'Discomfort removing clothing' },
      { id: 'hand-washing', label: 'Hand washing sensation (water temp, soap)' },
    ],
    modifications: [
      'Use a padded or soft toilet seat',
      'Warm the toilet seat before use',
      'Try wipes instead of toilet paper',
      'Experiment with different toilet paper options (ultra-soft, unscented)',
      'Place toilet paper in the bowl before bowel movements to reduce splash',
      'Wear loose, comfortable clothing for easier removal',
      'Wearing gloves while wiping if fear of mess is a barrier',
      'Use a bidet to eliminate toilet paper wiping entirely',
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
      { id: 'bright-lights', label: 'Bright or harsh overhead lights' },
      { id: 'flickering', label: 'Flickering fluorescent lights' },
      { id: 'reflections', label: 'Distressing reflections in mirrors' },
      { id: 'auto-lights', label: 'Distress with automatic motion-sensor lights' },
      { id: 'cluttered', label: 'Cluttered or visually busy space' },
      { id: 'fear-flush-visual', label: 'Fear of watching the flush' },
      { id: 'unfamiliar', label: 'Unfamiliar bathroom (school, public)' },
    ],
    modifications: [
      'Dim lighting or switch to warm LED bulbs',
      'Use natural lighting when possible',
      'Check for flickering lights using slo-mo video on your phone camera',
      'Use sunglasses or a hat for fluorescent lights',
      'Allow child to close the lid before flushing',
      'Cover mirrors temporarily if reflections are distressing',
      'Use night lights instead of overhead lights',
      'Declutter and simplify the visual space — neutral/simple décor',
      'Add a preferred visual (calming poster, favorite character)',
      'Create a "bathroom kit" for school/public use (familiar items)',
      'Practice visiting unfamiliar bathrooms with low pressure',
    ],
  },
  {
    id: 'postural',
    emoji: '🧘',
    title: 'Postural & Vestibular',
    color: '#e8eaf6',
    border: '#283593',
    triggers: [
      { id: 'unsafe-sitting', label: 'Feels unsafe or unstable sitting on toilet' },
      { id: 'fear-falling', label: 'Fear of falling in' },
      { id: 'stands-instead', label: 'Stands instead of sitting on toilet' },
      { id: 'fearful-posture', label: 'Fearful or rigid body posture on toilet' },
      { id: 'holds-walls', label: 'Needs to hold onto walls or surfaces' },
      { id: 'cant-relax', label: 'Difficulty relaxing enough to void' },
    ],
    modifications: [
      'Use a foot stool — knees should be above hip level for proper posture',
      'Use a toilet insert to reduce the opening size and increase security',
      'Add side handles or grab bars for stability',
      'Place a mirror in front of them so they can see where they are in space',
      'Use an adaptive toilet seat for better fit and security',
      'Try a smaller child-sized toilet if available',
      'Practice blowing activities (bubbles, pinwheels) to help relax the pelvic floor',
      'Allow child to sit backwards on the toilet if that feels more stable and safe',
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
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Sensory Audit</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}><Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>🏠 Dashboard</Text></TouchableOpacity>
        </View>
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
                        {(['yes', 'no', 'unsure'] as Reaction[]).map(r => {
                          const isActive = reactions[trigger.id] === r;
                          const activeStyle = isActive ? {
                            borderColor: r === 'yes' ? '#e53e3e' : r === 'no' ? '#2e7d5e' : '#FF9800',
                            backgroundColor: r === 'yes' ? '#fff5f5' : r === 'no' ? '#f0faf5' : '#fff8e1',
                          } : {};
                          return (
                          <TouchableOpacity
                            key={r}
                            style={[styles.reactionBtn, activeStyle]}
                            onPress={() => setReaction(trigger.id, r)}
                          >
                            <Text style={[styles.reactionBtnText, reactions[trigger.id] === r && styles.reactionBtnTextActive]}>
                              {r === 'yes' ? '✓ Yes' : r === 'no' ? '✗ No' : '? Maybe'}
                            </Text>
                          </TouchableOpacity>
                          );
                        })}
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
  shareBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.purple },
  shareBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: '#f8f4ff', borderRadius: RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  introEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.purple, textAlign: 'center', marginBottom: SPACING.sm },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  catCard: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOWS.sm },
  catHeader: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
    borderBottomWidth: 2,
  },
  catEmoji: { fontSize: 20, marginRight: SPACING.sm },
  catTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, marginRight: SPACING.sm },
  countBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  chevron: { fontSize: 12, color: COLORS.textLight },
  catBody: { backgroundColor: '#fff', padding: SPACING.md },
  triggerRow: { marginBottom: SPACING.md },
  triggerLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.xs, lineHeight: 18 },
  reactionBtns: { flexDirection: 'row', gap: 6 },
  reactionBtn: {
    paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.pill,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  reactionBtnText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  reactionBtnTextActive: { fontWeight: '700' as const },
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
    backgroundColor: '#fff', borderRadius: RADIUS.pill, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple,
  },
  shareFullBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.md },
  footer: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center' },
});
