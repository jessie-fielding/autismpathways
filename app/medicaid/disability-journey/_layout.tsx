import { Stack } from 'expo-router';

export default function DisabilityJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="quiz-1" />
    </Stack>
  );
}
