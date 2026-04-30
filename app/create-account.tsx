import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../services/useAuth';
import { storage } from '../services/storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { signUp, confirmSignUp, resendConfirmationCode, signInWithGoogle } = useAuth();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signUp(email, password, firstName, lastName);
    setLoading(false);
    if (result.success) {
      setStep('verify');
    } else {
      setError(result.error || 'Sign up failed. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    setLoading(true);
    setError('');
    const result = await confirmSignUp(email, code);
    setLoading(false);
    if (result.success) {
      router.replace('/(tabs)/dashboard');
    } else {
      setError(result.error || 'Verification failed. Please check the code and try again.');
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    const result = await resendConfirmationCode(email);
    setResendMsg(result.success ? 'Code resent! Check your email.' : (result.error || 'Failed to resend.'));
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const result = await signInWithGoogle();
    if (result.success) {
      const profile = await storage.getProfile();
      router.replace(profile ? '/(tabs)/dashboard' : '/profile-setup');
    } else {
      setError(result.error || 'Google sign-in failed. Please try again.');
    }
    setGoogleLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>

          {/* Logo */}
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>Autism <Text style={styles.logoPurple}>Pathways</Text></Text>
            <Text style={styles.logoSub}>Your family's navigation system</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              {step === 'form' ? 'Create your free account' : 'Check your email'}
            </Text>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {step === 'form' ? (
              <>
                {/* Google Sign-Up */}
                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  style={[styles.googleBtn, (loading || googleLoading) && styles.disabled]}
                  activeOpacity={0.85}
                >
                  {googleLoading
                    ? <ActivityIndicator color="#444" size="small" />
                    : <>
                        <Text style={styles.googleIcon}>G</Text>
                        <Text style={styles.googleBtnText}>Continue with Google</Text>
                      </>
                  }
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign up with email</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Form fields */}
                <View style={styles.nameRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="First name"
                    placeholderTextColor={COLORS.textLight}
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!loading}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Last name"
                    placeholderTextColor={COLORS.textLight}
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!loading}
                    autoCapitalize="words"
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 8 characters)"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={COLORS.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={handleSignUp}
                />

                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading}
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Create My Account Free</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/sign-in')} style={styles.switchBtn}>
                  <Text style={styles.switchText}>
                    Already have an account? <Text style={styles.switchLink}>Sign in</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.verifyBody}>
                  We sent a 6-digit verification code to{'\n'}
                  <Text style={styles.verifyEmail}>{email}</Text>
                </Text>

                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="Enter code"
                  placeholderTextColor={COLORS.textLight}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={handleVerify}
                />

                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={loading}
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                  }
                </TouchableOpacity>

                {!!resendMsg && (
                  <Text style={styles.resendMsg}>{resendMsg}</Text>
                )}

                <TouchableOpacity onPress={handleResend} style={styles.switchBtn}>
                  <Text style={styles.switchText}>
                    Didn't get it? <Text style={styles.switchLink}>Resend code</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep('form')} style={styles.switchBtn}>
                  <Text style={styles.switchText}>
                    Wrong email? <Text style={styles.switchLink}>Go back</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.securityNote}>
            🔒 Your data is encrypted and stored securely with AWS.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 48,
  },
  logoArea: { alignItems: 'center', marginBottom: SPACING.xl },
  logoText: { fontSize: 28, fontWeight: '800', color: '#1a1f5e' },
  logoPurple: { color: COLORS.purple },
  logoSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 4 },
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
  errorBox: {
    backgroundColor: '#FFF0EE',
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#F5C6C0',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: { color: '#C0392B', fontSize: FONT_SIZES.sm, textAlign: 'center' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 48,
    ...SHADOWS.sm,
  },
  googleIcon: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#444' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '500' },
  nameRow: { flexDirection: 'row', gap: SPACING.sm },
  halfInput: { flex: 1 },
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
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
  },
  primaryBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  primaryBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  switchBtn: { paddingVertical: SPACING.sm, alignItems: 'center' },
  switchText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  switchLink: { color: COLORS.purple, fontWeight: '600' },
  verifyBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  verifyEmail: { fontWeight: '700', color: COLORS.text },
  resendMsg: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.teal,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  securityNote: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 16,
  },
});
