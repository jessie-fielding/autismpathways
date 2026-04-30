/**
 * Sign In Screen
 *
 * Features:
 * - Email + password sign-in
 * - "Remember me" toggle — saves credentials to iOS Keychain / Android Keystore
 *   via expo-secure-store (never plain AsyncStorage)
 * - Auto-fills saved email + password on return visits
 * - Face ID / Touch ID biometric sign-in when credentials are saved
 * - Auto-sign-in: if a valid token + saved credentials exist, skips this screen
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../services/useAuth';
import { storage } from '../services/storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';
import {
  saveCredentials,
  loadCredentials,
  clearCredentials,
} from '../services/secureCredentials';
import { useBiometrics } from '../hooks/useBiometrics';

export default function SignInScreen() {
  const router    = useRouter();
  const { signIn } = useAuth();
  const biometrics = useBiometrics();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading]       = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [error, setError]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [checkingAutoSignIn, setCheckingAutoSignIn] = useState(true);

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initScreen();
  }, []);

  const initScreen = async () => {
    // 1. Check if already signed in with a valid token
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      const profile = await storage.getProfile();
      setCheckingAutoSignIn(false);
      if (profile) {
        router.replace('/(tabs)/dashboard');
        return;
      }
    }

    // 2. Load saved credentials
    const saved = await loadCredentials();
    if (saved) {
      setEmail(saved.email);
      setRememberMe(saved.rememberMe);
      setHasSavedCreds(!!saved.password);
      if (saved.rememberMe && saved.password) {
        setPassword(saved.password);
      }

      // 3. If biometric is enabled and credentials are saved, prompt automatically
      if (saved.biometricEnabled && saved.password && biometrics.available) {
        setCheckingAutoSignIn(false);
        setTimeout(() => triggerBiometricSignIn(saved.email, saved.password), 600);
        fadeIn();
        return;
      }
    }

    setCheckingAutoSignIn(false);
    fadeIn();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // ── Biometric sign-in ───────────────────────────────────────────────────────
  const triggerBiometricSignIn = async (savedEmail?: string, savedPassword?: string) => {
    const emailToUse    = savedEmail    || email;
    const passwordToUse = savedPassword || password;

    if (!emailToUse || !passwordToUse) {
      setError('No saved credentials found. Please sign in with your password.');
      return;
    }

    setBiometricLoading(true);
    const success = await biometrics.authenticate(
      `Sign in to Autism Pathways as ${emailToUse}`
    );

    if (success) {
      await doSignIn(emailToUse, passwordToUse, true);
    } else {
      setBiometricLoading(false);
      // Don't show an error — user just cancelled, they can type password
    }
  };

  // ── Password sign-in ────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    await doSignIn(email, password, false);
  };

  const doSignIn = async (emailVal: string, passwordVal: string, viaBiometric: boolean) => {
    if (!viaBiometric) setLoading(true);
    setError('');

    const result = await signIn(emailVal, passwordVal);

    if (result.success) {
      // Save credentials based on Remember Me preference
      await saveCredentials(
        emailVal,
        passwordVal,
        rememberMe,
        biometrics.available && rememberMe // enable biometric if available + remember me on
      );

      const profile = await storage.getProfile();
      if (profile) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/profile-setup');
      }
    } else {
      setError(result.error || 'An error occurred. Please try again.');
    }

    setLoading(false);
    setBiometricLoading(false);
  };

  // ── Forgot password ─────────────────────────────────────────────────────────
  const handleForgotPassword = () => {
    router.push('/forgot-password' as any);
  };

  // ── Loading splash while checking auto sign-in ──────────────────────────────
  if (checkingAutoSignIn) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashLogo}>Autism{'\n'}Pathways</Text>
        <ActivityIndicator color={COLORS.purple} style={{ marginTop: SPACING.xl }} />
      </View>
    );
  }

  // ── Main sign-in screen ─────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#F5F4FB', '#E8E5F5']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
            {/* Logo */}
            <View style={styles.logoArea}>
              <Text style={styles.logoText}>
                Autism <Text style={styles.logoPink}>Pathways</Text>
              </Text>
              <Text style={styles.logoSub}>Your family's navigation system</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Welcome back</Text>

              {/* Biometric button — shown when credentials are saved */}
              {hasSavedCreds && biometrics.available && (
                <TouchableOpacity
                  style={styles.biometricBtn}
                  onPress={() => triggerBiometricSignIn()}
                  disabled={biometricLoading || loading}
                  activeOpacity={0.8}
                >
                  {biometricLoading ? (
                    <ActivityIndicator color={COLORS.purple} size="small" />
                  ) : (
                    <>
                      <Text style={styles.biometricIcon}>{biometrics.icon}</Text>
                      <Text style={styles.biometricText}>
                        Sign in with {biometrics.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Divider */}
              {hasSavedCreds && biometrics.available && (
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or use password</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading && !biometricLoading}
              />

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  editable={!loading && !biometricLoading}
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(v => !v)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Remember me toggle */}
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(v => !v)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.rememberTextCol}>
                  <Text style={styles.rememberTitle}>Remember me</Text>
                  <Text style={styles.rememberSub}>
                    {biometrics.available
                      ? `Saves your login securely — enables ${biometrics.label} next time`
                      : 'Saves your login securely to this device'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign in button */}
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={loading || biometricLoading}
                style={[styles.signInBtn, (loading || biometricLoading) && styles.signInBtnDisabled]}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.signInBtnText}>Sign In</Text>
                }
              </TouchableOpacity>

              {/* Create account */}
              <TouchableOpacity
                onPress={() => router.push('/create-account')}
                disabled={loading}
                style={styles.createAccountBtn}
              >
                <Text style={styles.createAccountText}>
                  Don't have an account?{' '}
                  <Text style={styles.createAccountLink}>Create one free</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security note */}
            <Text style={styles.securityNote}>
              🔒 Your credentials are stored in your device's secure keychain, never on our servers.
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1f5e',
    textAlign: 'center',
    lineHeight: 38,
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxxl,
  },

  // Logo
  logoArea: { alignItems: 'center', marginBottom: SPACING.xl },
  logoText: { fontSize: 28, fontWeight: '800', color: '#1a1f5e' },
  logoPink: { color: '#c47ab8' },
  logoSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 4 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  // Biometric
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    minHeight: 48,
  },
  biometricIcon: { fontSize: 20 },
  biometricText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.purple,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '500' },

  // Error
  errorBox: {
    backgroundColor: '#FFF0EE',
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#F5C6C0',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: { color: '#C0392B', fontSize: FONT_SIZES.sm, textAlign: 'center' },

  // Inputs
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMid,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  passwordRow: { position: 'relative', marginBottom: 0 },
  passwordInput: { paddingRight: 48, marginBottom: SPACING.xs },
  eyeBtn: {
    position: 'absolute',
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingBottom: SPACING.xs,
  },
  eyeIcon: { fontSize: 16 },

  // Forgot password
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  forgotText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },

  // Remember me
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  rememberTextCol: { flex: 1 },
  rememberTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  rememberSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 16,
  },

  // Sign in button
  signInBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  signInBtnDisabled: { opacity: 0.6 },
  signInBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },

  // Create account
  createAccountBtn: { paddingVertical: SPACING.sm, alignItems: 'center' },
  createAccountText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  createAccountLink: { color: COLORS.purple, fontWeight: '600' },

  // Security note
  securityNote: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 16,
  },
});
