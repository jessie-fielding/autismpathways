import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../services/useAuth';
import { LanguageProvider } from '../lib/LanguageContext';
import { PmipProviderStoreProvider } from '../lib/pmip/pmipProviderStore';
import NotificationPermissionPrompt from '../components/NotificationPermissionPrompt';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { initAnalytics, trackAppOpened } from '../lib/analytics';

// Initialize Mixpanel + session replay on cold start
initAnalytics();

// Ensure notifications display even when the app is in the foreground.
// Must be called at module level so it runs on every app launch.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Track cold start
    trackAppOpened('cold_start');
    // Track foreground resume
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current !== 'active' && nextState === 'active') {
        trackAppOpened('foreground');
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  return (
    <LanguageProvider>
    <AuthProvider>
      <PmipProviderStoreProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          </Stack>
          <StatusBar style="auto" />
          <NotificationPermissionPrompt />
        </ThemeProvider>
      </PmipProviderStoreProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
