import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";
import { TOTAL_TAB_BAR_SPACING } from "@/src/components/ui/FloatingTabBar";

interface ScreenWrapperProps {
  children: ReactNode;
}

export const ScreenWrapper = ({
  children,
  scrollable = false,
}: ScreenWrapperProps & { scrollable?: boolean }) => {
  const insets = useSafeAreaInsets();
  const padding = TOTAL_TAB_BAR_SPACING(insets.bottom);

  if (scrollable) {
    return <View style={{ flex: 1 }}>{children}</View>;
    // You'll apply padding inside the ScrollView's contentContainerStyle instead
  }

  return <View style={{ flex: 1, paddingBottom: padding }}>{children}</View>;
};
