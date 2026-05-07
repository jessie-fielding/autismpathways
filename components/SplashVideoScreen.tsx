import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

// How many seconds to play before auto-advancing
const AUTO_ADVANCE_SECONDS = 6;

interface Props {
  onFinish: () => void;
}

export default function SplashVideoScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(require('../assets/videos/TherapyVideo.mp4'), (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const [secondsLeft, setSecondsLeft] = useState(AUTO_ADVANCE_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFinished = useRef(false);

  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => onFinish());
  };

  useEffect(() => {
    // Show skip button after 1 second
    const showSkip = setTimeout(() => {
      Animated.timing(skipOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1000);

    // Countdown timer
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(showSkip);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        player={player}
        contentFit="cover"
        style={styles.video}
        nativeControls={false}
        onPlayToEnd={finish}
      />

      {/* Subtle gradient overlay at bottom */}
      <View style={styles.bottomOverlay} />

      {/* App branding at top */}
      <View style={[styles.topBranding, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brandPill}>
          <Text style={styles.brandText}>
            Autism <Text style={styles.brandPurple}>Pathways</Text>
          </Text>
        </View>
      </View>

      {/* Skip button + countdown */}
      <Animated.View
        style={[
          styles.skipWrap,
          { bottom: insets.bottom + 32, opacity: skipOpacity },
        ]}
      >
        <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.8}>
          <Text style={styles.skipText}>Skip  {secondsLeft}s</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EDE9FF',
    zIndex: 9999,
  },
  video: {
    width: W,
    height: H,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'transparent',
    // Fade to black at bottom to make skip button readable
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -40 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
      },
    }),
  },
  topBranding: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  brandText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1f5e',
    letterSpacing: 0.3,
  },
  brandPurple: {
    color: '#7C5CBF',
  },
  skipWrap: {
    position: 'absolute',
    right: 24,
    alignItems: 'flex-end',
  },
  skipBtn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
