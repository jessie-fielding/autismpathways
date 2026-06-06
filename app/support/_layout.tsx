import { Stack } from 'expo-router';

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="book" options={{ headerShown: false }} />
      <Stack.Screen name="hardship" />
    </Stack>
  );
}
