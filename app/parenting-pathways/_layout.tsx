import { Stack } from 'expo-router';

export default function ParentingPathwaysLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="results" />
      <Stack.Screen name="trends" />
    </Stack>
  );
}
