/**
 * Poop Smearing Quiz Results
 * Shows primary cause hypothesis + ranked strategies.
 * "Not intentional" framing throughout to reduce parent shame.
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { SMEAR_RESULT_KEY } from './quiz';
import PathwayDisclaimer from '../../../components/PathwayDisclaimer';

type CauseKey = 'sensory' | 'gi' | 'communication' | 'boredom' | 'nighttime';

interface CauseResult {
  key: CauseKey;
  emoji: string;
  title: string;
  hypothesis: string;
  strategies: string[];
}

const CAUSES: Record<CauseKey, CauseResult> = {
  sensory: {
    key: 'sensory',
    emoji: '🖐️',
    title: 'Sensory Seeking',
    hypothesis:
      'The smearing is most likely sensory-driven — your child is seeking the texture, warmth, or sensation. This is the most common cause and is not intentional defiance.',
    strategies: [
      'Back-zip adaptive sleepwear (Wonsie, Harkla, Snuggies for Kids) — one-piece pajamas that zip up the back, making self-undressing and access very difficult. Many Medicaid waivers cover adaptive clothing.',
      'Sensory substitutes throughout the day — work with your OT or BCBA to introduce appropriate sensory alternatives at high-risk times: kinetic sand, slime, finger painting, putty, foam shaving cream.',
      'Increase proprioceptive input overall — a child who is well-regulated sensorially is less likely to seek extreme input. Ask your OT about a sensory diet: heavy work, deep pressure, swinging, weighted items.',
      'Request a functional behavior assessment (FBA) from your BCBA to identify the specific sensory function and design a targeted behavior intervention plan.',
    ],
  },
  gi: {
    key: 'gi',
    emoji: '🩺',
    title: 'GI Discomfort / Incomplete Evacuation',
    hypothesis:
      'The smearing may be GI-driven — constipation, incomplete evacuation, or GI pain is extremely common in profound autism and is a major but often missed trigger. Your child may be trying to relieve discomfort.',
    strategies: [
      'See your pediatrician or GI specialist — ask specifically about a bowel management plan. Constipation in autism is often undertreated. A GI specialist can assess for chronic constipation, overflow incontinence, or other GI issues.',
      'Track bowel movements alongside smearing incidents — use the Smear Tracker to log timing and consistency. Bring this data to your doctor.',
      'Dietary and hydration review — increase fiber and fluids. Ask your pediatrician about fiber supplements or stool softeners if appropriate.',
      'Enzyme-based cleaners (Zout, Nature\'s Miracle) break down organic matter better than standard cleaners during cleanup.',
    ],
  },
  communication: {
    key: 'communication',
    emoji: '💬',
    title: 'Communication / Attention',
    hypothesis:
      'The smearing may be a communication behavior — in the absence of other ways to express distress, discomfort, or a need, this behavior reliably gets a big reaction. It may be your child\'s way of saying something is wrong.',
    strategies: [
      'Request a functional behavior assessment (FBA) from your BCBA specifically targeting this behavior. The FBA will identify what the behavior is communicating and what need it\'s meeting.',
      'Minimize the reaction — when smearing occurs, respond calmly and neutrally. A big emotional reaction (even negative) can inadvertently reinforce the behavior if attention is the function.',
      'Build alternative communication — work with your SLP and BCBA on expanding your child\'s communication options. The more ways your child has to communicate needs, the less they need to rely on extreme behaviors.',
      'Also rule out pain — if this behavior is new or escalating, ask your pediatrician about a pain evaluation. Pain is a common driver of communication behaviors in nonverbal children.',
    ],
  },
  boredom: {
    key: 'boredom',
    emoji: '😴',
    title: 'Boredom / Understimulation',
    hypothesis:
      'The smearing may be boredom or understimulation — it tends to happen during unstructured time when your child is alone and not engaged. It\'s highly stimulating and self-reinforcing.',
    strategies: [
      'Reduce unstructured unsupervised time — particularly during high-risk windows (early morning, quiet periods). This doesn\'t mean constant supervision forever — it means temporarily increasing structure while you build other strategies.',
      'Scheduled sensory activities at high-risk times — if smearing happens at 5am, build in a sensory activity at that time: a vibrating toy, a sensory bin, music. Give the nervous system something to do.',
      'Back-zip adaptive sleepwear for nighttime/early morning — even if the primary cause is boredom, a physical barrier is the most effective immediate intervention.',
      'Work with your BCBA on a structured activity schedule for high-risk times, including preferred activities and sensory tools.',
    ],
  },
  nighttime: {
    key: 'nighttime',
    emoji: '🌙',
    title: 'Nighttime / Sleep-Specific Pattern',
    hypothesis:
      'This is a nighttime smearing pattern — one of the most common presentations. It typically happens because your child wakes, is alone, and has access. The primary intervention is a physical barrier while you address the underlying cause.',
    strategies: [
      'Back-zip adaptive sleepwear (Wonsie, Harkla, Snuggies for Kids) — these zip up the back and are very difficult to remove independently. Many Medicaid waivers cover adaptive clothing — ask your waiver coordinator.',
      'Scheduled nighttime check — if smearing happens at a predictable time (e.g., 3–5am), a brief check and diaper change at that time can interrupt the cycle before it starts.',
      'Evaluate for GI issues — nighttime smearing is often linked to incomplete evacuation or GI discomfort. Ask your pediatrician about a bowel management plan.',
      'Weighted blanket — can reduce nighttime sensory seeking that drives the behavior.',
    ],
  },
};

export default function PoopSmearingResults() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<{ topCause: CauseKey; scores: Record<CauseKey, number> } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SMEAR_RESULT_KEY).then((raw) => {
      if (raw) setResult(JSON.parse(raw));
    });
  }, []);

  if (!result) return null;

  const cause = CAUSES[result.topCause];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Results</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Not intentional chip */}
        <View style={styles.notIntentionalBadge}>
          <Text style={styles.notIntentionalText}>✅ Not intentional — this is a need being expressed</Text>
        </View>

        {/* Primary cause */}
        <View style={styles.causeCard}>
          <Text style={styles.causeEmoji}>{cause.emoji}</Text>
          <Text style={styles.causeLabel}>PRIMARY HYPOTHESIS</Text>
          <Text style={styles.causeTitle}>{cause.title}</Text>
          <Text style={styles.causeHypothesis}>{cause.hypothesis}</Text>
        </View>

        {/* Strategies */}
        <Text style={styles.sectionLabel}>RECOMMENDED STRATEGIES</Text>
        {cause.strategies.map((strategy, i) => (
          <View key={i} style={styles.strategyCard}>
            <View style={styles.strategyNum}>
              <Text style={styles.strategyNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.strategyText}>{strategy}</Text>
          </View>
        ))}

        {/* Tracker CTA */}
        <View style={styles.trackerCTA}>
          <Text style={styles.trackerCTATitle}>📋 Track to Confirm</Text>
          <Text style={styles.trackerCTAText}>
            Use the Smear Tracker to log incidents over time. Patterns in timing, location, and bowel movement data will help confirm this hypothesis — and give your BCBA and doctor the data they need.
          </Text>
          <TouchableOpacity
            style={styles.trackerBtn}
            onPress={() => router.push('/profound-autism/poop-smearing/tracker')}
            activeOpacity={0.85}
          >
            <Text style={styles.trackerBtnText}>Open Smear Tracker →</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            This quiz is a communication tool, not a diagnosis. Always work with your child's medical and behavioral team.
          </Text>
        </View>

        {/* Retake */}
        <TouchableOpacity
          style={styles.retakeBtn}
          onPress={() => router.push('/profound-autism/poop-smearing/quiz')}
          activeOpacity={0.8}
        >
          <Text style={styles.retakeBtnText}>Retake Quiz</Text>
        </TouchableOpacity>

        <PathwayDisclaimer type="medical" />
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.md },
  notIntentionalBadge: {
    backgroundColor: '#E3F7F1',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },
  notIntentionalText: { fontSize: FONT_SIZES.sm, color: '#065F46', fontWeight: '700' },
  causeCard: {
    backgroundColor: '#FDF3E7',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: '#F4A261',
    ...SHADOWS.sm,
  },
  causeEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  causeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#8B5E3C',
    marginBottom: SPACING.xs,
  },
  causeTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#3D2010', marginBottom: SPACING.sm },
  causeHypothesis: { fontSize: FONT_SIZES.sm, color: '#5A3A1A', lineHeight: 22 },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingTop: SPACING.xs,
  },
  strategyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  strategyNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5E3C',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  strategyNumText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.sm },
  strategyText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  trackerCTA: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  trackerCTATitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  trackerCTAText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.md },
  trackerBtn: {
    backgroundColor: '#8B5E3C',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
  },
  trackerBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  disclaimerBox: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, textAlign: 'center' },
  retakeBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  retakeBtnText: { color: COLORS.textMid, fontWeight: '600', fontSize: FONT_SIZES.sm },
});
