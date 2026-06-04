/**
 * Onboarding — 8-card walkthrough
 *
 * Shown once after account creation. Gated by AsyncStorage key 'ap_onboarding_complete'.
 *
 * Personalisation:
 *   - parentName: read from AsyncStorage 'ap_parent_first_name' (set during create-account)
 *   - childName:  read from AsyncStorage 'profile' JSON → childName field
 *
 * To add your Lottie animations:
 *   1. Place your .json files in assets/animations/onboarding/
 *      named card1.json, card2.json … card8.json
 *   2. For each card, set lottie: require('../../assets/animations/onboarding/cardN.json')
 *      (Card 1 is already wired — just add the file!)
 *   3. The emoji placeholder disappears automatically when lottie is non-null
 */
import React, { useRef, useState, useEffect } from 'react';
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

// ── Card definitions ──────────────────────────────────────────────────────────
// headline / body support {{parentName}} and {{childName}} tokens
const CARD_DEFS = [
  {
    id: '1',
    emoji: '💜',
    headline: 'Welcome to Autism Pathways, {{parentName}}!',
    body: 'Take a moment to get familiar with all of the ways that we can help {{childName}}\'s journey be a little easier.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    // ✅ Wire your card 1 Lottie here once card1.json is in assets/animations/onboarding/
    // lottie: require('../../assets/animations/onboarding/card1.json'),
    lottie: null,
  },
  {
    id: '2',
    emoji: '📓',
    headline: 'Daily Observations',
    body: 'Your daily observations fuel the app. Make observations daily (or as often as you\'d like) and attach them to your IEP pathway, provider report, and more. Over time, view trends to see common days, times, triggers, and more!',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card2.json'),
    lottie: null,
  },
  {
    id: '3',
    emoji: '🗺️',
    headline: 'Your Pathways',
    body: 'Diagnosis, Medicaid, Waiver, IEP, Potty, and Transition Pathways are designed to be your guide through every step (and curveball) you experience. Follow the pathways and answer checkpoint questions to get the full advantage of the tool.',
    bg: ['#FFF3E0', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card3.json'),
    lottie: null,
  },
  {
    id: '4',
    emoji: '🆘',
    headline: 'Need In-The-Moment Help?',
    body: 'Use the SOS tool to get timely strategies and tips to help with dysregulation, dangerous behavior, and more.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card4.json'),
    lottie: null,
  },
  {
    id: '5',
    emoji: '📅',
    headline: 'Stay Organized and Never Miss a Deadline Again',
    body: 'Set reminders for waiver check-ins, SSI applications, IEP meetings, service renewals, and more! Store all of your documents in one place for easy referencing when you need it most.',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card5.json'),
    lottie: null,
  },
  {
    id: '6',
    emoji: '🔍',
    headline: 'Find Providers Near You',
    body: 'Search 891+ curated ASD-specialized providers nearest to you by specialty (pediatricians, PTs, OTs, and more). Read caregiver reviews and add them to your services tracker.',
    bg: ['#FFF3E0', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card6.json'),
    lottie: null,
  },
  {
    id: '7',
    emoji: '🤍',
    headline: 'Just Know You Are Safe Here',
    body: 'Share, learn, and grow together in the Safe Space... or just vent privately and keep your thoughts completely to yourself. Either way, you belong here.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card7.json'),
    lottie: null,
  },
  {
    id: '8',
    emoji: '✨',
    headline: 'There is so much to explore... and it\'s constantly growing',
    body: 'I designed Autism Pathways to be the one place you can go to get everything you need — because I was so tired of having to scour through hundreds of different sites and agencies. If you have an idea for a feature, email me! I respond to every one.\n\nWith all the love,\nJessie, Founder',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    // lottie: require('../../assets/animations/onboarding/card8.json'),
    lottie: null,
    isLast: true,
  },
];

function interpolate(text: string, parentName: string, childName: string) {
  return text
    .replace(/{{parentName}}/g, parentName)
    .replace(/{{childName}}/g, childName);
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('your child');

  useEffect(() => {
    (async () => {
      const pName = await AsyncStorage.getItem('ap_parent_first_name');
      if (pName) setParentName(pName);

      const profileRaw = await AsyncStorage.getItem('profile');
      if (profileRaw) {
        try {
          const profile = JSON.parse(profileRaw);
          if (profile?.childName) setChildName(profile.childName);
        } catch {}
      }
    })();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('ap_onboarding_complete', 'true');
    router.replace('/profile-setup');
  };

  const goNext = () => {
    if (currentIndex < CARD_DEFS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderCard = ({ item }: { item: typeof CARD_DEFS[0] }) => {
    const headline = interpolate(item.headline, parentName || '!', childName);
    // For card 1 with no parentName yet, clean up the trailing comma+space before !
    const cleanHeadline = parentName
      ? headline
      : headline.replace(', !', '!');
    const body = interpolate(item.body, parentName || 'you', childName);

    return (
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
            <View style={styles.lottiePlaceholder}>
              <Text style={styles.placeholderEmoji}>{item.emoji}</Text>
            </View>
          )}
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          <Text style={styles.headline}>{cleanHeadline}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </LinearGradient>
    );
  };

  const isLast = currentIndex === CARD_DEFS.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={completeOnboarding}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Cards */}
      <Animated.FlatList
        ref={flatListRef}
        data={CARD_DEFS}
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
          {CARD_DEFS.map((_, i) => {
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
            {isLast ? "Let's Get Started \u2192" : 'Next \u2192'}
          </Text>
        </TouchableOpacity>

        {/* "I've got it" skip link */}
        {!isLast && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.gotItBtn} activeOpacity={0.7}>
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
    width: width * 0.72,
    height: width * 0.72,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: { width: '100%', height: '100%' },
  lottiePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(124,111,212,0.15)',
    borderStyle: 'dashed',
  },
  placeholderEmoji: { fontSize: 80 },

  textContent: { alignItems: 'center', paddingHorizontal: SPACING.sm },
  headline: {
    fontSize: 22, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', marginBottom: SPACING.md, lineHeight: 28,
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
  dot: { height: 8, borderRadius: 4, backgroundColor: COLORS.purple },

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
