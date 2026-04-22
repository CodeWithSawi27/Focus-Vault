import { Tabs } from "expo-router";
import { Home, Repeat, CheckSquare, Clock, User } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { FloatingTabBar } from "@/src/components/ui/FloatingTabBar";
import { OfflineBanner } from "@/src/components/ui/OfflineBanner";
import { ScreenWrapper } from "@/src/components/ui/ScreenWrapper"; // Import your new wrapper

export default function TabLayout() {
  const { colors } = useTheme();

  const makeIcon =
    (Icon: any) =>
    ({ color }: { color: string }) => (
      <Icon size={24} color={color} strokeWidth={1.3} />
    );

  return (
    <>
      <OfflineBanner />
      {/* Wrapping Tabs in ScreenWrapper here applies the 
          calculated bottom padding to every single screen 
          rendered inside this navigator.
      */}

      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent.sage,
          tabBarInactiveTintColor: colors.text.tertiary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: makeIcon(Home),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: "Habits",
            tabBarIcon: makeIcon(Repeat),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            tabBarIcon: makeIcon(CheckSquare),
          }}
        />
        <Tabs.Screen
          name="focus"
          options={{
            title: "Focus",
            tabBarIcon: makeIcon(Clock),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: makeIcon(User),
          }}
        />
      </Tabs>
    </>
  );
}
