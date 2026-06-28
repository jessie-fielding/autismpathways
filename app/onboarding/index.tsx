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
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  FlatList, Animated, Platform, ScrollView, Linking, Modal,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';

const { width } = Dimensions.get('window');

// ── Video sources for cards with MP4 animations ─────────────────────────────
const VIDEO_SOURCES: Record<string, any> = {
  card1: require('../../assets/animations/onboarding/card1.mp4'),
  card2: require('../../assets/animations/onboarding/card2.mp4'),
  card3: require('../../assets/animations/onboarding/card3.mp4'),
  card4: require('../../assets/animations/onboarding/card4.mp4'),
  card5: require('../../assets/animations/onboarding/card5.mp4'),
  card6: require('../../assets/animations/onboarding/card6.mp4'),
  card7: require('../../assets/animations/onboarding/card7.mp4'),
  card8: require('../../assets/animations/onboarding/card8.mp4'),
};

// ── Card definitions ──────────────────────────────────────────────────────────
// headline / body support {{parentName}} and {{childName}} tokens
const PARENT_CARD_DEFS = [
  {
    id: '1',
    emoji: '💜',
    headline: 'Welcome to Autism Pathways, {{parentName}}!',
    body: 'Take a moment to get familiar with all of the ways that we can help {{childName}}\'s journey be a little easier.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    video: 'card1',
    lottie: null,
  },
  {
    id: '2',
    emoji: '📓',
    headline: 'Daily Observations',
    body: 'Your daily observations fuel the app. Make observations daily (or as often as you\'d like) and attach them to your IEP pathway, provider report, and more. Over time, view trends to see common days, times, triggers, and more!',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    video: 'card2',
    lottie: null,
  },
  {
    id: '3',
    emoji: '🗺️',
    headline: 'Your Pathways',
    body: 'Diagnosis, Medicaid, Waiver, IEP, Potty, and Transition Pathways are designed to be your guide through every step (and curveball) you experience. Follow the pathways and answer checkpoint questions to get the full advantage of the tool.',
    bg: ['#E8F4FF', '#F5F4FB'] as [string, string],
    video: 'card3',
    lottie: null,
  },
  {
    id: '4',
    emoji: '🆘',
    headline: 'Need In-The-Moment Help?',
    body: 'Use the SOS tool to get timely strategies and tips to help with dysregulation, dangerous behavior, and more.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    video: 'card4',
    lottie: null,
  },
  {
    id: '5',
    emoji: '📅',
    headline: 'Stay Organized and Never Miss a Deadline Again',
    body: 'Set reminders for waiver check-ins, SSI applications, IEP meetings, service renewals, and more! Store all of your documents in one place for easy referencing when you need it most.',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    video: 'card5',
    lottie: null,
  },
  {
    id: '6',
    emoji: '🔍',
    headline: 'Find Providers Near You',
    body: 'Search 891+ curated ASD-specialized providers nearest to you by specialty (pediatricians, PTs, OTs, and more). Read caregiver reviews and add them to your services tracker.',
    bg: ['#FFF3E8', '#F5F4FB'] as [string, string],
    video: 'card6',
    lottie: null,
  },
  {
    id: '7',
    emoji: '🤍',
    headline: 'Just Know You Are Safe Here',
    body: 'Share, learn, and grow together in the Safe Space... or just vent privately and keep your thoughts completely to yourself. Either way, you belong here.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    video: 'card7',
    // lottie: require('../../assets/animations/onboarding/card7.json'),
    lottie: null,
  },
  {
    id: '8',
    emoji: '✨',
    headline: 'There is so much to explore...',
    noteLines: [
      'Hi, I\'m Jessie, founder of Autism Pathways and an autism parent myself.',
      'I built this because I needed it.',
      'Every feature in this app came from a real moment in my family\'s journey.',
      'If there\'s something you need that isn\'t here yet, email me at jessie@autismpathways.app. I read every message.',
    ],
    body: '',
    bg: ['#F5F3FF', '#FDFCFF'] as [string, string],
    video: 'card8',
    lottie: null,
    isLast: true,
  },
];

