import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../../lib/theme';

const PROTOCOL_KEY = 'ap_potty_regression_protocol';

const WEEKS = [
  {
    week: 1,
    title: 'Week 1 — Stabilize & Identify',
    color: '#fff3e0',
    border: '#E65100',
    emoji: '🔍',
    goals: [
      'Return to a consistent timed schedule (every 2 hours, no exceptions)',
      'Identify the trigger — what changed? (school, routine, stress, illness, new sibling)',
      'Remove all pressure and shame from bathroom interactions',
      'Increase fluid intake (dehydration worsens regression)',
      'Notify school if regression is happening there too',
    ],
    avoid: [
      'Do NOT punish accidents — this worsens regression',
      'Do NOT reduce fluids to prevent accidents',
      'Do NOT skip scheduled sits even if child refuses',
      'Do NOT compare to previous progress ("you used to do this fine")',
    ],
  },
  {
    week: 2,
    title: 'Week 2 — Rebuild Routine',
    color: '#e8f5e9',
    border: '#2E7D32',
    emoji: '🔄',
    goals: [
      'Continue timed schedule — add a visual timer the child can see',
      'Reintroduce the reward system (sticker chart, token board)',
      'Add a preferred activity to bathroom sits (tablet, book, fidget)',
      'Check for constipation — address medically if needed',
      'Communicate with school about consistent approach',
    ],
    avoid: [
      'Do NOT skip rewards because "they used to do it without them"',
      'Do NOT increase expectations — match where the child is NOW',
      'Do NOT assume the regression is behavioral without ruling out medical causes',
    ],
  },
  {
    week: 3,
    title: 'Week 3 — Gradual Progress',
    color: '#e3f2fd',
    border: '#1565C0',
    emoji: '📈',
    goals: [
      'Slowly reduce the reward frequency (every other success, then every 3rd)',
      'Begin fading the timed schedule if child is self-initiating',
      'Address the underlying trigger directly (therapy, school meeting, routine change)',
      'Celebrate any self-initiation — even if unsuccessful',
      'Consider OT referral if regression persists beyond 3 weeks',
    ],
    avoid: [
      'Do NOT fade the schedule too quickly',
      'Do NOT assume the regression is "over" after one good week',
      'Do NOT delay seeking support if there is no improvement',
    ],
  },
];

const TRIGGERS = [
  { id: 'new-school', label: 'New school year or classroom change', category: 'School' },
  { id: 'new-teacher', label: 'New teacher or aide', category: 'School' },
  { id: 'school-bathroom', label: 'School bathroom issues (noise, smell, privacy)', category: 'School' },
  { id: 'bullying', label: 'Bullying or social stress at school', category: 'School' },
  { id: 'new-sibling', label: 'New sibling or family member', category: 'Family' },
  { id: 'move', label: 'Move to a new home', category: 'Family' },
  { id: 'divorce', label: 'Family change (divorce, separation)', category: 'Family' },
  { id: 'illness', label: 'Recent illness (especially GI illness)', category: 'Medical' },
  { id: 'constipation', label: 'Constipation or painful BM', category: 'Medical' },
  { id: 'medication', label: 'New medication or dosage change', category: 'Medical' },
  { id: 'routine-change', label: 'Change in daily routine or schedule', category: 'Routine' },
  { id: 'travel', label: 'Travel or vacation', category: 'Routine' },
  { id: 'unknown', label: 'Unknown — no obvious trigger', category: 'Other' },
];

