import { Stack } from 'expo-router';

export default function HowToApplyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="step-1-intro" />
      <Stack.Screen name="step-2-paperwork" />
      <Stack.Screen name="step-3-apply" />
      <Stack.Screen name="step-4-followup" />
    </Stack>
  );
}
