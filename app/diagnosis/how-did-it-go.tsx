import React, { useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActiveChild } from '../../services/childManager';

const COLORS = {
  primary: '#5B4FCF',
  primaryLight: '#EEF0FF',
  teal: '#2DB89E',
  tealLight: '#E6F7F4',
  white: '#FFFFFF',
  background: '#F4F5FB',
  textDark: '#1A1A2E',
  textMid: '#4A4A6A',
  textLight: '#8888AA',
  border: '#E0E0F0',
  successBg: '#E6F7F4',
  successText: '#1A7A6A',
  celebrationBg: '#FFF8E6',
  celebrationBorder: '#FFD166',
  celebrationText: '#7A5A00',
  cardBg: '#FFFFFF',
  errorBg: '#FEF0F0',
  errorBorder: '#FFD0D0',
  errorText: '#8A1A1A',
  warmBg: '#FFF4EC',
  warmBorder: '#FFD0A0',
  warmText: '#7A3A00',
};

export default function HowDidItGoScreen() {
  const router = useRouter();
  const { key: childKey } = useActiveChild();
  const params = useLocalSearchParams<{
    evaluatorName?: string;
    evalType?: string;
    appointmentDate?: string;
  }>();

  const evaluatorName = params.evaluatorName || 'your evaluator';
  const evalType = params.evalType || 'telehealth';
  const appointmentDate = params.appointmentDate || '';

  const [outcome, setOutcome] = useState<'diagnosed' | 'no-diagnosis' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Confetti animation values
  const confettiPieces = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(Math.random() * 300 - 150),
      y: new Animated.Value(-20),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const launchConfetti = () => {
    confettiPieces.forEach((piece) => {
      piece.x.setValue(Math.random() * 300 - 150);
      piece.y.setValue(-20);
      piece.opacity.setValue(1);
      piece.rotate.setValue(0);

      Animated.parallel([
        Animated.timing(piece.y, {
          toValue: 600,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: piece.x._value + (Math.random() * 200 - 100),
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: Math.random() * 720,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(piece.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  };

  const handleOutcome = async (choice: 'diagnosed' | 'no-diagnosis') => {
    setOutcome(choice);
    // Mark diagnosis pathway complete (step 6 = 100%) on the dashboard tracker
    await AsyncStorage.setItem(childKey('ap_diagnosis_step'), '6');
    if (choice === 'diagnosed') {
      setShowCelebration(true);
      await AsyncStorage.setItem('diagnosis_outcome', 'diagnosed');
      await AsyncStorage.setItem('diagnosis_evaluator', evaluatorName);
      await AsyncStorage.setItem('diagnosis_date', appointmentDate);
      setTimeout(() => launchConfetti(), 100);
    } else {
      await AsyncStorage.setItem('diagnosis_outcome', 'no-diagnosis');
      // Add this evaluator to the tried list
      const existing = await AsyncStorage.getItem('tried_evaluators');
      const tried: string[] = existing ? JSON.parse(existing) : [];
      // We need the evaluator id — store it when selecting
      const selectedRaw = await AsyncStorage.getItem('selected_evaluator');
      if (selectedRaw) {
        const selected = JSON.parse(selectedRaw);
        if (selected.id && !tried.includes(selected.id)) {
          tried.push(selected.id);
          await AsyncStorage.setItem('tried_evaluators', JSON.stringify(tried));
        }
      }
    }
  };

  const handleGoToMedicaid = () => {
    router.push('/medicaid');
  };

  const handleTryAnotherEvaluator = () => {
    router.push({ pathname: '/diagnosis/evaluator-list', params: { retry: 'true' } });
  };

  // ── CELEBRATION SCREEN ──────────────────────────────────────────────
  if (showCelebration) {
    const CONFETTI_COLORS = ['#FFD166', '#5B4FCF', '#2DB89E', '#FF6B6B', '#4ECDC4', '#FF9F1C'];
    return (
      <View style={styles.celebrationContainer}>
        {/* Confetti pieces */}
        {confettiPieces.map((piece, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                left: '50%',
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  {
                    rotate: piece.rotate.interpolate({
                      inputRange: [0, 720],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
                opacity: piece.opacity,
              },
            ]}
          />
        ))}

        <ScrollView contentContainerStyle={styles.celebrationContent}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Congratulations!</Text>
          <Text style={styles.celebrationSubtitle}>Your child received an autism diagnosis.</Text>

          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationCardTitle}>This is a big moment.</Text>
            <Text style={styles.celebrationCardText}>
              Getting a diagnosis is not a loss — it's a door opening. It means your child can now access services, supports, and funding that were not available before.
            </Text>
            <Text style={styles.celebrationCardText}>
              Many families describe this moment as a relief. You finally have a name for what you've been seeing, and a path forward.
            </Text>
          </View>

          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What happens next?</Text>
            <View style={styles.nextStep}>
              <View style={styles.nextStepBullet}><Text style={styles.nextStepBulletText}>1</Text></View>
              <Text style={styles.nextStepText}>Apply for Medicaid (if not already enrolled) — it covers most autism therapies</Text>
            </View>
            <View style={styles.nextStep}>
              <View style={styles.nextStepBullet}><Text style={styles.nextStepBulletText}>2</Text></View>
              <Text style={styles.nextStepText}>Request an IEP meeting with your child's school</Text>
            </View>
            <View style={styles.nextStep}>
              <View style={styles.nextStepBullet}><Text style={styles.nextStepBulletText}>3</Text></View>
              <Text style={styles.nextStepText}>Start ABA therapy and other recommended services</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.medicaidButton} onPress={handleGoToMedicaid}>
            <Text style={styles.medicaidButtonText}>Start Medicaid Pathway →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dashboardButton} onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── NO DIAGNOSIS SCREEN ─────────────────────────────────────────────
  if (outcome === 'no-diagnosis') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.warmCard}>
          <View style={[styles.cardHeader, { backgroundColor: COLORS.warmBorder }]} />
          <View style={styles.cardBody}>
            <Text style={styles.warmEmoji}>💙</Text>
            <Text style={styles.warmTitle}>We hear you. This is hard.</Text>
            <Text style={styles.warmText}>
              Not receiving a diagnosis doesn't mean your child doesn't have autism. It may mean the evaluator wasn't the right fit, the evaluation wasn't comprehensive enough, or your child was having an atypical day.
            </Text>
            <Text style={styles.warmText}>
              Many families need 2–3 evaluations before receiving a diagnosis. You are your child's best advocate — keep going.
            </Text>
          </View>
        </View>

        <View style={styles.triedCard}>
          <Text style={styles.triedCardTitle}>What we've crossed off</Text>
          <Text style={styles.triedCardDesc}>
            We've marked <Text style={styles.triedName}>{evaluatorName}</Text> as tried. They'll appear crossed out when you return to the evaluator list so you can easily pick someone new.
          </Text>
          <View style={styles.triedExample}>
            <Text style={styles.triedExampleText}>{evaluatorName}</Text>
            <View style={styles.triedExampleBadge}><Text style={styles.triedExampleBadgeText}>Previously tried</Text></View>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for your next evaluation</Text>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>📋</Text>
            <Text style={styles.tipText}>Bring a video of your child's behaviors at home — evaluators can't always see everything in one session</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🏥</Text>
            <Text style={styles.tipText}>Ask for a multidisciplinary evaluation team (psychologist + speech therapist + OT) for more comprehensive results</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>📝</Text>
            <Text style={styles.tipText}>Request a written copy of the evaluation report and bring it to your next appointment</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>💬</Text>
            <Text style={styles.tipText}>You can say: "We had a previous evaluation that did not result in a diagnosis, but we're still seeing significant concerns. We'd like a second opinion."</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.tryAgainButton} onPress={handleTryAnotherEvaluator}>
          <Text style={styles.tryAgainButtonText}>Find Another Evaluator →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dashboardButtonAlt} onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={styles.dashboardButtonAltText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── INITIAL OUTCOME QUESTION ────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Step bar */}
      <View style={styles.stepBar}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View key={s} style={[styles.stepSegment, styles.stepActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step 6 of 6</Text>

      <View style={styles.card}>
        <View style={[styles.cardHeader, { backgroundColor: COLORS.primary }]} />
        <View style={styles.cardBody}>
          <Text style={styles.mainTitle}>How did the evaluation go?</Text>
          {appointmentDate && appointmentDate !== 'pending' && (
            <Text style={styles.dateNote}>Evaluation on {appointmentDate} with {evaluatorName}</Text>
          )}
          <Text style={styles.subtitle}>
            Whatever the outcome, you've done something incredibly important for your child. Share what happened and we'll guide your next step.
          </Text>

          {/* Diagnosed */}
          <TouchableOpacity
            style={styles.outcomeCard}
            onPress={() => handleOutcome('diagnosed')}
            activeOpacity={0.8}
          >
            <View style={styles.outcomeIconCircle}>
              <Text style={styles.outcomeIcon}>🎉</Text>
            </View>
            <View style={styles.outcomeText}>
              <Text style={styles.outcomeTitle}>We got a diagnosis!</Text>
              <Text style={styles.outcomeDesc}>
                My child received an autism diagnosis. Help me figure out next steps.
              </Text>
            </View>
            <Text style={styles.outcomeArrow}>→</Text>
          </TouchableOpacity>

          {/* No diagnosis */}
          <TouchableOpacity
            style={[styles.outcomeCard, styles.outcomeCardNeutral]}
            onPress={() => handleOutcome('no-diagnosis')}
            activeOpacity={0.8}
          >
            <View style={[styles.outcomeIconCircle, styles.outcomeIconCircleNeutral]}>
              <Text style={styles.outcomeIcon}>💙</Text>
            </View>
            <View style={styles.outcomeText}>
              <Text style={styles.outcomeTitle}>No diagnosis this time</Text>
              <Text style={styles.outcomeDesc}>
                The evaluation didn't result in a diagnosis. Help me understand my options.
              </Text>
            </View>
            <Text style={styles.outcomeArrow}>→</Text>
          </TouchableOpacity>

          {/* Still waiting */}
          <TouchableOpacity
            style={[styles.outcomeCard, styles.outcomeCardMuted]}
            onPress={() => router.push('/(tabs)/dashboard')}
            activeOpacity={0.8}
          >
            <View style={[styles.outcomeIconCircle, styles.outcomeIconCircleMuted]}>
              <Text style={styles.outcomeIcon}>⏳</Text>
            </View>
            <View style={styles.outcomeText}>
              <Text style={styles.outcomeTitle}>Still waiting for results</Text>
              <Text style={styles.outcomeDesc}>
                The evaluation happened but we're waiting for the written report.
              </Text>
            </View>
            <Text style={styles.outcomeArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  stepBar: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  stepSegment: { flex: 1, height: 4, borderRadius: 2 },
  stepActive: { backgroundColor: COLORS.teal },
  stepInactive: { backgroundColor: COLORS.border },
  stepLabel: { fontSize: 13, color: COLORS.teal, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { height: 6 },
  cardBody: { padding: 20 },
  mainTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom: 6 },
  dateNote: { fontSize: 13, color: COLORS.textLight, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textMid, lineHeight: 22, marginBottom: 20 },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.celebrationBorder,
    gap: 12,
  },
  outcomeCardNeutral: { backgroundColor: '#EEF4FF', borderColor: '#C0C8F0' },
  outcomeCardMuted: { backgroundColor: COLORS.background, borderColor: COLORS.border },
  outcomeIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.celebrationBg, alignItems: 'center', justifyContent: 'center' },
  outcomeIconCircleNeutral: { backgroundColor: COLORS.primaryLight },
  outcomeIconCircleMuted: { backgroundColor: COLORS.background },
  outcomeIcon: { fontSize: 22 },
  outcomeText: { flex: 1 },
  outcomeTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 3 },
  outcomeDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 18 },
  outcomeArrow: { fontSize: 18, color: COLORS.textLight },
  // Celebration
  celebrationContainer: { flex: 1, backgroundColor: '#FFFDF0' },
  celebrationContent: { padding: 24, paddingBottom: 60, alignItems: 'center' },
  confettiPiece: { position: 'absolute', top: 0, width: 10, height: 10, borderRadius: 2 },
  celebrationEmoji: { fontSize: 72, marginBottom: 12, marginTop: 60 },
  celebrationTitle: { fontSize: 34, fontWeight: '900', color: COLORS.textDark, textAlign: 'center', marginBottom: 8 },
  celebrationSubtitle: { fontSize: 18, color: COLORS.textMid, textAlign: 'center', marginBottom: 28 },
  celebrationCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16, width: '100%', borderWidth: 1.5, borderColor: COLORS.celebrationBorder },
  celebrationCardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.celebrationText, marginBottom: 10 },
  celebrationCardText: { fontSize: 15, color: COLORS.textMid, lineHeight: 22, marginBottom: 8 },
  nextStepsCard: { backgroundColor: COLORS.tealLight, borderRadius: 16, padding: 20, marginBottom: 24, width: '100%' },
  nextStepsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.successText, marginBottom: 14 },
  nextStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  nextStepBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nextStepBulletText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  nextStepText: { flex: 1, fontSize: 14, color: COLORS.successText, lineHeight: 20 },
  medicaidButton: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  medicaidButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  dashboardButton: { width: '100%', borderRadius: 30, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  dashboardButtonText: { color: COLORS.textMid, fontSize: 15, fontWeight: '600' },
  // No diagnosis
  warmCard: { backgroundColor: COLORS.warmBg, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.warmBorder },
  warmEmoji: { fontSize: 36, marginBottom: 10 },
  warmTitle: { fontSize: 20, fontWeight: '800', color: COLORS.warmText, marginBottom: 10 },
  warmText: { fontSize: 15, color: COLORS.warmText, lineHeight: 22, marginBottom: 10 },
  triedCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  triedCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  triedCardDesc: { fontSize: 14, color: COLORS.textMid, lineHeight: 20, marginBottom: 14 },
  triedName: { fontWeight: '700', color: COLORS.textDark },
  triedExample: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.background, borderRadius: 10, padding: 12 },
  triedExampleText: { fontSize: 14, color: COLORS.textLight, textDecorationLine: 'line-through', flex: 1 },
  triedExampleBadge: { backgroundColor: COLORS.errorBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  triedExampleBadgeText: { fontSize: 11, color: COLORS.errorText, fontWeight: '700' },
  tipsCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 14 },
  tip: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  tipIcon: { fontSize: 18, marginTop: 1 },
  tipText: { flex: 1, fontSize: 14, color: COLORS.textMid, lineHeight: 20 },
  tryAgainButton: { backgroundColor: COLORS.teal, borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  tryAgainButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  dashboardButtonAlt: { borderRadius: 30, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  dashboardButtonAltText: { color: COLORS.textMid, fontSize: 15, fontWeight: '600' },
});
