import { Stack } from 'expo-router';

export default function AppealLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="step-0-situation" />
      <Stack.Screen name="step-1-understand" />
      <Stack.Screen name="step-2-admin-review" />
      <Stack.Screen name="step-3-admin-checklist" />
      <Stack.Screen name="step-4-action" />
      <Stack.Screen name="step-5-corrected" />
    </Stack>
  );
}
