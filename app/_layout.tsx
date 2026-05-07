import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../services/useAuth';
import { PmipProviderStoreProvider } from '../lib/pmip/pmipProviderStore';
import NotificationPermissionPrompt from '../components/NotificationPermissionPrompt';
import DismissKeyboard from '../components/DismissKeyboard';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PmipProviderStoreProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <DismissKeyboard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="auto" />
            <NotificationPermissionPrompt />
          </DismissKeyboard>
        </ThemeProvider>
      </PmipProviderStoreProvider>
    </AuthProvider>
  );
}
