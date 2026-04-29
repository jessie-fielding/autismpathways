import { Stack } from 'expo-router';

export default function PMIPProviderJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="step-1-intro" />
      <Stack.Screen name="step-2-quiz" />
      <Stack.Screen name="step-3-summary" />
      <Stack.Screen name="step-3-pmip-form-check" />
      <Stack.Screen name="step-4-celebration" />
    </Stack>
  );
}
