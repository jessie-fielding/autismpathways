/**
 * Onboarding — 8-card walkthrough
 *
 * Shown once after account creation. Gated by AsyncStorage key 'ap_onboarding_complete'.
 * Each card has:
 *   - A Lottie animation (placeholder slot — drop in your .json file and update the source)
 *   - A headline + body copy
 *   - Progress dots
 *   - Skip link (top right) and Next/Get Started button (bottom)
 *
 * To add your Lottie animations:
 *   1. Place your .json files in assets/animations/onboarding/
 *      e.g. card1.json, card2.json ... card8.json
 *   2. Uncomment the `source={CARDS[index].lottie}` line in the LottieView below
 *   3. Remove the placeholder <View> that currently shows the emoji fallback
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  FlatList, Animated, Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';

const { width } = Dimensions.get('window');

// ── Card content ──────────────────────────────────────────────────────────────
// lottie: path to your animation file (uncomment source= below when ready)
// emoji: shown as a placeholder until the Lottie file is added
const CARDS = [
  {
    id: '1',
    emoji: '🗺️',
    headline: 'Your family's navigation system',
    body: 'Autism Pathways guides you step by step through diagnosis, Medicaid, waivers, IEPs, and more — so you never have to figure it out alone.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card1.json'),
    lottie: null,
  },
  {
    id: '2',
    emoji: '🔍',
    headline: 'Start with the Diagnosis Pathway',
    body: 'Not sure where to begin? Our guided diagnosis pathway walks you through every step, from first concerns to official evaluation.',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card2.json'),
    lottie: null,
  },
  {
    id: '3',
    emoji: '🏥',
    headline: 'Medicaid and waivers, simplified',
    body: 'We break down Medicaid eligibility, waiver waitlists, and how to use your benefits — in plain language, not government-speak.',
    bg: ['#FFF3E0', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card3.json'),
    lottie: null,
  },
  {
    id: '4',
    emoji: '🏫',
    headline: 'Walk into every IEP meeting prepared',
    body: 'Generate talking points, record meetings, and track goals. You deserve to feel confident in that room.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card4.json'),
    lottie: null,
  },
  {
    id: '5',
    emoji: '📓',
    headline: 'Log observations that matter',
    body: 'Track behaviors, milestones, and daily moments. Your observations are powerful evidence — keep them organized.',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card5.json'),
    lottie: null,
  },
  {
    id: '6',
    emoji: '💬',
    headline: 'Talk to providers with confidence',
    body: 'Our Provider Translator and Talking Points tools help you communicate clearly with doctors, therapists, and school staff.',
    bg: ['#FFF3E0', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card6.json'),
    lottie: null,
  },
  {
    id: '7',
    emoji: '🧘',
    headline: 'You need support too',
    body: 'The Safe Space, In-the-Moment tools, and 1:1 calls with Jessie are here for the hard days. You are not alone in this.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card7.json'),
    lottie: null,
  },
  {
    id: '8',
    emoji: '💜',
    headline: 'You've got this',
    body: 'Thousands of families are navigating this journey with Autism Pathways. Let\'s build your child\'s path together.',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card8.json'),
    lottie: null,
    isLast: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('ap_onboarding_complete', 'true');
    router.replace('/profile-setup');
  };

  const goNext = () => {
    if (currentIndex < CARDS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderCard = ({ item }: { item: typeof CARDS[0] }) => (
    <LinearGradient
      colors={item.bg}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Animation area */}
      <View style={styles.animationContainer}>
        {item.lottie ? (
          <LottieView
            source={item.lottie}
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : (
          // Placeholder until Lottie files are added
          <View style={styles.lottiePlaceholder}>
            <Text style={styles.placeholderEmoji}>{item.emoji}</Text>
          </View>
        )}
      </View>

      {/* Text content */}
      <View style={styles.textContent}>
        <Text style={styles.headline}>{item.headline}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    </LinearGradient>
  );

  const isLast = currentIndex === CARDS.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Cards */}
      <Animated.FlatList
        ref={flatListRef}
        data={CARDS}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + SPACING.lg }]}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {CARDS.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.nextBtnLast]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Let's Get Started →" : 'Next →'}
          </Text>
        </TouchableOpacity>

        {/* "I've got it" skip link */}
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} style={styles.gotItBtn} activeOpacity={0.7}>
            <Text style={styles.gotItText}>I've got it, take me in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  skipBtn: {
    position: 'absolute', top: 0, right: SPACING.lg,
    zIndex: 10, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm,
  },
  skipText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },

  flatList: { flex: 1 },

  card: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },

  animationContainer: {
    width: width * 0.75,
    height: width * 0.75,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: { width: '100%', height: '100%' },
  lottiePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(124,111,212,0.15)',
    borderStyle: 'dashed',
  },
  placeholderEmoji: { fontSize: 80 },

  textContent: { alignItems: 'center', paddingHorizontal: SPACING.sm },
  headline: {
    fontSize: 24, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', marginBottom: SPACING.md, lineHeight: 30,
  },
  body: {
    fontSize: FONT_SIZES.md, color: COLORS.textMid,
    textAlign: 'center', lineHeight: 22,
  },

  bottomControls: {
    alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, backgroundColor: COLORS.bg,
    borderTopWidth: 1, borderTopColor: 'rgba(212,208,239,0.3)',
  },
  dots: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.lg },
  dot: {
    height: 8, borderRadius: 4,
    backgroundColor: COLORS.purple,
  },
  nextBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl,
    width: '100%', alignItems: 'center', marginBottom: SPACING.sm,
  },
  nextBtnLast: { backgroundColor: COLORS.teal },
  nextBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  gotItBtn: { paddingVertical: SPACING.sm },
  gotItText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '600' },
});
