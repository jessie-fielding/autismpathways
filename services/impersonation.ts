/**
 * impersonation.ts
 *
 * Client-only "View as user" debug flag for the admin.
 * Stores a boolean in AsyncStorage. When true, useIsPremium always returns
 * false so the admin can preview the free-tier experience.
 *
 * After toggling, the user is prompted to navigate back to the home screen
 * so every page re-reads the flag on a fresh mount.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const IMPERSONATE_KEY = 'ap_view_as_user';

/**
 * Returns true if the admin is currently viewing the app as a free user.
 */
export async function isImpersonatingUser(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(IMPERSONATE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

/**
 * Enables or disables "View as user" mode.
 * Shows an alert asking the user to navigate away and back so every screen
 * re-reads the flag on a fresh mount.
 */
export async function setImpersonatingUser(on: boolean): Promise<void> {
  try {
    if (on) {
      await AsyncStorage.setItem(IMPERSONATE_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(IMPERSONATE_KEY);
    }
  } catch {
    // ignore storage errors
  }

  const message = on
    ? 'View as user mode is ON. Go back to the home screen and re-open any page to see the free-tier experience. A banner will appear at the top.'
    : 'View as user mode is OFF. Go back to the home screen to return to your normal admin view.';

  Alert.alert(
    on ? '\ud83d\udc41 View as User Enabled' : '\u2705 Back to Admin Mode',
    message,
    [{ text: 'Got it' }]
  );
}
