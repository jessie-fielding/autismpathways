import { Stack } from 'expo-router';

export default function IEPLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="district-lookup" />
    </Stack>
  );
}
