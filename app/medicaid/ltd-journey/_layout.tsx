import { Stack } from 'expo-router';

export default function LtdJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="step-2-quiz" />
      <Stack.Screen name="step-3-summary" />
      <Stack.Screen name="step-3b-pmip-check" />
      <Stack.Screen name="apply-for-ltd" />
    </Stack>
  );
}
