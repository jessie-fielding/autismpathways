import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../services/useAuth';
import { storage } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';
import { restoreFromCloud, hasLocalData, scheduleBackup } from '../services/cloudSync';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { signUp, confirmSignUp, resendConfirmationCode, signInWithGoogle, signInWithApple, sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const [step, setStep] = useState<'form' | 'verify' | 'phone' | 'phone-verify'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [showRelPicker, setShowRelPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

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
      await AsyncStorage.setItem('ap_parent_first_name', firstName.trim());
      if (relationship) await AsyncStorage.setItem('ap_parent_relationship', relationship);
      router.replace('/profile-setup');
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
      // New social sign-up: no profile yet → show onboarding first
      if (!profile) {
        router.replace('/profile-setup');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } else {
      setError(result.error || 'Google sign-in failed. Please try again.');
    }
    setGoogleLoading(false);
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    setError('');
    const result = await signInWithApple();
    if (result.success) {
      const profile = await storage.getProfile();
      // New social sign-up: no profile yet → show onboarding first
      if (!profile) {
        router.replace('/profile-setup');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } else if (result.error) {
      setError(result.error);
    }
    setAppleLoading(false);
  };

  const handleSendPhoneOtp = async () => {
    const cleaned = phone.replace(/[^\d]/g, '');
    const e164 = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
    if (cleaned.length < 10) {
      setError('Please enter a valid US phone number');
      return;
    }
    setPhoneLoading(true);
    setError('');
    const result = await sendPhoneOtp(e164);
    setPhoneLoading(false);
    if (result.success) {
      setPhone(e164);
      setStep('phone-verify');
    } else {
      setError(result.error || 'Could not send code. Please try again.');
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneCode || phoneCode.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setPhoneLoading(true);
    setError('');
    const result = await verifyPhoneOtp(phone, phoneCode, firstName || undefined, lastName || undefined);
    setPhoneLoading(false);
    if (result.success) {
      // Cloud restore: returning user on fresh install
      if (!result.isNewUser) {
        const localDataExists = await hasLocalData();
        const phoneUserId = `phone_${phone.replace(/\+/g, '')}`;
        if (!localDataExists) {
          await restoreFromCloud(phoneUserId);
        } else {
          scheduleBackup(phoneUserId);
        }
      }
      if (result.isNewUser) {
        router.replace('/profile-setup');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } else {
      setError(result.error || 'Verification failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.purple }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Purple header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to{"\n"}Autism Pathways</Text>
          <Text style={styles.headerSub}>The guide your child's diagnosis didn't come with</Text>
        </View>

        {/* White card body */}
        <View style={styles.body}>
          <Text style={styles.title}>
            {step === 'form' ? 'Create your free account'
              : step === 'verify' ? 'Check your email'
              : step === 'phone' ? 'Sign up with phone'
              : 'Enter your code'}
          </Text>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {step === 'phone' ? (
              <>
                <Text style={styles.phoneHint}>
                  We'll text you a 6-digit code — no password needed.
                </Text>

                {/* Optional name fields for new users */}
                <View style={styles.nameRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Jessie"
                      placeholderTextColor={COLORS.textLight}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      editable={!phoneLoading}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder=""
                      placeholderTextColor={COLORS.textLight}
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      editable={!phoneLoading}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(555) 000-0000"
                  placeholderTextColor={COLORS.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  editable={!phoneLoading}
                  returnKeyType="go"
                  onSubmitEditing={handleSendPhoneOtp}
                />

                <TouchableOpacity
                  onPress={handleSendPhoneOtp}
                  disabled={phoneLoading}
                  style={[styles.primaryBtn, phoneLoading && styles.disabled]}
                  activeOpacity={0.85}
                >
                  {phoneLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Send Code →</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setStep('form'); setError(''); }} style={styles.switchBtn}>
                  <Text style={styles.switchText}>
                    Use email instead? <Text style={styles.switchLink}>Go back</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : step === 'phone-verify' ? (
              <>
                <Text style={styles.verifyBody}>
                  We texted a 6-digit code to{"\n"}
                  <Text style={styles.verifyEmail}>{phone}</Text>
                </Text>

                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor={COLORS.textLight}
                  value={phoneCode}
                  onChangeText={setPhoneCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!phoneLoading}
                  returnKeyType="go"
                  onSubmitEditing={handleVerifyPhoneOtp}
                />

                <TouchableOpacity
                  onPress={handleVerifyPhoneOtp}
                  disabled={phoneLoading}
                  style={[styles.primaryBtn, phoneLoading && styles.disabled]}
                  activeOpacity={0.85}
                >
                  {phoneLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setStep('phone'); setPhoneCode(''); setError(''); }} style={styles.switchBtn}>
                  <Text style={styles.switchText}>
                    Wrong number? <Text style={styles.switchLink}>Go back</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : step === 'form' ? (
              <>
                {/* Google Sign-Up */}
                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  disabled={loading || googleLoading || appleLoading}
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

                {/* Apple Sign-Up — iOS only, required by Guideline 4.8 */}
                {Platform.OS === 'ios' && (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={8}
                    style={[styles.appleBtn, appleLoading && styles.disabled]}
                    onPress={handleAppleSignIn}
                  />
                )}

                {/* Phone auth button */}
                <TouchableOpacity
                  onPress={() => { setStep('phone'); setError(''); }}
                  disabled={loading || googleLoading || appleLoading}
                  style={[styles.phoneBtn, (loading || googleLoading || appleLoading) && styles.disabled]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.phoneBtnIcon}>📱</Text>
                  <Text style={styles.phoneBtnText}>Continue with Phone</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign up with email</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Form fields */}
                {/* Name row */}
                <View style={styles.nameRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Your First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Jessie"
                      placeholderTextColor={COLORS.textLight}
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!loading}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder=""
                      placeholderTextColor={COLORS.textLight}
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!loading}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Relationship picker */}
                <Text style={styles.fieldLabel}>Your relationship to child</Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerRow]}
                  onPress={() => setShowRelPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={relationship ? { fontSize: FONT_SIZES.sm, color: COLORS.text } : { fontSize: FONT_SIZES.sm, color: COLORS.textLight }}>
                    {relationship || 'Select an option'}
                  </Text>
                  <Text style={{ fontSize: 14, color: COLORS.textLight }}>▾</Text>
                </TouchableOpacity>

                {/* Email */}
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                {/* Password with show/hide */}
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                    placeholder="min. 8 characters"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: SPACING.sm }}>
                    <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Confirm password */}
                <Text style={styles.fieldLabel}>Confirm Password</Text>
                <View style={[styles.passwordWrap, { marginBottom: SPACING.lg }]}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                    placeholder=""
                    placeholderTextColor={COLORS.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    editable={!loading}
                    returnKeyType="go"
                    onSubmitEditing={handleSignUp}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ padding: SPACING.sm }}>
                    <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading}
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Create Free Account →</Text>
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

                {/* Spam callout */}
                <View style={styles.spamCallout}>
                  <Text style={styles.spamCalloutText}>
                    📬 Don't see it? Check your <Text style={{ fontWeight: '700' }}>spam or junk folder</Text> — verification emails sometimes land there.
                  </Text>
                </View>

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
      </ScrollView>

      {/* Relationship picker modal */}
      <Modal visible={showRelPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowRelPicker(false)} activeOpacity={1}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Your relationship to child</Text>
            {['Parent', 'Guardian', 'Caregiver', 'Grandparent', 'Foster Parent', 'Provider', 'Therapist', 'Teacher', 'Other'].map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.pickerItem}
                onPress={() => { setRelationship(r); setShowRelPicker(false); }}
              >
                <Text style={[styles.pickerItemText, relationship === r && { color: COLORS.purple, fontWeight: '700' }]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.purple,
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 36,
  },
  headerSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: SPACING.xs,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
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
  appleBtn: {
    width: '100%',
    height: 48,
    marginBottom: SPACING.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '500' },
  nameRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
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
  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#E8F4FD',
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: '#B3D9F5',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 48,
  },
  phoneBtnIcon: { fontSize: 16 },
  phoneBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1A7FC1' },
  phoneHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
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
  spamCallout: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: SPACING.sm,
  },
  spamCalloutText: {
    fontSize: FONT_SIZES.xs,
    color: '#92400E',
    lineHeight: 18,
    textAlign: 'center',
  },
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
