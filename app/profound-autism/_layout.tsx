import { Stack } from 'expo-router';
export default function ProfoundAutismLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sos-plus/index" />
      <Stack.Screen name="poop-smearing/index" />
      <Stack.Screen name="poop-smearing/quiz" />
      <Stack.Screen name="poop-smearing/results" />
      <Stack.Screen name="poop-smearing/tracker" />
      <Stack.Screen name="is-it-pain/index" />
      <Stack.Screen name="program-finder/index" />
      <Stack.Screen name="safety-at-home/index" />
      <Stack.Screen name="bigger-than-me/index" />
      <Stack.Screen name="medication-guide/index" />
      <Stack.Screen name="waitlist-survival/index" />
      <Stack.Screen name="community/index" />
      <Stack.Screen name="abc-logger/index" />
    </Stack>
  );
}
