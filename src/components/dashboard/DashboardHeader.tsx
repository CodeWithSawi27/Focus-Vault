import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Flame } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

const MASCOT_WELCOME = require("@/assets/mascots/mascot_welcome.png");

interface DashboardHeaderProps {
  greeting: string;
  formattedDate: string;
  displayName: string | null;
  longestStreak: number;
  avatarBase64?: string | null;
}

export const DashboardHeader = ({
  greeting,
  formattedDate,
  displayName,
  longestStreak,
  avatarBase64,
}: DashboardHeaderProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  const firstName = displayName?.split(" ")[0] ?? "there";
  const initials = displayName
    ? displayName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: 10 },
        topRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        },
        greetingBlock: { gap: 3, flex: 1 },
        greetingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
        mascot: { width: 32, height: 32, resizeMode: "contain" },
        date: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          fontSize: 13,
          letterSpacing: 0.8,
          fontWeight: "400",
        },
        greeting: {
          ...Typography.title1,
          color: colors.text.primary,
          letterSpacing: -0.5,
          fontSize: 22,
          fontWeight: "600",
        },
        avatarWrap: {
          width: 48,
          height: 48,
          borderRadius: 24,
          marginTop: 2,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        avatarImage: {
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          borderRadius: 24,
        },
        avatarFallback: {
          width: "100%",
          height: "100%",
          borderRadius: 24,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
        },
        avatarText: {
          ...Typography.subhead,
          color: colors.text.inverse,
          fontWeight: "500",
          letterSpacing: -0.3,
        },
        streakBadge: {
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          alignSelf: "flex-start",
          backgroundColor: colors.accent.orangeMuted,
          borderRadius: Radius.full,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: colors.accent.orange + "25",
        },
        streakText: {
          ...Typography.caption,
          color: colors.accent.orange,
          fontWeight: "400",
          letterSpacing: 0.1,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>
              {greeting}, {firstName}
            </Text>
            <Image source={MASCOT_WELCOME} style={styles.mascot} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          {avatarBase64 ? (
            <Image source={{ uri: avatarBase64 }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {longestStreak > 0 && (
        <View style={styles.streakBadge}>
          <Flame size={13} color={colors.accent.orange} strokeWidth={2} />
          <Text style={styles.streakText}>{longestStreak} day streak</Text>
        </View>
      )}
    </View>
  );
};
