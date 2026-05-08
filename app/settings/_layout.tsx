import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sources" />
    </Stack>
  );
}
