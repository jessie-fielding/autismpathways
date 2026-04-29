import { Stack } from 'expo-router';

export default function LTDJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="action-plan" />
      <Stack.Screen name="pmip-provider-journey" />
    </Stack>
  );
}
