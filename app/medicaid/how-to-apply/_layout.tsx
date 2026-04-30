import { Stack } from 'expo-router';

export default function HowToApplyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="paperwork-checklist" />
      <Stack.Screen name="in-person-vs-phone" />
      <Stack.Screen name="application-tracker" />
      <Stack.Screen name="follow-up" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
