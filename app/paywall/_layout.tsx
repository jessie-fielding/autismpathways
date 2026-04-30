import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

export default function PaywallLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
