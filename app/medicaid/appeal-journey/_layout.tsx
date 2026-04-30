import { Stack } from 'expo-router';

export default function AppealJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="step-2-review-checklist" />
      <Stack.Screen name="step-3-gather-docs" />
      <Stack.Screen name="step-4-action-plan" />
      <Stack.Screen name="step-5-resubmit" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
