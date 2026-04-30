/**
 * useBiometrics
 *
 * Wraps expo-local-authentication to provide:
 * - Device biometric capability check (Face ID, Touch ID, fingerprint)
 * - Biometric authentication prompt
 * - Human-readable biometric type label ("Face ID" / "Touch ID" / "Biometrics")
 *
 * Install: npx expo install expo-local-authentication
 *
 * Add to app.json (iOS):
 *   "infoPlist": {
 *     "NSFaceIDUsageDescription": "Use Face ID to sign in quickly and securely."
 *   }
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Conditional import
let LocalAuth: typeof import('expo-local-authentication') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LocalAuth = require('expo-local-authentication');
} catch {
  // Not installed
}

export type BiometricType = 'face' | 'fingerprint' | 'none';

export type BiometricsState = {
  available: boolean;
  biometricType: BiometricType;
  label: string;          // "Face ID" | "Touch ID" | "Biometrics"
  icon: string;           // emoji for the button
  authenticate: (reason?: string) => Promise<boolean>;
};

export function useBiometrics(): BiometricsState {
  const [available, setAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    if (!LocalAuth || Platform.OS === 'web') return;

    try {
      const compatible = await LocalAuth.hasHardwareAsync();
      if (!compatible) return;

      const enrolled = await LocalAuth.isEnrolledAsync();
      if (!enrolled) return;

      const types = await LocalAuth.supportedAuthenticationTypesAsync();

      // AuthenticationType: 1 = FINGERPRINT, 2 = FACIAL_RECOGNITION, 3 = IRIS
      const hasFace        = types.includes(2);
      const hasFingerprint = types.includes(1);

      setAvailable(true);
      setBiometricType(hasFace ? 'face' : hasFingerprint ? 'fingerprint' : 'fingerprint');
    } catch {
      // Biometrics not available
    }
  };

  const authenticate = async (reason?: string): Promise<boolean> => {
    if (!LocalAuth || !available) return false;
    try {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: reason || 'Sign in to Autism Pathways',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  };

  const label = biometricType === 'face'
    ? 'Face ID'
    : biometricType === 'fingerprint'
      ? (Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint')
      : 'Biometrics';

  const icon = biometricType === 'face' ? '🪪' : '👆';

  return { available, biometricType, label, icon, authenticate };
}
