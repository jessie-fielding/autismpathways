/**
 * SOS+ — Profound Autism Pathway
 * 3-step quiz for extreme behaviors → de-escalation strategies.
 * Matches parenting-pathways/quiz.tsx flow exactly.
 * 988 is PRIMARY crisis resource throughout.
 */
import { useState } from 'react';
import {
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
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent, logScreenView } from '../../../lib/analytics';
import { useEffect } from 'react';

type Behavior =
  | 'physical_aggression'
  | 'sib'
  | 'poop_smearing'
  | 'elopement'
  | 'screaming'
  | 'property_destruction'
  | 'other';

type Location = 'home' | 'school' | 'public' | 'car' | 'community';
type Intensity = 'building' | 'full' | 'unsafe';

const BEHAVIORS: { id: Behavior; emoji: string; label: string }[] = [
  { id: 'physical_aggression', emoji: '👊', label: 'Physical\nAggression' },
  { id: 'sib',                 emoji: '🤕', label: 'Self-Injurious\nBehavior' },
  { id: 'poop_smearing',       emoji: '💩', label: 'Poop\nSmearing' },
  { id: 'elopement',           emoji: '🏃', label: 'Elopement\n/ Running' },
  { id: 'screaming',           emoji: '📢', label: 'Screaming\n/ Yelling' },
  { id: 'property_destruction',emoji: '💥', label: 'Property\nDestruction' },
  { id: 'other',               emoji: '❓', label: 'Other\nBehavior' },
];

const LOCATIONS: { id: Location; emoji: string; label: string }[] = [
  { id: 'home',      emoji: '🏠', label: 'Home' },
  { id: 'school',    emoji: '🏫', label: 'School' },
  { id: 'public',    emoji: '🛒', label: 'Public' },
  { id: 'car',       emoji: '🚗', label: 'Car' },
  { id: 'community', emoji: '🌳', label: 'Community' },
];

const INTENSITIES: { id: Intensity; emoji: string; label: string; sub: string; color: string }[] = [
  { id: 'building', emoji: '🟡', label: 'Building',              sub: 'Starting to escalate',        color: '#F5A623' },
  { id: 'full',     emoji: '🟠', label: 'Full Episode',          sub: 'In the middle of it',          color: '#E8700D' },
  { id: 'unsafe',   emoji: '🔴', label: 'Escalating to Unsafe',  sub: 'Risk of harm to self or others', color: '#C0392B' },
];

