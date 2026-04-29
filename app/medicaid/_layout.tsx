import { Stack } from 'expo-router';

export default function MedicaidLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="appeal-journey" />
      <Stack.Screen name="disability-journey/intro" />
    </Stack>
  );
}