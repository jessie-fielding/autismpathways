import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

export default function PaywallLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="premium-features" />
      <Stack.Screen name="hardship-application" />
    </Stack>
  );
}
