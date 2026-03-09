import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Play, Pause, Square } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const TimerControls = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}: TimerControlsProps) => {
  const { colors } = useTheme();

  const showStop = status === "running" || status === "paused";
  const isCompleted = status === "completed";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        },
        primaryBtn: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: colors.text.primary,
          borderRadius: Radius.full,
          paddingVertical: 16,
          paddingHorizontal: 40,
          ...Shadow.md,
        },
        primaryBtnGreen: { backgroundColor: colors.accent.green },
        primaryLabel: {
          ...Typography.headline,
          color: colors.text.inverse,
          letterSpacing: -0.2,
        },
        secondaryBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: Radius.full,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        secondaryLabel: {
          ...Typography.subhead,
          color: colors.text.secondary,
          fontWeight: "500",
        },
        placeholder: { width: 80 },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      {showStop ? (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onStop}
          activeOpacity={0.7}
        >
          <Square size={18} color={colors.text.secondary} strokeWidth={1.8} />
          <Text style={styles.secondaryLabel}>Stop</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {isCompleted ? (
        <TouchableOpacity
          style={[styles.primaryBtn, styles.primaryBtnGreen]}
          onPress={onStop}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryLabel}>Done</Text>
        </TouchableOpacity>
      ) : status === "idle" ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Play
            size={22}
            color={colors.text.inverse}
            strokeWidth={2}
            fill={colors.text.inverse}
          />
          <Text style={styles.primaryLabel}>Start</Text>
        </TouchableOpacity>
      ) : status === "running" ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onPause}
          activeOpacity={0.8}
        >
          <Pause size={22} color={colors.text.inverse} strokeWidth={2} />
          <Text style={styles.primaryLabel}>Pause</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onResume}
          activeOpacity={0.8}
        >
          <Play
            size={22}
            color={colors.text.inverse}
            strokeWidth={2}
            fill={colors.text.inverse}
          />
          <Text style={styles.primaryLabel}>Resume</Text>
        </TouchableOpacity>
      )}

      <View style={styles.placeholder} />
    </View>
  );
};
