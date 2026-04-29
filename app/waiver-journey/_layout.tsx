import { Stack } from 'expo-router';

export default function WaiverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="step-1-intro" />
      <Stack.Screen name="step-2-ltd-check" />
      <Stack.Screen name="step-3-waiver-types" />
    </Stack>
  );
}
