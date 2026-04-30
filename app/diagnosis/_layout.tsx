import { Stack } from 'expo-router';

export default function DiagnosisLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="why-diagnosis" />
      <Stack.Screen name="eval-type" />
      <Stack.Screen name="help-me-decide/index" />
      <Stack.Screen name="evaluator-list" />
      <Stack.Screen name="appointment-date" />
      <Stack.Screen name="how-did-it-go" />
    </Stack>
  );
}