// Provider-specific onboarding cards
const PROVIDER_CARD_DEFS = [
  {
    id: 'p1',
    emoji: '💜',
    headline: 'Welcome to Autism Pathways, {{parentName}}!',
    body: 'You\'re now part of a community built for and by autism families. Here\'s how the app helps you support the families you work with.',
    bg: ['#EDE9FC', '#F5F4FB'] as [string, string],
    video: 'card1',
    lottie: null,
  },
  {
    id: 'p2',
    emoji: '🔍',
    headline: 'Your Provider Profile',
    body: 'Families searching for specialists in your area can find and connect with you directly. Keep your profile updated to appear in the directory.',
    bg: ['#E8F4FF', '#F5F4FB'] as [string, string],
    video: 'card6',
    lottie: null,
  },
  {
    id: 'p3',
    emoji: '🤝',
    headline: 'Connection Requests',
    body: 'When a family wants to connect, you\'ll get a request. Accept, decline, or message them directly. You\'re always in control of who you connect with.',
    bg: ['#E3F7F1', '#F5F4FB'] as [string, string],
    video: 'card3',
    lottie: null,
  },
  {
    id: 'p4',
    emoji: '🗺️',
    headline: 'Advocate Hub',
    body: 'Access state-specific waiver programs, Medicaid resources, IEP guides, and more. Use these to stay current and share with the families you support.',
    bg: ['#FFF3E8', '#F5F4FB'] as [string, string],
    video: 'card3',
    lottie: null,
  },
  {
    id: 'p5',
    emoji: '✨',
    headline: 'Thank you for being here.',
    noteLines: [
      'Hi, I\'m Jessie, founder of Autism Pathways and an autism parent myself.',
      'Providers like you are the reason families find their footing.',
      'If there\'s something you need that isn\'t here yet, email me at jessie@autismpathways.app.',
    ],
    body: '',
    bg: ['#F5F3FF', '#FDFCFF'] as [string, string],
    video: 'card8',
    lottie: null,
    isLast: true,
  },
];

function interpolate(text: string, parentName: string, childName: string) {
  return text
    .replace(/{{parentName}}/g, parentName)
    .replace(/{{childName}}/g, childName);
}

/**
 * VideoCard — looping muted video, same pattern as the landing page hero.
 * Each card gets its own player instance so they don't interfere.
 */
