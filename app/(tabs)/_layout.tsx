import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: 'rgba(242, 242, 247, 0.92)',
          borderTopColor: Colors.glass.border,
        },
        
      }}
    />
  );
}