// Strategies keyed by behavior
const STRATEGIES: Record<Behavior, { title: string; steps: string[] }> = {
  physical_aggression: {
    title: 'Physical Aggression — Right Now',
    steps: [
      'Lower your own voice — even if they can\'t process words, they feel your nervous system.',
      'Create distance immediately — your goal is to get to a safe distance, not to manage the behavior physically.',
      'Remove other people from the room if possible — reduce audience and stimulation.',
      'Do NOT restrain unless you are trained (CPI, Safety-Care) and it is the only option to prevent serious injury.',
      'Use simple, flat language if you speak at all: "Safe. I\'m here." Not long sentences.',
      'Do NOT try to reason, explain consequences, or threaten during the episode.',
      'Do NOT call 911 for property destruction alone — this can traumatize your child and escalate the situation.',
      'After the episode: give recovery time before any discussion. Their nervous system needs 20–30 minutes to regulate.',
    ],
  },
  sib: {
    title: 'Self-Injurious Behavior — Right Now',
    steps: [
      'Stay calm and reduce demands immediately — SIB often escalates when demands are maintained.',
      'Reduce sensory input: dim lights, turn off TV/music, clear the room.',
      'Do NOT physically block unless there is immediate risk of serious injury — blocking can escalate.',
      'If blocking is necessary, use the minimum contact needed to redirect, not restrain.',
      'Offer a preferred item or sensory tool without making demands.',
      'Give space and time — do not crowd them or demand eye contact.',
      'After the episode: document what happened before (antecedent) — this is critical data for your BCBA.',
      'If SIB is new or increasing, request a medical evaluation — pain is a common driver of SIB.',
    ],
  },
  poop_smearing: {
    title: 'Poop Smearing — Right Now',
    steps: [
      'Respond calmly and neutrally — a big emotional reaction can reinforce the behavior.',
      'Clean up matter-of-factly, without excessive attention to the behavior.',
      'Use enzyme-based cleaner (Zout, Nature\'s Miracle) — breaks down organic matter better than standard cleaners.',
      'For nighttime smearing: back-zip adaptive sleepwear (Wonsie, Harkla) is the highest-impact intervention.',
      'Keep a dedicated "smearing kit" — gloves, enzyme cleaner, extra clothes — in a consistent location.',
      'Request a functional behavior assessment (FBA) from your BCBA if this is ongoing.',
      'Ask your pediatrician about GI evaluation — constipation is a very common driver.',
      'Use the Poop Smearing Quiz tool in this pathway to identify the likely cause.',
    ],
  },
  elopement: {
    title: 'Elopement / Running — Right Now',
    steps: [
      'Do not chase immediately if it will cause them to run faster — stay calm and follow at a safe distance.',
      'Call out calmly using their name and a preferred item or activity: "[Name], let\'s go get [preferred thing]."',
      'Alert others nearby — schools, neighbors, community members.',
      'If you cannot locate your child within 2 minutes, call 911 — elopement is a safety emergency.',
      'Register your child with Smart911 (smart911.com) so dispatchers know about autism before they arrive.',
      'Consider a GPS tracker (AngelSense, Jiobit, Tile) — many Medicaid waivers cover these.',
      'Contact the NAA (National Autism Association) for their free Big Red Safety Box with ID tools.',
      'After the episode: review what triggered the elopement — boredom, sensory overload, or a specific antecedent.',
    ],
  },
  screaming: {
    title: 'Screaming / Yelling — Right Now',
    steps: [
      'Do NOT match their volume — lower your own voice to a near-whisper.',
      'Reduce sensory input: turn off TV/music, dim lights, clear the room of other people.',
      'Do NOT demand they stop screaming — this adds to the escalation.',
      'Offer a sensory tool or preferred item without making demands.',
      'Give space and time — do not crowd them or demand eye contact.',
      'If screaming is new or significantly increased, rule out pain — ear infections, dental pain, and GI issues are common causes.',
      'Use simple, flat language if you speak at all: "Safe. I\'m here."',
      'After the episode: document antecedents for your BCBA.',
    ],
  },
  property_destruction: {
    title: 'Property Destruction — Right Now',
    steps: [
      'Prioritize safety — move people out of the area, not objects.',
      'Do NOT try to stop the destruction physically unless someone is in immediate danger.',
      'Reduce demands and sensory input immediately.',
      'Create distance — your goal is to get to a safe distance.',
      'Do NOT call 911 for property destruction alone — this can traumatize your child and escalate the situation.',
      'After the episode: document what happened before (antecedent) — this is critical data for your BCBA.',
      'Consider a "destruction-safe" room or area for high-risk times — remove breakables, secure hazards.',
      'Request a functional behavior assessment (FBA) if this is ongoing.',
    ],
  },
  other: {
    title: 'Extreme Behavior — Right Now',
    steps: [
      'Lower your own voice and reduce demands immediately.',
      'Reduce sensory input: dim lights, turn off TV/music, clear the room of other people if possible.',
      'Offer a preferred item or sensory tool without making demands.',
      'Give space and time — do not crowd them or demand eye contact.',
      'Avoid physical touch unless they seek it or safety requires it.',
      'Use simple, flat language if you speak at all: "Safe. I\'m here." Not long sentences.',
      'Do NOT try to reason with them or explain consequences during the episode.',
      'After the episode: give recovery time before any discussion. Document antecedents for your BCBA.',
    ],
  },
};

