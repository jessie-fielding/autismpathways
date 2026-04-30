/**
 * secureCredentials
 *
 * Stores and retrieves user credentials using expo-secure-store,
 * which writes to the iOS Keychain and Android Keystore.
 * Credentials are NEVER stored in plain AsyncStorage.
 *
 * Install: npx expo install expo-secure-store
 *
 * Keys stored:
 *   ap_saved_email     — last used email address
 *   ap_saved_password  — encrypted password (only if "Remember me" was checked)
 *   ap_remember_me     — 'true' | 'false'
 *   ap_biometric_enabled — 'true' | 'false'
 */

// Conditional import so the app doesn't crash if expo-secure-store isn't installed yet
let SecureStore: typeof import('expo-secure-store') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store');
} catch {
  // Not installed — falls back to no-op
}

const KEY_EMAIL     = 'ap_saved_email';
const KEY_PASSWORD  = 'ap_saved_password';
const KEY_REMEMBER  = 'ap_remember_me';
const KEY_BIOMETRIC = 'ap_biometric_enabled';

export type SavedCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
  biometricEnabled: boolean;
};

/**
 * Save credentials after a successful sign-in.
 * Only saves the password if rememberMe is true.
 */
export async function saveCredentials(
  email: string,
  password: string,
  rememberMe: boolean,
  biometricEnabled: boolean
): Promise<void> {
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(KEY_EMAIL, email);
    await SecureStore.setItemAsync(KEY_REMEMBER, String(rememberMe));
    await SecureStore.setItemAsync(KEY_BIOMETRIC, String(biometricEnabled));
    if (rememberMe) {
      await SecureStore.setItemAsync(KEY_PASSWORD, password);
    } else {
      // Clear any previously saved password
      await SecureStore.deleteItemAsync(KEY_PASSWORD).catch(() => {});
    }
  } catch (e) {
    console.warn('secureCredentials.saveCredentials error:', e);
  }
}

/**
 * Load saved credentials from the keychain.
 * Returns null if nothing is saved or SecureStore is unavailable.
 */
export async function loadCredentials(): Promise<SavedCredentials | null> {
  if (!SecureStore) return null;
  try {
    const [email, password, rememberRaw, biometricRaw] = await Promise.all([
      SecureStore.getItemAsync(KEY_EMAIL),
      SecureStore.getItemAsync(KEY_PASSWORD),
      SecureStore.getItemAsync(KEY_REMEMBER),
      SecureStore.getItemAsync(KEY_BIOMETRIC),
    ]);

    if (!email) return null;

    return {
      email: email ?? '',
      password: password ?? '',
      rememberMe: rememberRaw === 'true',
      biometricEnabled: biometricRaw === 'true',
    };
  } catch (e) {
    console.warn('secureCredentials.loadCredentials error:', e);
    return null;
  }
}

/**
 * Clear all saved credentials (called on sign-out or when user unchecks Remember Me).
 */
export async function clearCredentials(): Promise<void> {
  if (!SecureStore) return;
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(KEY_EMAIL).catch(() => {}),
      SecureStore.deleteItemAsync(KEY_PASSWORD).catch(() => {}),
      SecureStore.deleteItemAsync(KEY_REMEMBER).catch(() => {}),
      SecureStore.deleteItemAsync(KEY_BIOMETRIC).catch(() => {}),
    ]);
  } catch (e) {
    console.warn('secureCredentials.clearCredentials error:', e);
  }
}

/**
 * Update just the biometric preference without touching the password.
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (!SecureStore) return;
  try {
    await SecureStore.setItemAsync(KEY_BIOMETRIC, String(enabled));
  } catch (e) {
    console.warn('secureCredentials.setBiometricEnabled error:', e);
  }
}
