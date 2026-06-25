/**
 * impersonation.ts
 *
 * Client-only "View as user" debug flag for the admin.
 * Stores a boolean in AsyncStorage. When true, useIsPremium always returns
 * false so the admin can preview the free-tier experience.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

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
 * Callers are responsible for showing any confirmation UI.
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
}