export default function SOSPlus() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [behavior, setBehavior] = useState<Behavior | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showStrategies, setShowStrategies] = useState(false);

  useEffect(() => {
    logScreenView('sos_plus');
    logEvent('sos_plus_quiz_started');
  }, []);

  const canSubmit = behavior !== null && location !== null && intensity !== null;

  function handleIntensitySelect(id: Intensity) {
    setIntensity(id);
    if (id === 'unsafe') {
      logEvent('sos_plus_serious_screen_viewed');
      setShowSafetyModal(true);
    }
  }

  function handleGetStrategies() {
    if (!canSubmit) return;
    setShowStrategies(true);
  }

  const strategies = behavior ? STRATEGIES[behavior] : null;

  if (showStrategies && strategies) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setShowStrategies(false)}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SOS+</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/dashboard')}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.dashText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>
        {/* 988 sticky banner */}
        <TouchableOpacity
          style={styles.crisisBanner}
          onPress={() => Linking.openURL('tel:988')}
          activeOpacity={0.85}
        >
          <Text style={styles.crisisBannerText}>
            📞 <Text style={styles.crisisBold}>988</Text> — Call or text now · No police unless you ask
          </Text>
        </TouchableOpacity>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.strategiesHeader}>
            <Text style={styles.strategiesTitle}>{strategies.title}</Text>
            <Text style={styles.strategiesSub}>
              {location ? `📍 ${LOCATIONS.find(l => l.id === location)?.label}` : ''}{' '}
              {intensity ? `· ${INTENSITIES.find(i => i.id === intensity)?.label}` : ''}
            </Text>
          </View>
          {strategies.steps.map((step, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
          {/* Escalation reminder */}
          <View style={styles.escalationCard}>
            <Text style={styles.escalationTitle}>🆘 If it escalates to unsafe:</Text>
            <Text style={styles.escalationText}>
              Call <Text style={styles.escalationBold}>988</Text> first — trained counselors can help you de-escalate without sending police.{'\n\n'}
              Call <Text style={styles.escalationBold}>911</Text> only if there is immediate risk of serious physical injury.
            </Text>
            <TouchableOpacity
              style={styles.call988Btn}
              onPress={() => Linking.openURL('tel:988')}
              activeOpacity={0.85}
            >
              <Text style={styles.call988BtnText}>Call 988 Now</Text>
            </TouchableOpacity>
          </View>
          {/* After the episode */}
          <View style={styles.afterCard}>
            <Text style={styles.afterTitle}>📋 After the Episode</Text>
            <Text style={styles.afterText}>
              Document what happened before (antecedent), the behavior itself, and what happened after (consequence). This ABC data is critical for your BCBA to build an effective behavior intervention plan.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
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
        <Text style={styles.headerTitle}>SOS+</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/dashboard')}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>

      {/* 988 sticky banner */}
      <TouchableOpacity
        style={styles.crisisBanner}
        onPress={() => Linking.openURL('tel:988')}
        activeOpacity={0.85}
      >
        <Text style={styles.crisisBannerText}>
          📞 <Text style={styles.crisisBold}>988</Text> — Call or text now · No police unless you ask
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Q1: Behavior */}
        <Text style={styles.questionLabel}>What is happening?</Text>
        <View style={styles.tileGrid}>
          {BEHAVIORS.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.tile, behavior === b.id && styles.tileSelected]}
              onPress={() => setBehavior(b.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.tileEmoji}>{b.emoji}</Text>
              <Text style={[styles.tileLabel, behavior === b.id && styles.tileLabelSelected]}>
                {b.label}
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
              When a child is escalating to unsafe behavior — risk of harm to themselves or others — you don't have to handle it alone.
            </Text>
            <View style={styles.modalOption}>
              <Text style={styles.modalOptionTitle}>📞 Call 988 — Primary Resource</Text>
              <Text style={styles.modalOptionBody}>
                The 988 Suicide & Crisis Lifeline also supports families in behavioral crises. Trained counselors can help you de-escalate right now — without sending police unless you ask.{'\n\n'}
                Many parents worry that calling 911 will traumatize their child. 988 is a safe first call that keeps your family in control of what happens next.
              </Text>
              <TouchableOpacity
                style={styles.modalLinkBtn}
                onPress={() => Linking.openURL('tel:988')}
              >
                <Text style={styles.modalLinkBtnText}>Call 988 Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalOption}>
              <Text style={styles.modalOptionTitle}>🚨 Call 911 — If Immediate Danger</Text>
              <Text style={styles.modalOptionBody}>
                Call 911 only if there is immediate risk of serious physical injury that cannot be managed otherwise. If you call, tell the dispatcher: "My child has autism and is in a behavioral crisis. Please send officers trained in autism or a crisis team if available."
              </Text>
              <TouchableOpacity
                style={[styles.modalLinkBtn, { backgroundColor: '#555' }]}
                onPress={() => Linking.openURL('tel:911')}
              >
                <Text style={styles.modalLinkBtnText}>Call 911</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalContinueBtn}
              onPress={() => setShowSafetyModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalContinueBtnText}>Continue to Strategies →</Text>
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
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  dashText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  // Crisis Banner
  crisisBanner: {
    backgroundColor: '#C0392B',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  crisisBannerText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  crisisBold: { fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  questionLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  // Behavior tiles
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
  tileSelected: { borderColor: '#C0392B', backgroundColor: '#FFF0EE' },
  tileEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  tileLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  tileLabelSelected: { color: '#C0392B' },
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
  pillSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
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
  intensityLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
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
    backgroundColor: '#C0392B',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  submitBtnDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },
  submitBtnText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },
  // Strategies view
  strategiesHeader: {
    backgroundColor: '#C0392B',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  strategiesTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  strategiesSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.sm },
  stepText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  escalationCard: {
    backgroundColor: '#FFF0EE',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: '#FFCFCA',
  },
  escalationTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#C0392B', marginBottom: SPACING.sm },
  escalationText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.md },
  escalationBold: { fontWeight: '800' },
  call988Btn: {
    backgroundColor: '#C0392B',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
  },
  call988BtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  afterCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  afterTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  afterText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  // Safety Modal
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
  modalOptionBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  modalLinkBtn: {
    backgroundColor: '#C0392B',
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  modalLinkBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  modalContinueBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalContinueBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
});