function VideoCard({ source }: { source: any }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <VideoView
        player={player}
        contentFit="contain"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: RADIUS.lg }}
        nativeControls={false}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.32)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', borderBottomLeftRadius: RADIUS.lg, borderBottomRightRadius: RADIUS.lg }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('your child');
  const [isProvider, setIsProvider] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const premiumModalShown = useRef(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    (async () => {
      const pName = await AsyncStorage.getItem('ap_parent_first_name');
      if (pName) setParentName(pName);

      const providerFlag = await AsyncStorage.getItem('ap_is_provider');
      const profileRaw = await AsyncStorage.getItem('profile');
      if (profileRaw) {
        try {
          const profile = JSON.parse(profileRaw);
          if (profile?.childName) setChildName(profile.childName);
          if (profile?.isProvider === true || providerFlag === 'true') {
            setIsProvider(true);
            // Use provider first name if available
            if (profile?.providerFirstName) setParentName(profile.providerFirstName);
            else if (profile?.parentName) setParentName(profile.parentName);
          }
        } catch {}
      }
    })();
  }, []);

  // Pick the right card set based on account type
  const CARDS = isProvider ? PROVIDER_CARD_DEFS : PARENT_CARD_DEFS;

  // These refs MUST be declared before any conditional return (Rules of Hooks)
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      setCurrentIndex(idx);
      // Show premium modal once when user reaches the last card
      if (idx === CARDS.length - 1 && !premiumModalShown.current) {
        premiumModalShown.current = true;
        setTimeout(() => setShowPremiumModal(true), 600);
      }
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('ap_onboarding_complete', 'true');
    router.replace('/(tabs)/dashboard');
  };

  // Show premium modal before going straight in (for users who skip the cards)
  const completeOnboardingWithModal = async () => {
    if (!premiumModalShown.current) {
      premiumModalShown.current = true;
      setShowPremiumModal(true);
    } else {
      await completeOnboarding();
    }
  };

  const goNext = () => {
    if (currentIndex < CARDS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  // ── Opt-in welcome splash (shown before cards) ───────────────────────────────
  if (!showCards) {
    return (
      <LinearGradient
        colors={['#F3F0FF', '#EDE8FF', '#F8F6FF']}
        style={[styles.splashContainer, { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom + SPACING.xl }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.splashIconWrap}>
          <Text style={styles.splashEmoji}>💜</Text>
        </View>
        <Text style={styles.splashHeadline}>
          {parentName ? `Welcome, ${parentName}!` : 'Welcome to Autism Pathways!'}
        </Text>
        <Text style={styles.splashSub}>
          {isProvider
            ? 'Your provider profile is ready. Dive straight in or take a quick tour.'
            : `Your family's guide to navigating autism — one step at a time.`}
        </Text>
        <TouchableOpacity
          style={styles.splashPrimaryBtn}
          onPress={completeOnboardingWithModal}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#7C6FD4', '#9B8FF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.splashPrimaryBtnInner}
          >
            <Text style={styles.splashPrimaryBtnText}>Take me straight in →</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.splashSecondaryBtn}
          onPress={() => setShowCards(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.splashSecondaryBtnText}>Show me about Autism Pathways</Text>
        </TouchableOpacity>
        <Text style={styles.splashNote}>No pressure — you can explore anytime from the menu</Text>

        {/* Premium modal — rendered here so it works from the splash path too */}
        <Modal
          visible={showPremiumModal}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={async () => { setShowPremiumModal(false); await completeOnboarding(); }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <LinearGradient
                colors={['#6C5CE7', '#9B8FF5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalHeaderTitle}>⭐ Unlock Premium Access</Text>
                <Text style={styles.modalHeaderSub}>Everything you need — in one place</Text>
              </LinearGradient>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {[
                  { icon: '🗺️', title: 'All Pathways', desc: 'Diagnosis, Medicaid, Waiver, IEP, Potty & Transition — fully unlocked' },
                  { icon: '🤖', title: 'AI Transition Guide', desc: 'Personalised step-by-step guidance powered by AI' },
                  { icon: '🎙️', title: 'IEP Meeting Recorder', desc: 'Record, transcribe & summarise your IEP meetings' },
                  { icon: '📈', title: 'Trends & Insights', desc: 'Spot patterns in your daily observations over time' },
                  { icon: '🔔', title: 'Smart Reminders', desc: 'Never miss a waiver renewal, IEP date, or deadline' },
                  { icon: '📁', title: 'Document Vault', desc: `Store & organise all your child's important documents` },
                  { icon: '🔍', title: 'Full Provider Directory', desc: '891+ curated ASD-specialised providers near you' },
                ].map((perk) => (
                  <View key={perk.title} style={styles.perkRow}>
                    <Text style={styles.perkIcon}>{perk.icon}</Text>
                    <View style={styles.perkText}>
                      <Text style={styles.perkTitle}>{perk.title}</Text>
                      <Text style={styles.perkDesc}>{perk.desc}</Text>
                    </View>
                  </View>
                ))}
                <View style={styles.pricingNote}>
                  <Text style={styles.pricingNoteText}>From <Text style={styles.pricingNotePrice}>$14.99 / month</Text> · Cancel anytime</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCTA}
                  onPress={() => { setShowPremiumModal(false); completeOnboarding(); setTimeout(() => router.push('/paywall'), 300); }}
                  activeOpacity={0.88}
                >
                  <LinearGradient colors={['#6C5CE7', '#9B8FF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalCTAInner}>
                    <Text style={styles.modalCTAText}>View Plans →</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDonateBtn} onPress={() => Linking.openURL('https://info.autismpathways.app/donate')} activeOpacity={0.7}>
                  <Text style={styles.modalDonateText}>🫶 Help keep this free — <Text style={styles.modalDonateLink}>Donate</Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDismiss} onPress={async () => { setShowPremiumModal(false); await completeOnboarding(); }} activeOpacity={0.7}>
                  <Text style={styles.modalDismissText}>Maybe later</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    );
  }

  const renderCard = ({ item }: { item: typeof PARENT_CARD_DEFS[0] }) => {
    const headline = interpolate(item.headline, parentName || '!', childName);
    // For card 1 with no parentName yet, clean up the trailing comma+space before !
    const cleanHeadline = parentName
      ? headline
      : headline.replace(', !', '!');
    const body = interpolate(item.body, parentName || 'you', childName);
    const isLastCard = item.id === '8';

    // Card 8 gets a special layout — large headline + handwritten-note card + signature
    if (isLastCard) {
      return (
        <LinearGradient
          colors={item.bg}
          style={[styles.card, styles.card8]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.card8ScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Animation area */}
            <View style={styles.animationContainer}>
              {(item as any).video ? (
                <VideoCard source={VIDEO_SOURCES[(item as any).video]} />
              ) : item.lottie ? (
                <LottieView source={item.lottie} autoPlay loop style={styles.lottie} />
              ) : (
                <View style={styles.lottiePlaceholder}>
                  <Text style={styles.placeholderEmoji}>{item.emoji}</Text>
                </View>
              )}
            </View>

            {/* Big headline */}
            <Text style={styles.headline8}>{cleanHeadline}</Text>

            {/* Handwritten-note card */}
            <View style={styles.noteCard}>
              <Text style={styles.noteHeart}>♡</Text>
              {((item as any).noteLines as string[]).map((line, i) => (
                <Text key={i} style={styles.noteLine}>{line}</Text>
              ))}
              <Text style={styles.noteHeartBottom}>♡</Text>
            </View>

            {/* Signature */}
            <Text style={styles.signature}>Jessie Fielding, Founder ♡</Text>
          </ScrollView>
        </LinearGradient>
      );
    }

    return (
      <LinearGradient
        colors={item.bg}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Animation area */}
        <View style={styles.animationContainer}>
          {(item as any).video ? (
            <VideoCard source={VIDEO_SOURCES[(item as any).video]} />
          ) : item.lottie ? (
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

  const isLast = currentIndex === CARDS.length - 1;

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

      {/* ── Premium / Donate Modal ── */}
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <LinearGradient
              colors={['#6C5CE7', '#9B8FF5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderTitle}>⭐ Unlock Premium Access</Text>
              <Text style={styles.modalHeaderSub}>Everything you need — in one place</Text>
            </LinearGradient>

            {/* Perks list */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {[
                { icon: '🗺️', title: 'All Pathways', desc: 'Diagnosis, Medicaid, Waiver, IEP, Potty & Transition — fully unlocked' },
                { icon: '🤖', title: 'AI Transition Guide', desc: 'Personalised step-by-step guidance powered by AI' },
                { icon: '🎙️', title: 'IEP Meeting Recorder', desc: 'Record, transcribe & summarise your IEP meetings' },
                { icon: '📈', title: 'Trends & Insights', desc: 'Spot patterns in your daily observations over time' },
                { icon: '🔔', title: 'Smart Reminders', desc: 'Never miss a waiver renewal, IEP date, or deadline' },
                { icon: '📁', title: 'Document Vault', desc: `Store & organise all your child's important documents` },
                { icon: '🔍', title: 'Full Provider Directory', desc: '891+ curated ASD-specialised providers near you' },
              ].map((perk) => (
                <View key={perk.title} style={styles.perkRow}>
                  <Text style={styles.perkIcon}>{perk.icon}</Text>
                  <View style={styles.perkText}>
                    <Text style={styles.perkTitle}>{perk.title}</Text>
                    <Text style={styles.perkDesc}>{perk.desc}</Text>
                  </View>
                </View>
              ))}

              {/* Pricing note */}
              <View style={styles.pricingNote}>
                <Text style={styles.pricingNoteText}>From <Text style={styles.pricingNotePrice}>$14.99 / month</Text> · Cancel anytime</Text>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={styles.modalCTA}
                onPress={() => {
                  setShowPremiumModal(false);
                  completeOnboarding();
                  setTimeout(() => router.push('/paywall'), 300);
                }}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#6C5CE7', '#9B8FF5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalCTAInner}
                >
                  <Text style={styles.modalCTAText}>View Plans →</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Donate link */}
              <TouchableOpacity
                style={styles.modalDonateBtn}
                onPress={() => Linking.openURL('https://info.autismpathways.app/donate')}
                activeOpacity={0.7}
              >
                <Text style={styles.modalDonateText}>🫶 Help keep this free — <Text style={styles.modalDonateLink}>Donate</Text></Text>
              </TouchableOpacity>

              {/* Dismiss */}
              <TouchableOpacity
                style={styles.modalDismiss}
                onPress={() => setShowPremiumModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalDismissText}>Maybe later</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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

        {/* Next / Let's Explore */}
        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.nextBtnLast]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Let's Explore \u2192" : 'Next \u2192'}
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

  // ── Opt-in welcome splash styles ─────────────────────────────────────────────
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  splashIconWrap: {
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(124,111,212,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  splashEmoji: { fontSize: 48 },
  splashHeadline: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  splashSub: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  splashPrimaryBtn: {
    width: '100%',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#7C6FD4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  splashPrimaryBtnInner: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  splashPrimaryBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  splashSecondaryBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(124,111,212,0.35)',
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  splashSecondaryBtnText: {
    color: COLORS.purple,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  splashNote: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

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
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  lottie: { width: '100%', height: '100%', borderRadius: RADIUS.lg },
  lottiePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: RADIUS.lg,
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

  // ── Card 8 special styles ──────────────────────────────────────────────────
  card8: { justifyContent: 'flex-start', paddingTop: 0 },
  card8ScrollContent: { alignItems: 'center', paddingTop: SPACING.xl, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },

  headline8: {
    fontSize: 26, fontWeight: '900', color: COLORS.text,
    textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 32,
    paddingHorizontal: SPACING.md,
  },

  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(124,111,212,0.25)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#7C6FD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  noteHeart: {
    fontSize: 20,
    color: '#B8A8E8',
    marginBottom: SPACING.sm,
  },

  noteHeartBottom: {
    fontSize: 20,
    color: '#B8A8E8',
    textAlign: 'right',
    marginTop: SPACING.sm,
  },

  noteLine: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 24,
    marginBottom: SPACING.xs,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // ── Premium / Donate Modal ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  modalHandle: {
    width: 40, height: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalHeader: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  modalHeaderSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,208,239,0.35)',
  },
  perkIcon: { fontSize: 22, width: 28, textAlign: 'center', marginTop: 1 },
  perkText: { flex: 1 },
  perkTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  perkDesc: { fontSize: 12, color: COLORS.textMid, lineHeight: 17 },
  pricingNote: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  pricingNoteText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  pricingNotePrice: { fontWeight: '800', color: COLORS.purple },
  modalCTA: {
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  modalCTAInner: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalCTAText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '800' },
  modalDonateBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  modalDonateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
  },
  modalDonateLink: {
    color: COLORS.purple,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalDismiss: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modalDismissText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '600',
  },

  signature: {
    fontSize: FONT_SIZES.md,
    color: '#7C6FD4',
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