export default function RegressionProtocolScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [regressionNotes, setRegressionNotes] = useState('');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [completedGoals, setCompletedGoals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(PROTOCOL_KEY).then(val => {
      if (val) {
        const d = JSON.parse(val);
        setSelectedTriggers(d.triggers || []);
        setRegressionNotes(d.notes || '');
        setCompletedGoals(d.goals || {});
      }
    });
  }, []);

  const save = async (triggers: string[], notes: string, goals: Record<string, boolean>) => {
    await AsyncStorage.setItem(PROTOCOL_KEY, JSON.stringify({ triggers, notes, goals }));
  };

  const toggleTrigger = (id: string) => {
    const updated = selectedTriggers.includes(id)
      ? selectedTriggers.filter(t => t !== id)
      : [...selectedTriggers, id];
    setSelectedTriggers(updated);
    save(updated, regressionNotes, completedGoals);
  };

  const toggleGoal = (key: string) => {
    const updated = { ...completedGoals, [key]: !completedGoals[key] };
    setCompletedGoals(updated);
    save(selectedTriggers, regressionNotes, updated);
  };

  const handleShare = async () => {
    const triggers = selectedTriggers.map(id => TRIGGERS.find(t => t.id === id)?.label).filter(Boolean);
    const text = `REGRESSION RESPONSE PROTOCOL\n\nIdentified Triggers:\n${triggers.length > 0 ? triggers.map(t => `• ${t}`).join('\n') : '• Not yet identified'}\n\nNotes:\n${regressionNotes || 'None'}\n\nGenerated by Autism Pathways`;
    await Share.share({ title: 'Regression Response Protocol', message: text });
  };

  const categories = [...new Set(TRIGGERS.map(t => t.category))];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regression Protocol</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🔄</Text>
          <Text style={styles.introTitle}>Regression Response Protocol</Text>
          <Text style={styles.introBody}>
            Regression is normal and does not mean you've failed. This 3-week protocol gives you a clear, calm plan for responding to a potty training regression — week by week, with specific goals and things to avoid.
          </Text>
        </View>

        <View style={styles.reassuranceCard}>
          <Text style={styles.reassuranceTitle}>First: Take a breath. 💜</Text>
          <Text style={styles.reassuranceBody}>
            Regression happens to almost every autistic child at some point. It is not a sign that your child "forgot" how to use the toilet — it is a sign that something in their environment or body has changed. Your job right now is to be a detective, not a disciplinarian.
          </Text>
        </View>

        {/* Trigger Identification */}
        <Text style={styles.sectionTitle}>Step 1 — Identify the Trigger</Text>
        <Text style={styles.sectionSubtitle}>Select any changes that happened around the time the regression started:</Text>
        {categories.map(cat => (
          <View key={cat} style={styles.triggerGroup}>
            <Text style={styles.triggerGroupTitle}>{cat}</Text>
            {TRIGGERS.filter(t => t.category === cat).map(trigger => (
              <TouchableOpacity
                key={trigger.id}
                style={[styles.triggerChip, selectedTriggers.includes(trigger.id) && styles.triggerChipSelected]}
                onPress={() => toggleTrigger(trigger.id)}
              >
                <Text style={[styles.triggerChipText, selectedTriggers.includes(trigger.id) && styles.triggerChipTextSelected]}>
                  {selectedTriggers.includes(trigger.id) ? '✓ ' : ''}{trigger.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Additional notes about the regression</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={regressionNotes}
            onChangeText={t => { setRegressionNotes(t); save(selectedTriggers, t, completedGoals); }}
            placeholder="When did it start? What does it look like? Any patterns?"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* 3-Week Protocol */}
        <Text style={styles.sectionTitle}>Step 2 — Follow the 3-Week Protocol</Text>
        {WEEKS.map(week => (
          <TouchableOpacity
            key={week.week}
            style={[styles.weekCard, { backgroundColor: week.color, borderLeftColor: week.border }]}
            onPress={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
            activeOpacity={0.85}
          >
            <View style={styles.weekHeader}>
              <Text style={styles.weekEmoji}>{week.emoji}</Text>
              <Text style={[styles.weekTitle, { color: week.border }]}>{week.title}</Text>
              <Text style={styles.chevron}>{expandedWeek === week.week ? '▲' : '▼'}</Text>
            </View>
            {expandedWeek === week.week && (
              <View style={styles.weekBody}>
                <Text style={[styles.weekSubtitle, { color: week.border }]}>✅ Goals this week:</Text>
                {week.goals.map((goal, i) => {
                  const key = `w${week.week}-g${i}`;
                  return (
                    <TouchableOpacity key={i} style={styles.goalRow} onPress={() => toggleGoal(key)}>
                      <View style={[styles.checkbox, completedGoals[key] && { backgroundColor: week.border, borderColor: week.border }]}>
                        {completedGoals[key] && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.goalText, completedGoals[key] && styles.goalTextDone]}>{goal}</Text>
                    </TouchableOpacity>
                  );
                })}
                <Text style={[styles.weekSubtitle, { color: '#e53e3e', marginTop: SPACING.md }]}>🚫 Avoid this week:</Text>
                {week.avoid.map((item, i) => (
                  <Text key={i} style={styles.avoidItem}>• {item}</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.whenToSeekCard}>
          <Text style={styles.whenTitle}>🚨 When to Seek Outside Support</Text>
          {[
            'Regression lasts more than 3–4 weeks with no improvement',
            'Child shows signs of pain or discomfort during bathroom attempts',
            'Regression is accompanied by significant behavioral changes',
            'You suspect constipation or a medical issue',
            'The regression is causing significant family stress',
          ].map((item, i) => (
            <Text key={i} style={styles.whenItem}>• {item}</Text>
          ))}
          <Text style={styles.whenFooter}>Consider referrals to: Pediatric GI, OT, PFPT, or a behavioral therapist specializing in autism.</Text>
        </View>

        <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare}>
          <Text style={styles.shareFullBtnText}>📤 Share Protocol Summary</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Autism Pathways · For personal use only · Not a substitute for professional support</Text>
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
    alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.card,
  },
  introEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.purple, textAlign: 'center', marginBottom: SPACING.sm },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  reassuranceCard: {
    backgroundColor: '#fff8e1', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: '#FF9800', marginBottom: SPACING.lg,
  },
  reassuranceTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#e65100', marginBottom: SPACING.xs },
  reassuranceBody: { fontSize: FONT_SIZES.sm, color: '#bf360c', lineHeight: 20 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 18 },
  triggerGroup: { marginBottom: SPACING.md },
  triggerGroupTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  triggerChip: {
    padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: '#fff', marginBottom: 6,
  },
  triggerChipSelected: { borderColor: COLORS.purple, backgroundColor: '#f0ebff' },
  triggerChipText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  triggerChipTextSelected: { color: COLORS.purple, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.card },
  fieldLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text, backgroundColor: '#fafafa',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  weekCard: {
    borderRadius: RADIUS.lg, borderLeftWidth: 4, padding: SPACING.md,
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  weekHeader: { flexDirection: 'row', alignItems: 'center' },
  weekEmoji: { fontSize: 20, marginRight: SPACING.sm },
  weekTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700' },
  chevron: { fontSize: 12, color: COLORS.textSecondary },
  weekBody: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: SPACING.md },
  weekSubtitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginBottom: SPACING.sm },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm, marginTop: 1, flexShrink: 0,
  },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  goalText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  goalTextDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  avoidItem: { fontSize: FONT_SIZES.sm, color: '#c53030', lineHeight: 22, marginBottom: 2 },
  whenToSeekCard: {
    backgroundColor: '#fff5f5', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: '#e53e3e', marginBottom: SPACING.lg,
  },
  whenTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#c53030', marginBottom: SPACING.sm },
  whenItem: { fontSize: FONT_SIZES.sm, color: '#c53030', lineHeight: 22, marginBottom: 2 },
  whenFooter: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, fontStyle: 'italic' },
  shareFullBtn: {
    backgroundColor: '#fff', borderRadius: RADIUS.full, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple,
  },
  shareFullBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.md },
  footer: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
});
