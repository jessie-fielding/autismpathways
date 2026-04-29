import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  heroContainer: {
    height: height * 0.45,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  rainbowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  heroSection: {
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 44,
  },
  heroTitleAccent: {
    color: COLORS.purple,
    fontWeight: '900',
    fontSize: FONT_SIZES.xxxl,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMid,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  featureList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 20,
    minWidth: 24,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  button: {
    borderRadius: 50,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.purple,
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
  buttonTextPrimary: {
    color: COLORS.white,
  },
  buttonTextSecondary: {
    color: COLORS.purple,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rainbow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(230, 220, 255, 0.4)', 'rgba(255, 255, 255, 1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section with Video */}
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

              {/* Full Rainbow Overlay */}
              <LinearGradient
                colors={['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.rainbowOverlay, { opacity: 0.35 }]}
              />
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                Your journey to
              </Text>
              <Text style={styles.heroTitleAccent}>
                the right support
              </Text>
              <Text style={[styles.heroTitle, { marginBottom: SPACING.lg }]}>
                starts here.
              </Text>
              <Text style={styles.heroSubtitle}>
                Autism Pathways walks you through Medicaid, waivers, appeals, and IEPs — one step at a time, based on exactly where you are.
              </Text>
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🗺️</Text>
                <Text style={styles.featureText}>Personalized pathways for your situation</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⏰</Text>
                <Text style={styles.featureText}>Never miss an appeal deadline</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📋</Text>
                <Text style={styles.featureText}>Checklists, scripts, and next steps</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💜</Text>
                <Text style={styles.featureText}>Built by parents, for parents</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => router.push('/sign-in')}
              >
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => router.push('/create-account')}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Create an Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              Free account includes core tools.{'\n'}
              <Text style={{ fontWeight: '600', color: COLORS.purple }}>Premium</Text> unlocks advanced features.
            </Text>
          </View>
        </ScrollView>

        {/* Rainbow Bar */}
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
