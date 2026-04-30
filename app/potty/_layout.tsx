import { Stack } from 'expo-router';

export default function PottyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="result" />
      <Stack.Screen name="bowel-diary" />
    </Stack>
  );
}
