import { Stack } from 'expo-router';

export default function IEPLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="district-lookup" />
      <Stack.Screen name="telehealth-lookup" />
      <Stack.Screen name="evaluator-lookup" />
      <Stack.Screen name="submit-evaluator" />
      <Stack.Screen name="meeting-recorder" />
    </Stack>
  );
}
