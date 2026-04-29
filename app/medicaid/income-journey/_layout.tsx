import { Stack } from 'expo-router';

export default function IncomeJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="quiz-ltd" />
    </Stack>
  );
}
