import { Stack } from 'expo-router';
export default function TransitionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="stage-0-get-on-list" />
      <Stack.Screen name="stage-1-start-conversation" />
      <Stack.Screen name="stage-2-build-plan" />
      <Stack.Screen name="stage-3-senior-year" />
      <Stack.Screen name="stage-4-navigating-gap" />
      <Stack.Screen name="stage-5-adult-life" />
      <Stack.Screen name="state-waivers" />
    </Stack>
  );
}
