import { Stack } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
        animationDuration: 220,
      }}
    >
      {/* Login fades in — entry point */}
      <Stack.Screen
        name="login"
        options={{
          animation: "fade",
          animationDuration: 220,
        }}
      />

      {/* Register slides up — feels like a modal push */}
      <Stack.Screen
        name="register"
        options={{
          animation: "slide_from_right",
          animationDuration: 280,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      />
    </Stack>
  );
}
