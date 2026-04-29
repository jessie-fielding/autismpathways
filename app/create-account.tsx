import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../services/useAuth';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { signUp, confirmSignUp } = useAuth();
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);
    if (result.success) {
      setStep('verify');
      setError('');
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter verification code');
      return;
    }
    setLoading(true);
    const result = await confirmSignUp(email, code);
    setLoading(false);
    if (result.success) {
      router.replace('/(tabs)/dashboard');
    } else {
      setError(result.error || 'Verification failed');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#F5F4FB' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 30, color: '#2D1B69', textAlign: 'center' }}>Create Account</Text>
          {error && <Text style={{ color: '#E74C3C', marginBottom: 15, textAlign: 'center' }}>{error}</Text>}
          {step === 'form' ? (
            <>
              <TextInput style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' }} placeholder="First Name" value={firstName} onChangeText={setFirstName} editable={!loading} />
              <TextInput style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' }} placeholder="Last Name" value={lastName} onChangeText={setLastName} editable={!loading} />
              <TextInput style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' }} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!loading} />
              <TextInput style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' }} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry editable={!loading} />
              <TextInput style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 20, borderRadius: 8, backgroundColor: '#fff' }} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!loading} />
              <TouchableOpacity onPress={handleSignUp} disabled={loading} style={{ backgroundColor: loading ? '#A99BC4' : '#7C5CBF', padding: 15, borderRadius: 8, alignItems: 'center' }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Create My Account Free</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text style={{ textAlign: 'center', color: '#7c6fd4', fontSize: 14, fontWeight: '500', marginTop: 20 }}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 18, marginBottom: 15, color: '#2D1B69', textAlign: 'center' }}>Enter verification code sent to {email}</Text>
              <TextInput style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 20, borderRadius: 8, backgroundColor: '#fff' }} placeholder="Verification Code" value={code} onChangeText={setCode} editable={!loading} />
              <TouchableOpacity onPress={handleVerify} disabled={loading} style={{ backgroundColor: loading ? '#A99BC4' : '#7C5CBF', padding: 15, borderRadius: 8, alignItems: 'center' }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Verify</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
