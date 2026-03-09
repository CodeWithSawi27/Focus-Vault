import { useMemo } from "react";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  ListChecks,
  Timer,
  BarChart2,
  UserCircle,
} from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Platform, View, StyleSheet } from "react-native";

interface TabIconProps {
  Icon: React.ElementType;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  activeBg: string;
}

const TabIcon = ({
  Icon,
  focused,
  activeColor,
  inactiveColor,
  activeBg,
}: TabIconProps) => (
  <View
    style={[staticStyles.iconWrapper, focused && { backgroundColor: activeBg }]}
  >
    <Icon
      size={22}
      strokeWidth={focused ? 2 : 1.5}
      color={focused ? activeColor : inactiveColor}
    />
  </View>
);

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: isDark
        ? "rgba(18,18,18,0.97)"
        : "rgba(250,250,250,0.97)",
      borderTopColor: colors.border,
    }),
    [colors, isDark],
  );

  const makeIcon =
    (Icon: React.ElementType) =>
    ({ focused }: { focused: boolean }) => (
      <TabIcon
        Icon={Icon}
        focused={focused}
        activeColor={colors.text.primary}
        inactiveColor={colors.text.tertiary}
        activeBg={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}
      />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: staticStyles.label,
        tabBarStyle: [staticStyles.tabBar, tabBarStyle],
        tabBarItemStyle: staticStyles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Dashboard", tabBarIcon: makeIcon(LayoutDashboard) }}
      />
      <Tabs.Screen
        name="habits"
        options={{ title: "Habits", tabBarIcon: makeIcon(ListChecks) }}
      />
      <Tabs.Screen
        name="focus"
        options={{ title: "Focus", tabBarIcon: makeIcon(Timer) }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: "Analytics", tabBarIcon: makeIcon(BarChart2) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: makeIcon(UserCircle) }}
      />
    </Tabs>
  );
}

// Static styles — never change with theme
const staticStyles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    elevation: 0,
  },
  tabItem: { paddingTop: 4 },
  iconWrapper: {
    width: 40,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.1,
    marginTop: 2,
  },
});
