import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/useAuth';
import { storage } from '../services/storage';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      // Check if profile exists
      const profile = await storage.getProfile();
      if (profile) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/profile-setup');
      }
    } else {
      setError(result.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={['#F5F4FB', '#E8E5F5']}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#2D1B69', textAlign: 'center' }}>
              Welcome Back
            </Text>

            {error && <Text style={{ color: '#E74C3C', marginBottom: 15, textAlign: 'center' }}>{error}</Text>}

            <TextInput
              style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 15, borderRadius: 8, backgroundColor: '#fff' }}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={{ borderWidth: 1, borderColor: '#D4C5E2', padding: 12, marginBottom: 20, borderRadius: 8, backgroundColor: '#fff' }}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={{ backgroundColor: loading ? '#A99BC4' : '#7C5CBF', padding: 15, borderRadius: 8, alignItems: 'center' }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/create-account')}
              disabled={loading}
            >
              <Text style={{ textAlign: 'center', color: '#7c6fd4', fontSize: 14, fontWeight: '500', marginTop: 20 }}>
                Don't have an account? Create one
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
