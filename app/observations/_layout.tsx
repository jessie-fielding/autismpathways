import { Stack } from 'expo-router';

export default function ObservationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new-entry" />
    </Stack>
  );
}
