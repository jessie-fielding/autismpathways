import { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import type { Situation, Location, Intensity } from '../../lib/parentingStrategies';

const SITUATIONS: { id: Situation; emoji: string; label: string }[] = [
  { id: 'meltdown',   emoji: '🌊', label: 'Meltdown' },
  { id: 'aggression', emoji: '💥', label: 'Aggression' },
  { id: 'refusal',    emoji: '🚫', label: 'Refusal' },
  { id: 'sensory',    emoji: '🔊', label: 'Sensory\nOverload' },
  { id: 'shutdown',   emoji: '🔇', label: 'Shutdown' },
  { id: 'anxiety',    emoji: '😰', label: 'Anxiety' },
  { id: 'transition', emoji: '🔄', label: 'Transition' },
  { id: 'other',      emoji: '❓', label: 'Other' },
];

const LOCATIONS: { id: Location; emoji: string; label: string }[] = [
  { id: 'home',   emoji: '🏠', label: 'Home' },
  { id: 'school', emoji: '🏫', label: 'School' },
  { id: 'public', emoji: '🛒', label: 'Public' },
  { id: 'car',    emoji: '🚗', label: 'Car' },
];

const INTENSITIES: { id: Intensity; emoji: string; label: string; sub: string; color: string }[] = [
  { id: 'building', emoji: '🟡', label: 'Building',          sub: 'Starting to escalate',    color: '#F5A623' },
  { id: 'full',     emoji: '🟠', label: 'Full',              sub: 'In the middle of it',      color: '#E8700D' },
  { id: 'unsafe',   emoji: '🔴', label: 'Escalating to\nunsafe', sub: 'Risk of harm',         color: '#C0392B' },
];

const UNSAFE_SITUATIONS: Situation[] = ['aggression', 'meltdown', 'other'];

export default function ParentingPathwaysQuiz() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [situation, setSituation] = useState<Situation | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const canSubmit = situation !== null && location !== null && intensity !== null;

  function handleIntensitySelect(id: Intensity) {
    setIntensity(id);
    if (id === 'unsafe') {
      setShowSafetyModal(true);
    }
  }

  function handleGetStrategies() {
    if (!canSubmit) return;
    router.push({
      pathname: '/parenting-pathways/results',
      params: { situation, location, intensity },
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What's happening?</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Q1: Situation */}
        <Text style={styles.questionLabel}>What is happening?</Text>
        <View style={styles.tileGrid}>
          {SITUATIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.tile, situation === s.id && styles.tileSelected]}
              onPress={() => setSituation(s.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.tileEmoji}>{s.emoji}</Text>
              <Text style={[styles.tileLabel, situation === s.id && styles.tileLabelSelected]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Q2: Location */}
        <Text style={styles.questionLabel}>Where are you?</Text>
        <View style={styles.pillRow}>
          {LOCATIONS.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.pill, location === l.id && styles.pillSelected]}
              onPress={() => setLocation(l.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.pillEmoji}>{l.emoji}</Text>
              <Text style={[styles.pillLabel, location === l.id && styles.pillLabelSelected]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Q3: Intensity */}
        <Text style={styles.questionLabel}>How intense is it right now?</Text>
        <View style={styles.intensityCol}>
          {INTENSITIES.map((i) => (
            <TouchableOpacity
              key={i.id}
              style={[
                styles.intensityBtn,
                intensity === i.id && { borderColor: i.color, backgroundColor: `${i.color}15` },
              ]}
              onPress={() => handleIntensitySelect(i.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.intensityEmoji}>{i.emoji}</Text>
              <View style={styles.intensityText}>
                <Text style={[styles.intensityLabel, intensity === i.id && { color: i.color }]}>
                  {i.label}
                </Text>
                <Text style={styles.intensitySub}>{i.sub}</Text>
              </View>
              {intensity === i.id && (
                <View style={[styles.intensityCheck, { backgroundColor: i.color }]}>
                  <Text style={styles.intensityCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleGetStrategies}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>⚡ Get Strategies Now</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + SPACING.xxxl }} />
      </ScrollView>

      {/* Safety Modal */}
      <Modal
        visible={showSafetyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSafetyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🆘</Text>
            <Text style={styles.modalTitle}>This sounds serious</Text>
            <Text style={styles.modalBody}>
              When a child is escalating to unsafe behavior — risk of harm to themselves or others —
              you don't have to handle it alone.
            </Text>

            <View style={styles.modalOption}>
              <Text style={styles.modalOptionTitle}>📞 Call 988</Text>
              <Text style={styles.modalOptionBody}>
                The 988 Suicide & Crisis Lifeline also supports families in behavioral crises. Trained
                counselors can help you de-escalate right now — without sending police unless you ask.
                Many parents worry that calling 911 will traumatize their child. 988 is a safe first
                call that keeps your family in control of what happens next.
              </Text>
              <TouchableOpacity
                style={styles.modalLinkBtn}
                onPress={() => Linking.openURL('tel:988')}
              >
                <Text style={styles.modalLinkBtnText}>Call 988 Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalOption}>
              <Text style={styles.modalOptionTitle}>🚨 Call 911</Text>
              <Text style={styles.modalOptionBody}>
                If there is immediate physical danger that you cannot safely manage, call 911. You can
                tell the dispatcher your child has autism — many areas have Crisis Intervention Team
                (CIT) officers trained to respond.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalLearnMore}
              onPress={() => Linking.openURL('https://988lifeline.org')}
            >
              <Text style={styles.modalLearnMoreText}>Learn more about 988 →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalContinueBtn}
              onPress={() => setShowSafetyModal(false)}
            >
              <Text style={styles.modalContinueBtnText}>Continue to Strategies</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  questionLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Situation tiles
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  tile: {
    width: '47.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  tileSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.lavender,
  },
  tileEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  tileLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  tileLabelSelected: { color: COLORS.purple },

  // Location pills
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  pillSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.lavender,
  },
  pillEmoji: { fontSize: 18 },
  pillLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  pillLabelSelected: { color: COLORS.purple },

  // Intensity
  intensityCol: { gap: SPACING.sm, marginBottom: SPACING.xxl },
  intensityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  intensityEmoji: { fontSize: 22, marginRight: SPACING.md },
  intensityText: { flex: 1 },
  intensityLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
  },
  intensitySub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  intensityCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityCheckText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '700' },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  submitBtnDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },

  // Safety modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 420,
    ...SHADOWS.lg,
  },
  modalEmoji: { fontSize: 40, textAlign: 'center', marginBottom: SPACING.md },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalOption: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOptionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalOptionBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  modalLinkBtn: {
    backgroundColor: '#C0392B',
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  modalLinkBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  modalLearnMore: { alignItems: 'center', marginBottom: SPACING.lg },
  modalLearnMoreText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  modalContinueBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalContinueBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
});
