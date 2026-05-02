import { Stack } from 'expo-router';
import { MedicaidStateProvider } from '../../lib/MedicaidStateContext';

export default function MedicaidLayout() {
  return (
    <MedicaidStateProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="select-state" />
        <Stack.Screen name="your-situation" />
        <Stack.Screen name="denial-reason" />
        <Stack.Screen name="appeal-journey" />
        <Stack.Screen name="income-journey" />
        <Stack.Screen name="ltd-journey" />
        <Stack.Screen name="how-to-apply" />
      </Stack>
    </MedicaidStateProvider>
  );
}
