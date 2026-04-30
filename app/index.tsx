import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🗺️', label: 'Guided Path' },
  { icon: '⏰', label: 'Save Time' },
  { icon: '📋', label: 'Stay Organized' },
  { icon: '💜', label: 'Peace of Mind' },
];

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(230, 220, 255, 0.5)', 'rgba(245, 243, 255, 1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Video hero ─────────────────────────────────────────── */}
          <View style={styles.heroContainer}>
            <View style={styles.videoContainer}>
              <Video
                source={require('../assets/family-walking.mp4')}
                rate={1}
                volume={0}
                isMuted
                resizeMode="cover"
                isLooping
                shouldPlay
                style={styles.video}
              />
              {/* Rainbow tint overlay */}
              <LinearGradient
                colors={['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rainbowOverlay, { opacity: 0.35 }]}
              />
              {/* Fade-to-bg at bottom so content blends in */}
              <LinearGradient
                colors={['transparent', 'rgba(245, 243, 255, 1)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 0, y: 1 }}
                style={styles.fadeOverlay}
              />
            </View>
          </View>

          {/* ── Content below animation ────────────────────────────── */}
          <View style={styles.contentContainer}>

            {/* Brand label */}
            <Text style={styles.brandLabel}>Autism Pathways</Text>

            {/* Hero headline */}
            <Text style={styles.heroTitle}>
              The support your{'\n'}
              <Text style={styles.heroTitleAccent}>family deserves.</Text>
            </Text>

            {/* Underline squiggle accent */}
            <View style={styles.underlineAccent} />

            {/* Subtitle */}
            <Text style={styles.heroSubtitle}>
              Navigate Medicaid, IEPs, and appeals — step by step.
            </Text>

            {/* 2×2 feature grid */}
            <View style={styles.featureGrid}>
              {FEATURES.map((f) => (
                <View key={f.label} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => router.push('/sign-in')}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => router.push('/create-account')}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Create an Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              Free account includes core tools.{'\n'}
              <Text style={{ fontWeight: '700', color: COLORS.purple }}>Premium</Text> unlocks advanced features.
            </Text>
          </View>
        </ScrollView>

        {/* Rainbow bar at very bottom */}
        <LinearGradient
          colors={['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.rainbow}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  gradient: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xxxl },

  // Video hero
  heroContainer: {
    height: height * 0.42,
    position: 'relative',
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  video: { width: '100%', height: '100%' },
  rainbowOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  fadeOverlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '50%',
  },

  // Content
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },

  brandLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textMid,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: COLORS.purpleDark,
    fontWeight: '900',
  },

  underlineAccent: {
    width: 160,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.lavenderAccent,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    opacity: 0.7,
  },

  heroSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMid,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },

  // Feature grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  featureCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  featureLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Buttons
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  button: {
    borderRadius: 50,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.purple,
    ...SHADOWS.md,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.purple,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
  },
  buttonTextPrimary: { color: COLORS.white },
  buttonTextSecondary: { color: COLORS.purple },

  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Bottom rainbow bar
  rainbow: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 4,
  },
});
