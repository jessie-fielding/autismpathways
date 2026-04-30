import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="diagnosis-pathway" options={{ href: null }} />
      <Tabs.Screen name="medicaid-pathway" options={{ href: null }} />
      <Tabs.Screen name="tools-tab" options={{ href: null }} />
      <Tabs.Screen name="settings-tab" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="start-here" options={{ href: null }} />
    </Tabs>
  );
}
