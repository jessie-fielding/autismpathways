import { Stack } from 'expo-router';

export default function ApplyForLTDLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="step-1-what-is-ltd" />
      <Stack.Screen name="step-2-gather-paperwork" />
      <Stack.Screen name="step-3-apply" />
      <Stack.Screen name="step-4-celebrate" />
    </Stack>
  );
}
