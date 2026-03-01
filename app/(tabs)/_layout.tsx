import { Tabs } from 'expo-router';
import { LayoutDashboard, ListChecks, Timer, BarChart2 } from 'lucide-react-native';
import { Colors } from '@/src/constants/theme';
import { Platform, View, StyleSheet } from 'react-native';

interface TabIconProps {
  Icon: React.ElementType;
  focused: boolean;
}

const TabIcon = ({ Icon, focused }: TabIconProps) => (
  <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
    <Icon
      size={22}
      strokeWidth={focused ? 2 : 1.5}
      color={focused ? Colors.text.primary : Colors.text.tertiary}
    />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.text.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutDashboard} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ focused }) => <TabIcon Icon={ListChecks} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => <TabIcon Icon={Timer} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => <TabIcon Icon={BarChart2} focused={focused} />,
      }}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(250, 250, 250, 0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 0,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1,
    marginTop: 2,
  },
});