import { Stack } from 'expo-router';

export default function SafeSpaceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="community" />
      <Stack.Screen name="post-detail" />
    </Stack>
  );
}
