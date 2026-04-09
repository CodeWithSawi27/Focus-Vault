import { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { WifiOff, RefreshCw } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography } from "@/src/constants/theme";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";

export const OfflineBanner = () => {
  const { colors } = useTheme();
  const { isOnline, isSyncing, pendingCount } = useNetworkSync();
  const translateY = useRef(new Animated.Value(-60)).current;

  // Slide in when offline, slide out when back online
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOnline && pendingCount === 0 ? -60 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [isOnline, pendingCount]);

  const label = useMemo(() => {
    if (isSyncing) return "Syncing data...";
    if (!isOnline && pendingCount > 0)
      return `Offline · ${pendingCount} change${pendingCount > 1 ? "s" : ""} pending`;
    if (!isOnline) return "You are offline";
    if (pendingCount > 0)
      return `Syncing ${pendingCount} pending change${pendingCount > 1 ? "s" : ""}...`;
    return "";
  }, [isOnline, isSyncing, pendingCount]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: isSyncing
            ? colors.accent.blue
            : colors.accent.orange,
        },
        text: {
          ...Typography.footnote,
          color: "#FFFFFF",
          fontWeight: "600",
        },
      }),
    [colors, isSyncing],
  );

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      {isSyncing ? (
        <RefreshCw size={13} color="#FFFFFF" strokeWidth={2.5} />
      ) : (
        <WifiOff size={13} color="#FFFFFF" strokeWidth={2.5} />
      )}
      <Text style={styles.text}>{label}</Text>
    </Animated.View>
  );
};
