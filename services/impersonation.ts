import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

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
 * Enables or disables "View as user" mode, then reloads the app so every
 * gate re-reads the flag on a fresh mount.
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
  try {
    await Updates.reloadAsync();
  } catch {
    // reloadAsync may throw in dev — ignore
  }
}
