import { Stack } from 'expo-router';

export default function MedicaidLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="your-situation" />
      <Stack.Screen name="denial-reason" />
      <Stack.Screen name="appeal-journey" />
      <Stack.Screen name="income-journey" />
      <Stack.Screen name="ltd-journey" />
      <Stack.Screen name="how-to-apply" />
    </Stack>
  );
}
