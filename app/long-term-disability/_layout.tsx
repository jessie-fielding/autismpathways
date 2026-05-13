import { Stack } from 'expo-router';

export default function LongTermDisabilityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="state-detail" />
      <Stack.Screen name="federal-programs" />
      <Stack.Screen name="action-plan" />
    </Stack>
  );
}
