import { Stack } from 'expo-router';

export default function PottyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="result" />
      <Stack.Screen name="bowel-diary" />
      <Stack.Screen name="provider-report" />
      <Stack.Screen name="tools/bowel-retraining" />
      <Stack.Screen name="tools/pfpt-exercises" />
      <Stack.Screen name="tools/interoception-activities" />
      <Stack.Screen name="tools/visual-schedule" />
      <Stack.Screen name="tools/sensory-audit" />
      <Stack.Screen name="tools/desensitization" />
      <Stack.Screen name="tools/school-bathroom-plan" />
      <Stack.Screen name="tools/regression-protocol" />
    </Stack>
  );
}
