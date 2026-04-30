import { Tabs } from 'expo-router';
import FloatingTabBar from '../../components/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen
        name="diagnosis-pathway"
        options={{ href: '/diagnosis' }}
      />
      <Tabs.Screen
        name="medicaid-pathway"
        options={{ href: '/medicaid' }}
      />
      <Tabs.Screen
        name="tools-tab"
        options={{ href: '/tools' }}
      />
      <Tabs.Screen
        name="settings-tab"
        options={{ href: '/settings' }}
      />
    </Tabs>
  );
}
