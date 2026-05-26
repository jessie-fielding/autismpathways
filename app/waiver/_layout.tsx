import { Stack } from 'expo-router';
import { COLORS } from '../../lib/theme';

export default function WaiverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="state-overview" />
      <Stack.Screen name="county-picker" />
      <Stack.Screen name="agency-card" />
      <Stack.Screen name="utilization-hub" />
      <Stack.Screen name="services-list" />
      <Stack.Screen name="service-scheduler" />
      <Stack.Screen name="aba-tool" />
      <Stack.Screen name="aba-quiz" />
    </Stack>
  );
}
