import { Stack } from 'expo-router';

export default function IncomeJourneyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ltd-check" />
      <Stack.Screen name="submitted-monitoring" />
      <Stack.Screen name="work-ahead" />
      <Stack.Screen name="escalation" />
    </Stack>
  );
}
